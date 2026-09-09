"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, saveAssessmentForUser } from "@/lib/supabase";
import {
  calculateScores,
  DEFAULT_ANSWERS,
  type QuestionnaireAnswers,
  type Scores,
} from "@/lib/scoring";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { useTheme } from "@/contexts/ThemeContext";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

function scoreBarColor(score: number) {
  if (score >= 70) return "#74c69d";
  if (score >= 50) return "#f4a261";
  return "#f09595";
}

function scoreBadge(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 70) return { label: "Bonne santé", color: "#74c69d", bg: "rgba(116,198,157,0.12)", border: "rgba(116,198,157,0.3)" };
  if (score >= 50) return { label: "À améliorer", color: "#f4a261", bg: "rgba(244,162,97,0.12)", border: "rgba(244,162,97,0.3)" };
  return { label: "Attention requise", color: "#f09595", bg: "rgba(240,149,149,0.12)", border: "rgba(240,149,149,0.3)" };
}

function ScoreCircle({ score, isPartial = false }: { score: number; isPartial?: boolean }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const step = score / 60;
      const iv = setInterval(() => {
        cur += step;
        if (cur >= score) { setDisplayed(score); clearInterval(iv); }
        else setDisplayed(Math.round(cur));
      }, 16);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(t);
  }, [score]);

  const size = 140;
  const sw = 6;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (displayed / 100) * circ;
  const color = scoreBarColor(score);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(43,92,230,0.12)"
          stroke="rgba(43,92,230,0.35)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 38, color: "#a8c0ff", lineHeight: 1 }}>
          {displayed}
        </span>
        <span style={{ fontSize: 11, color: "var(--t45)", marginTop: 2 }}>/100</span>
        {isPartial && (
          <span style={{ fontSize: 9, color: "#f4a261", marginTop: 1, fontFamily: T.b, fontWeight: 600 }}>
            incomplet
          </span>
        )}
      </div>
    </div>
  );
}

function SubScoreBar({
  label, emoji, score, interpretation, delay = 0,
}: {
  label: string; emoji: string; score: number; interpretation: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ padding: "16px", borderRadius: 16,
        background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
            color: "var(--text-primary)" }}>{label}</span>
        </div>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18,
          color: score >= 70 ? "#74c69d" : score >= 50 ? "#f4a261" : "#f09595" }}>
          {score}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 100,
        background: "rgba(255,255,255,0.06)", marginBottom: 8, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 100,
            background: score >= 70 ? "#74c69d" : score >= 50 ? "#f4a261" : "#f09595" }}
        />
      </div>
      <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)",
        margin: 0, lineHeight: 1.4 }}>{interpretation}</p>
    </motion.div>
  );
}

function scoreInterpretation(key: keyof Omit<Scores, "global" | "job_type">, score: number, answers: QuestionnaireAnswers): string {
  switch (key) {
    case "setup":
      if (score >= 70) return "Ton poste de travail est bien configuré. Maintiens ces bonnes habitudes.";
      if (score >= 50) return "Ton setup a quelques failles. Un réglage d'écran ou de distance peut faire une grande différence.";
      return `${answers.q1 === "laptop" ? "Le laptop seul est ergonomiquement le pire setup possible. " : ""}Ton écran mal placé génère une tension cervicale permanente.`;
    case "pain":
      if (score >= 70) return "Peu ou pas de douleurs signalées — ton corps s'en sort bien pour l'instant.";
      if (score >= 50) return "Des douleurs modérées sont présentes. Agir maintenant évite la chronicisation.";
      return "Tes douleurs sont significatives et/ou installées depuis longtemps. Une consultation est recommandée.";
    case "habits":
      if (score >= 70) return "Tes habitudes de travail sont saines. Tu bouges suffisamment dans ta journée.";
      if (score >= 50) return "Tu pourrais améliorer tes pauses et ton rapport au téléphone.";
      return `${answers.q13 >= 8 ? `${answers.q13}h assis/jour dépasse le seuil critique. ` : ""}Tu restes trop longtemps immobile.`;
    case "sleep_energy":
      if (score >= 70) return "Ta récupération est bonne. Hydratation et sommeil sont au rendez-vous.";
      if (score >= 50) return "Quelques ajustements sur le sommeil ou l'hydratation amélioreraient ton énergie.";
      return `${answers.q18 === "exhausted" ? "Te réveiller épuisé est un signal fort. " : ""}Le manque de récupération amplifie toutes les douleurs.`;
    case "lifestyle":
      if (score >= 70) return "Ton mode de vie actif compense bien la sédentarité du travail.";
      if (score >= 50) return "Un peu plus de sport ou d'exercices ferait une nette différence.";
      return "Ton corps manque de mouvement pour contrebalancer la sédentarité. C'est réversible avec peu d'efforts.";
    case "nutrition":
      if (score >= 70) return "Ton alimentation soutient bien ton énergie et ta concentration tout au long de la journée.";
      if (score >= 50) return "Quelques ajustements dans tes habitudes alimentaires amélioreraient ton énergie au bureau.";
      return `${answers.qn1 === "screen" ? "Manger devant l'écran empêche la vraie récupération. " : ""}Ton alimentation crée des pics glycémiques qui épuisent ta concentration.`;
    default:
      return "";
  }
}

