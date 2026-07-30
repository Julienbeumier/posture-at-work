"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, saveAssessmentForUser } from "@/lib/supabase";
import {
  calculateScores,
  getRecommendations,
  getExercises,
  DEFAULT_ANSWERS,
  type QuestionnaireAnswers,
  type Scores,
} from "@/lib/scoring";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { getJobContent } from "@/lib/job-content";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

// ─── Score color helpers ──────────────────────────────────────────────────────

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

// ─── Animated score circle ────────────────────────────────────────────────────

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

// ─── Inline product per dimension ────────────────────────────────────────────

const DIM_INLINE_PRODUCTS: Record<string, { name: string; url: string; reason: string; price: string }> = {
  "/conseils/setup":     { name: "Rehausseur écran GRIFEMA",           url: "https://amzn.to/3RF8Hn1", reason: "Écran trop bas → charge cervicale +12kg sur la nuque",    price: "~28€" },
  "/conseils/douleurs":  { name: "Coussin lombaire FORTEM",             url: "https://amzn.to/4dIapg4", reason: "Soulage les douleurs lombaires dès la première utilisation", price: "~30€" },
  "/conseils/habitudes": { name: "Bureau assis-debout SONGMICS",        url: "https://amzn.to/4dGGncw", reason: "Alterner assis/debout réduit les douleurs lombaires de 50%", price: "~200€" },
  "/conseils/sommeil":   { name: "Lunettes anti-lumière bleue Horus X", url: "https://amzn.to/4veEs4B", reason: "Bloque la lumière bleue pour retrouver un sommeil naturel",  price: "~30€" },
  "/conseils/lifestyle": { name: "Coussin d'équilibre BODYMATE",        url: "https://amzn.to/3Rh9avh", reason: "Active les muscles du dos sans effort conscient",           price: "~30€" },
  "/conseils/nutrition": { name: "Gourde graduée avec horaires 1.5L",   url: "https://amzn.to/4dVZNJl", reason: "Rappel d'hydratation tout au long de la journée",          price: "~15€" },
};

const DIM_INLINE_PRODUCTS_DEBOUT: Record<string, { name: string; url: string; reason: string; price: string }> = {
  "/conseils/setup":     { name: "Tapis anti-fatigue ergonomique",  url: "https://amzn.to/4fnjrQR",          reason: "Sol dur sans amorti = fatigue musculaire x3 en fin de journée",               price: "~45€" },
  "/conseils/douleurs":  { name: "Semelles orthopédiques de travail", url: "https://amzn.to/4eiCfP5", reason: "Amorties et soutien de voûte plantaire pour journées debout",                 price: "~35€" },
  "/conseils/sommeil":   { name: "Chaussettes de compression graduée", url: "https://amzn.to/4vimwWT", reason: "À porter le matin avant de se lever — prévient jambes lourdes et varices", price: "~20€" },
  "/conseils/lifestyle": { name: "Balle de massage plantaire",       url: "https://amzn.to/4wZhdNP",        reason: "Auto-massage sous le pied après le service — soulage les tensions en 5 min", price: "~15€" },
  "/conseils/habitudes": { name: "Repose-pieds ergonomique",         url: "https://amzn.to/4uMCqZO",                                                                 reason: "Permet d'alterner l'appui et soulage le bas du dos de 25%",                   price: "~35€" },
  "/conseils/nutrition": { name: "Gourde 1.5L graduée",              url: "https://amzn.to/4dVZNJl",                                                                 reason: "Hydratation critique pour les métiers debout — boire sans y penser",          price: "~15€" },
};

// ─── Locked sub-score (non-premium) ──────────────────────────────────────────

function LockedSubScoreBar({ label, emoji, onClick }: { label: string; emoji: string; onClick?: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      style={{ position: "relative", overflow: "hidden", borderRadius: 14,
        padding: "16px 18px", cursor: "pointer",
        background: "rgba(212,162,42,0.04)",
        border: "0.5px solid rgba(212,162,42,0.2)" }}>

        <div style={{ position: "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(to bottom, transparent 30%, rgba(15,15,26,0.85) 100%)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{emoji}</span>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "var(--t55)" }}>{label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 100,
            background: "rgba(212,162,42,0.12)", border: "0.5px solid rgba(212,162,42,0.25)" }}>
            <span style={{ fontSize: 10 }}>🔒</span>
            <span style={{ fontFamily: T.b, fontSize: 10, color: "#d4a22a", fontWeight: 700 }}>Premium</span>
          </div>
        </div>

        <div style={{ height: 5, borderRadius: 100, background: "var(--bg-card-2)",
          marginBottom: 6, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%",
            width: "65%", borderRadius: 100, filter: "blur(3px)",
            background: "linear-gradient(90deg, #d4a22a, #f4a261)" }} />
        </div>

        <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t35)", margin: 0,
          filter: "blur(4px)", userSelect: "none" as const, lineHeight: 1.5 }}>
          Analyse disponible dans le bilan complet — score et recommandations personnalisées
        </p>

        <div style={{ position: "absolute", bottom: 12, left: "50%",
          transform: "translateX(-50%)", zIndex: 3,
          padding: "5px 14px", borderRadius: 100,
          background: "rgba(43,92,230,0.9)",
          boxShadow: "0 2px 12px rgba(43,92,230,0.4)" }}>
          <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 11, color: "#fff" }}>Débloquer →</span>
        </div>
      </motion.div>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────

