import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { adminToken, userId, email } = await req.json();
    if (!adminToken || !userId) {
      return NextResponse.json({ error: "Token et userId requis" }, { status: 400 });
    }

    const { data: invite } = await supabaseAdmin
      .from("admin_invites")
      .select("company_id, email, used_at")
      .eq("token", adminToken)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!invite || invite.used_at) {
      return NextResponse.json({ error: "Token invalide ou déjà utilisé" }, { status: 400 });
    }

    if (invite.email !== email) {
      return NextResponse.json({ error: "Email ne correspond pas" }, { status: 403 });
    }

    await supabaseAdmin.from("company_memberships").upsert({
      company_id: invite.company_id,
      user_id: userId,
      role: "admin",
      anonymous_id: "Admin",
    }, { onConflict: "company_id,user_id" });

    await supabaseAdmin
      .from("admin_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("token", adminToken);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[activate-admin]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