const DIMENSION_LINKS: Record<string, string> = {
  setup:        "/conseils/setup",
  pain:         "/conseils/douleurs",
  habits:       "/conseils/habitudes",
  sleep_energy: "/conseils/sommeil",
  nutrition:    "/conseils/nutrition",
  lifestyle:    "/conseils/lifestyle",
};

const SUB_SCORES: { key: keyof Omit<Scores, "global" | "job_type">; label: string; emoji: string }[] = [
  { key: "setup",        label: "Setup & ergonomie",   emoji: "💻" },
  { key: "pain",         label: "Douleurs",             emoji: "🩺" },
  { key: "habits",       label: "Habitudes de travail", emoji: "⏱️" },
  { key: "sleep_energy", label: "Sommeil & énergie",    emoji: "🌙" },
  { key: "lifestyle",    label: "Mode de vie actif",    emoji: "🏃" },
  { key: "nutrition",    label: "Nutrition & énergie",  emoji: "🍽️" },
];

export default function ResultsPage() {
  const router = useRouter();
  const { c } = useTheme();
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [firstname, setFirstname] = useState("");
  const [hasVideoAnalysis, setHasVideoAnalysis] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setFirstname(localStorage.getItem("paw_firstname") ?? "");
    const videoData = sessionStorage.getItem("paw_analysis_personne");
    setHasVideoAnalysis(!!videoData);
    const isExample = sessionStorage.getItem("paw_example_mode") === "true"
                   || localStorage.getItem("paw_example_mode") === "true";
    if (!isExample) {
      sessionStorage.removeItem("paw_example_mode");
      localStorage.removeItem("paw_example_mode");
    }
  }, []);

  useEffect(() => {
    async function saveToSupabase(s: Scores, a: QuestionnaireAnswers | Record<string, unknown>) {
      const isExample = sessionStorage.getItem("paw_example_mode") === "true"
                     || localStorage.getItem("paw_example_mode") === "true";
      if (isExample) return;
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let companyId = localStorage.getItem("paw_company_id");
        if (!companyId) {
          const { data: membership } = await supabase
            .from("company_memberships")
            .select("company_id")
            .eq("user_id", user.id)
            .eq("role", "employee")
            .maybeSingle();
          if (membership?.company_id) {
            companyId = membership.company_id;
            localStorage.setItem("paw_company_id", membership.company_id);
          }
        }

        const { error } = await saveAssessmentForUser(user.id, s, a as Record<string, unknown>, null, companyId);
        if (error) console.error("[PAW] Erreur sauvegarde:", error);
        else console.log("[PAW] Bilan sauvegardé ✅");
      } catch (e) {
        console.error("[PAW] Exception sauvegarde:", e);
      }
    }

    async function load() {
      const ssScores = sessionStorage.getItem("postureatwork_scores");
      const ssAnswers = sessionStorage.getItem("postureatwork_answers")
                     || sessionStorage.getItem("postureatwork_answers_debout");
      if (ssScores && ssAnswers) {
        const parsedScores = JSON.parse(ssScores) as Scores;
        const parsedAnswers = JSON.parse(ssAnswers) as QuestionnaireAnswers;
        setScores(parsedScores);
        setAnswers({ ...DEFAULT_ANSWERS, ...parsedAnswers });
        saveToSupabase(parsedScores, parsedAnswers);
        return;
      }

      const stored = localStorage.getItem("paw_answers");
      if (stored) {
        const parsed: QuestionnaireAnswers = { ...DEFAULT_ANSWERS, ...JSON.parse(stored) };
        const s = calculateScores(parsed);
        setAnswers(parsed);
        setScores(s);
        sessionStorage.setItem("postureatwork_scores", JSON.stringify(s));
        sessionStorage.setItem("postureatwork_answers", JSON.stringify(parsed));
        saveToSupabase(s, parsed);
        return;
      }

      const { data: { user } } = await createClient().auth.getUser();
      if (user) {
        const { data } = await createClient()
          .from("assessments")
          .select("scores, answers")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.scores) {
          const parsedAnswers: QuestionnaireAnswers = data.answers
            ? { ...DEFAULT_ANSWERS, ...(data.answers as Partial<QuestionnaireAnswers>) }
            : DEFAULT_ANSWERS;
          setScores(data.scores as Scores);
          setAnswers(parsedAnswers);
          sessionStorage.setItem("postureatwork_scores", JSON.stringify(data.scores));
          sessionStorage.setItem("postureatwork_answers", JSON.stringify(parsedAnswers));
          return;
        }
      }

      router.replace("/questionnaire");
    }
    load();
  }, [router]);

  if (!scores || !answers) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.b, fontSize: 14, color: "var(--t40)" }}>Calcul en cours…</span>
      </main>
    );
  }

  const badge = scoreBadge(scores.global);

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg, paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.14)", size: 500 },
        { top: "35%", left: "-8%", color: "rgba(116,198,157,0.08)", size: 380 },
        { bottom: "-10%", right: "10%", color: "rgba(244,162,97,0.07)", size: 420 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>

        {/* ── 1. HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ paddingTop: 80, paddingBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}
        >
          <ScoreCircle score={scores.global} isPartial={!hasVideoAnalysis} />

          <div style={{ padding: "6px 16px", borderRadius: 100, background: badge.bg, border: `0.5px solid ${badge.border}` }}>
            <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: badge.color }}>
              {hasVideoAnalysis ? "✅ Analyse complète" : "⚠️ Analyse partielle"} · {badge.label}
            </span>
          </div>

          <div>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 22 : 28,
              color: "var(--text-primary)", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              {firstname ? `Le bilan de ${firstname}` : "Ton bilan PostureAtWork"}
            </h1>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
              {scores.global >= 70
                ? "Tu as de bonnes bases. Affine les détails pour atteindre un confort optimal."
                : scores.global >= 50
                ? "Plusieurs zones méritent ton attention. Consulte le rapport complet pour les priorités."
                : "Ton corps envoie des signaux importants. Agis sur les priorités urgentes dès maintenant."}
            </p>
          </div>
        </motion.div>

        {/* ── 2. CTA VIDÉO (si pas de vidéo) ── */}
        {!hasVideoAnalysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ marginBottom: 24 }}>
            <div style={{ textAlign: "center", padding: "28px 24px", borderRadius: 20,
              background: "rgba(43,92,230,0.06)", border: "1px solid rgba(43,92,230,0.2)",
              marginBottom: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 20 : 24,
                color: "var(--text-primary)", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
                Ton analyse est incomplète
              </p>
              <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
                lineHeight: 1.7, maxWidth: 460, margin: "0 auto 20px" }}>
                Le questionnaire révèle ce que tu <em>penses</em> de ta posture.
                La vidéo montre ce que ton corps <em>fait réellement</em>.
                Sans elle, on ne voit que la moitié du tableau.
              </p>
              <div style={{ display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 8, marginBottom: 24, textAlign: "left" }}>
                {[
                  { icon: "🦆", text: "Projection de tête et charge cervicale" },
                  { icon: "🦅", text: "Position des épaules et du dos" },
                  { icon: "💻", text: "Hauteur et distance de l'écran" },
                  { icon: "🪑", text: "Position assise et soutien lombaire" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center",
                    padding: "10px 12px", borderRadius: 10,
                    background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t65)" }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/video-intro" style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ display: "inline-block", padding: "16px 36px",
                    borderRadius: 100, background: "#2b5ce6", color: "#fff",
                    fontFamily: T.h, fontWeight: 800, fontSize: 16,
                    boxShadow: "0 4px 24px rgba(43,92,230,0.4)", cursor: "pointer" }}>
                  Analyser ma posture en 40 secondes →
                </motion.div>
              </Link>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", margin: "12px 0 0" }}>
                Depuis ton PC ou par QR code sur mobile · Résultat immédiat
              </p>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 12,
              background: "rgba(244,162,97,0.06)", border: "0.5px solid rgba(244,162,97,0.2)",
              display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", margin: 0 }}>
                Les scores ci-dessous sont <strong style={{ color: "var(--text-primary)" }}>
                basés uniquement sur ton questionnaire</strong> — ils peuvent changer
                significativement après l&apos;analyse vidéo.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 3. 2 CARDS SCORES (si vidéo faite) ── */}
        {hasVideoAnalysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ marginBottom: 24 }}>
            <div style={{ display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 12 }}>
              <div style={{ padding: "20px", borderRadius: 16,
                background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>📋</span>
                  <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
                    color: "var(--text-primary)", margin: 0 }}>Questionnaire</p>
                </div>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 36,
                  color: scores.global >= 70 ? "#74c69d" :
                         scores.global >= 50 ? "#f4a261" : "#f09595",
                  margin: "0 0 4px", letterSpacing: "-1px" }}>
                  {scores.global}<span style={{ fontSize: 16, fontWeight: 400, color: "var(--t40)" }}>/100</span>
                </p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", margin: 0 }}>
                  30 questions analysées
                </p>
              </div>
              {(() => {
                const videoScore = (() => { try { return JSON.parse(sessionStorage.getItem("paw_analysis_personne") || "{}")?.globalPostureScore; } catch { return null; } })();
                const setupScore = (() => { try { return JSON.parse(sessionStorage.getItem("paw_analysis_poste") || "{}")?.globalSetupScore; } catch { return null; } })();
                const avgVideo = videoScore && setupScore
                  ? Math.round((videoScore + setupScore) / 2)
                  : videoScore ?? setupScore ?? null;
                if (avgVideo === null) return null;
                return (
                  <div style={{ padding: "20px", borderRadius: 16,
                    background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 20 }}>🎥</span>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14,
                        color: "var(--text-primary)", margin: 0 }}>Analyse vidéo</p>
                    </div>
                    <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 36,
                      color: avgVideo >= 70 ? "#74c69d" :
                             avgVideo >= 50 ? "#f4a261" : "#f09595",
                      margin: "0 0 4px", letterSpacing: "-1px" }}>
                      {avgVideo}<span style={{ fontSize: 16, fontWeight: 400, color: "var(--t40)" }}>/100</span>
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", margin: 0 }}>
                      Posture · Setup · Corrélations
                    </p>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* ── 4. 6 SCORES (cliquables, 2 colonnes) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ borderRadius: 20, padding: "24px 28px",
            background: "var(--bg-card)", border: "0.5px solid var(--border-2)",
            marginBottom: 20 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16,
            color: "var(--text-primary)", margin: "0 0 16px" }}>
            Tes 6 indicateurs
          </p>
          <div style={{ display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 12 }}>
            {SUB_SCORES.map(({ key, label, emoji }, i) => (
              <Link key={key} href={DIMENSION_LINKS[key]} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <SubScoreBar
                    label={label}
                    emoji={emoji}
                    score={scores[key]}
                    interpretation={scoreInterpretation(key, scores[key], answers)}
                    delay={i * 0.1}
                  />
                  <div style={{ position: "absolute", top: 14, right: 14,
                    fontSize: 11, color: "var(--t30)", pointerEvents: "none" }}>→</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── 5. CTA RAPPORT (si vidéo faite) ── */}
        {hasVideoAnalysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ marginBottom: 20 }}>
            <Link href="/final-report" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                style={{ padding: "20px 24px", borderRadius: 16, cursor: "pointer",
                  background: "rgba(116,198,157,0.06)", border: "1px solid rgba(116,198,157,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 16, flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15,
                    color: "var(--text-primary)", margin: "0 0 4px" }}>
                    ✅ Ton rapport complet est prêt
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: 0 }}>
                    Top 3 priorités · Actions concrètes · Exercices personnalisés
                  </p>
                </div>
                <div style={{ padding: "12px 24px", borderRadius: 100,
                  background: "#74c69d", color: "#fff",
                  fontFamily: T.h, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  Voir mon rapport →
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* ── BOTTOM ACTIONS ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/questionnaire" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
              🔄 Refaire le bilan
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{ padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)" }}>
              🏠 Mon dashboard
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
