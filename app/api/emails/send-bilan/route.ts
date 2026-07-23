import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { emailBilan } from "@/lib/emails/templates";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "PostureAtWork <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstname, scores, recommendations, topExercise } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { subject, html } = emailBilan({
      email,
      firstname: firstname || "toi",
      globalScore: scores?.global ?? 0,
      recommendations: recommendations ?? [],
      topExercise: topExercise ?? { name: "Rétraction cervicale", duration: "10 rép. × 5 sec", instruction: "Rentre doucement le menton vers la gorge. Tiens 5 secondes. Répète 10 fois." },
    });

    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend] send-bilan error:", error);
      return NextResponse.json({ error: "Échec envoi email" }, { status: 500 });
    }

    // Save to email_sequences
    const next3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await createClient()
      .from("email_sequences")
      .upsert({
        email,
        firstname: firstname || null,
        scores: scores ?? null,
        sequence_step: 1,
        last_sent_at: new Date().toISOString(),
        next_send_at: next3,
        unsubscribed: false,
      }, { onConflict: "email" });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-bilan]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
