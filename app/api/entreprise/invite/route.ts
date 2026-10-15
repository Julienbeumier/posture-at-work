import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  getSessionUser, getSupabaseAdmin, getCompanyAdminMembership,
  rateLimit, clientIp, escapeHtml, secureCode,
} from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { companyId, emails } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "company_id manquant" }, { status: 400 });
    }

    // Seul un administrateur de CETTE entreprise peut créer des invitations
    const membership = await getCompanyAdminMembership(user.id, companyId);
    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    if (!rateLimit(`invite:${user.id}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de demandes, réessayez plus tard" }, { status: 429 });
    }
    void clientIp;

    const supabaseAdmin = getSupabaseAdmin();
    const code = secureCode(8);

    const { error: insertError } = await supabaseAdmin
      .from("company_invites")
      .insert({
        company_id: companyId,
        code,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error("[invite insert error]", insertError);
      return NextResponse.json({ error: "Impossible de créer l'invitation" }, { status: 500 });
    }

    const inviteUrl = `https://postureatwork.com/join/${code}`;

    const recipients: string[] = Array.isArray(emails)
      ? emails.filter((e: unknown): e is string => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)).slice(0, 50)
      : [];

    if (recipients.length) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await Promise.allSettled(
        recipients.map((email) =>
          resend.emails.send({
            from: "PostureAtWork <hello@postureatwork.com>",
            to: email,
            subject: "Votre employeur vous invite à faire votre bilan ergonomique",
            html: `
              <h2>Bilan ergonomique offert par votre employeur</h2>
              <p>Votre entreprise utilise PostureAtWork pour améliorer la santé de ses équipes.</p>
              <p>En 5 minutes, obtenez votre bilan personnalisé : posture, douleurs, énergie.</p>
              <p><a href="${inviteUrl}" style="background:#2b5ce6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">Commencer mon bilan</a></p>
              <p style="color:#999;font-size:12px;margin-top:24px;">Code d'accès : ${escapeHtml(code)}</p>
            `,
          })
        )
      );
    }

    return NextResponse.json({ code, inviteUrl });
  } catch (err) {
    console.error("[entreprise/invite]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
