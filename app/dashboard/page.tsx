"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assessment {
  id: string;
  created_at: string;
  global_score: number;
  scores: {
    setup: number;
    pain: number;
    habits: number;
    sleep_energy: number;
    lifestyle: number;
    nutrition?: number;
    global: number;
  };
  answers: Record<string, unknown>;
  job_type?: string;
  video_analysis: {
    personne?: Record<string, unknown>;
    poste?: Record<string, unknown>;
    analyzed_at?: string;
  } | null;
}

interface DailyCheckin {
  id?: string;
  date: string;
  exercises_done: boolean;
  water_goal_met: boolean;
  breaks_taken: number;
  pain_level: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPS = [
  "💡 Règle 20-20-20 : toutes les 20 min, regarde à 6m pendant 20 secondes. Tes yeux te remercieront.",
  "💡 2 minutes de marche toutes les heures réduisent le risque cardiovasculaire de 17%.",
  "💡 La caféine après 14h perturbe ton sommeil même si tu t'endors bien le soir.",
  "💡 Les cervicales supportent 5kg — ta tête en avant à 45° en charge 22kg.",
  "💡 Un déjeuner riche en protéines = énergie stable tout l'après-midi, sans crash.",
  "💡 Dormir sur le ventre = pire position pour les cervicales. Préfère le côté.",
  "💡 Le stress chronique crée des tensions musculaires réelles et mesurables.",
];

const DIM_META: Record<string, { label: string; emoji: string; color: string; iconBg: string; path: string }> = {
  setup:        { label: "Setup & ergonomie",  emoji: "💻", color: "#7c9fff", iconBg: "rgba(43,92,230,0.18)",  path: "/conseils/setup" },
  pain:         { label: "Douleurs",            emoji: "🩺", color: "#f09595", iconBg: "rgba(226,75,74,0.18)",  path: "/conseils/douleurs" },
  habits:       { label: "Habitudes",           emoji: "⏱️", color: "#f4a261", iconBg: "rgba(212,98,42,0.18)",  path: "/conseils/habitudes" },
  sleep_energy: { label: "Sommeil & énergie",   emoji: "🌙", color: "#74c69d", iconBg: "rgba(45,106,79,0.18)",  path: "/conseils/sommeil" },
  lifestyle:    { label: "Mode de vie actif",   emoji: "🏃", color: "#5dcaa5", iconBg: "rgba(29,158,117,0.18)", path: "/conseils/lifestyle" },
  nutrition:    { label: "Nutrition & énergie", emoji: "🍽️", color: "#a78bfa", iconBg: "rgba(124,58,237,0.18)", path: "/conseils/nutrition" },
};

const DIM_PRODUCTS: Record<string, { name: string; url: string; price: string }> = {
  setup:        { name: "Rehausseur écran GRIFEMA",           url: "https://amzn.to/3RF8Hn1", price: "~28€" },
  pain:         { name: "Coussin lombaire FORTEM",             url: "https://amzn.to/4dIapg4", price: "~30€" },
  habits:       { name: "Bureau assis-debout SONGMICS",        url: "https://amzn.to/4dGGncw", price: "~200€" },
  sleep_energy: { name: "Lunettes anti-lumière bleue Horus X", url: "https://amzn.to/4veEs4B", price: "~30€" },
  lifestyle:    { name: "Coussin d'équilibre BODYMATE",        url: "https://amzn.to/3Rh9avh", price: "~30€" },
  nutrition:    { name: "Gourde graduée avec horaires 1.5L",   url: "https://amzn.to/4dVZNJl", price: "~15€" },
};

const SHORTCUTS = [
  { icon: "🧘", title: "Mobilité",    desc: "Programme du jour · 10 min", href: "/mobilite",        scoreKey: null, bg: "rgba(45,106,79,0.10)",  border: "rgba(45,106,79,0.20)",  iconBg: "rgba(45,106,79,0.20)",  color: "#74c69d", blob: "rgba(45,106,79,0.25)" },
  { icon: "📊", title: "Mes scores",    desc: "6 dimensions · Voir détails",  href: "/results",           scoreKey: null, bg: "rgba(43,92,230,0.10)",  border: "rgba(43,92,230,0.20)",  iconBg: "rgba(43,92,230,0.20)",  color: "#7c9fff", blob: "rgba(43,92,230,0.25)" },
  { icon: "🪑", title: "Setup",         desc: null, href: "/conseils/setup",    scoreKey: "setup",      bg: "rgba(212,98,42,0.08)",  border: "rgba(212,98,42,0.18)",  iconBg: "rgba(212,98,42,0.20)",  color: "#f4a261", blob: "rgba(212,98,42,0.25)" },
  { icon: "🤕", title: "Douleurs",      desc: null, href: "/conseils/douleurs", scoreKey: "pain",       bg: "rgba(226,75,74,0.08)",  border: "rgba(226,75,74,0.18)",  iconBg: "rgba(226,75,74,0.20)",  color: "#f09595", blob: "rgba(226,75,74,0.25)" },
  { icon: "🥗", title: "Nutrition",     desc: null, href: "/conseils/nutrition",scoreKey: "nutrition",  bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.18)", iconBg: "rgba(124,58,237,0.20)", color: "#a78bfa", blob: "rgba(124,58,237,0.25)" },
  { icon: "🎥", title: "Analyse vidéo", desc: "Refaire une analyse IA",        href: "/video-intro",       scoreKey: null, bg: "rgba(29,158,117,0.08)", border: "rgba(29,158,117,0.18)", iconBg: "rgba(29,158,117,0.20)", color: "#5dcaa5", blob: "rgba(29,158,117,0.25)" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sc(s: number) { return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595"; }

function badge(s: number) {
  if (s >= 70) return { label: "Bon niveau",       color: "#74c69d", bg: "rgba(116,198,157,0.12)", border: "rgba(116,198,157,0.3)" };
  if (s >= 50) return { label: "À améliorer",      color: "#f4a261", bg: "rgba(244,162,97,0.12)",  border: "rgba(244,162,97,0.3)" };
  return         { label: "Attention requise", color: "#f09595", bg: "rgba(240,149,149,0.12)", border: "rgba(240,149,149,0.3)" };
}

function statusLabel(s: number) { return s >= 70 ? "Bon" : s >= 50 ? "À améliorer" : "Critique"; }

function getWeekStart() {
  const now = new Date();
  const d = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (d === 0 ? 6 : d - 1));
  return mon.toISOString().slice(0, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroCircle({ score }: { score: number }) {
  const size = 70; const sw = 5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const color = sc(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
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
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "#a8c0ff", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color: "var(--t40)" }}>/100</span>
      </div>
    </div>
  );
}

function ScoreBarRow({ dimKey, score, prev }: { dimKey: string; score: number; prev?: number }) {
  const meta = DIM_META[dimKey];
  const color = sc(score);
  const delta = prev != null ? score - prev : null;
  return (
    <Link href={meta?.path ?? "#"} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: meta?.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
          {meta?.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
            <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t75)" }}>{meta?.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color }}>{score}</span>
              {delta != null && delta !== 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: delta > 0 ? "#74c69d" : "#f09595" }}>
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
            </div>
          </div>
          <div style={{ height: 4, background: "var(--bg-card-2)", borderRadius: 100, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", borderRadius: 100, background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
        <span style={{ fontSize: 10, color: "var(--t25)", flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}

function GoalCircle({ done, total, color }: { done: number; total: number; color: string }) {
  const size = 48; const sw = 4;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(done / total, 1);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 11, color }}>{done}/{total}</span>
      </div>
    </div>
  );
}


function Skeleton() {
  return <div style={{ height: 80, borderRadius: 18, background: "var(--bg-card-2)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { premium: isPremiumUser } = usePremium();
  const { c } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [weeklyCheckins, setWeeklyCheckins] = useState<DailyCheckin[]>([]);
  const [checkin, setCheckin] = useState<DailyCheckin>({
    date: new Date().toISOString().slice(0, 10),
    exercises_done: false,
    water_goal_met: false,
    breaks_taken: 0,
    pain_level: 0,
  });
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [expandedBilan, setExpandedBilan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [hasBilan, setHasBilan] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [premiumToast, setPremiumToast] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = createClient();

      const { data: { user: u } } = await supabase.auth.getUser();
      console.log('Dashboard - User:', u?.id, u?.email);

      if (!u) {
        console.log('Dashboard - Pas connecté');
        router.replace("/auth");
        setLoading(false);
        return;
      }

      setUser(u);
      const firstName =
        (u.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
        (u.user_metadata?.name as string | undefined)?.split(' ')[0] ||
        localStorage.getItem('paw_firstname') ||
        u.email?.split('@')[0] ||
        '';
      setFirstname(firstName);

      const { data: assessmentsData, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      console.log('Dashboard - Assessments:', assessmentsData);
      console.log('Dashboard - Erreur:', error);

      if (error) {
        console.error('Erreur lecture assessments:', error);
        setLoading(false);
        return;
      }

      if (assessmentsData && assessmentsData.length > 0) {
        console.log('Dashboard - Dernier bilan:', assessmentsData[0]);
        setAssessments(assessmentsData);
        setHasBilan(true);
      } else {
        console.log('Dashboard - Aucun bilan trouvé');
        setHasBilan(false);
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: cData } = await supabase
        .from("daily_checkins").select("*").eq("user_id", u.id).eq("date", today).maybeSingle();
      if (cData) {
        setCheckin(cData);
        setWaterGlasses(cData.water_goal_met ? 6 : 0);
        setCheckinSaved(!!cData.id);
      }

      const weekStart = getWeekStart();
      const { data: wData } = await supabase
        .from("daily_checkins").select("*").eq("user_id", u.id)
        .gte("date", weekStart).lte("date", today).order("date", { ascending: true });
      if (wData) setWeeklyCheckins(wData);

      const { data: allC } = await supabase
        .from("daily_checkins").select("date").eq("user_id", u.id)
        .order("date", { ascending: false }).limit(30);
      if (allC) {
        let s = 0;
        const now = new Date();
        for (let i = 0; i < allC.length; i++) {
          const exp = new Date(now);
          exp.setDate(now.getDate() - i);
          if (allC[i].date === exp.toISOString().slice(0, 10)) s++;
          else break;
        }
        setStreak(s);
      }

      setLoading(false);

      // Show premium activation toast if redirected from /premium
      if (typeof window !== "undefined" && window.location.search.includes("premium=activated")) {
        setPremiumToast(true);
        setTimeout(() => setPremiumToast(false), 5000);
        window.history.replaceState({}, "", "/dashboard");
      }

      // Service worker + push notifications
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as unknown as Record<string, unknown>)["standalone"];
        if (isIos && !("Notification" in window)) {
          setTimeout(() => setShowIosBanner(true), 3000);
        } else if ("Notification" in window && Notification.permission === "default") {
          setTimeout(() => requestNotificationPermission(), 3000);
        }
      }
    };

    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteAccount() {
    if (!user) return;
    setDeleteLoading(true);
    const supabase = createClient();
    await supabase.from("assessments").delete().eq("user_id", user.id);
    await supabase.from("daily_checkins").delete().eq("user_id", user.id);
    await supabase.auth.signOut();
    router.replace("/");
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, action: "save" }),
      });
    } catch { /* user denied or browser unsupported */ }
  }

  async function saveCheckin() {
    if (!user) return;
    setCheckinLoading(true);
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_checkins").upsert({
      user_id: user.id, date: today,
      exercises_done: checkin.exercises_done,
      water_goal_met: waterGlasses >= 6,
      breaks_taken: checkin.breaks_taken,
      pain_level: checkin.pain_level,
    }, { onConflict: "user_id,date" });
    setCheckinSaved(true);
    setCheckinLoading(false);
  }

  // ─── Computed values ─────────────────────────────────────────────────────────

  const latest = assessments[0];
  const previous = assessments[1];
  const first = assessments[assessments.length - 1];
  const tip = TIPS[new Date().getDay() % 7];
  const exercisesDays = weeklyCheckins.filter((c) => c.exercises_done).length;
  const waterDays = weeklyCheckins.filter((c) => c.water_goal_met).length;
  const breaksDays = weeklyCheckins.filter((c) => c.breaks_taken >= 3).length;

  const recentPain = weeklyCheckins.slice(-3).map((c) => c.pain_level);
  const painAlert = recentPain.length >= 2 &&
    recentPain.every((p, i) => i === 0 || p > recentPain[i - 1]) &&
    recentPain[recentPain.length - 1] > 2;

  const weekSummary = weeklyCheckins.length >= 3 ? {
    avgPain: Math.round((weeklyCheckins.reduce((s, c) => s + c.pain_level, 0) / weeklyCheckins.length) * 10) / 10,
    exerciseDays: exercisesDays,
    waterDays,
    avgBreaks: Math.round(weeklyCheckins.reduce((s, c) => s + c.breaks_taken, 0) / weeklyCheckins.length * 10) / 10,
  } : null;

  const improvements: { label: string; delta: number }[] = [];
  if (latest && first && latest.id !== first.id) {
    Object.keys(DIM_META).forEach((k) => {
      const latestScore = latest.scores[k as keyof typeof latest.scores] ?? 0;
      const firstScore = first.scores[k as keyof typeof first.scores] ?? 0;
      const delta = latestScore - firstScore;
      if (delta >= 5) improvements.push({ label: DIM_META[k].label, delta });
    });
    improvements.sort((a, b) => b.delta - a.delta);
  }

  const nextBilanDate = latest
    ? new Date(new Date(latest.created_at).getTime() + 14 * 24 * 60 * 60 * 1000)
    : null;
  const daysUntilBilan = nextBilanDate
    ? Math.ceil((nextBilanDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  const displayName = firstname || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "toi";
  const latestBadge = latest ? badge(latest.global_score) : null;

  const chartData = assessments.length >= 2
    ? assessments.slice().reverse().map(a => ({
        date: new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        score: a.global_score,
      }))
    : null;

  const loadHistoricBilan = (assessment: Assessment, goToVideo = false) => {
    sessionStorage.removeItem("paw_example_mode");
    localStorage.removeItem("paw_example_mode");
    sessionStorage.setItem("postureatwork_scores", JSON.stringify(assessment.scores));
    const jobType = (assessment.scores as Record<string, unknown>)?.job_type ?? assessment.job_type ?? "bureau";
    const answersKey = jobType === "debout" ? "postureatwork_answers_debout" : "postureatwork_answers";
    if (assessment.answers) sessionStorage.setItem(answersKey, JSON.stringify(assessment.answers));
    if (assessment.video_analysis) {
      if (assessment.video_analysis.personne) sessionStorage.setItem("paw_analysis_personne", JSON.stringify(assessment.video_analysis.personne));
      if (assessment.video_analysis.poste) sessionStorage.setItem("paw_analysis_poste", JSON.stringify(assessment.video_analysis.poste));
    }
    router.push(goToVideo ? "/final-report" : "/results");
  };

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: c.mainBg, paddingTop: 56, paddingBottom: 80, position: "relative" }}>
        <BackgroundBlobs blobs={[{ top: "-5%", right: "-5%", color: "rgba(43,92,230,0.12)", size: 400 }]} />
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg, paddingTop: 56, paddingBottom: 100, position: "relative" }}>
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.12)", size: 500 },
        { top: "40%", left: "-8%", color: "rgba(45,106,79,0.08)", size: 380 },
      ]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 660, margin: "0 auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── PREMIUM TOAST ── */}
        <AnimatePresence>
          {premiumToast && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              style={{
                borderRadius: 16, padding: "14px 20px",
                background: "rgba(45,106,79,0.20)", border: "0.5px solid rgba(116,198,157,0.35)",
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>🎉</span>
              <div>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#74c69d", margin: 0 }}>Accès premium activé !</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(116,198,157,0.75)", margin: 0 }}>Tu as maintenant accès à tout PostureAtWork.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── S1 : HERO SCORE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{
          borderRadius: 22, padding: "22px 24px",
          background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(43,92,230,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
            {latest ? <HeroCircle score={latest.global_score} /> : (
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(43,92,230,0.15)", border: "3px solid rgba(43,92,230,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 24 }}>🎯</span>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", margin: 0 }}>
                  Bonjour {displayName} 👋
                </p>
                {isPremiumUser && (
                  <span style={{ padding: "3px 10px", borderRadius: 100, background: "linear-gradient(135deg, #f59e0b, #d4622a)", fontFamily: T.h, fontWeight: 800, fontSize: 11, color: "#fff", letterSpacing: "0.5px" }}>
                    ✨ PREMIUM
                  </span>
                )}
              </div>
              {latestBadge && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-block", padding: "3px 12px", borderRadius: 100,
                    background: latestBadge.bg, border: `0.5px solid ${latestBadge.border}`,
                    fontFamily: T.b, fontWeight: 600, fontSize: 11, color: latestBadge.color,
                  }}>
                    {latestBadge.label}
                  </span>
                  {previous && (() => {
                    const delta = latest.global_score - previous.global_score;
                    if (delta === 0) return null;
                    return (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        padding: "3px 10px", borderRadius: 100,
                        background: delta > 0 ? "rgba(116,198,157,0.12)" : "rgba(240,149,149,0.12)",
                        border: `0.5px solid ${delta > 0 ? "rgba(116,198,157,0.3)" : "rgba(240,149,149,0.3)"}`,
                        fontFamily: T.h, fontWeight: 700, fontSize: 11,
                        color: delta > 0 ? "#74c69d" : "#f09595",
                      }}>
                        {delta > 0 ? "↑" : "↓"} {delta > 0 ? `+${delta}` : delta} pts
                      </span>
                    );
                  })()}
                </div>
              )}
              {latest && (
                <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", margin: "4px 0 0" }}>
                  Bilan du {new Date(latest.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </p>
              )}
            </div>
          </div>
          <Link href="/onboarding" style={{ textDecoration: "none", display: "block", marginTop: 16 }}>
            <div style={{
              padding: "13px 0", borderRadius: 100, textAlign: "center", cursor: "pointer",
              background: "#2b5ce6", boxShadow: "0 4px 20px rgba(43,92,230,0.4)",
              fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff",
            }}>
              {latest ? "Nouveau bilan →" : "Commencer mon bilan →"}
            </div>
          </Link>
        </motion.div>

        {/* ── iOS NOTIFICATION BANNER ── */}
        {showIosBanner && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 16, padding: "14px 18px", background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📱</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "var(--text-primary)", margin: "0 0 4px" }}>Active les rappels</p>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", margin: 0, lineHeight: 1.5 }}>
                Sur iOS, ajoute l&apos;app à ton écran d&apos;accueil pour recevoir des rappels posture.
              </p>
            </div>
            <button onClick={() => setShowIosBanner(false)}
              style={{ background: "none", border: "none", color: "var(--t30)", fontSize: 16, cursor: "pointer", flexShrink: 0, padding: 0 }}>✕</button>
          </motion.div>
        )}

        {/* No assessment state */}
        {!hasBilan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            borderRadius: 22, padding: "28px 24px", textAlign: "center",
            background: "rgba(43,92,230,0.06)", border: "0.5px solid rgba(43,92,230,0.18)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 17, color: "var(--text-primary)", marginBottom: 8 }}>Pas encore de bilan</p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", lineHeight: 1.65, marginBottom: 20 }}>
              Fais ton premier bilan en 5 minutes pour débloquer ton tableau de bord complet.
            </p>
            <Link href="/onboarding" style={{ textDecoration: "none" }}>
              <div style={{ padding: "14px 0", borderRadius: 100, background: "#2b5ce6", boxShadow: "0 4px 24px rgba(43,92,230,0.4)", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
                Faire mon premier bilan →
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── S2 : TIP DU JOUR ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{
          borderRadius: 18, padding: "16px 20px",
          background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.15)",
        }}>
          <p style={{ fontFamily: T.b, fontSize: 10, fontWeight: 700, color: "rgba(168,192,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, marginBottom: 8 }}>
            TIP DU JOUR
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t85)", lineHeight: 1.65, margin: 0 }}>
            {tip}
          </p>
        </motion.div>

        {/* ── S3 : CARREFOUR ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 10 }}>
            Ton espace santé
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SHORTCUTS.map((s) => {
              const score = s.scoreKey && latest ? (latest.scores[s.scoreKey as keyof typeof latest.scores] ?? null) : null;
              const noAssessment = !latest;
              const isVideoCard = s.title === "Analyse vidéo";
              const hasVideoAnalysis = latest?.video_analysis != null;
              // Cards linking to /conseils or /results without a bilan → redirect to /onboarding
              const isLocked = noAssessment && (s.href.startsWith("/conseils") || s.href === "/results");
              const videoHref = isPremiumUser ? "/video-intro" : "/premium";
              const href = isLocked ? "/onboarding" : isVideoCard ? videoHref : s.href;
              const desc = score != null
                ? `${score}/100 · ${statusLabel(score)}`
                : isLocked
                ? "🔒 Après ton bilan"
                : isVideoCard && !isPremiumUser && !hasVideoAnalysis
                ? "Normalement 9.99€"
                : (s.desc ?? "");
              return (
                <Link key={s.title} href={href} style={{ textDecoration: "none" }}>
                  <div style={{
                    borderRadius: 18, padding: "16px 16px", position: "relative", overflow: "hidden",
                    background: s.bg, border: `0.5px solid ${s.border}`, cursor: "pointer",
                  }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: s.blob, filter: "blur(24px)", opacity: 0.7 }} />
                    {isVideoCard && (
                      <div style={{ position: "absolute", top: 8, right: 8, padding: "2px 7px", borderRadius: 100, background: "rgba(245,158,11,0.15)", border: "0.5px solid rgba(245,158,11,0.35)", fontFamily: T.b, fontWeight: 700, fontSize: 9, color: "#f59e0b" }}>
                        {isPremiumUser ? "👑 Offert en beta" : "🎁 Gratuit en beta"}
                      </div>
                    )}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 10, position: "relative" }}>
                      {s.icon}
                    </div>
                    <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: s.color, margin: 0, marginBottom: 3, position: "relative" }}>
                      {isVideoCard ? (isPremiumUser ? "Lancer mon analyse →" : "Lancer maintenant →") : s.title}
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t45)", margin: 0, position: "relative" }}>
                      {desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Produit recommandé pour la dimension la plus faible */}
          {latest && (() => {
            const dimKeys = ["setup", "pain", "habits", "sleep_energy", "lifestyle", "nutrition"] as const;
            const weakest = dimKeys.reduce((a, b) =>
              (latest.scores[a] ?? 100) <= (latest.scores[b] ?? 100) ? a : b
            );
            const prod = DIM_PRODUCTS[weakest];
            const meta = DIM_META[weakest === "pain" ? "pain" : weakest === "habits" ? "habits" : weakest === "sleep_energy" ? "sleep_energy" : weakest === "lifestyle" ? "lifestyle" : weakest === "nutrition" ? "nutrition" : "setup"];
            if (!prod || !meta) return null;
            return (
              <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 11, color: "var(--t45)", margin: "0 0 2px" }}>Recommandé pour toi :</p>
                  <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 12, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name}</p>
                </div>
                <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: 12, color: meta.color, flexShrink: 0 }}>{prod.price}</span>
                <a href={prod.url} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 12px", borderRadius: 100, textDecoration: "none", background: "#2b5ce6", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0 }}>Amazon →</a>
              </div>
            );
          })()}
        </motion.div>

        {/* ── S4 : CHECK-IN ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }} style={{
          borderRadius: 22, padding: "22px 20px",
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>Check-in du jour</p>
            {streak > 0 && (
              <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(245,158,11,0.15)", border: "0.5px solid rgba(245,158,11,0.3)", fontFamily: T.b, fontWeight: 700, fontSize: 11, color: "#fbbf24" }}>
                🔥 {streak} jour{streak > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {checkinSaved ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 6 }}>Journée validée ✅</p>
                <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", marginBottom: 16 }}>Reviens demain pour maintenir ton streak.</p>
                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "12px 0", borderRadius: 100, background: "rgba(45,106,79,0.20)", border: "0.5px solid rgba(45,106,79,0.35)", fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "#74c69d" }}>
                    🧘 Faire mes exercices →
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Exercises */}
                <div
                  onClick={() => setCheckin((c) => ({ ...c, exercises_done: !c.exercises_done }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, cursor: "pointer",
                    background: checkin.exercises_done ? "rgba(45,106,79,0.12)" : "rgba(255,255,255,0.03)",
                    border: checkin.exercises_done ? "0.5px solid rgba(45,106,79,0.35)" : "0.5px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>✅</span>
                  <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t85)", flex: 1 }}>Mes exercices du jour</span>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: checkin.exercises_done ? "#74c69d" : "rgba(255,255,255,0.06)", border: checkin.exercises_done ? "none" : "0.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checkin.exercises_done && <span style={{ fontSize: 10, color: "var(--bg-primary)", fontWeight: 900 }}>✓</span>}
                  </div>
                </div>

                {/* Water */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>💧</span>
                    <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)", flex: 1 }}>Eau aujourd&apos;hui</span>
                    <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: waterGlasses >= 6 ? "#74c69d" : "#a8c0ff" }}>{waterGlasses}</span>
                    <span style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)" }}>verres{waterGlasses >= 6 ? " ✓" : ""}</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={1} value={waterGlasses}
                    onChange={(e) => setWaterGlasses(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#2b5ce6", background: `linear-gradient(to right, #2b5ce6 ${waterGlasses * 10}%, rgba(255,255,255,0.08) ${waterGlasses * 10}%)`, height: 4, borderRadius: 100, outline: "none", appearance: "none" }}
                  />
                </div>

                {/* Breaks */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16 }}>⏱️</span>
                  <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)", flex: 1 }}>Pauses actives</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() => setCheckin((c) => ({ ...c, breaks_taken: Math.max(0, c.breaks_taken - 1) }))}
                      style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bg-card-2)", border: "0.5px solid rgba(255,255,255,0.12)", color: "var(--text-primary)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", width: 20, textAlign: "center" }}>{checkin.breaks_taken}</span>
                    <button
                      onClick={() => setCheckin((c) => ({ ...c, breaks_taken: c.breaks_taken + 1 }))}
                      style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bg-card-2)", border: "0.5px solid rgba(255,255,255,0.12)", color: "var(--text-primary)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                  </div>
                </div>

                {/* Pain */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>🤕</span>
                    <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)", flex: 1 }}>Douleur du jour</span>
                    <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: "var(--t50)" }}>{checkin.pain_level}/5</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCheckin((c) => ({ ...c, pain_level: v }))}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                          background: checkin.pain_level === v ? "rgba(240,149,149,0.18)" : "rgba(255,255,255,0.04)",
                          border: checkin.pain_level === v ? "0.5px solid rgba(240,149,149,0.45)" : "0.5px solid var(--border)",
                          fontFamily: T.h, fontWeight: 700, fontSize: 12,
                          color: checkin.pain_level === v ? "#f09595" : "var(--t35)",
                        }}
                      >{v}</button>
                    ))}
                  </div>
                </div>

                <div
                  onClick={!checkinLoading ? saveCheckin : undefined}
                  style={{
                    padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: checkinLoading ? "default" : "pointer",
                    background: "#2b5ce6", boxShadow: "0 4px 20px rgba(43,92,230,0.35)",
                    fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff",
                    opacity: checkinLoading ? 0.7 : 1,
                  }}
                >
                  {checkinLoading ? "Sauvegarde…" : "Valider ma journée →"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── S5 : 6 SCORES ── */}
        {latest && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{
            borderRadius: 22, padding: "20px 20px",
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>Tes 6 indicateurs</p>
            <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", marginBottom: 10 }}>Clique pour voir le plan</p>
            {Object.keys(DIM_META).map((k) => (
              <ScoreBarRow
                key={k} dimKey={k}
                score={latest.scores[k as keyof typeof latest.scores] ?? 0}
                prev={previous?.scores[k as keyof typeof previous.scores]}
              />
            ))}
          </motion.div>
        )}

        {/* ── S6 : OBJECTIFS SEMAINE ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} style={{
          borderRadius: 22, padding: "20px 20px",
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
        }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0, marginBottom: 16 }}>Objectifs de la semaine</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🧘", label: "Exercices quotidiens", done: exercisesDays, total: 5, color: "#74c69d" },
              { icon: "💧", label: "Hydratation 1.5L/jour", done: waterDays, total: 7, color: "#7c9fff" },
              { icon: "⏱️", label: "Pauses actives ×3/jour", done: breaksDays, total: 5, color: "#f4a261" },
            ].map((g) => (
              <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <GoalCircle done={g.done} total={g.total} color={g.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 13 }}>{g.icon}</span>
                    <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t75)" }}>{g.label}</span>
                  </div>
                  <div style={{ height: 3, background: "var(--bg-card-2)", borderRadius: 100, overflow: "hidden" }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 100, background: g.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(g.done / g.total, 1) * 100}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                  <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t35)", marginTop: 4 }}>
                    {g.done} jour{g.done > 1 ? "s" : ""} atteint{g.done > 1 ? "s" : ""} cette semaine
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── S7 : ALERTE DOULEUR ── */}
        {painAlert && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{
            borderRadius: 20, padding: "18px 20px",
            background: "rgba(226,75,74,0.10)", border: "0.5px solid rgba(226,75,74,0.30)",
          }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#f09595", margin: 0, marginBottom: 6 }}>
              ⚠️ Ta douleur semble progresser cette semaine
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t60)", lineHeight: 1.65, marginBottom: 14 }}>
              Ton niveau de douleur a augmenté ces derniers jours. Voici quoi faire maintenant.
            </p>
            <Link href="/conseils/douleurs" style={{ textDecoration: "none" }}>
              <div style={{ padding: "10px 0", borderRadius: 100, textAlign: "center", background: "rgba(226,75,74,0.18)", border: "0.5px solid rgba(226,75,74,0.35)", fontFamily: T.b, fontWeight: 700, fontSize: 12, color: "#f09595" }}>
                Voir mes conseils douleurs →
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── S8 : RÉSUMÉ SEMAINE ── */}
        {weekSummary && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{
            borderRadius: 22, padding: "20px 20px",
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0, marginBottom: 14 }}>Ta semaine PAW</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "😴", label: "Douleur moy.", value: `${weekSummary.avgPain}/5`, color: weekSummary.avgPain < 2 ? "#74c69d" : weekSummary.avgPain <= 3 ? "#f4a261" : "#f09595" },
                { icon: "🧘", label: "Jours exercices", value: `${weekSummary.exerciseDays}/7`, color: "#5dcaa5" },
                { icon: "💧", label: "Hydratation OK", value: `${weekSummary.waterDays}/7`, color: "#7c9fff" },
                { icon: "⏱️", label: "Pauses/jour", value: weekSummary.avgBreaks, color: "#f4a261" },
              ].map((item) => (
                <div key={item.label} style={{ borderRadius: 14, padding: "14px 14px", background: "var(--bg-card)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: item.color, margin: "6px 0 2px" }}>{item.value}</p>
                  <p style={{ fontFamily: T.b, fontSize: 10, color: "var(--t40)", margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── S9 : AMÉLIORATIONS ── */}
        {improvements.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{
            borderRadius: 22, padding: "20px 20px",
            background: "rgba(45,106,79,0.08)", border: "0.5px solid rgba(45,106,79,0.22)",
          }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "#74c69d", margin: 0, marginBottom: 12 }}>
              🎉 Depuis ton premier bilan
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {improvements.slice(0, 4).map((imp) => (
                <div key={imp.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t75)" }}>{imp.label}</span>
                  <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "#74c69d" }}>+{imp.delta} pts</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── S10 : PROCHAIN BILAN ── */}
        {latest && daysUntilBilan !== null && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }} style={{
            borderRadius: 22, padding: "20px 20px",
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>🗓️ Prochain bilan</p>
              <span style={{
                padding: "4px 12px", borderRadius: 100,
                background: daysUntilBilan <= 0 ? "rgba(240,149,149,0.15)" : "rgba(43,92,230,0.15)",
                border: daysUntilBilan <= 0 ? "0.5px solid rgba(240,149,149,0.3)" : "0.5px solid rgba(43,92,230,0.3)",
                fontFamily: T.b, fontWeight: 700, fontSize: 11,
                color: daysUntilBilan <= 0 ? "#f09595" : "#7c9fff",
              }}>
                {daysUntilBilan <= 0 ? "Maintenant !" : `Dans ${daysUntilBilan}j`}
              </span>
            </div>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", marginBottom: 14 }}>
              {daysUntilBilan <= 0
                ? "Il est temps de refaire ton bilan pour mesurer ta progression !"
                : `Recommandé le ${nextBilanDate!.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
            </p>
            <Link href="/onboarding" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "12px 0", borderRadius: 100, textAlign: "center",
                background: daysUntilBilan <= 0 ? "#2b5ce6" : "rgba(255,255,255,0.05)",
                border: daysUntilBilan <= 0 ? "none" : "0.5px solid var(--border-3)",
                boxShadow: daysUntilBilan <= 0 ? "0 4px 20px rgba(43,92,230,0.35)" : "none",
                fontFamily: T.h, fontWeight: 700, fontSize: 13,
                color: daysUntilBilan <= 0 ? "#fff" : "var(--t50)",
              }}>
                Nouveau bilan →
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── S_CHART : ÉVOLUTION ── */}
        {chartData && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }} style={{
            borderRadius: 22, padding: "20px 20px",
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0, marginBottom: 4 }}>📈 Ton évolution</p>
            <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t35)", marginBottom: 16 }}>
              Score global sur tes {assessments.length} derniers bilans
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="date" stroke="rgba(240,240,250,0.15)" tick={{ fontSize: 10, fill: "var(--t35)" }} />
                <YAxis domain={[0, 100]} stroke="rgba(240,240,250,0.15)" tick={{ fontSize: 10, fill: "var(--t35)" }} width={32} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-secondary)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 12, color: "var(--text-primary)" }}
                  labelStyle={{ color: "var(--t50)", marginBottom: 4 }}
                />
                <Line type="monotone" dataKey="score" stroke="#2b5ce6" strokeWidth={2.5}
                  dot={{ fill: "#2b5ce6", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#7c9fff" }}
                  name="Score global"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── S11 : HISTORIQUE ── */}
        {assessments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={{
            borderRadius: 22, padding: "20px 20px",
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
          }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: 0, marginBottom: 12 }}>📋 Mes bilans</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assessments.map((a, i) => {
                const prev = assessments[i + 1];
                const delta = prev ? a.global_score - prev.global_score : null;
                const color = sc(a.global_score);
                const b = badge(a.global_score);
                const isExpanded = expandedBilan === a.id;
                const jobType = (a.scores as Record<string, unknown>)?.job_type ?? a.job_type ?? "bureau";
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 + i * 0.04 }}
                    style={{ borderRadius: 16, background: "rgba(255,255,255,0.02)", border: `0.5px solid ${isExpanded ? "rgba(43,92,230,0.3)" : "rgba(255,255,255,0.05)"}`, overflow: "hidden" }}>
                    {/* ── Header ── */}
                    <div onClick={() => setExpandedBilan(isExpanded ? null : a.id)}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, border: `0.5px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.h, fontWeight: 900, fontSize: 14, color, flexShrink: 0 }}>
                        {a.global_score}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: T.b, fontWeight: 600, fontSize: 13, color: "var(--text-primary)", margin: "0 0 4px" }}>
                          {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 100, background: b.bg, border: `0.5px solid ${b.border}`, fontFamily: T.b, fontSize: 10, color: b.color }}>{b.label}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 100, background: "var(--bg-card-3)", fontFamily: T.b, fontSize: 10, color: "var(--t40)" }}>
                            {jobType === "debout" ? "🏭 Debout" : "💻 Bureau"}
                          </span>
                          {a.video_analysis && (
                            <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(167,139,250,0.12)", fontFamily: T.b, fontSize: 10, color: "#a78bfa" }}>🎥 Vidéo</span>
                          )}
                          {delta !== null && delta !== 0 && (
                            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 10, color: delta > 0 ? "#74c69d" : "#f09595" }}>
                              {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: "var(--t25)", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {/* ── Expanded: mini-scores + actions ── */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                          <div style={{ padding: "0 16px 14px", borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, marginBottom: 14 }}>
                              {Object.keys(DIM_META).map(k => {
                                const s = a.scores[k as keyof typeof a.scores] ?? 0;
                                const m = DIM_META[k];
                                return (
                                  <span key={k} style={{ padding: "3px 10px", borderRadius: 100, background: `${m.color}14`, border: `0.5px solid ${m.color}30`, fontFamily: T.b, fontSize: 11, color: m.color }}>
                                    {m.emoji} {s}
                                  </span>
                                );
                              })}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button onClick={() => loadHistoricBilan(a)}
                                style={{ flex: 1, padding: "10px 0", borderRadius: 100, cursor: "pointer", background: "#2b5ce6", border: "none", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "#fff" }}>
                                Voir ce bilan →
                              </button>
                              {a.video_analysis && (
                                <button onClick={() => loadHistoricBilan(a, true)}
                                  style={{ flex: 1, padding: "10px 0", borderRadius: 100, cursor: "pointer", background: "rgba(167,139,250,0.12)", border: "0.5px solid rgba(167,139,250,0.3)", fontFamily: T.h, fontWeight: 700, fontSize: 12, color: "#a78bfa" }}>
                                  🎥 Analyse vidéo →
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── DELETE ACCOUNT ── */}
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ background: "none", border: "none", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "rgba(240,149,149,0.45)", cursor: "pointer", textDecoration: "underline" }}
          >
            Supprimer mon compte
          </button>
        </div>

      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, background: "#141422", border: "0.5px solid rgba(240,149,149,0.25)" }}
            >
              <div style={{ fontSize: 36, textAlign: "center", marginBottom: 14 }}>⚠️</div>
              <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 17, color: "var(--text-primary)", textAlign: "center", marginBottom: 10 }}>
                Supprimer mon compte
              </p>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "var(--t55)", textAlign: "center", lineHeight: 1.65, marginBottom: 24 }}>
                Es-tu sûr ? Toutes tes données seront supprimées définitivement (bilans, check-ins, scores). Cette action est irréversible.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={deleteAccount}
                  disabled={deleteLoading}
                  style={{ padding: "13px 0", borderRadius: 100, background: "#e24b4a", border: "none", color: "#fff", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 14, cursor: deleteLoading ? "default" : "pointer", opacity: deleteLoading ? 0.6 : 1 }}
                >
                  {deleteLoading ? "Suppression…" : "Oui, supprimer définitivement"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{ padding: "12px 0", borderRadius: 100, background: "var(--bg-card-3)", border: "0.5px solid var(--border-3)", color: "var(--t50)", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
