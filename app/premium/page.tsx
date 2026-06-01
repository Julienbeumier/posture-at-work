"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { emoji: "📋", title: "Conseils détaillés", color: "#7c9fff", bg: "rgba(43,92,230,0.08)", border: "rgba(43,92,230,0.20)", desc: "Des conseils vraiment personnalisés selon tes réponses. Pas des conseils génériques — des actions concrètes pour TON profil, TON métier, TES douleurs." },
  { emoji: "🧘", title: "Hub exercices complet", color: "#74c69d", bg: "rgba(45,106,79,0.08)", border: "rgba(45,106,79,0.20)", desc: "30 exercices avec timer, guide vocal et programmes adaptés à ton métier. Au bureau, à la maison, en voiture, en voyage. 15 minutes par jour." },
  { emoji: "🎥", title: "Analyse vidéo IA", color: "#a78bfa", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.20)", desc: "Claude Vision analyse ta posture réelle en 60 secondes. Détecte ce que tu ne vois pas toi-même. Rapport complet immédiat." },
  { emoji: "📈", title: "Dashboard & historique", color: "#f4a261", bg: "rgba(212,98,42,0.08)", border: "rgba(212,98,42,0.20)", desc: "Suit ton évolution bilan après bilan. Graphique de progression, delta par dimension, streak d'exercices. Vois tes progrès." },
  { emoji: "📄", title: "Rapport PDF pro", color: "#5dcaa5", bg: "rgba(29,158,117,0.08)", border: "rgba(29,158,117,0.20)", desc: "Un rapport complet et professionnel à télécharger. Questionnaire + analyse vidéo en un seul document. Partageable avec ton médecin ou kiné." },
  { emoji: "♾️", title: "Accès à vie", color: "#d4a22a", bg: "rgba(212,162,42,0.08)", border: "rgba(212,162,42,0.20)", desc: "Un seul paiement. Accès pour toujours. Pas d'abonnement, pas de surprise. Tous les futurs bilans inclus." },
];

const ROWS = [
  { section: "QUESTIONNAIRE & SCORES", items: [
    { label: "Score global sur 100", free: true, premium: true },
    { label: "6 scores par dimension", free: true, premium: true },
    { label: "Questionnaire adaptatif", free: true, premium: true },
  ]},
  { section: "CONSEILS", items: [
    { label: "Aperçu des conseils", free: true, premium: true },
    { label: "Conseils détaillés complets", free: false, premium: true },
    { label: "Actions prioritaires", free: false, premium: true },
    { label: "Contenu adapté à ton métier", free: false, premium: true },
  ]},
  { section: "EXERCICES & MOBILITÉ", items: [
    { label: "3 exercices basiques", free: true, premium: true },
    { label: "30 exercices + 6 programmes", free: false, premium: true },
    { label: "Timer interactif", free: false, premium: true },
    { label: "Guide vocal", free: false, premium: true },
    { label: "Programmes par métier", free: false, premium: true },
  ]},
  { section: "ANALYSE VIDÉO IA", items: [
    { label: "Analyse posture", free: false, premium: true },
    { label: "Analyse setup bureau", free: false, premium: true },
    { label: "Rapport vidéo personnalisé", free: false, premium: true },
  ]},
  { section: "SUIVI & HISTORIQUE", items: [
    { label: "Dashboard personnel", free: false, premium: true },
    { label: "Historique bilans illimité", free: false, premium: true },
    { label: "Graphique évolution", free: false, premium: true },
    { label: "Score de progression", free: false, premium: true },
  ]},
  { section: "RAPPORT & EXPORT", items: [
    { label: "Rapport PDF complet", free: false, premium: true },
    { label: "Partage de score", free: false, premium: true },
  ]},
  { section: "EMAILS", items: [
    { label: "Email post-bilan", free: true, premium: true },
    { label: "Séquence conseils personnalisés", free: false, premium: true },
  ]},
];

const TESTIMONIALS = [
  { initials: "MA", color: "#2b5ce6", name: "Marie A.", role: "UX Designer, Paris", text: "Les conseils détaillés m'ont permis de comprendre pourquoi j'avais mal au cou. En 2 semaines, fini.", badge: "Score +26 pts" },
  { initials: "SL", color: "#f4a261", name: "Sophie L.", role: "Caissière, Lyon", text: "Le programme d'exercices debout a changé mes fins de service. Je rentre chez moi sans avoir mal aux pieds.", badge: "Score +29 pts" },
  { initials: "RD", color: "#74c69d", name: "Romain D.", role: "RH, Bordeaux", text: "J'ai fait faire les bilans à toute mon équipe. Le dashboard individuel de chacun est vraiment complet.", badge: "Équipe de 12" },
];

