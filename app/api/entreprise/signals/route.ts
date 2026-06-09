import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(cookieStore);
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: membership } = await supabaseAdmin
      .from("company_memberships")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const { data: signals } = await supabaseAdmin
      .from("company_signals")
      .select("*")
      .eq("company_id", membership.company_id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ data: signals ?? [] });
  } catch (err) {
    console.error("[signals GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
