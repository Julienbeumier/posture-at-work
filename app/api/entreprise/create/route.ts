import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { name, contactName, contactEmail, plan } = await req.json();
    if (!name || !contactEmail) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Service role — bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Récupérer l'user connecté via cookies
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(cookieStore);
    const { data: { user } } = await supabaseUser.auth.getUser();

    const maxEmployees = plan === "starter" ? 25 : plan === "pme" ? 100 : 999;

    // Créer la company
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name,
        contact_name: contactName,
        contact_email: contactEmail,
        plan,
        max_employees: maxEmployees,
      })
      .select()
      .single();

    if (companyError || !company) {
      console.error("[create company error]", companyError);
      return NextResponse.json({ error: companyError?.message }, { status: 500 });
    }

    // Créer le membership admin
    if (user) {
      const { error: memberError } = await supabaseAdmin
        .from("company_memberships")
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: "admin",
          anonymous_id: "Admin",
        });
      if (memberError) console.error("[membership error]", memberError);
    } else {
      console.warn("[create] Aucun user connecté — membership non créé");
    }

    // Générer un premier code d'invitation
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await supabaseAdmin.from("company_invites").insert({
      company_id: company.id,
      code,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({ companyId: company.id, inviteCode: code });
  } catch (err) {
    console.error("[entreprise/create]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