const FAQ = [
  {
    q: "Combien de temps l'accès beta gratuit dure-t-il ?",
    a: "On ne peut pas donner de date précise — ça dépend de notre rythme de développement. Ce qu'on peut dire : tous les comptes créés pendant la beta gardent l'accès premium à vie, même après le passage en payant.",
  },
  {
    q: "Que se passe-t-il quand PAW devient payant ?",
    a: "Ton accès reste gratuit à vie. Le 9.99€ ne s'applique qu'aux nouveaux comptes créés après le lancement officiel.",
  },
  {
    q: "L'analyse vidéo est-elle sécurisée ?",
    a: "Les frames vidéo sont envoyées à l'API Claude pour analyse et ne sont pas stockées sur nos serveurs. La vidéo complète n'est jamais uploadée.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Check({ val }: { val: boolean }) {
  return (
    <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 14, color: val ? "#2d6a4f" : "rgba(226,75,74,0.5)" }}>
      {val ? "✅" : "❌"}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
      <div onClick={() => setOpen(v => !v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", cursor: "pointer", gap: 12 }}>
        <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#f0f0fa" }}>{q}</span>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "rgba(220,220,245,0.4)", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.6)", lineHeight: 1.7, paddingBottom: 16, margin: 0 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PremiumPage() {
  const router = useRouter();

  const hasBilan = typeof window !== "undefined" && !!sessionStorage.getItem("postureatwork_scores");
  const ctaHref = hasBilan ? "/dashboard" : "/onboarding";

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", paddingTop: 80, paddingBottom: 80, position: "relative", overflow: "hidden" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(43,92,230,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(116,198,157,0.07) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

        {/* ── SECTION 1 : HERO ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", paddingBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 16px", borderRadius: 100, background: "rgba(212,162,42,0.12)", border: "0.5px solid rgba(212,162,42,0.35)" }}>
            <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#d4a22a" }}>🎁 Accès premium offert en beta</span>
          </div>

          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 30, color: "#f0f0fa", lineHeight: 1.25, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Le questionnaire te dit<br />
            <span style={{ color: "#7c9fff" }}>où tu en es.</span><br />
            Le premium t&apos;aide<br />
            à t&apos;améliorer. <span style={{ color: "#74c69d" }}>Pour toujours.</span>
          </h1>

          <p style={{ fontFamily: T.b, fontSize: 15, color: "rgba(220,220,245,0.6)", lineHeight: 1.75, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
            Conseils détaillés, exercices guidés, analyse vidéo IA, suivi dans le temps — tout ce dont ton corps a besoin pour aller mieux au travail.
          </p>

          <div onClick={() => router.push(ctaHref)}
            style={{ display: "inline-block", padding: "16px 32px", borderRadius: 100, cursor: "pointer", background: "#2b5ce6", boxShadow: "0 0 40px rgba(43,92,230,0.5), 0 4px 20px rgba(43,92,230,0.4)", fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 12 }}>
            🚀 Activer mon accès premium gratuit →
          </div>

          <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.35)", margin: 0 }}>
            ✨ Gratuit pendant la beta · Normalement 9.99€ à vie
          </p>
        </motion.div>

        {/* ── SECTION 2 : COMPARAISON ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", textAlign: "center", marginBottom: 28 }}>
            Qu&apos;est-ce qui change avec le premium ?
          </h2>

          <div style={{ borderRadius: 20, overflow: "hidden", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ padding: "14px 20px", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "rgba(220,220,245,0.4)", letterSpacing: "0.05em" }}>FONCTIONNALITÉ</div>
              <div style={{ padding: "14px 8px", textAlign: "center", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "rgba(220,220,245,0.4)" }}>Gratuit</div>
              <div style={{ padding: "14px 8px", textAlign: "center", background: "rgba(43,92,230,0.08)", borderLeft: "0.5px solid rgba(43,92,230,0.15)" }}>
                <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "#7c9fff" }}>Premium</span>
                <br />
                <span style={{ fontFamily: T.b, fontSize: 9, color: "#d4a22a" }}>🎁 Offert</span>
              </div>
            </div>

            {ROWS.map((section, si) => (
              <div key={si}>
                <div style={{ padding: "8px 20px", background: "rgba(255,255,255,0.02)", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 10, color: "rgba(220,220,245,0.3)", letterSpacing: "0.08em" }}>{section.section}</span>
                </div>
                {section.items.map((row, ri) => (
                  <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", borderTop: "0.5px solid rgba(255,255,255,0.04)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <div style={{ padding: "11px 20px", fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.65)" }}>{row.label}</div>
                    <div style={{ padding: "11px 8px", textAlign: "center" }}><Check val={row.free} /></div>
                    <div style={{ padding: "11px 8px", textAlign: "center", background: "rgba(43,92,230,0.06)", borderLeft: "0.5px solid rgba(43,92,230,0.10)" }}><Check val={row.premium} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── SECTION 3 : 6 FEATURES ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", textAlign: "center", marginBottom: 20 }}>
            Tout ce que tu débloques
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.06 }}
                style={{ borderRadius: 18, padding: "18px 16px", background: f.bg, border: `0.5px solid ${f.border}` }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.emoji}</div>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: f.color, margin: "0 0 8px" }}>{f.title}</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.55)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── SECTION 4 : URGENCE BETA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 48 }}>
          <div style={{ borderRadius: 24, padding: "36px 28px", textAlign: "center", background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
            <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", marginBottom: 16 }}>
              Accès premium offert — mais pas pour longtemps
            </h2>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.6)", lineHeight: 1.8, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
              PostureAtWork est en phase beta avec ses premiers utilisateurs.<br /><br />
              Pendant cette période, <strong style={{ color: "#f0f0fa" }}>TOUT le premium est entièrement gratuit</strong> — analyse vidéo, dashboard, exercices complets, rapport PDF.<br /><br />
              Dès le lancement officiel, l&apos;accès sera à <strong style={{ color: "#d4a22a" }}>9.99€ en one-shot</strong> (accès à vie).<br /><br />
              <strong style={{ color: "#74c69d" }}>Si tu actives maintenant → accès à vie offert.</strong>
            </p>

            <motion.div
              animate={{ boxShadow: ["0 0 30px rgba(43,92,230,0.4)", "0 0 60px rgba(43,92,230,0.6)", "0 0 30px rgba(43,92,230,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => router.push(ctaHref)}
              style={{ display: "inline-block", padding: "18px 36px", borderRadius: 100, cursor: "pointer", background: "#2b5ce6", fontFamily: T.h, fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 16 }}>
              🚀 Activer mon accès premium gratuit →
            </motion.div>

            <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.35)", margin: 0 }}>
              Sans carte bancaire · Sans engagement · Juste créer un compte gratuit
            </p>
          </div>
        </motion.div>

        {/* ── SECTION 5 : TÉMOIGNAGES ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", textAlign: "center", marginBottom: 20 }}>
            Ce qu&apos;ils disent
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ borderRadius: 18, padding: "20px 20px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.h, fontWeight: 900, fontSize: 14, color: "#fff", flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#f0f0fa", margin: 0 }}>{t.name}</p>
                    <p style={{ fontFamily: T.b, fontSize: 11, color: "rgba(220,220,245,0.4)", margin: 0 }}>{t.role}</p>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(116,198,157,0.12)", border: "0.5px solid rgba(116,198,157,0.3)", fontFamily: T.h, fontWeight: 700, fontSize: 11, color: "#74c69d", flexShrink: 0 }}>
                    {t.badge}
                  </span>
                </div>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.65)", lineHeight: 1.65, margin: 0 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── SECTION 6 : FAQ ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", textAlign: "center", marginBottom: 20 }}>
            Questions fréquentes
          </h2>
          <div style={{ borderRadius: 20, padding: "4px 24px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </motion.div>

        {/* ── FINAL CTA ── */}
        <div style={{ textAlign: "center" }}>
          <div onClick={() => router.push(ctaHref)}
            style={{ display: "inline-block", padding: "16px 32px", borderRadius: 100, cursor: "pointer", background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.4)", fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 12 }}>
            🚀 Activer maintenant — c&apos;est gratuit
          </div>
          <p style={{ fontFamily: T.b, fontSize: 11, color: "rgba(220,220,245,0.3)" }}>Accès à vie offert pendant la beta</p>
        </div>

      </div>
    </main>
  );
}
