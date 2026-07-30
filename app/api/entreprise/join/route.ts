import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { code, userId, companyId } = await req.json();
    if (!code || !userId || !companyId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Compter les membres existants pour anonymous_id
    const { count } = await supabaseAdmin
      .from("company_memberships")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);

    const anonymousId = `Employé #${(count ?? 0) + 1}`;

    // Créer le membership employé
    const { error } = await supabaseAdmin
      .from("company_memberships")
      .insert({
        company_id: companyId,
        user_id: userId,
        role: "employee",
        anonymous_id: anonymousId,
      });

    if (error) {
      console.error("[join error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, anonymousId });
  } catch (err) {
    console.error("[join]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