function SubScoreBar({
  label, emoji, score, interpretation, dimensionPath, dimensionColor, delay = 0, jobType = "bureau",
}: {
  label: string; emoji: string; score: number; interpretation: string;
  dimensionPath: string; dimensionColor: string; delay?: number; jobType?: string;
}) {
  const color = scoreBarColor(score);
  const [expanded, setExpanded] = useState(false);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const inc = score / 40;
      const iv = setInterval(() => {
        cur += inc;
        if (cur >= score) { setDisplayed(score); clearInterval(iv); }
        else setDisplayed(Math.round(cur));
      }, 20);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.b, fontSize: 13, color: "var(--t75)" }}>
            <span>{emoji}</span>
            <span>{label}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15, color }}>{displayed}</span>
            <span style={{ fontSize: 10, color: "var(--t30)" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <div style={{ height: 5, background: "var(--bg-card-2)", borderRadius: 100, overflow: "hidden", marginBottom: 4 }}>
          <motion.div
            style={{ height: "100%", borderRadius: 100, background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.15, ease: "easeOut" }}
          />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontFamily: T.b, fontSize: 12, color: "var(--t50)", lineHeight: 1.6, paddingTop: 4, paddingBottom: 2 }}
            >
              {interpretation}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Link
        href={dimensionPath}
        style={{ textDecoration: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{
          display: "inline-block", marginTop: 4,
          fontFamily: T.b, fontSize: 11, fontWeight: 600,
          color: dimensionColor, cursor: "pointer",
        }}>
          Voir mon plan détaillé →
        </span>
      </Link>
      {score < 70 && (() => {
        const map = jobType === "debout" ? DIM_INLINE_PRODUCTS_DEBOUT : DIM_INLINE_PRODUCTS;
        const p = map[dimensionPath];
        if (!p) return null;
        return (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 12,
            background: `${dimensionColor}10`, border: `0.5px solid ${dimensionColor}30`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🛒</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "var(--text-primary)", margin: 0 }}>{p.name}</p>
              <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t45)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.reason}</p>
            </div>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 12, color: dimensionColor, flexShrink: 0 }}>{p.price}</span>
            <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
              padding: "5px 12px", borderRadius: 100, textDecoration: "none", flexShrink: 0,
              background: "#2b5ce6", fontFamily: T.b, fontWeight: 700, fontSize: 11, color: "#fff",
            }}>Amazon →</a>
          </div>
        );
      })()}
    </motion.div>
  );
}

// ─── Score interpretation ─────────────────────────────────────────────────────

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUB_SCORES: { key: keyof Omit<Scores, "global" | "job_type">; label: string; emoji: string; dimensionPath: string; dimensionColor: string }[] = [
  { key: "setup",       label: "Setup & ergonomie",    emoji: "💻", dimensionPath: "/conseils/setup",     dimensionColor: "#7c9fff" },
  { key: "pain",        label: "Douleurs",              emoji: "🩺", dimensionPath: "/conseils/douleurs",  dimensionColor: "#f09595" },
  { key: "habits",      label: "Habitudes de travail",  emoji: "⏱️", dimensionPath: "/conseils/habitudes", dimensionColor: "#f4a261" },
  { key: "sleep_energy",label: "Sommeil & énergie",     emoji: "🌙", dimensionPath: "/conseils/sommeil",   dimensionColor: "#74c69d" },
  { key: "lifestyle",   label: "Mode de vie actif",     emoji: "🏃", dimensionPath: "/conseils/lifestyle", dimensionColor: "#5dcaa5" },
  { key: "nutrition",   label: "Nutrition & énergie",   emoji: "🍽️", dimensionPath: "/conseils/nutrition", dimensionColor: "#a78bfa" },
];

