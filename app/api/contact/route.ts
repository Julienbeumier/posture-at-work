import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, clientIp, escapeHtml } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (!rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de messages, réessayez plus tard" }, { status: 429 });
    }
    const body = await req.json();
    const nom = String(body.nom ?? "").slice(0, 120);
    const email = String(body.email ?? "").slice(0, 200);
    const message = String(body.message ?? "").slice(0, 5000);
    if (!nom || !email || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    await resend.emails.send({
      from: "PostureAtWork <hello@postureatwork.com>",
      to: "hello@postureatwork.com",
      subject: `[PAW Contact] Message de ${nom.replace(/[\r\n]/g, " ")}`,
      html: `
        <h2>Nouveau message via PostureAtWork</h2>
        <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Si la demande mentionne une démo, envoyer une confirmation avec le lien démo
    if (message?.toLowerCase().includes("démo")) {
      await resend.emails.send({
        from: "PostureAtWork <hello@postureatwork.com>",
        to: email,
        subject: "Votre demande de démo PAW Entreprise",
        html: `
          <div style="font-family: sans-serif; max-width: 500px;">
            <h2>Merci pour votre intérêt pour PAW Entreprise !</h2>
            <p>Nous revenons vers vous sous 24h pour organiser votre démo personnalisée.</p>
            <p>En attendant, vous pouvez explorer un dashboard de démonstration complet :</p>
            <a href="https://postureatwork.com/entreprise/demo" style="display:inline-block; padding:12px 24px; background:#7c3aed; color:#fff; border-radius:100px; text-decoration:none; font-weight:600;">
              Voir le dashboard de démo →
            </a>
            <p style="margin-top: 24px; color: #666; font-size: 13px;">— L'équipe PostureAtWork</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
