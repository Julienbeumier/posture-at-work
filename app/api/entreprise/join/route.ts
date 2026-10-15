import { NextResponse } from "next/server";
import { getSessionUser, getSupabaseAdmin, rateLimit, clientIp } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    if (!rateLimit(`join:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Le code d'invitation détermine l'entreprise (on ignore tout companyId envoyé par le client)
    const { data: invite } = await supabaseAdmin
      .from("company_invites")
      .select("company_id")
      .eq("code", code.toUpperCase())
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!invite) return NextResponse.json({ error: "Invitation invalide ou expirée" }, { status: 404 });

    const companyId = invite.company_id;

    const { data: existing } = await supabaseAdmin
      .from("company_memberships")
      .select("anonymous_id")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .maybeSingle();

    let anonymousId = existing?.anonymous_id as string | undefined;

    if (!existing) {
      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("max_employees, is_active")
        .eq("id", companyId)
        .maybeSingle();
      if (!company || company.is_active === false) {
        return NextResponse.json({ error: "Entreprise inactive" }, { status: 403 });
      }

      const { count } = await supabaseAdmin
        .from("company_memberships")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("role", "employee");

      if (company.max_employees && (count ?? 0) >= company.max_employees) {
        return NextResponse.json({ error: "Nombre maximum d'employés atteint" }, { status: 403 });
      }

      anonymousId = `Employé #${(count ?? 0) + 1}`;
      const { error } = await supabaseAdmin.from("company_memberships").insert({
        company_id: companyId,
        user_id: user.id,
        role: "employee",
        anonymous_id: anonymousId,
      });
      if (error) {
        console.error("[join error]", error);
        return NextResponse.json({ error: "Impossible de rejoindre l'entreprise" }, { status: 500 });
      }
    }

    // Premium offert aux employés B2B (activé côté serveur uniquement)
    await supabaseAdmin.from("profiles").upsert({
      user_id: user.id,
      is_premium: true,
      premium_source: "b2b",
      premium_activated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return NextResponse.json({ success: true, anonymousId, companyId });
  } catch (err) {
    console.error("[join]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
