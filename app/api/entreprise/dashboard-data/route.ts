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

    // Vérifier que l'user est admin
    const { data: adminMembership } = await supabaseAdmin
      .from("company_memberships")
      .select("company_id, role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminMembership) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const companyId = adminMembership.company_id;

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    const { data: members } = await supabaseAdmin
      .from("company_memberships")
      .select("anonymous_id, joined_at, user_id")
      .eq("company_id", companyId)
      .eq("role", "employee")
      .order("joined_at", { ascending: true });

    const employees = await Promise.all(
      (members ?? []).map(async (m) => {
        const { data: assessment } = await supabaseAdmin
          .from("assessments")
          .select("global_score, scores, created_at, job_type, answers")
          .eq("user_id", m.user_id)
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          anonymous_id: m.anonymous_id,
          joined_at: m.joined_at,
          global_score: assessment?.global_score ?? null,
          scores: assessment?.scores ?? null,
          assessed_at: assessment?.created_at ?? null,
          job_type: assessment?.job_type ?? null,
          answers: assessment?.answers ?? null,
        };
      })
    );

    const { data: invite } = await supabaseAdmin
      .from("company_invites")
      .select("code")
      .eq("company_id", companyId)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ company, employees, inviteCode: invite?.code ?? null });
  } catch (err) {
    console.error("[dashboard-data]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
