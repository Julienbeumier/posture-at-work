import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DEMO_COMPANY_ID = "84a0c205-2c9d-4edf-88fe-a2c6272627e0";

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", DEMO_COMPANY_ID)
      .single();

    const { data: members } = await supabaseAdmin
      .from("company_memberships")
      .select("anonymous_id, joined_at, user_id")
      .eq("company_id", DEMO_COMPANY_ID)
      .eq("role", "employee")
      .order("joined_at", { ascending: true });

    const employees = await Promise.all(
      (members ?? []).map(async (m) => {
        const { data: assessment } = await supabaseAdmin
          .from("assessments")
          .select("global_score, scores, created_at, job_type, answers, video_analysis")
          .eq("user_id", m.user_id)
          .eq("company_id", DEMO_COMPANY_ID)
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
          video_analysis: assessment?.video_analysis ?? null,
        };
      })
    );

    // Historique mensuel
    const { data: history } = await supabaseAdmin
      .from("assessments")
      .select("global_score, scores, created_at, job_type")
      .eq("company_id", DEMO_COMPANY_ID)
      .not("global_score", "is", null)
      .order("created_at", { ascending: true });

    const historyByMonth: Record<string, { scores: number[]; bureau: number[]; debout: number[] }> = {};
    (history ?? []).forEach((a) => {
      const mois = new Date(a.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
      if (!historyByMonth[mois]) historyByMonth[mois] = { scores: [], bureau: [], debout: [] };
      if (a.global_score) historyByMonth[mois].scores.push(a.global_score);
      if (a.job_type === "bureau" && a.global_score) historyByMonth[mois].bureau.push(a.global_score);
      if (a.job_type === "debout" && a.global_score) historyByMonth[mois].debout.push(a.global_score);
    });

    const evolutionData = Object.entries(historyByMonth).map(([mois, data]) => ({
      mois,
      global: data.scores.length ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : null,
      bureau: data.bureau.length ? Math.round(data.bureau.reduce((a, b) => a + b, 0) / data.bureau.length) : null,
      debout: data.debout.length ? Math.round(data.debout.reduce((a, b) => a + b, 0) / data.debout.length) : null,
      count: data.scores.length,
    }));

    return NextResponse.json({ company, employees, evolutionData, isDemo: true });
  } catch (err) {
    console.error("[demo-data]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
