import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { entrepriseWelcomeEmail } from "@/lib/emails/templates";
import { isPlatformAdmin, rateLimit, clientIp, secureToken, secureCode, escapeHtml } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Vérifie l'accès admin (utilisé par la page /admin pour valider le mot de passe)
export async function GET(req: Request) {
  if (!rateLimit(`admin-check:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  if (!(await isPlatformAdmin(req))) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(`admin-create:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
      return NextResponse.json({ success: false, message: "Trop de tentatives" }, { status: 429 });
    }
    if (!(await isPlatformAdmin(req))) {
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 });
    }
    const { companyName, contactName, contactEmail, plan, maxEmployees, inviteCode } = await req.json();

    if (!companyName || !contactEmail) {
      return NextResponse.json({ success: false, message: "Nom et email requis" }, { status: 400 });
    }

    const code = inviteCode?.toUpperCase() ||
      companyName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) + secureCode(4);

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: companyName,
        contact_name: contactName ?? "",
        contact_email: contactEmail,
        plan: plan ?? "essentiel",
        max_employees: maxEmployees ?? 25,
        is_active: true,
      })
      .select()
      .single();

    if (companyError || !company) {
      return NextResponse.json({ success: false, message: companyError?.message ?? "Erreur création company" }, { status: 500 });
    }

    await supabaseAdmin.from("company_invites").insert({
      company_id: company.id,
      code,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const adminToken = secureToken(24);

    await supabaseAdmin.from("admin_invites").insert({
      company_id: company.id,
      token: adminToken,
      email: contactEmail,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const adminUrl = `https://postureatwork.com/auth?admin_token=${adminToken}&redirect=/entreprise/dashboard&from=entreprise`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "PostureAtWork <hello@postureatwork.com>",
      to: contactEmail,
      subject: `Bienvenue sur PAW Entreprise — ${companyName}`,
      html: entrepriseWelcomeEmail({
        companyName,
        adminName: contactName,
        inviteCode: code,
        dashboardUrl: adminUrl,
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Company "${escapeHtml(companyName)}" créée avec succès. Email envoyé à ${escapeHtml(contactEmail)}.`,
      companyId: company.id,
      inviteCode: code,
    });

  } catch (err) {
    console.error("[admin/create-company]", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
