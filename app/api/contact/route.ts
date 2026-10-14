import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { nom, email, message } = await req.json();
    if (!nom || !email || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    await resend.emails.send({
      from: "PostureAtWork <hello@postureatwork.com>",
      to: "hello@postureatwork.com",
      subject: `[PAW Contact] Message de ${nom}`,
      html: `
        <h2>Nouveau message via PostureAtWork</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
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
