import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { scores, answers, videoAnalysis, jobType } = body;

    if (!scores || Object.keys(scores).length === 0) {
      return NextResponse.json({ error: "Scores manquants" }, { status: 400 });
    }

    // Récupérer company_id si employé B2B
    const { data: membership } = await supabaseAdmin
      .from("company_memberships")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("role", "employee")
      .maybeSingle();

    const companyId = membership?.company_id ?? null;

    // Vérifier si un bilan existe déjà aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing } = await supabaseAdmin
      .from("assessments")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("assessments")
        .update({
          scores,
          answers,
          global_score: scores.global ?? 0,
          job_type: jobType ?? "bureau",
          company_id: companyId,
          ...(videoAnalysis ? { video_analysis: videoAnalysis } : {}),
        })
        .eq("id", existing.id);

      return NextResponse.json({ success: true, id: existing.id });
    }

    // Créer un nouveau bilan
    const { data: newAssessment, error } = await supabaseAdmin
      .from("assessments")
      .insert({
        user_id: user.id,
        scores,
        answers,
        global_score: scores.global ?? 0,
        job_type: jobType ?? "bureau",
        company_id: companyId,
        ...(videoAnalysis ? { video_analysis: videoAnalysis } : {}),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[save assessment]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: newAssessment.id });
  } catch (err) {
    console.error("[save assessment]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
