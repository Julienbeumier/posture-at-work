import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const now = new Date();
    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;

    // ── J+1 : utilisateurs inscrits hier sans bilan ──────────────────────
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const { data: newUsers } = await supabaseAdmin.auth.admin.listUsers();

    for (const user of newUsers?.users ?? []) {
      const createdAt = new Date(user.created_at);
      if (createdAt < yesterday || createdAt > yesterdayEnd) continue;
      if (!user.email) continue;

      const { data: assessment } = await supabaseAdmin
        .from("assessments")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (assessment) continue;

      const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? undefined;
      await resend.emails.send({
        from: "PostureAtWork <hello@postureatwork.com>",
        to: user.email,
        subject: "Tu n'as pas encore fait ton bilan 👀",
        html: reminderJ1Email(firstName),
      });
      sent++;
    }

    // ── J+7 : utilisateurs sans premium ──────────────────────────────────
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sevenDaysAgoEnd = new Date(sevenDaysAgo);
    sevenDaysAgoEnd.setHours(23, 59, 59, 999);

    for (const user of newUsers?.users ?? []) {
      const createdAt = new Date(user.created_at);
      if (createdAt < sevenDaysAgo || createdAt > sevenDaysAgoEnd) continue;
      if (!user.email) continue;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_premium) continue;

      const { data: assessment } = await supabaseAdmin
        .from("assessments")
        .select("global_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!assessment) continue;

      const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? undefined;
      await resend.emails.send({
        from: "PostureAtWork <hello@postureatwork.com>",
        to: user.email,
        subject: "Ton analyse complète t'attend — 19,99€ à vie 🔓",
        html: reminderJ7Email(firstName, assessment.global_score),
      });
      sent++;
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("[trigger-sequence]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── Templates inline ──────────────────────────────────────────────────────────

function reminderJ1Email(firstName?: string): string {
  const displayName = (firstName && firstName !== "toi")
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1) + ","
    : "";
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="background:#111827;display:inline-block;padding:10px 20px;border-radius:10px;">
        <p style="font-size:20px;font-weight:900;color:#fff;margin:0;">PAW<span style="color:#2b5ce6;">.</span></p>
      </div>
    </div>
    <div style="background:#fff;border-radius:20px;padding:28px;border:1px solid #e5e7eb;margin-bottom:16px;">
      <h1 style="font-size:20px;font-weight:900;color:#111827;margin:0 0 12px;">
        ${displayName ? displayName + " ton" : "Ton"} bilan t'attend 👀
      </h1>
      <p style="font-size:14px;color:#6b7280;line-height:1.75;margin:0 0 20px;">
        Tu as créé ton compte hier mais tu n'as pas encore fait ton bilan.
        Ça prend 5 minutes — et tu vas peut-être comprendre pourquoi tu as mal.
      </p>
      <a href="https://postureatwork.com/onboarding"
         style="display:inline-block;padding:14px 28px;border-radius:100px;background:#2b5ce6;color:#fff;font-size:15px;font-weight:700;text-decoration:none;">
        Faire mon bilan maintenant →
      </a>
    </div>
    <div style="background:#fff;border-radius:16px;padding:18px 22px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <p style="font-size:13px;color:#374151;line-height:1.65;margin:0;">
        💡 <strong>87% des douleurs au travail ont une cause identifiable.</strong>
        Le questionnaire PAW te dit exactement d'où ça vient — et quoi faire en priorité.
      </p>
    </div>
    <div style="text-align:center;padding-top:16px;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#d1d5db;margin:0;">PostureAtWork · <a href="https://postureatwork.com/desinscrit" style="color:#d1d5db;">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`;
}

function reminderJ7Email(firstName?: string, score?: number): string {
  const displayName = (firstName && firstName !== "toi")
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1) + ","
    : "";
  const scoreText = score ? `Ton score global est de <strong style="color:#2b5ce6;">${score}/100</strong>. ` : "";
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="background:#111827;display:inline-block;padding:10px 20px;border-radius:10px;">
        <p style="font-size:20px;font-weight:900;color:#fff;margin:0;">PAW<span style="color:#2b5ce6;">.</span></p>
      </div>
    </div>
    <div style="background:#fff;border-radius:20px;padding:28px;border:1px solid #e5e7eb;margin-bottom:16px;">
      <h1 style="font-size:20px;font-weight:900;color:#111827;margin:0 0 12px;">
        ${displayName ? displayName + " il" : "Il"} te manque la moitié de ton analyse 🔒
      </h1>
      <p style="font-size:14px;color:#6b7280;line-height:1.75;margin:0 0 16px;">
        ${scoreText ? scoreText + " M" : "M"}ais 3 dimensions restent verrouillées — sommeil, nutrition, lifestyle.
        Ce sont souvent elles qui expliquent pourquoi les douleurs persistent malgré les efforts.
      </p>
      <div style="background:#f8faff;border-radius:12px;padding:14px 16px;margin-bottom:20px;border:1px solid #dbeafe;">
        ${["🌙 Ton score Sommeil", "🍽️ Ton score Nutrition", "🏃 Ton score Lifestyle"].map(d => `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #eff2ff;">
            <span style="font-size:14px;">${d.split(" ")[0]}</span>
            <span style="font-size:13px;color:#374151;flex:1;">${d.split(" ").slice(1).join(" ")}</span>
            <div style="width:60px;height:6px;border-radius:3px;background:#e5e7eb;position:relative;overflow:hidden;">
              <div style="position:absolute;inset:0;background:linear-gradient(90deg,#2b5ce6,transparent);filter:blur(2px);"></div>
            </div>
            <span style="font-size:12px;color:#9ca3af;">🔒</span>
          </div>
        `).join("")}
      </div>
      <a href="https://postureatwork.com/premium"
         style="display:inline-block;padding:14px 28px;border-radius:100px;background:linear-gradient(135deg,#2b5ce6,#7c3aed);color:#fff;font-size:15px;font-weight:700;text-decoration:none;">
        🔓 Débloquer mon analyse — 19,99€ →
      </a>
      <p style="font-size:11px;color:#9ca3af;margin:10px 0 0;">Accès à vie · Paiement unique · Sans abonnement</p>
    </div>
    <div style="text-align:center;padding-top:16px;border-top:1px solid #e5e7eb;">
      <p style="font-size:11px;color:#d1d5db;margin:0;">PostureAtWork · <a href="https://postureatwork.com/desinscrit" style="color:#d1d5db;">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`;
}
