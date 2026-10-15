import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { emailBilan } from "@/lib/emails/templates";
import { createClient } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "PostureAtWork <hello@postureatwork.com>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scores, recommendations, topExercise } = body;
    const email = String(body.email ?? "").trim().slice(0, 200);
    const firstname = String(body.firstname ?? "").slice(0, 60);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Frein anti-abus : pas plus de 5 envois / h / IP, et 2 / jour / destinataire
    if (!rateLimit(`bilan-ip:${clientIp(req)}`, 5, 60 * 60 * 1000) ||
        !rateLimit(`bilan-to:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de demandes, réessayez plus tard" }, { status: 429 });
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
