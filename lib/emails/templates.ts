const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://postureatwork.com";

function scoreColor(s: number) {
  return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595";
}

function base(content: string, unsubEmail: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PostureAtWork</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="font-size:22px;font-weight:900;color:#f0f0fa;letter-spacing:-0.5px;">PAW</span>
          <span style="font-size:22px;font-weight:900;color:#7c9fff;">.</span>
          <span style="font-size:12px;color:rgba(220,220,245,0.4);margin-left:12px;">Ton bilan santé au travail</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
          <p style="color:rgba(220,220,245,0.35);font-size:12px;margin:0 0 8px;">
            PostureAtWork — <a href="${APP_URL}" style="color:#7c9fff;text-decoration:none;">${APP_URL.replace("https://","")}</a>
          </p>
          <p style="color:rgba(220,220,245,0.25);font-size:11px;margin:0;">
            <a href="${APP_URL}/api/emails/unsubscribe?email=${encodeURIComponent(unsubEmail)}" style="color:rgba(220,220,245,0.35);text-decoration:underline;">
              Me désinscrire
            </a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, url: string, secondary = false) {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr><td style="background:${secondary ? "transparent" : "#2b5ce6"};border-radius:100px;${secondary ? "border:1.5px solid rgba(255,255,255,0.25);" : ""}padding:13px 28px;">
      <a href="${url}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;">${label}</a>
    </td></tr>
  </table>`;
}

// ─── Template 1 — Post-bilan ──────────────────────────────────────────────────

export interface BilanTemplateData {
  firstname: string;
  email: string;
  globalScore: number;
  recommendations: string[];
  topExercise: { name: string; duration: string; instruction: string };
}

export function emailBilan(d: BilanTemplateData): { subject: string; html: string } {
  const color = scoreColor(d.globalScore);
  const top3 = d.recommendations.slice(0, 3);

  const content = `
    <p style="color:rgba(220,220,245,0.55);font-size:14px;margin:0 0 24px;">Salut ${d.firstname} 👋</p>
    <h1 style="color:#f0f0fa;font-size:24px;font-weight:900;margin:0 0 24px;line-height:1.2;">
      Ton bilan PAW est prêt
    </h1>

    <!-- Score -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;" align="center">
      <tr><td align="center" style="background:${color}18;border:2px solid ${color};border-radius:50%;width:100px;height:100px;text-align:center;vertical-align:middle;">
        <span style="font-size:40px;font-weight:900;color:${color};line-height:1;">${d.globalScore}</span>
        <br/><span style="font-size:11px;color:rgba(220,220,245,0.5);">/100</span>
      </td></tr>
    </table>

    <!-- Priorités -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:20px;background:rgba(43,92,230,0.08);border:0.5px solid rgba(43,92,230,0.20);border-radius:16px;">
        <p style="color:#7c9fff;font-size:13px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em;">Tes 3 priorités</p>
        ${top3.map((r, i) => `
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:${i < 2 ? "12px" : "0"};">
          <tr>
            <td width="28" valign="top" style="padding-top:2px;">
              <span style="background:#2b5ce6;color:#fff;font-size:11px;font-weight:700;border-radius:50%;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;">${i + 1}</span>
            </td>
            <td style="color:rgba(220,220,245,0.80);font-size:13px;line-height:1.5;padding-left:8px;">${r}</td>
          </tr>
        </table>`).join("")}
      </td></tr>
    </table>

    <!-- Exercice du jour -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:20px;background:rgba(45,106,79,0.08);border:0.5px solid rgba(45,106,79,0.22);border-radius:16px;">
        <p style="color:#74c69d;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Ton exercice du jour</p>
        <p style="color:#f0f0fa;font-size:16px;font-weight:800;margin:0 0 6px;">${d.topExercise.name}</p>
        <p style="color:#74c69d;font-size:12px;margin:0 0 10px;">⏱ ${d.topExercise.duration}</p>
        <p style="color:rgba(220,220,245,0.65);font-size:13px;line-height:1.6;margin:0;">${d.topExercise.instruction}</p>
      </td></tr>
    </table>

    <!-- CTA principal -->
    <div style="text-align:center;margin-bottom:20px;">
      ${btn("Voir mon rapport complet →", `${APP_URL}/results`)}
    </div>

    <!-- Teaser vidéo -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;">
      <tr><td style="padding:20px;background:rgba(124,58,237,0.08);border:0.5px solid rgba(124,58,237,0.22);border-radius:16px;text-align:center;">
        <p style="font-size:20px;margin:0 0 10px;">🎬</p>
        <p style="color:#f0f0fa;font-size:15px;font-weight:800;margin:0 0 8px;">Tu veux savoir ce que ton corps révèle vraiment ?</p>
        <p style="color:rgba(220,220,245,0.55);font-size:13px;line-height:1.6;margin:0 0 16px;">Notre IA analyse ta posture en 60 secondes — résultat niveau kiné.</p>
        ${btn("Essayer l'analyse vidéo →", `${APP_URL}/video-intro`, true)}
      </td></tr>
    </table>
  `;

  return {
    subject: `${d.firstname}, ton score PAW est de ${d.globalScore}/100 — voici quoi faire`,
    html: base(content, d.email),
  };
}

// ─── Template 2 — J+3 Tip ────────────────────────────────────────────────────

export interface TipTemplateData {
  firstname: string;
  email: string;
  tip: string;
  tipContext: string;
}

export function emailTip(d: TipTemplateData): { subject: string; html: string } {
  const content = `
    <p style="color:rgba(220,220,245,0.55);font-size:14px;margin:0 0 24px;">Salut ${d.firstname} 👋</p>
    <h1 style="color:#f0f0fa;font-size:22px;font-weight:900;margin:0 0 24px;">Ton tip de la semaine</h1>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr><td style="padding:24px;background:rgba(43,92,230,0.10);border-left:3px solid #2b5ce6;border-radius:0 16px 16px 0;">
        <p style="color:#f0f0fa;font-size:18px;font-weight:700;margin:0 0 12px;line-height:1.4;">💡 ${d.tip}</p>
        <p style="color:rgba(220,220,245,0.60);font-size:13px;line-height:1.65;margin:0;">${d.tipContext}</p>
      </td></tr>
    </table>

    <div style="text-align:center;margin-bottom:16px;">
      ${btn("Voir tous mes conseils →", `${APP_URL}/conseils/setup`)}
    </div>
  `;

  return {
    subject: "💡 Le tip ergonomique qui change tout",
    html: base(content, d.email),
  };
}

// ─── Template 3 — J+7 Témoignage ─────────────────────────────────────────────

export interface TestimonialTemplateData {
  firstname: string;
  email: string;
}

export function emailTestimonial(d: TestimonialTemplateData): { subject: string; html: string } {
  const content = `
    <p style="color:rgba(220,220,245,0.55);font-size:14px;margin:0 0 24px;">Salut ${d.firstname} 👋</p>
    <h1 style="color:#f0f0fa;font-size:22px;font-weight:900;margin:0 0 24px;">Marie a progressé de +23 pts en 3 semaines</h1>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:24px;background:rgba(116,198,157,0.07);border:0.5px solid rgba(116,198,157,0.20);border-radius:16px;">
        <p style="color:rgba(220,220,245,0.80);font-size:15px;font-style:italic;line-height:1.7;margin:0 0 16px;">
          "En 3 semaines j&apos;ai arrêté d&apos;avoir mal au cou. Juste en suivant les reco PAW — sans rien acheter."
        </p>
        <p style="color:#74c69d;font-size:12px;font-weight:700;margin:0;">— Marie A., UX Designer, Paris</p>
      </td></tr>
    </table>

    <p style="color:#f0f0fa;font-size:15px;font-weight:800;margin:0 0 16px;">Ce qu'elle a changé :</p>
    ${[
      "Elle a surélevé son écran avec 3 livres posés dessus",
      "Elle fait la rétraction cervicale toutes les heures (30 sec)",
      "Elle mange loin de son écran le midi — juste 20 min",
    ].map((a, i) => `
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:10px;">
      <tr>
        <td width="28" valign="top"><span style="background:#74c69d;color:#0f0f1a;font-size:11px;font-weight:700;border-radius:50%;display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;">${i + 1}</span></td>
        <td style="color:rgba(220,220,245,0.80);font-size:13px;line-height:1.5;padding-left:8px;">${a}</td>
      </tr>
    </table>`).join("")}

    <div style="text-align:center;margin-top:24px;">
      ${btn("Refaire mon bilan pour voir ma progression →", `${APP_URL}/questionnaire`)}
    </div>
  `;

  return {
    subject: "Marie a amélioré son score de +23 pts — voici comment",
    html: base(content, d.email),
  };
}

// ─── Template 4 — J+14 Rappel bilan ──────────────────────────────────────────

export function emailRappel(d: { firstname: string; email: string }): { subject: string; html: string } {
  const content = `
    <p style="color:rgba(220,220,245,0.55);font-size:14px;margin:0 0 24px;">Salut ${d.firstname} 👋</p>
    <h1 style="color:#f0f0fa;font-size:22px;font-weight:900;margin:0 0 16px;">⏰ 2 semaines ont passé</h1>
    <p style="color:rgba(220,220,245,0.65);font-size:14px;line-height:1.7;margin:0 0 24px;">
      C&apos;est le moment idéal pour refaire ton bilan et mesurer ta progression.
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:20px;background:rgba(43,92,230,0.08);border:0.5px solid rgba(43,92,230,0.20);border-radius:16px;text-align:center;">
        <p style="color:#a8c0ff;font-size:32px;font-weight:900;margin:0 0 6px;">+15 pts</p>
        <p style="color:rgba(220,220,245,0.60);font-size:13px;margin:0;">Progression moyenne des personnes qui refont un bilan toutes les 2 semaines</p>
      </td></tr>
    </table>

    <div style="text-align:center;">
      ${btn("Faire mon nouveau bilan →", `${APP_URL}/questionnaire`)}
    </div>
  `;

  return {
    subject: "⏰ Il est temps de refaire ton bilan PAW",
    html: base(content, d.email),
  };
}

// ─── Template Premium — Bienvenue après paiement ─────────────────────────────

export function premiumWelcomeEmail(firstName?: string): string {
  const name = firstName ?? "toi";
  const items = [
    { emoji: "📊", title: "6 dimensions analysées", desc: "Setup, douleurs, habitudes, sommeil, nutrition, lifestyle — une vision complète de ta santé au travail." },
    { emoji: "🎥", title: "Analyse vidéo IA posturale", desc: "Filme ta posture en 40 secondes. Notre IA détecte ce que ton corps fait réellement au travail." },
    { emoji: "📄", title: "Rapport PDF complet", desc: "Ton bilan personnalisé à garder, partager avec ton kiné ou ton médecin du travail." },
    { emoji: "🧘", title: "Hub exercices complet", desc: "30 exercices ciblés avec programmes progressifs pour corriger tes déséquilibres." },
    { emoji: "♾️", title: "Accès à vie", desc: "Un seul paiement. Tous tes futurs bilans inclus. Pas d'abonnement." },
  ];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans PAW Premium</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:40px;">
      <p style="font-size:28px;font-weight:900;color:#ffffff;margin:0;letter-spacing:-0.5px;">
        PAW<span style="color:#2b5ce6;">.</span>
      </p>
      <p style="font-size:11px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);margin:4px 0 0;text-transform:uppercase;">
        Posture At Work
      </p>
    </div>

    <div style="background:linear-gradient(135deg,rgba(43,92,230,0.15),rgba(124,58,237,0.10));border:1px solid rgba(43,92,230,0.25);border-radius:20px;padding:32px 28px;text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:16px;">🎉</div>
      <h1 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 12px;letter-spacing:-0.5px;line-height:1.2;">
        Bienvenue dans PAW Premium, ${name} !
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.6);line-height:1.7;margin:0;">
        Tu viens de faire quelque chose que peu de gens font —
        investir dans ta santé au travail avant que ça devienne urgent.
        Ton corps te remerciera.
      </p>
    </div>

    <div style="margin-bottom:28px;">
      <p style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">
        Ce que tu as maintenant
      </p>
      ${items.map(item => `
        <div style="display:flex;gap:14px;padding:14px 16px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:8px;">
          <span style="font-size:22px;flex-shrink:0;">${item.emoji}</span>
          <div>
            <p style="font-size:14px;font-weight:700;color:#ffffff;margin:0 0 3px;">${item.title}</p>
            <p style="font-size:12px;color:rgba(255,255,255,0.45);margin:0;line-height:1.5;">${item.desc}</p>
          </div>
        </div>
      `).join("")}
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://postureatwork.com/results"
         style="display:inline-block;padding:16px 36px;border-radius:100px;background:linear-gradient(135deg,#2b5ce6,#7c3aed);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;letter-spacing:-0.3px;box-shadow:0 4px 24px rgba(43,92,230,0.4);">
        🔓 Voir mon analyse complète →
      </a>
      <p style="font-size:12px;color:rgba(255,255,255,0.25);margin:12px 0 0;">
        Ton analyse t'attend sur postureatwork.com
      </p>
    </div>

    <div style="background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;margin-bottom:28px;">
      <p style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.75;margin:0;font-style:italic;">
        "En cabinet, je vois chaque semaine des patients qui auraient pu éviter
        des mois de douleurs s'ils avaient agi plus tôt. Tu viens de faire ce premier pas —
        c'est le plus important."
      </p>
      <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:10px 0 0;">
        — Julien, kinésithérapeute fondateur de PAW
      </p>
    </div>

    <div style="background:rgba(43,92,230,0.08);border:0.5px solid rgba(43,92,230,0.2);border-radius:14px;padding:16px 20px;margin-bottom:32px;">
      <p style="font-size:12px;font-weight:700;color:#7c9fff;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">
        💡 Par où commencer ?
      </p>
      <p style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.65;margin:0;">
        Va d'abord voir ton score <strong style="color:rgba(255,255,255,0.8);">Douleurs</strong> —
        c'est souvent là que tout commence. Ensuite fais l'analyse vidéo pour voir
        ce que ton corps fait réellement. Ça prend 40 secondes et ça change tout.
      </p>
    </div>

    <div style="text-align:center;border-top:0.5px solid rgba(255,255,255,0.08);padding-top:24px;">
      <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0 0 6px;">
        PostureAtWork · hello@postureatwork.com
      </p>
      <p style="font-size:11px;color:rgba(255,255,255,0.15);margin:0;">
        Tu reçois cet email car tu viens d'activer ton accès PAW Premium.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

// ─── Template 5 — J+30 Teaser premium ────────────────────────────────────────

export function emailPremium(d: { firstname: string; email: string }): { subject: string; html: string } {
  const content = `
    <p style="color:rgba(220,220,245,0.55);font-size:14px;margin:0 0 24px;">Salut ${d.firstname} 👋</p>
    <h1 style="color:#f0f0fa;font-size:22px;font-weight:900;margin:0 0 16px;">🎥 Sais-tu vraiment comment tu te tiens ?</h1>
    <p style="color:rgba(220,220,245,0.65);font-size:14px;line-height:1.7;margin:0 0 24px;">
      Tu as fait ton bilan il y a un mois. Mais le questionnaire ne voit pas ce que la caméra capture.
    </p>

    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="padding:20px;background:rgba(124,58,237,0.08);border:0.5px solid rgba(124,58,237,0.20);border-radius:16px;">
        <p style="color:#a78bfa;font-size:13px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">Ce que l&apos;analyse vidéo révèle</p>
        ${[
          ["🦆", "Position réelle de ta tête", "L'angle exact mesuré en temps réel"],
          ["💪", "Tension cervicale mesurée", "En kg de charge sur ta nuque"],
          ["💻", "Setup bureau analysé", "Écran, chaise, distances — tout"],
          ["🛒", "Recommandations produits", "Personnalisées selon tes observations"],
        ].map(([emoji, title, desc]) => `
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
          <tr>
            <td width="32" valign="top" style="font-size:18px;">${emoji}</td>
            <td style="padding-left:10px;">
              <p style="color:#f0f0fa;font-size:13px;font-weight:700;margin:0 0 2px;">${title}</p>
              <p style="color:rgba(220,220,245,0.45);font-size:12px;margin:0;">${desc}</p>
            </td>
          </tr>
        </table>`).join("")}
      </td></tr>
    </table>

    <div style="text-align:center;">
      ${btn("Essayer l'analyse vidéo IA →", `${APP_URL}/video-intro`)}
    </div>
  `;

  return {
    subject: "🎥 Découvre ce que ton corps révèle vraiment",
    html: base(content, d.email),
  };
}
