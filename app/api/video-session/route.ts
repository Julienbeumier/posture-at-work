import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { scores, answers, jobType, userId, assessmentId } = await req.json();

    // Générer un token unique
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Stocker dans Supabase temporairement (expire dans 1h)
    await supabaseAdmin.from("video_sessions").upsert({
      token,
      scores,
      answers,
      job_type: jobType,
      user_id: userId ?? null,
      assessment_id: assessmentId ?? null,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("[video-session]", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { token, videoAnalysis } = await req.json();
    if (!token || !videoAnalysis) {
      return NextResponse.json({ error: "Token et analyse requis" }, { status: 400 });
    }

    // Récupérer la session pour avoir l'assessment_id ciblé
    const { data: session } = await supabaseAdmin
      .from("video_sessions")
      .select("user_id, assessment_id")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Session invalide ou expirée" }, { status: 404 });
    }

    // Sauvegarder dans le bon assessment (ciblé à la création du token)
    const assessmentId = session.assessment_id;
    if (assessmentId) {
      await supabaseAdmin
        .from("assessments")
        .update({ video_analysis: videoAnalysis })
        .eq("id", assessmentId);
    }

    // Marquer la session comme analysée
    await supabaseAdmin
      .from("video_sessions")
      .update({ video_analysis: videoAnalysis, analyzed_at: new Date().toISOString() })
      .eq("token", token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[video-session PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

  const { data } = await supabaseAdmin
    .from("video_sessions")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "Session expirée" }, { status: 404 });

  return NextResponse.json(data);
}
