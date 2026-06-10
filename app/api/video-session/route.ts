import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { scores, answers, jobType } = await req.json();

    // Générer un token unique
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Stocker dans Supabase temporairement (expire dans 1h)
    await supabaseAdmin.from("video_sessions").upsert({
      token,
      scores,
      answers,
      job_type: jobType,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("[video-session]", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
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
