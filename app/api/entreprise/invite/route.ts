import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { companyId, emails } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "company_id manquant" }, { status: 400 });
    }

    // Service role — bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Générer un code unique
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error: insertError } = await supabaseAdmin
      .from("company_invites")
      .insert({
        company_id: companyId,
        code,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error("[invite insert error]", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const inviteUrl = `https://postureatwork.com/join/${code}`;

    if (emails?.length) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await Promise.allSettled(
        emails.map((email: string) =>
          resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Votre employeur vous invite à faire votre bilan ergonomique",
            html: `
              <h2>Bilan ergonomique offert par votre employeur</h2>
              <p>Votre entreprise utilise PostureAtWork pour améliorer la santé de ses équipes.</p>
              <p>En 5 minutes, obtenez votre bilan personnalisé : posture, douleurs, énergie.</p>
              <p><a href="${inviteUrl}" style="background:#2b5ce6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">Faire mon bilan →</a></p>
              <p style="color:#999;font-size:12px;margin-top:24px;">Code d'accès : ${code}</p>
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
