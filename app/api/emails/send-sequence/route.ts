import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { emailTip, emailTestimonial, emailRappel, emailPremium } from "@/lib/emails/templates";
import { createClient } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "PostureAtWork <onboarding@resend.dev>";

const NEXT_DELAYS: Record<number, number> = {
  2: 7,   // J+3 → next at J+7
  3: 14,  // J+7 → next at J+14
  4: 30,  // J+14 → next at J+30
  5: 0,   // J+30 → no more
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstname, step, scores } = body;

    if (!email || !step || step < 2 || step > 5) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const name = firstname || "toi";
    let subject = "";
    let html = "";

    if (step === 2) {
      const tips: Record<string, string> = {
        setup: "Règle 20-20-20 : toutes les 20 min, regarde à 6m pendant 20 secondes",
        pain: "Les cervicales supportent 5kg — ta tête en avant à 45° en charge 22kg",
        habits: "2 minutes de marche toutes les heures réduisent le risque cardiovasculaire de 17%",
        sleep_energy: "La caféine après 14h perturbe ton sommeil même si tu t'endors bien",
        nutrition: "Un déjeuner riche en protéines = énergie stable tout l'après-midi",
        lifestyle: "Le stress chronique crée des tensions musculaires réelles et mesurables",
      };
      const sc = scores ?? {};
      const lowest = Object.entries(tips).reduce((a, b) =>
        (sc[a[0]] ?? 50) <= (sc[b[0]] ?? 50) ? a : b
      );
      const r = emailTip({
        email, firstname: name,
        tip: lowest[1],
        tipContext: "C'est un des changements les plus impactants pour ton confort au bureau — applicable dès maintenant, sans rien acheter.",
      });
      subject = r.subject; html = r.html;
    } else if (step === 3) {
      const r = emailTestimonial({ email, firstname: name });
      subject = r.subject; html = r.html;
    } else if (step === 4) {
      const r = emailRappel({ email, firstname: name });
      subject = r.subject; html = r.html;
    } else {
      const r = emailPremium({ email, firstname: name });
      subject = r.subject; html = r.html;
    }

    const { error } = await resend.emails.send({ from: FROM, to: email, subject, html });
    if (error) return NextResponse.json({ error: "Échec envoi" }, { status: 500 });

    const delay = NEXT_DELAYS[step] ?? 0;
    const nextSendAt = delay > 0
      ? new Date(Date.now() + delay * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await createClient()
      .from("email_sequences")
      .update({
        sequence_step: step,
        last_sent_at: new Date().toISOString(),
        next_send_at: nextSendAt,
      })
      .eq("email", email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-sequence]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
