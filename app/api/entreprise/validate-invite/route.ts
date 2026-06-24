import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "Code manquant" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data } = await supabaseAdmin
      .from("company_invites")
      .select("*, companies(*)")
      .eq("code", code.toUpperCase())
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ error: "Invitation invalide ou expirée" }, { status: 404 });
    }

    return NextResponse.json({ company: data.companies, invite: { ...data, companies: undefined } });
  } catch (err) {
    console.error("[validate-invite]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
