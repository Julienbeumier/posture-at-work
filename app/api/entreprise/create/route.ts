import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, contactName, contactEmail, plan } = await req.json();
    if (!name || !contactEmail) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const maxEmployees = plan === "starter" ? 25 : plan === "pme" ? 100 : 999;

    const { data: company, error: companyError } = await supabase
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
      return NextResponse.json({ error: companyError?.message }, { status: 500 });
    }

    if (user) {
      await supabase.from("company_memberships").insert({
        company_id: company.id,
        user_id: user.id,
        role: "admin",
        anonymous_id: "Admin",
      });
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await supabase.from("company_invites").insert({
      company_id: company.id,
      code,
    });

    return NextResponse.json({ companyId: company.id, inviteCode: code });
  } catch (err) {
    console.error("[entreprise/create]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