const PRIORITY_STYLE = {
  urgent: { bg: "rgba(240,149,149,0.08)", border: "rgba(240,149,149,0.25)", tagBg: "rgba(240,149,149,0.15)", tagColor: "#f09595", blob: "rgba(240,149,149,0.12)", label: "Urgent" },
  important: { bg: "rgba(244,162,97,0.08)", border: "rgba(244,162,97,0.22)", tagBg: "rgba(244,162,97,0.15)", tagColor: "#f4a261", blob: "rgba(244,162,97,0.12)", label: "Important" },
  good: { bg: "rgba(116,198,157,0.07)", border: "rgba(116,198,157,0.2)", tagBg: "rgba(116,198,157,0.15)", tagColor: "#74c69d", blob: "rgba(116,198,157,0.10)", label: "Bien joué" },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const { premium } = usePremium();
  const { c } = useTheme();
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [activeTab, setActiveTab] = useState<"recs" | "exercises">("recs");
  const [firstname, setFirstname] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [jobType, setJobType] = useState("bureau");
  const [hasVideoAnalysis, setHasVideoAnalysis] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  useEffect(() => {
    setFirstname(localStorage.getItem("paw_firstname") ?? "");
    const videoData = sessionStorage.getItem("paw_analysis_personne");
    setHasVideoAnalysis(!!videoData);
    const isExample = sessionStorage.getItem("paw_example_mode") === "true"
                   || localStorage.getItem("paw_example_mode") === "true";
    if (!isExample) {
      // Page de vrais résultats — effacer le mode exemple pour que /conseils sache où revenir
      sessionStorage.removeItem("paw_example_mode");
      localStorage.removeItem("paw_example_mode");
    }
    setJobType(isExample ? "bureau" : (localStorage.getItem("paw_job_type") ?? "bureau"));
  }, []);

  useEffect(() => {
    async function saveToSupabase(s: Scores, a: QuestionnaireAnswers | Record<string, unknown>) {
      const isExample = sessionStorage.getItem("paw_example_mode") === "true"
                     || localStorage.getItem("paw_example_mode") === "true";
      if (isExample) { console.log("[PAW] Mode exemple — pas de sauvegarde"); return; }
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { return; }

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
      // 1. sessionStorage (fastest — set immediately after questionnaire)
      const ssScores = sessionStorage.getItem("postureatwork_scores");
      const ssAnswers = sessionStorage.getItem("postureatwork_answers")
                     || sessionStorage.getItem("postureatwork_answers_debout");
      if (ssScores && ssAnswers) {
        const parsedScores = JSON.parse(ssScores) as Scores;
        const parsedAnswers = JSON.parse(ssAnswers) as QuestionnaireAnswers;
        setScores(parsedScores);
        const isExampleNow = sessionStorage.getItem("paw_example_mode") === "true"
                          || localStorage.getItem("paw_example_mode") === "true";
        if (!isExampleNow && parsedScores.job_type) setJobType(parsedScores.job_type);
        setAnswers({ ...DEFAULT_ANSWERS, ...parsedAnswers });
        saveToSupabase(parsedScores, parsedAnswers);
        return;
      }

      // 2. localStorage paw_answers (set after questionnaire submit)
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

      // 3. Supabase latest assessment
      const { data: { user } } = await createClient().auth.getUser();
      console.log("[PAW] Assessments — recherche user:", user?.id);
      if (user) {
        const { data } = await createClient()
          .from("assessments")
          .select("scores, answers")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        console.log("[PAW] Assessment trouvé:", !!data?.scores);
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

      // 4. Nothing found → send to questionnaire
      router.replace("/questionnaire");
    }
    load();
  }, [router]);

  async function sendBilanEmail() {
    if (!emailInput || !scores || !answers) return;
    setEmailLoading(true);
    const recs2 = getRecommendations(scores, answers);
    const exs = getExercises(scores, answers);
    await fetch("/api/emails/send-bilan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput,
        firstname,
        scores,
        recommendations: recs2.slice(0, 3).map(r => r.title),
        topExercise: exs[0]
          ? { name: exs[0].name, duration: exs[0].duration, instruction: exs[0].description }
          : { name: "Rétraction cervicale", duration: "10 rép. × 5 sec", instruction: "Rentre doucement le menton vers la gorge. Tiens 5 secondes. Répète 10 fois." },
      }),
    });
    setEmailSent(true);
    setEmailLoading(false);
  }

  function handleLockedClick() {
    const scores = sessionStorage.getItem("postureatwork_scores");
    const answers = sessionStorage.getItem("postureatwork_answers");
    const jobType = localStorage.getItem("paw_job_type");
    if (!isLoggedIn) {
      if (scores) {
        localStorage.setItem("paw_pending_assessment", JSON.stringify({
          scores, answers, jobType,
          savedAt: new Date().toISOString(),
        }));
      }
      router.push("/auth?redirect=/premium");
    } else {
      router.push("/premium");
    }
  }

  if (!scores || !answers) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.b, fontSize: 14, color: "var(--t40)" }}>Calcul en cours…</span>
      </main>
    );
  }

  const isLocked = !premium;
  const bureauRecs = getRecommendations(scores, answers);
  const deboutRecs: { title: string; description: string; priority: "urgent" | "important" | "good" }[] = [];
  if (jobType === "debout") {
    if (scores.setup < 50) deboutRecs.push({ title: "Ton environnement debout est risqué", description: "Sol dur, chaussures inadaptées ou absence de tapis anti-fatigue s'accumulent chaque jour et génèrent tensions et douleurs aux pieds, jambes et dos.", priority: "urgent" });
    if (scores.pain < 50) deboutRecs.push({ title: "Tes douleurs méritent attention", description: "Les douleurs aux pieds, aux jambes ou au dos liées au travail debout sont évitables avec les bons ajustements.", priority: scores.pain < 30 ? "urgent" : "important" });
    if (scores.habits < 50) deboutRecs.push({ title: "Tu bouges trop peu pendant le service", description: "Même debout, l'immobilité est l'ennemi. Micro-mouvements toutes les 30 minutes relancent la circulation et réduisent la fatigue.", priority: "important" });
    if (scores.lifestyle < 50) deboutRecs.push({ title: "Ton corps a besoin de récupération active", description: "Après une journée debout, surélève les jambes 20 minutes et fais des étirements ciblés — c'est aussi important que le sommeil.", priority: "important" });
    if (scores.sleep_energy < 50) deboutRecs.push({ title: "Ton sommeil ne compense pas la fatigue physique", description: "Un métier debout exige une récupération de qualité. Sans sommeil suffisant, douleurs et fatigue s'accumulent semaine après semaine.", priority: "important" });
    if (deboutRecs.length === 0) deboutRecs.push({ title: "Bonne posture debout !", description: "Tes indicateurs sont corrects. Continue les exercices préventifs (short foot, montées sur pointes) pour rester en forme.", priority: "good" });
  }
  const recs = jobType === "debout" ? deboutRecs : bureauRecs;
  const exercises = getExercises(scores, answers);
  const badge = scoreBadge(scores.global);

  // ── Debout flags (computed from raw answers) ─────────────────────────────
  const rawA = answers as unknown as Record<string, unknown>;
  const deboutFlags = jobType === "debout" ? {
    consultRecommandee: rawA["q_d_crampes_global"] === "service_et_nuit"
      || rawA["q_d_jambes_nuit"] === "perturbe_sommeil"
      || rawA["q_d_varices"] === "importantes"
      || rawA["q_d_jambes_soir"] === "douloureuses",
    crampes: rawA["q_d_crampes_global"] === "nocturnes" || rawA["q_d_crampes_global"] === "service_et_nuit",
    dependanceEnergie: rawA["q_d_energie_boisson"] === "souvent_energisantes" || rawA["q_d_energie_boisson"] === "seul_moyen",
    petitDejInsuffisant: rawA["q_d_petit_dej"] === "juste_cafe" || rawA["q_d_petit_dej"] === "saute",
    autoEval: rawA["q_d_autoevaluation"] as number | null ?? null,
  } : null;

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg, paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.14)", size: 500 },
        { top: "35%", left: "-8%", color: "rgba(116,198,157,0.08)", size: 380 },
        { bottom: "-10%", right: "10%", color: "rgba(244,162,97,0.07)", size: 420 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ paddingTop: 80, paddingBottom: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}
        >
          {/* Chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 100,
            background: isLocked ? "rgba(212,162,42,0.12)" : "rgba(116,198,157,0.12)",
            border: `0.5px solid ${isLocked ? "rgba(212,162,42,0.3)" : "rgba(116,198,157,0.3)"}`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: isLocked ? "#d4a22a" : "#74c69d" }} />
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600, color: isLocked ? "#d4a22a" : "#74c69d" }}>
              {isLocked ? "🔒 Analyse partielle — 3 dimensions sur 6" : "✅ Analyse complète"}
            </span>
          </div>

          {/* Circle */}
          <ScoreCircle score={scores.global} isPartial={!hasVideoAnalysis} />

          {/* Badge */}
          <div style={{
            padding: "6px 16px", borderRadius: 100,
            background: badge.bg, border: `0.5px solid ${badge.border}`,
          }}>
            <span style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: badge.color }}>{badge.label}</span>
          </div>

          {/* Bloc conversion premium (B3) */}
          {isLocked && (() => {
            const painScore = scores.pain ?? 70;
            const setupScore = scores.setup ?? 70;
            const habitsScore = scores.habits ?? 70;
            const mainIssue = painScore < setupScore && painScore < habitsScore
              ? { msg: "tes douleurs sont plus sérieuses qu'elles n'y paraissent" }
              : setupScore < habitsScore
              ? { msg: "ton poste génère des contraintes que tu ne vois pas encore" }
              : { msg: "tes habitudes de travail accumulent une charge invisible" };
            const hasPain = scores.pain < 60;

            return (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ width: "100%", borderRadius: 24, overflow: "hidden", marginBottom: 8 }}>

                <div style={{
                  padding: "24px 24px 20px",
                  background: "linear-gradient(135deg, rgba(43,92,230,0.12), rgba(124,58,237,0.10))",
                  border: "1.5px solid rgba(43,92,230,0.25)",
                  borderBottom: "none",
                  borderRadius: "24px 24px 0 0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: "rgba(43,92,230,0.15)", border: "1px solid rgba(43,92,230,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      🔍
                    </div>
                    <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>
                      Ce qu&apos;on a trouvé — et ce qu&apos;on ne peut pas encore te dire
                    </p>
                  </div>

                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.75, margin: "0 0 16px" }}>
                    Ton score de <strong style={{ color: "var(--text-primary)" }}>{scores.global}/100</strong> est calculé
                    sur 6 dimensions. Tu vois ci-dessous tes 3 premières dimensions —
                    {hasPain
                      ? ` mais si tu as mal, c'est souvent le sommeil, le stress ou la nutrition qui amplifient la douleur sans que tu le saches.`
                      : ` mais les 3 dimensions cachées peuvent complètement changer le diagnostic.`
                    }
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { emoji: "🌙", label: "Sommeil & énergie",
                        teaser: hasPain
                          ? "Ta récupération musculaire la nuit détermine si tes douleurs s'améliorent ou empirent..."
                          : "Ton niveau d'énergie au travail est directement lié à la qualité de ton sommeil..." },
                      { emoji: "🍽️", label: "Nutrition",
                        teaser: "L'inflammation alimentaire peut multiplier par 2 l'intensité des douleurs musculaires..." },
                      { emoji: "🏃", label: "Lifestyle & bien-être",
                        teaser: "Ton niveau de stress au travail génère du cortisol qui maintient tes muscles en tension..." },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: "12px 14px", borderRadius: 12,
                        background: "rgba(0,0,0,0.15)", border: "0.5px solid rgba(255,255,255,0.06)",
                        display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden" }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{item.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "var(--text-primary)", margin: "0 0 3px" }}>{item.label}</p>
                          <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)", margin: 0,
                            filter: "blur(5px)", userSelect: "none" as const, lineHeight: 1.4 }}>
                            {item.teaser}
                          </p>
                        </div>
                        <div style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 100,
                          background: "rgba(212,162,42,0.15)", border: "0.5px solid rgba(212,162,42,0.3)" }}>
                          <span style={{ fontFamily: T.b, fontSize: 11, color: "#d4a22a", fontWeight: 700 }}>🔒 Verrouillé</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: "20px 24px",
                  background: "rgba(43,92,230,0.06)",
                  border: "1.5px solid rgba(43,92,230,0.25)",
                  borderTop: "0.5px solid rgba(43,92,230,0.15)",
                  borderRadius: "0 0 24px 24px",
                }}>
                  <div onClick={handleLockedClick} style={{ cursor: "pointer" }}>
                    <motion.div
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      style={{ padding: "16px 0", borderRadius: 100, textAlign: "center",
                        background: "linear-gradient(135deg, #2b5ce6, #7c3aed)",
                        boxShadow: "0 4px 24px rgba(43,92,230,0.4)",
                        fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "#fff",
                        cursor: "pointer", marginBottom: 10 }}>
                      🔓 Voir mon analyse complète →
                    </motion.div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                    {["6 dimensions analysées", "Analyse vidéo IA", "Rapport PDF", "Conseils personnalisés"].map(f => (
                      <span key={f} style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)" }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Bilan complet / incomplet */}
          {hasVideoAnalysis ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 100, marginBottom: 16,
              background: "rgba(29,158,117,0.12)", border: "0.5px solid rgba(29,158,117,0.3)",
            }}>
              <span style={{ fontSize: 12 }}>✅</span>
              <span style={{ fontFamily: T.b, fontSize: 12, color: "#1d9e75", fontWeight: 600 }}>
                Bilan complet — Analyse vidéo incluse
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                borderRadius: 20, padding: "20px 24px", marginBottom: 20,
                background: "rgba(124,58,237,0.08)",
                border: "1.5px solid rgba(124,58,237,0.35)",
                position: "relative", overflow: "hidden",
                textAlign: "left", width: "100%",
              }}
            >
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160, borderRadius: "50%",
                background: "rgba(124,58,237,0.15)", filter: "blur(40px)",
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>
                    🎥
                  </div>
                  <div>
                    <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 15, color: "#c4b5fd", margin: 0, lineHeight: 1.2 }}>
                      Ton bilan est incomplet
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 11, color: "rgba(196,181,253,0.6)", margin: 0 }}>
                      La partie la plus importante manque encore
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.7, margin: "0 0 16px" }}>
                  Le questionnaire analyse tes habitudes et ta douleur déclarée.
                  Mais <strong style={{ color: "#c4b5fd" }}>personne n&apos;a encore vu ta posture réelle.</strong>
                  {" "}L&apos;analyse vidéo IA est la seule façon de savoir exactement
                  ce que ton corps fait au travail — en 40 secondes.
                </p>
                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  {[
                    "Analyse posturale en temps réel",
                    "Détection des déséquilibres",
                    "Conseils ultra-personnalisés",
                  ].map(f => (
                    <span key={f} style={{
                      padding: "4px 12px", borderRadius: 100,
                      background: "rgba(124,58,237,0.12)", border: "0.5px solid rgba(124,58,237,0.25)",
                      fontFamily: T.b, fontSize: 11, color: "#c4b5fd",
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
                {isLocked ? (
                  <div onClick={handleLockedClick} style={{ cursor: "pointer" }}>
                    <div style={{
                      padding: "14px 0", borderRadius: 100, textAlign: "center",
                      background: "linear-gradient(135deg, #2b5ce6, #7c3aed)",
                      boxShadow: "0 4px 20px rgba(43,92,230,0.4)",
                      fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff",
                    }}>
                      🔒 Inclus dans le bilan complet →
                    </div>
                  </div>
                ) : (
                  <Link href="/video-intro" style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
                      background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                      fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#fff",
                    }}>
                      🎥 Analyser ma posture →
                    </div>
                  </Link>
                )}
                <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", textAlign: "center", marginTop: 8 }}>
                  40 secondes · Via ta caméra · Résultats immédiats
                </p>
              </div>
            </motion.div>
          )}

          <div>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "var(--text-primary)", margin: 0, marginBottom: 8, lineHeight: 1.2 }}>
              {firstname ? `Le bilan de ${firstname}` : "Ton bilan PostureAtWork"}
            </h1>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
              {firstname ? `Voici ce qu'on a analysé pour toi, ${firstname}. ` : ""}
              {scores.global >= 70
                ? "Tu as de bonnes bases. Affine les détails pour atteindre un confort optimal."
                : scores.global >= 50
                ? "Plusieurs zones méritent ton attention. Suis les recommandations ci-dessous."
                : "Ton corps envoie des signaux importants. Agis sur les priorités urgentes dès maintenant."}
            </p>
          </div>

          {/* Job intro */}
          {jobType !== "bureau" && (() => {
            const jc = getJobContent(jobType);
            return (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 18px", borderRadius: 14, background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.18)", maxWidth: 480, textAlign: "left" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{jc.emoji}</span>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.65, margin: 0 }}>{jc.intro}</p>
              </div>
            );
          })()}
        </motion.div>

        {/* ── SHARE BUTTON ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            onClick={() => router.push("/partage")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 100, cursor: "pointer",
              background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.35)",
              fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#7c9fff",
            }}
          >
            📱 Partager mon score
          </div>
        </motion.div>

        {/* ── FLAG ALERTS (debout) ── */}
        {deboutFlags && (() => {
          const cards: { bg: string; border: string; color: string; text: string }[] = [];
          if (deboutFlags.consultRecommandee) cards.push({ bg: "rgba(226,75,74,0.10)", border: "rgba(226,75,74,0.30)", color: "#f09595", text: "⚕️ Certains de tes symptômes méritent un avis professionnel. Consulte un médecin ou kinésithérapeute." });
          if (deboutFlags.crampes) cards.push({ bg: "rgba(244,162,97,0.10)", border: "rgba(244,162,97,0.28)", color: "#f4a261", text: "😴 Tes crampes nocturnes ont une solution simple — voir les conseils sommeil" });
          if (deboutFlags.dependanceEnergie) cards.push({ bg: "rgba(244,162,97,0.10)", border: "rgba(244,162,97,0.28)", color: "#f4a261", text: "⚡ Tu dépends des boissons énergisantes pour tenir — il y a une meilleure solution" });
          if (deboutFlags.petitDejInsuffisant) cards.push({ bg: "rgba(43,92,230,0.10)", border: "rgba(43,92,230,0.28)", color: "#7c9fff", text: "🍳 Un vrai petit-déjeuner changerait significativement ton niveau d'énergie et ta posture" });
          if (!cards.length) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {cards.map((c, i) => (
                <div key={i} style={{ padding: "12px 16px", borderRadius: 14, background: c.bg, border: `0.5px solid ${c.border}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: c.color, lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </motion.div>
          );
        })()}

        {/* ── AUTO-EVAL CARD (debout only) ── */}
        {deboutFlags?.autoEval !== null && deboutFlags?.autoEval !== undefined && (() => {
          const ae = deboutFlags.autoEval as number;
          const selfPct = Math.round(((ae - 1) / 4) * 100);
          const diff = selfPct - scores.global;
          let msg = "";
          let msgColor = "var(--t55)";
          if (diff > 20) { msg = "Tu t'estimes mieux que ton score — tes douleurs sont peut-être devenues normales pour toi. C'est un signal à ne pas ignorer."; msgColor = "#f4a261"; }
          else if (diff < -20) { msg = "Tu es plus solide que tu ne le crois ! Ton score est meilleur que ton ressenti."; msgColor = "#74c69d"; }
          else { msg = "Ton ressenti correspond bien à ta situation réelle — bonne conscience corporelle."; msgColor = "#7c9fff"; }
          return (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              style={{ borderRadius: 18, padding: "16px 20px", background: "var(--bg-card)", border: "0.5px solid var(--border-2)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "var(--t55)", margin: 0 }}>🪞 Ton ressenti vs ton score réel</p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, background: "var(--bg-card-2)", border: "0.5px solid var(--border)" }}>
                  <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#a8c0ff", margin: 0 }}>{selfPct}</p>
                  <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", margin: 0 }}>Ton ressenti</p>
                </div>
                <span style={{ color: "var(--t25)", fontSize: 18 }}>vs</span>
                <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.18)" }}>
                  <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#7c9fff", margin: 0 }}>{scores.global}</p>
                  <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", margin: 0 }}>Score PAW</p>
                </div>
              </div>
              <p style={{ fontFamily: T.b, fontSize: 12, color: msgColor, lineHeight: 1.6, margin: 0 }}>{msg}</p>
            </motion.div>
          );
        })()}

        {/* ── 6 SOUS-SCORES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            borderRadius: 24, padding: "24px 28px",
            background: "var(--bg-card)", border: "0.5px solid var(--border-2)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>Tes 6 indicateurs</span>
            <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t30)" }}>Clique pour détails</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {SUB_SCORES.map(({ key, label, emoji, dimensionPath, dimensionColor }, i) => {
              const locked = isLocked && ["sleep_energy", "lifestyle", "nutrition"].includes(key);
              if (locked) return <LockedSubScoreBar key={key} label={label} emoji={emoji} onClick={handleLockedClick} />;
              return (
                <SubScoreBar
                  key={key}
                  label={label}
                  emoji={emoji}
                  score={scores[key]}
                  interpretation={scoreInterpretation(key, scores[key], answers)}
                  dimensionPath={dimensionPath}
                  dimensionColor={dimensionColor}
                  delay={i * 0.15}
                  jobType={jobType}
                />
              );
            })}
            {!hasVideoAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                style={{
                  borderRadius: 20, padding: "20px 22px", marginTop: 8,
                  background: "rgba(124,58,237,0.06)",
                  border: "1px dashed rgba(124,58,237,0.35)",
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{ fontSize: 28, flexShrink: 0 }}>🎥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#c4b5fd", margin: 0 }}>
                      Analyse IA posturale
                    </p>
                    <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(124,58,237,0.2)", fontFamily: T.b, fontSize: 10, fontWeight: 700, color: "#c4b5fd" }}>
                      NON ANALYSÉ
                    </span>
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: 0 }}>
                    Claude Vision n&apos;a pas encore analysé ta posture réelle.
                  </p>
                </div>
                <Link href="/video-intro" style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div style={{
                    padding: "8px 16px", borderRadius: 100,
                    background: "#7c3aed", color: "#fff",
                    fontFamily: T.b, fontWeight: 700, fontSize: 12, cursor: "pointer",
                  }}>
                    Analyser →
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            display: "flex", gap: 4, padding: 4, borderRadius: 16,
            background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)",
            marginBottom: 16,
          }}
        >
          {(["recs", "exercises"] as const).map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, cursor: "pointer",
                background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === tab ? "var(--text-primary)" : "var(--t35)",
                fontFamily: T.b, fontWeight: 600, fontSize: 13,
                transition: "all 0.2s ease",
              }}
            >
              {tab === "recs" ? "📋 Recommandations" : "🤸 Exercices"}
            </div>
          ))}
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === "recs" && (
            <motion.div
              key="recs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}
            >
              {recs.slice(0, 5).map((rec, i) => {
                const cfg = PRIORITY_STYLE[rec.priority];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      borderRadius: 20, padding: "20px 22px", position: "relative", overflow: "hidden",
                      background: cfg.bg, border: `0.5px solid ${cfg.border}`,
                    }}
                  >
                    {/* blob top-right */}
                    <div style={{
                      position: "absolute", top: -30, right: -30, width: 120, height: 120,
                      borderRadius: "50%", background: cfg.blob, filter: "blur(30px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.3 }}>{rec.title}</span>
                        <span style={{
                          flexShrink: 0, padding: "3px 10px", borderRadius: 100,
                          background: cfg.tagBg, color: cfg.tagColor,
                          fontFamily: T.b, fontWeight: 600, fontSize: 11,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t60)", lineHeight: 1.65, margin: 0 }}>
                        {rec.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "exercises" && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}
            >
              {exercises.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    borderRadius: 20, padding: "20px 22px",
                    background: "rgba(43,92,230,0.07)", border: "0.5px solid rgba(43,92,230,0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{ex.emoji}</span>
                    <div>
                      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>{ex.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <span style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff" }}>⏱ {ex.duration}</span>
                        <span style={{ color: "var(--t20)", fontSize: 10 }}>·</span>
                        <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t40)" }}>{ex.targets}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.65, margin: 0 }}>
                    {ex.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROCHAINES ÉTAPES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          style={{ marginBottom: 16 }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Tes prochaines étapes
          </p>
          {(() => {
            const lowestDim = SUB_SCORES.reduce((a, b) => (scores[a.key] ?? 100) <= (scores[b.key] ?? 100) ? a : b);
            return (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <div style={{ borderRadius: 18, padding: "16px 14px", background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🧘</div>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "#7c9fff", margin: "0 0 4px" }}>Exercices</p>
                    <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t40)", margin: 0 }}>Programme guidé</p>
                  </div>
                </Link>
                <Link href={lowestDim.dimensionPath} style={{ textDecoration: "none" }}>
                  <div style={{ borderRadius: 18, padding: "16px 14px", background: "rgba(124,58,237,0.10)", border: "0.5px solid rgba(124,58,237,0.25)", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "#a78bfa", margin: "0 0 4px" }}>Plan prioritaire</p>
                    <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t40)", margin: 0 }}>{lowestDim.label}</p>
                  </div>
                </Link>
                <Link href="/video-intro" style={{ textDecoration: "none" }}>
                  <div style={{ borderRadius: 18, padding: "16px 14px", background: "rgba(45,106,79,0.10)", border: "0.5px solid rgba(45,106,79,0.25)", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color: "#74c69d", margin: "0 0 4px" }}>Analyse IA</p>
                    <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t40)", margin: 0 }}>Posture vidéo</p>
                  </div>
                </Link>
              </div>
            );
          })()}
        </motion.div>

        {/* ── LE SAVIEZ-VOUS ── */}
        {(() => {
          const jc = getJobContent(jobType);
          const facts = jc.risk_profile.did_you_know;
          if (!facts.length) return null;
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
              style={{ borderRadius: 22, padding: "20px 22px", marginBottom: 16, background: "rgba(167,139,250,0.06)", border: "0.5px solid rgba(167,139,250,0.18)" }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#a78bfa", margin: "0 0 12px" }}>💡 Le saviez-vous ?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {facts.map((fact, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "#a78bfa", fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", lineHeight: 1.6, margin: 0 }}>{fact}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* ── PREMIUM UPSELL / STATUS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            borderRadius: 24, padding: "24px 26px",
            background: premium ? "rgba(45,106,79,0.10)" : "rgba(43,92,230,0.08)",
            border: `0.5px solid ${premium ? "rgba(116,198,157,0.25)" : "rgba(43,92,230,0.25)"}`,
            marginBottom: 16,
          }}
        >
          {premium ? (
            <>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#74c69d", margin: "0 0 6px" }}>
                👑 Accès premium activé
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", margin: "0 0 16px" }}>
                Tous les outils PAW sont débloqués pour toi.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Conseils détaillés accessibles", "Analyse vidéo IA accessible", "Dashboard & historique accessible", "Rapport PDF accessible"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#74c69d" }}>✓</span>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "var(--text-primary)", margin: "0 0 6px" }}>
                🚀 Tu n&apos;as accès qu&apos;à une partie de PAW
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", margin: "0 0 16px" }}>
                Tu as accès à l&apos;analyse complète — 6 dimensions + vidéo IA
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {["Conseils détaillés bloqués", "Analyse vidéo IA bloquée", "Dashboard bloqué", "Rapport PDF bloqué"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#f09595" }}>✕</span>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
              <div onClick={handleLockedClick} style={{ cursor: "pointer" }}>
                <div style={{ padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: "pointer", background: "linear-gradient(135deg, #2b5ce6, #7c9fff)", boxShadow: "0 0 24px rgba(43,92,230,0.35)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                  🔓 Débloquer mon analyse complète — 19,99€ →
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* ── SAVE CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            borderRadius: 24, padding: "24px 26px",
            background: "linear-gradient(135deg, rgba(43,92,230,0.10), rgba(43,92,230,0.06))",
            border: "0.5px solid rgba(43,92,230,0.25)",
            marginBottom: 16,
          }}
        >
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: 0, marginBottom: 6 }}>
            Reçois ton rapport par email
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.65, marginBottom: 16 }}>
            Tes 3 priorités + un exercice ciblé — directement dans ta boîte.
          </p>

          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(45,106,79,0.15)", border: "0.5px solid rgba(116,198,157,0.35)", display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ fontSize: 18 }}>📧</span>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "#74c69d", margin: 0 }}>
                  Ton rapport a été envoyé à <strong>{emailInput}</strong> !
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendBilanEmail()}
                    placeholder="ton@email.com"
                    style={{
                      flex: 1, padding: "12px 16px", borderRadius: 12,
                      background: "var(--bg-card-2)", border: "0.5px solid rgba(255,255,255,0.15)",
                      color: "var(--text-primary)", fontSize: 14, fontFamily: T.b, outline: "none",
                    }}
                  />
                  <div
                    onClick={sendBilanEmail}
                    style={{
                      padding: "12px 18px", borderRadius: 12, cursor: emailLoading ? "default" : "pointer",
                      background: emailInput ? "#2b5ce6" : "rgba(43,92,230,0.25)",
                      fontFamily: T.h, fontWeight: 800, fontSize: 13,
                      color: emailInput ? "#fff" : "rgba(255,255,255,0.3)",
                      flexShrink: 0, transition: "all 0.2s",
                    }}
                  >
                    {emailLoading ? "…" : "Envoyer"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Link href="/final-report" style={{ textDecoration: "none", display: "block", marginTop: 12 }}>
            <div style={{
              padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "transparent", border: "0.5px solid rgba(43,92,230,0.40)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "#7c9fff",
            }}>
              Sauvegarder sur mon compte →
            </div>
          </Link>
        </motion.div>

        {/* ── PDF DOWNLOAD ── */}
        <div
          onClick={() => router.push("/rapport-pdf")}
          style={{
            padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
            background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
            border: "1px solid rgba(99,102,241,0.3)",
            fontFamily: T.b, fontWeight: 700, fontSize: 14, color: "#a5b4fc",
            marginBottom: 10,
          }}
        >
          📄 Télécharger mon rapport PDF
        </div>

        {/* ── BOTTOM ACTIONS ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/questionnaire" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)",
            }}>
              🔄 Refaire le bilan
            </div>
          </Link>
          <Link href="/" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "12px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "var(--bg-card-2)", border: "0.5px solid var(--border-2)",
              fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--t45)",
            }}>
              🏠 Accueil
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
