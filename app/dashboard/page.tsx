"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, saveAssessmentForUser } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "@/contexts/ThemeContext";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { ParcoursStep, ParcoursLinkCard } from "@/components/dashboard/ParcoursStep";
import DailyChecklist from "@/components/dashboard/DailyChecklist";
import SignalForm from "@/components/dashboard/SignalForm";
import RemindersButton from "@/components/dashboard/RemindersButton";
import {
  EXERCISE_GOAL, REBILAN_DAYS, buildChecklist, dimensionScores, focusLabel,
  nextStep, scoreColor, tipOfDay,
} from "@/lib/dashboard";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Issue { zone?: string; element?: string; severity: string; consequence?: string; fix?: string }

interface VideoAnalysis {
  personne?: { globalPostureScore?: number; mainIssues?: Issue[] };
  debout?: { globalPostureScore?: number; mainIssues?: Issue[] };
  poste?: { globalSetupScore?: number; mainIssues?: Issue[] };
}

interface Assessment {
  id: string;
  created_at: string;
  global_score: number;
  scores: Record<string, number>;
  video_analysis: VideoAnalysis | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  };
}

const sevColor = (s: string) => (s === "élevé" ? "#ff7b7b" : s === "modéré" ? "#ffa347" : "#3fe0a0");

function fmtDate(iso: string, withYear = false) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroCircle({ score }: { score: number }) {
  const size = 104; const sw = 8;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div role="img" aria-label={`Score global : ${score} sur 100`} style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(43,92,230,0.12)" stroke="rgba(43,92,230,0.35)" strokeWidth={sw} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 34, color: "var(--text-primary)", lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>/100</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div style={{ height: 80, borderRadius: 18, background: "var(--bg-card-2)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: T.b, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
      color, background: `${color}22`, border: `1px solid ${color}44`,
    }}>{children}</span>
  );
}

