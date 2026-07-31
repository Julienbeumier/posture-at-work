import { NextResponse } from "next/server";
import { Resend } from "resend";
import { welcomeEmail } from "@/lib/emails/templates";

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "PostureAtWork <hello@postureatwork.com>",
      to: email,
      subject: "Bienvenue sur PAW — ton bilan t'attend 👋",
      html: welcomeEmail({ email, firstName }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[welcome email]", err);
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }
}
