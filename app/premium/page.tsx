"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePremium } from "@/hooks/usePremium";

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

const FAQ = [
  {
    q: "C'est quoi exactement le paiement ?",
    a: "Un seul paiement de 19,99€. Pas d'abonnement, pas de renouvellement automatique. Tu paies une fois et tu as accès à vie — y compris tous les futurs bilans et fonctionnalités.",
  },
  {
    q: "Et si je ne suis pas satisfait ?",
    a: "On rembourse sans question dans les 7 jours. Envoie un email à hello@postureatwork.com avec ton numéro de commande et c'est réglé sous 24h.",
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
        <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{q}</span>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--t40)", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t60)", lineHeight: 1.7, paddingBottom: 16, margin: 0 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PremiumPage() {
  const router = useRouter();
  const { premium: alreadyPremium } = usePremium();
  const [user, setUser] = useState<User | null>(null);
  const [userScores, setUserScores] = useState<Record<string, number> | null>(null);
  const [hasBilanComplet, setHasBilanComplet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const scoresRaw = sessionStorage.getItem("postureatwork_scores");
    if (scoresRaw) {
      setUserScores(JSON.parse(scoresRaw));
      setHasBilanComplet(true);
    }

    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const hasBilan = typeof window !== "undefined" && !!sessionStorage.getItem("postureatwork_scores");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleCheckout() {
    if (!user) {
      router.push("/auth?redirect=/premium");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        setCheckoutError(data.error);
        setCheckoutLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setCheckoutError("Erreur de connexion. Réessaie.");
      setCheckoutLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: 80, paddingBottom: 80, position: "relative", overflow: "hidden" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(43,92,230,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(116,198,157,0.07) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

        {/* ── ALREADY PREMIUM ── */}
        {alreadyPremium && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ borderRadius: 20, padding: "40px 32px", background: "rgba(45,106,79,0.12)", border: "0.5px solid rgba(116,198,157,0.30)", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
              <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#74c69d", marginBottom: 12 }}>
                Tu as déjà le premium activé !
              </h1>
              <p style={{ fontFamily: T.b, fontSize: 15, color: "var(--t65)", lineHeight: 1.7, marginBottom: 28 }}>
                Tous les accès sont débloqués.<br />Conseils détaillés, analyse vidéo IA, dashboard, rapport PDF — tout est à toi.
              </p>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <div style={{ display: "inline-block", padding: "15px 32px", borderRadius: 100, background: "#74c69d", fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--bg-primary)", cursor: "pointer" }}>
                  ← Retour au dashboard
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── MAIN CONTENT (non-premium) ── */}
        {!alreadyPremium && (<>

          {/* ── SECTION 1 : HERO ── */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", paddingBottom: 48 }}>

            {hasBilanComplet && (
              <div style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 10,
                padding: "8px 16px", borderRadius: 100,
                background: "rgba(212,162,42,0.1)", border: "0.5px solid rgba(212,162,42,0.3)" }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <span style={{ fontFamily: T.b, fontSize: 13, color: "#d4a22a", fontWeight: 600 }}>
                  Ton bilan est prêt — l&apos;analyse complète t&apos;attend
                </span>
              </div>
            )}

            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 28 : 36,
              color: "var(--text-primary)", marginBottom: 16, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              {hasBilanComplet
                ? <>Tu as répondu aux questions.<br /><span style={{ color: "#2b5ce6" }}>Voici ce que tu n&apos;as pas encore vu.</span></>
                : <>Ton corps mérite une analyse<br /><span style={{ color: "#2b5ce6" }}>vraiment complète.</span></>
              }
            </h1>

            {hasBilanComplet && userScores && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  { label: "Setup", score: userScores.setup, emoji: "💻" },
                  { label: "Douleurs", score: userScores.pain, emoji: "🩺" },
                  { label: "Habitudes", score: userScores.habits, emoji: "⏱️" },
                ].map(d => (
                  <div key={d.label} style={{ padding: "10px 16px", borderRadius: 16,
                    background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                    <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)" }}>{d.emoji} {d.label}</span>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 20,
                      color: d.score < 50 ? "#f09595" : d.score < 70 ? "#f4a261" : "#74c69d",
                      margin: "2px 0 0" }}>{d.score}/100</p>
                  </div>
                ))}
                {[
                  { label: "Sommeil", emoji: "🌙" },
                  { label: "Nutrition", emoji: "🍽️" },
                  { label: "Lifestyle", emoji: "🏃" },
                ].map(d => (
                  <div key={d.label} style={{ padding: "10px 16px", borderRadius: 16,
                    background: "rgba(212,162,42,0.06)", border: "0.5px solid rgba(212,162,42,0.2)",
                    position: "relative" }}>
                    <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)" }}>{d.emoji} {d.label}</span>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 20,
                      color: "#d4a22a", margin: "2px 0 0", filter: "blur(6px)", userSelect: "none" }}>
                      ??/100
                    </p>
                    <span style={{ position: "absolute", top: 6, right: 8, fontSize: 11 }}>🔒</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontFamily: T.b, fontSize: 15, color: "var(--t55)", lineHeight: 1.7,
              maxWidth: 480, margin: "0 auto 28px" }}>
              {hasBilanComplet && userScores && (userScores.pain ?? 100) < 60
                ? "Tes douleurs ont des causes que le bilan partiel ne révèle pas encore. Le sommeil, la nutrition et le stress jouent souvent un rôle central."
                : "6 dimensions analysées. Conseils personnalisés. Analyse vidéo IA. Tout ce qu'il faut pour comprendre et agir."
              }
            </p>

            <motion.div
              animate={{ boxShadow: ["0 0 30px rgba(43,92,230,0.3)", "0 0 50px rgba(43,92,230,0.5)", "0 0 30px rgba(43,92,230,0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              onClick={handleCheckout}
              style={{ display: "inline-block", padding: "15px 32px", borderRadius: 100,
                cursor: checkoutLoading ? "default" : "pointer",
                opacity: checkoutLoading ? 0.7 : 1,
                background: "linear-gradient(135deg, #2b5ce6, #7c3aed)",
                fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 12 }}>
              {checkoutLoading ? "Redirection vers le paiement…" : "🔓 Débloquer mon analyse complète — 19,99€ →"}
            </motion.div>

            {checkoutError && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#f09595",
                textAlign: "center", marginBottom: 8 }}>{checkoutError}</p>
            )}

            <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)" }}>
              Paiement sécurisé · Accès à vie · 19,99€ one-shot
            </p>
          </motion.div>

          {/* ── SECTION 2 : CE QUE TU VAS DÉCOUVRIR ── */}
          {hasBilanComplet && userScores && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ marginBottom: 48 }}>
              <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22,
                color: "var(--text-primary)", textAlign: "center", marginBottom: 20 }}>
                Ce que tu vas découvrir
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ...((userScores.pain ?? 100) < 60 ? [{
                    icon: "🩺",
                    title: "Pourquoi tu as vraiment mal",
                    desc: "Le bilan complet croise tes douleurs avec ton sommeil, ta nutrition et ton stress — les 3 amplificateurs que le bilan partiel ne voit pas.",
                    color: "#f09595",
                    bg: "rgba(240,149,149,0.06)",
                    border: "rgba(240,149,149,0.2)",
                  }] : []),
                  {
                    icon: "🌙",
                    title: "Ton score Sommeil — actuellement caché",
                    desc: "La récupération musculaire pendant le sommeil détermine si tes douleurs s'améliorent ou empirent. Tu vas enfin voir ton score.",
                    color: "#74c69d",
                    bg: "rgba(116,198,157,0.06)",
                    border: "rgba(116,198,157,0.2)",
                  },
                  {
                    icon: "🎥",
                    title: "Ta posture réelle — filmée et analysée par l'IA",
                    desc: "En 40 secondes, Claude Vision analyse ce que tu ne vois pas toi-même : projection de tête, épaules, lombaires. Aucun questionnaire ne peut faire ça.",
                    color: "#a78bfa",
                    bg: "rgba(124,58,237,0.06)",
                    border: "rgba(124,58,237,0.2)",
                  },
                  {
                    icon: "📋",
                    title: "Ton plan d'action personnalisé",
                    desc: "3 actions prioritaires pour cette semaine, basées sur TON profil. Pas des conseils génériques — des actions pour tes douleurs, ton métier, ton mode de vie.",
                    color: "#7c9fff",
                    bg: "rgba(43,92,230,0.06)",
                    border: "rgba(43,92,230,0.2)",
                  },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    style={{ display: "flex", gap: 14, padding: "16px 18px", borderRadius: 16,
                      background: item.bg, border: `0.5px solid ${item.border}` }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
                        color: item.color, margin: "0 0 4px" }}>{item.title}</p>
                      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)",
                        lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SECTION 3 : COMPARAISON ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", textAlign: "center", marginBottom: 28 }}>
              Qu&apos;est-ce qui change avec le premium ?
            </h2>

            <div style={{ borderRadius: 20, overflow: "hidden", border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ padding: "14px 20px", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "var(--t40)", letterSpacing: "0.05em" }}>FONCTIONNALITÉ</div>
                <div style={{ padding: "14px 8px", textAlign: "center", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "var(--t40)" }}>Bilan gratuit</div>
                <div style={{ padding: "14px 8px", textAlign: "center", background: "rgba(43,92,230,0.08)", borderLeft: "0.5px solid rgba(43,92,230,0.15)" }}>
                  <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "#7c9fff" }}>Premium</span>
                  <br />
                  <span style={{ fontFamily: T.b, fontSize: 9, color: "#d4a22a" }}>19,99€ à vie</span>
                </div>
              </div>

              {ROWS.map((section, si) => (
                <div key={si}>
                  <div style={{ padding: "8px 20px", background: "rgba(255,255,255,0.02)", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 10, color: "var(--t30)", letterSpacing: "0.08em" }}>{section.section}</span>
                  </div>
                  {section.items.map((row, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", borderTop: "0.5px solid rgba(255,255,255,0.04)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <div style={{ padding: "11px 20px", fontFamily: T.b, fontSize: 12, color: "var(--t65)" }}>{row.label}</div>
                      <div style={{ padding: "11px 8px", textAlign: "center" }}><Check val={row.free} /></div>
                      <div style={{ padding: "11px 8px", textAlign: "center", background: "rgba(43,92,230,0.06)", borderLeft: "0.5px solid rgba(43,92,230,0.10)" }}><Check val={row.premium} /></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── SECTION 4 : 6 FEATURES ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", textAlign: "center", marginBottom: 20 }}>
              Tout ce que tu débloques
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {FEATURES.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.06 }}
                  style={{ borderRadius: 16, padding: "18px 16px", background: f.bg, border: `0.5px solid ${f.border}` }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{f.emoji}</div>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: f.color, margin: "0 0 8px" }}>{f.title}</p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── SECTION 5 : CTA INTERMÉDIAIRE ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 48 }}>
            <div style={{ borderRadius: 20, padding: "32px 28px", textAlign: "center",
              background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.2)" }}>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", marginBottom: 8 }}>
                Prêt à voir l&apos;analyse complète ?
              </p>
              <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65,
                marginBottom: 20, maxWidth: 380, margin: "0 auto 20px" }}>
                {hasBilanComplet
                  ? "Tu as déjà fait le plus dur. L'analyse est prête. Il ne reste qu'à la débloquer."
                  : "6 dimensions, analyse vidéo IA, rapport PDF complet — tout ce qu'il faut pour comprendre et agir."
                }
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                style={{ display: "inline-block", padding: "15px 32px", borderRadius: 100,
                  cursor: checkoutLoading ? "default" : "pointer",
                  opacity: checkoutLoading ? 0.7 : 1,
                  background: "#2b5ce6",
                  boxShadow: "0 4px 24px rgba(43,92,230,0.4)",
                  fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff" }}>
                {checkoutLoading ? "Redirection vers le paiement…" : "🔓 Débloquer maintenant — 19,99€ →"}
              </motion.div>
              {checkoutError && (
                <p style={{ fontFamily: T.b, fontSize: 12, color: "#f09595",
                  textAlign: "center", marginTop: 8 }}>{checkoutError}</p>
              )}
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", marginTop: 10 }}>
                Paiement sécurisé · Accès à vie · 19,99€ one-shot
              </p>
            </div>
          </motion.div>

          {/* ── SECTION 6 : FAQ ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", textAlign: "center", marginBottom: 20 }}>
              Questions fréquentes
            </h2>
            <div style={{ borderRadius: 20, padding: "4px 24px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
              {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
            </div>
          </motion.div>

          {/* ── FINAL CTA ── */}
          <div style={{ textAlign: "center" }}>
            <div onClick={handleCheckout}
              style={{ display: "inline-block", padding: "15px 32px", borderRadius: 100,
                cursor: checkoutLoading ? "default" : "pointer",
                opacity: checkoutLoading ? 0.7 : 1,
                background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.4)",
                fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 12 }}>
              {checkoutLoading ? "Redirection vers le paiement…" : "🚀 Débloquer — 19,99€ à vie →"}
            </div>
            {checkoutError && (
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#f09595",
                textAlign: "center", marginBottom: 8 }}>{checkoutError}</p>
            )}
            <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t30)" }}>Paiement sécurisé · Sans abonnement</p>
          </div>

        </>)}

      </div>
    </main>
  );
}