const ctaStyle: React.CSSProperties = {
  display: "inline-block", padding: "13px 24px", borderRadius: 100, background: "#2b5ce6", color: "#fff",
  fontFamily: T.h, fontWeight: 700, fontSize: 14, textDecoration: "none", minHeight: 44, boxSizing: "border-box",
};

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { c } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [notAdminError, setNotAdminError] = useState(false);
  const [isB2B, setIsB2B] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const isMobile = useSyncExternalStore(
    cb => { window.addEventListener("resize", cb); return () => window.removeEventListener("resize", cb); },
    () => window.innerWidth < 768,
    () => false,
  );
  const [exerciseDays, setExerciseDays] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dayKey, setDayKey] = useState("");
  const [nowMs, setNowMs] = useState(0);

  // Bilan fait avant la création du compte : on l'enregistre maintenant.
  useEffect(() => {
    async function recoverPendingAssessment() {
      const pending = localStorage.getItem("paw_pending_assessment");
      if (!pending) return;
      try {
        const { scores, answers, jobType, savedAt } = JSON.parse(pending);
        if (Date.now() - new Date(savedAt).getTime() > 4 * 60 * 60 * 1000) {
          localStorage.removeItem("paw_pending_assessment"); return;
        }
        const supabase = createClient();
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u || !scores) return;
        const parsedScores = JSON.parse(scores);
        const parsedAnswers = answers ? JSON.parse(answers) : {};
        const { error } = await saveAssessmentForUser(u.id, parsedScores, parsedAnswers, null, null, jobType ?? "bureau");
        // En cas d'échec on garde le bilan en attente : nouvelle tentative à la prochaine visite.
        if (error) return;
        sessionStorage.setItem("postureatwork_scores", scores);
        if (answers) sessionStorage.setItem("postureatwork_answers", answers);
        if (jobType) localStorage.setItem("paw_job_type", jobType);
        localStorage.removeItem("paw_pending_assessment");
        router.push("/results");
      } catch {
        localStorage.removeItem("paw_pending_assessment");
      }
    }
    recoverPendingAssessment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function recoverOnboarding() {
      const pending = localStorage.getItem("paw_onboarding");
      if (!pending) return;
      const data = JSON.parse(pending);
      if (Date.now() - new Date(data.savedAt).getTime() > 2 * 60 * 60 * 1000) {
        localStorage.removeItem("paw_onboarding"); return;
      }
      if (data.name) localStorage.setItem("paw_firstname", data.name);
      if (data.age) localStorage.setItem("paw_age", data.age);
      if (data.job) localStorage.setItem("paw_job_type", data.job);
      if (data.hoursWeek) localStorage.setItem("paw_hours_week", data.hoursWeek);
      localStorage.removeItem("paw_onboarding");
    }
    recoverOnboarding();
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/auth"); setLoading(false); return; }
      setUser(u);

      const metaName =
        (u.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
        (u.user_metadata?.name as string | undefined)?.split(" ")[0] || null;
      const storedEmail = localStorage.getItem("paw_user_email");
      const storedFirstname = localStorage.getItem("paw_firstname");
      const localName = storedEmail === u.email ? storedFirstname : null;
      setFirstname(metaName || localName || u.email?.split("@")[0] || "");
      localStorage.setItem("paw_user_email", u.email ?? "");

      const now = Date.now();
      const today = new Date(now).toLocaleDateString("sv-SE");
      const weekStart = new Date(now - 6 * 86400000).toLocaleDateString("sv-SE");
      setNowMs(now);
      setDayKey(today);
      try { setChecked(JSON.parse(localStorage.getItem(`paw_checklist_${today}`) ?? "{}")); } catch { setChecked({}); }

      const { data: assessmentsData } = await supabase
        .from("assessments").select("id, created_at, global_score, scores, video_analysis")
        .eq("user_id", u.id).order("created_at", { ascending: false });
      if (assessmentsData && assessmentsData.length > 0) setAssessments(assessmentsData as Assessment[]);

      // Séances d'exercices des 7 derniers jours
      const { data: checkins } = await supabase
        .from("daily_checkins").select("date, exercises_done")
        .eq("user_id", u.id).gte("date", weekStart);
      setExerciseDays((checkins ?? []).filter(r => r.exercises_done).length);

      const { data: membershipData } = await supabase
        .from("company_memberships").select("company_id, anonymous_id, role")
        .eq("user_id", u.id).maybeSingle();
      if (membershipData?.role === "employee") {
        setIsB2B(true);
        setCompanyId(membershipData.company_id);
        setAnonymousId(membershipData.anonymous_id);
      }

      const feedbackKey = `paw_feedback_shown_${u.id}`;
      const premiumSince = localStorage.getItem("paw_premium_since");
      if (!localStorage.getItem(feedbackKey) && premiumSince &&
          now - new Date(premiumSince).getTime() >= 48 * 60 * 60 * 1000) {
        setShowFeedbackBanner(true);
      }

      setLoading(false);

      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "not_admin") {
        setNotAdminError(true);
        window.history.replaceState({}, "", "/dashboard");
      }

      // Nécessaire aux rappels (activés seulement si la personne le demande)
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTask(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { localStorage.setItem(`paw_checklist_${dayKey}`, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  }

  // ─── Computed ────────────────────────────────────────────────────────────────

  const latest = assessments[0] ?? null;
  const previous = assessments[1] ?? null;
  const displayName = firstname || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  const dims = dimensionScores(latest?.scores);
  const tasks = buildChecklist(dims);
  const checklistDone = tasks.filter(t => checked[t.id]).length;
  const va = latest?.video_analysis ?? null;
  const hasVideo = !!va;
  const postureScore = va?.personne?.globalPostureScore ?? va?.debout?.globalPostureScore;
  const setupScore = va?.poste?.globalSetupScore;
  const videoIssues: Issue[] = [
    ...(va?.personne?.mainIssues ?? va?.debout?.mainIssues ?? []).slice(0, 2),
    ...(va?.poste?.mainIssues ?? []).slice(0, 2),
  ].slice(0, 3);
  const daysSince = latest && nowMs ? Math.floor((nowMs - new Date(latest.created_at).getTime()) / 86400000) : 0;
  const daysLeft = Math.max(REBILAN_DAYS - daysSince, 0);
  const delta = latest && previous ? latest.global_score - previous.global_score : null;
  const next = nextStep({ hasVideo, exerciseDays, checklistDone, checklistTotal: tasks.length, daysSinceBilan: daysSince });
  const openStep = next.step ?? 5;
  const score = latest?.global_score ?? 0;

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, position: "relative" }}>
        <BackgroundBlobs blobs={[{ top: "-5%", right: "-5%", color: "rgba(43,92,230,0.12)", size: 400 }]} />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "80px 16px 40px" : "100px 24px 60px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} />)}
        </div>
      </main>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "80px 16px 40px" : "100px 24px 60px" }}>

        {/* ── Alertes ── */}
        {notAdminError && (
          <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 14,
            background: "rgba(255,163,71,0.1)", border: "1px solid rgba(255,163,71,0.3)" }}>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "#ffa347", margin: 0 }}>
              Tu n&apos;as pas accès au dashboard entreprise. Contacte ton administrateur PAW.
            </p>
          </div>
        )}

        {showFeedbackBanner && (
          <motion.div {...fadeUp(0)} style={{ marginBottom: 14, borderRadius: 18, padding: "18px 20px",
            background: "rgba(43,92,230,0.10)", border: "1px solid rgba(43,92,230,0.25)",
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 4px" }}>
                2 minutes pour améliorer PAW ?
              </p>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: 0 }}>
                Ton avis nous aide à construire un meilleur outil de santé au travail.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/feedback" style={{ ...ctaStyle, padding: "10px 18px", fontSize: 13 }}>Donner mon avis</Link>
              <button type="button"
                onClick={() => { setShowFeedbackBanner(false); localStorage.setItem(`paw_feedback_shown_${user!.id}`, "true"); }}
                style={{ padding: "10px 16px", borderRadius: 100, background: "transparent", border: "1px solid var(--border-2)",
                  color: "var(--t55)", fontFamily: T.b, fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                Plus tard
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Score ── */}
        <motion.div {...fadeUp(0)} style={{ padding: "24px", borderRadius: 20, background: "var(--bg-card)",
          border: "1px solid var(--border)", marginBottom: 16, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          {latest && <HeroCircle score={score} />}
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: isMobile ? 24 : 28, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Bonjour{displayName ? ` ${displayName}` : ""}
            </h1>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", margin: "0 0 10px" }}>
              {latest ? `Bilan du ${fmtDate(latest.created_at)}` : "Pas encore de bilan"}
            </p>
            {latest && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <Pill color={scoreColor(score)}>
                  {score >= 70 ? "Bon niveau" : score >= 50 ? "À améliorer" : "Points critiques"}
                </Pill>
                {delta !== null && (
                  <Pill color={delta > 0 ? "#3fe0a0" : delta < 0 ? "#ff7b7b" : "#6f9bff"}>
                    {delta > 0 ? `+${delta} points` : delta < 0 ? `${delta} points` : "Stable"} depuis le bilan précédent
                  </Pill>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {latest && (
          <>
            {/* ── Prochaine étape ── */}
            <motion.div {...fadeUp(0.05)} style={{ padding: "22px 24px", borderRadius: 20, marginBottom: 26,
              background: "rgba(43,92,230,0.12)", border: "1px solid rgba(43,92,230,0.4)" }}>
              <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                color: "#8fb0ff", margin: "0 0 8px" }}>
                {next.step ? `Prochaine étape · Étape ${next.step} sur 5` : "Ton parcours"}
              </p>
              <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 21, color: "var(--text-primary)", margin: "0 0 6px" }}>{next.title}</h2>
              <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t65)", lineHeight: 1.6, margin: next.cta ? "0 0 16px" : 0 }}>{next.text}</p>
              {next.cta && next.href && (next.href.startsWith("#")
                ? <a href={next.href} style={ctaStyle}>{next.cta}</a>
                : <Link href={next.href} style={ctaStyle}>{next.cta}</Link>)}
            </motion.div>

            {/* ── Parcours d'amélioration ── */}
            <motion.div {...fadeUp(0.08)}>
              <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", margin: "0 0 6px" }}>
                Ton parcours d&apos;amélioration
              </h2>
              <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.6, margin: "0 0 18px" }}>
                Cinq étapes, dans l&apos;ordre, pour passer de ton bilan à un poste et des habitudes qui te ménagent.
              </p>

              <ParcoursStep c={c} n={1} title="Comprendre" subtitle="Ton score et tes priorités"
                status="Fait" statusColor="#3fe0a0" defaultOpen={false}>
                <ul style={{ listStyle: "none", margin: "0 0 12px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {dims.slice(0, 3).map((d, i) => (
                    <li key={d.slug}>
                      <Link href={`/conseils/${d.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 12, background: "var(--bg-card-2)", border: "1px solid var(--border)", minHeight: 48 }}>
                        <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "var(--t55)", width: 18 }}>{i + 1}</span>
                        <span style={{ fontFamily: T.b, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{d.label}</span>
                        <span aria-hidden="true" style={{ width: 80, height: 6, borderRadius: 100, background: "var(--border)", overflow: "hidden" }}>
                          <span style={{ display: "block", width: `${d.score}%`, height: "100%", borderRadius: 100, background: scoreColor(d.score) }} />
                        </span>
                        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: scoreColor(d.score), width: 28, textAlign: "right" }}>{d.score}</span>
                        <span aria-hidden="true" style={{ color: "var(--t55)" }}>›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <ParcoursLinkCard c={c}
                  text="Ce sont tes trois dimensions les plus faibles, donc celles qui rapportent le plus. Chacune a sa page de conseils."
                  cta="Voir tous mes résultats" onClick={() => router.push("/results")} />
              </ParcoursStep>

              <ParcoursStep c={c} n={2} title="Corriger ton poste" subtitle="Ce que la vidéo révèle"
                status={hasVideo ? "Fait" : "À faire"} statusColor={hasVideo ? "#3fe0a0" : "#ffa347"} defaultOpen={openStep === 2}>
                {hasVideo ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: setupScore !== undefined && postureScore !== undefined ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 14 }}>
                      {[
                        { label: "Posture observée", value: postureScore, good: "Bonne posture globale", mid: "Quelques corrections", bad: "Points critiques" },
                        { label: "Poste observé", value: setupScore, good: "Poste bien configuré", mid: "Ajustements recommandés", bad: "Poste à reconfigurer" },
                      ].filter(t => t.value !== undefined).map(t => {
                        const v = t.value as number;
                        return (
                          <div key={t.label} style={{ padding: "14px 16px", borderRadius: 14, background: `${scoreColor(v)}14`, border: `1px solid ${scoreColor(v)}33` }}>
                            <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "var(--t55)", margin: "0 0 6px" }}>{t.label}</p>
                            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 30, color: scoreColor(v), margin: "0 0 4px", lineHeight: 1 }}>
                              {v}<span style={{ fontSize: 14, fontWeight: 600, color: "var(--t45)" }}>/100</span>
                            </p>
                            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: 0 }}>{v >= 70 ? t.good : v >= 50 ? t.mid : t.bad}</p>
                          </div>
                        );
                      })}
                    </div>
                    {videoIssues.length > 0 && (
                      <ul style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        {videoIssues.map((issue, i) => {
                          const detail = issue.fix ?? issue.consequence;
                          return (
                            <li key={i} style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: sevColor(issue.severity), flexShrink: 0 }} />
                                <span style={{ fontFamily: T.b, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{issue.zone ?? issue.element}</span>
                                <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: sevColor(issue.severity), padding: "2px 10px", borderRadius: 100, background: `${sevColor(issue.severity)}22` }}>{issue.severity}</span>
                              </div>
                              {detail && <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.55, margin: "8px 0 0 18px" }}>{detail}</p>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <ParcoursLinkCard c={c} text="Le rapport complet détaille chaque point et la façon de le corriger." cta="Voir mon rapport complet" onClick={() => router.push("/final-report")} />
                  </>
                ) : (
                  <ParcoursLinkCard c={c}
                    text="Le questionnaire montre ce que tu penses de ta posture. La vidéo montre ce que ton corps fait réellement, en 40 secondes depuis ton PC ou ton mobile."
                    cta="Analyser ma posture" onClick={() => router.push("/video-intro")} />
                )}
              </ParcoursStep>

              <ParcoursStep c={c} n={3} title="Soulager" subtitle="Des exercices ciblés sur ta priorité"
                status={`${Math.min(exerciseDays, EXERCISE_GOAL)}/${EXERCISE_GOAL} cette semaine`}
                statusColor={exerciseDays >= EXERCISE_GOAL ? "#3fe0a0" : exerciseDays > 0 ? "#6f9bff" : "#ffa347"}
                defaultOpen={openStep === 3}>
                <div style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 12, background: "rgba(63,224,160,0.08)", border: "1px solid rgba(63,224,160,0.25)" }}>
                  <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "#3fe0a0", margin: "0 0 4px" }}>Focus du moment</p>
                  <p style={{ fontFamily: T.b, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" }}>{focusLabel(dims)}</p>
                  <div style={{ display: "flex", gap: 6 }} role="img" aria-label={`${Math.min(exerciseDays, EXERCISE_GOAL)} séances sur ${EXERCISE_GOAL} cette semaine`}>
                    {Array.from({ length: EXERCISE_GOAL }, (_, i) => (
                      <span key={i} style={{ flex: 1, height: 6, borderRadius: 100, background: i < exerciseDays ? "#3fe0a0" : "var(--border)" }} />
                    ))}
                  </div>
                </div>
                <ParcoursLinkCard c={c}
                  text={`Des séances courtes, adaptées à tes résultats. Objectif : ${EXERCISE_GOAL} séances par semaine.`}
                  cta="Voir mon programme" onClick={() => router.push("/mobilite")} />
              </ParcoursStep>

              <ParcoursStep c={c} n={4} title="Ancrer" subtitle="Les bons réflexes du quotidien"
                status={`${checklistDone}/${tasks.length} aujourd'hui`}
                statusColor={checklistDone === tasks.length ? "#3fe0a0" : "#6f9bff"} defaultOpen={openStep === 4}>
                <DailyChecklist tasks={tasks} checked={checked} onToggle={toggleTask} />
                <RemindersButton />
              </ParcoursStep>

              <ParcoursStep c={c} n={5} title="Mesurer" subtitle="Vérifier que ça progresse"
                status={daysSince >= REBILAN_DAYS ? "À refaire" : `Dans ${daysLeft} j`}
                statusColor={daysSince >= REBILAN_DAYS ? "#ffa347" : "#6f9bff"} defaultOpen={openStep === 5}>
                {assessments.length > 1 && (
                  <ul style={{ listStyle: "none", margin: "0 0 12px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {assessments.slice(0, 5).map((a, i) => {
                      const older = assessments[i + 1];
                      const d = older ? a.global_score - older.global_score : null;
                      return (
                        <li key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
                          <span style={{ fontFamily: T.b, fontSize: 14, color: "var(--text-primary)", flex: 1 }}>{fmtDate(a.created_at, true)}</span>
                          {d !== null && (
                            <span style={{ fontFamily: T.b, fontSize: 13, fontWeight: 700, color: d > 0 ? "#3fe0a0" : d < 0 ? "#ff7b7b" : "var(--t55)" }}>
                              {d > 0 ? `+${d}` : d}
                            </span>
                          )}
                          <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: scoreColor(a.global_score), width: 32, textAlign: "right" }}>{a.global_score}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <ParcoursLinkCard c={c}
                  text={daysSince >= REBILAN_DAYS
                    ? "Ton dernier bilan date d'il y a plus de 4 semaines. Refais-le pour voir ce qui a bougé."
                    : `Un nouveau bilan est conseillé environ 4 semaines après le précédent, pour laisser le temps aux changements de se voir. C'est dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}, mais tu peux le refaire quand tu veux.`}
                  cta="Refaire mon bilan" onClick={() => router.push("/questionnaire")} />
              </ParcoursStep>
            </motion.div>

            {/* ── Entreprise ── */}
            {isB2B && companyId && anonymousId && (
              <motion.div {...fadeUp(0.1)} style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", lineHeight: 1.6, margin: "0 0 12px" }}>
                  Ton entreprise participe au Diagnostic PAW. Ton employeur ne voit jamais ton nom : tes résultats lui sont présentés sous un identifiant anonyme.
                </p>
                <SignalForm companyId={companyId} anonymousId={anonymousId} />
              </motion.div>
            )}

            {/* ── Astuce du jour ── */}
            <motion.div {...fadeUp(0.12)}>
              <div style={{ padding: "16px 20px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700, color: "var(--t55)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  Astuce du jour
                </p>
                <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--text-primary)", margin: 0, lineHeight: 1.65 }}>{tipOfDay(nowMs)}</p>
              </div>
            </motion.div>
          </>
        )}

        {/* ── État vide ── */}
        {!latest && (
          <motion.div {...fadeUp(0.05)} style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>
              Tu n&apos;as pas encore fait ton bilan
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65, maxWidth: 380, margin: "0 auto 24px" }}>
              5 minutes pour comprendre ce que ton corps essaie de te dire au travail.
            </p>
            <Link href="/questionnaire" style={{ ...ctaStyle, padding: "15px 32px", fontSize: 15 }}>Commencer mon bilan</Link>
          </motion.div>
        )}

      </div>
    </main>
  );
}
