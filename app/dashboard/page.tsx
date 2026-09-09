"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
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
  const size = 96; const sw = 6;
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
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#a8c0ff", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: "var(--t40)" }}>/100</span>
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

// ─── SignalForm ───────────────────────────────────────────────────────────────

function SignalForm({ companyId, anonymousId, onSent }: {
  companyId: string;
  anonymousId: string;
  onSent: () => void;
}) {
  const supabase = createClient();
  const TF = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [loading, setLoading] = useState(false);

  const types = [
    { key: "douleur", label: "🩺 Douleur physique", showZone: true, showIntensity: true },
    { key: "equipement", label: "🪑 Problème d'équipement", showZone: false, showIntensity: false },
    { key: "contrainte", label: "⚠️ Contrainte posturale", showZone: true, showIntensity: false },
    { key: "autre", label: "💬 Autre", showZone: false, showIntensity: false },
  ];

  const zones = ["Lombaires / dos bas", "Cervicales / nuque", "Épaules", "Poignets / mains", "Jambes / genoux", "Pieds", "Autre"];

  const selectedType = types.find(t => t.key === type);

  async function handleSubmit() {
    if (!type || !description.trim()) return;
    setLoading(true);
    await supabase.from("signals").insert({
      company_id: companyId,
      anonymous_id: anonymousId,
      type,
      zone: zone || null,
      description: description.trim(),
      intensity: selectedType?.showIntensity ? intensity : null,
    });
    setLoading(false);
    onSent();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {types.map(t => (
          <button key={t.key} onClick={() => setType(t.key)}
            style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: type === t.key ? "rgba(244,162,97,0.15)" : "rgba(255,255,255,0.04)",
              border: `0.5px solid ${type === t.key ? "rgba(244,162,97,0.4)" : "rgba(255,255,255,0.08)"}`,
              fontFamily: TF.b, fontSize: 12, fontWeight: 600,
              color: type === t.key ? "#f4a261" : "rgba(255,255,255,0.5)", textAlign: "left" as const }}>
            {t.label}
          </button>
        ))}
      </div>

      {selectedType?.showZone && (
        <select value={zone} onChange={e => setZone(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, outline: "none",
            background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)",
            color: zone ? "var(--text-primary)" : "rgba(255,255,255,0.35)",
            fontFamily: TF.b, fontSize: 13 }}>
          <option value="">Zone concernée (optionnel)</option>
          {zones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      )}

      {selectedType?.showIntensity && (
        <div>
          <p style={{ fontFamily: TF.b, fontSize: 12,
            color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
            Intensité de la douleur : <strong style={{ color: "#f4a261" }}>{intensity}/5</strong>
          </p>
          <input type="range" min={1} max={5} step={1} value={intensity}
            onChange={e => setIntensity(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#f4a261" }} />
        </div>
      )}

      {type && (
        <textarea
          placeholder="Décrivez brièvement le problème… (ex: douleur lombaire qui s'aggrave en fin de journée)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          style={{ padding: "10px 12px", borderRadius: 10, outline: "none", resize: "none",
            background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)",
            color: "var(--text-primary)", fontFamily: TF.b,
            fontSize: 13, lineHeight: 1.5 }}
        />
      )}

      {type && description.trim() && (
        <button onClick={handleSubmit} disabled={loading}
          style={{ padding: "12px 0", borderRadius: 100, border: "none", cursor: "pointer",
            background: "#f4a261", color: "#fff", opacity: loading ? 0.7 : 1,
            fontFamily: TF.h, fontWeight: 700, fontSize: 14 }}>
          {loading ? "Envoi…" : "Envoyer le signalement →"}
        </button>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
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
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [notAdminError, setNotAdminError] = useState(false);
  const [isB2B, setIsB2B] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [signalSent, setSignalSent] = useState(false);
  const [membership, setMembership] = useState<{
    role: "admin" | "employee";
    company_name: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function recoverPendingAssessment() {
      const pending = localStorage.getItem("paw_pending_assessment");
      if (!pending) return;

      const { scores, answers, jobType, savedAt } = JSON.parse(pending);
      const age = Date.now() - new Date(savedAt).getTime();
      if (age > 4 * 60 * 60 * 1000) {
        localStorage.removeItem("paw_pending_assessment");
        return;
      }

      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;

      if (scores) sessionStorage.setItem("postureatwork_scores", scores);
      if (answers) sessionStorage.setItem("postureatwork_answers", answers);
      if (jobType) localStorage.setItem("paw_job_type", jobType);

      const parsedScores = JSON.parse(scores);
      const parsedAnswers = answers ? JSON.parse(answers) : {};

      await supabase.from("assessments").upsert({
        user_id: u.id,
        global_score: parsedScores.global,
        scores: parsedScores,
        answers: parsedAnswers,
        job_type: jobType ?? "bureau",
      }, { onConflict: "user_id" });

      localStorage.removeItem("paw_pending_assessment");
      router.push("/results");
    }
    recoverPendingAssessment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function recoverOnboarding() {
      const pending = localStorage.getItem("paw_onboarding");
      if (!pending) return;

      const data = JSON.parse(pending);
      const age = Date.now() - new Date(data.savedAt).getTime();
      if (age > 2 * 60 * 60 * 1000) {
        localStorage.removeItem("paw_onboarding");
        return;
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
      console.log('Dashboard - User:', u?.id, u?.email);

      if (!u) {
        console.log('Dashboard - Pas connecté');
        router.replace("/auth");
        setLoading(false);
        return;
      }

      setUser(u);
      // Priorité : metadata Google OAuth → onboarding lié à cet user → email
      const metaName =
        (u.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
        (u.user_metadata?.name as string | undefined)?.split(' ')[0] ||
        null;

      // localStorage seulement si l'email correspond au compte courant
      const storedEmail = localStorage.getItem('paw_user_email');
      const storedFirstname = localStorage.getItem('paw_firstname');
      const localName = storedEmail === u.email ? storedFirstname : null;

      const firstName = metaName || localName || u.email?.split('@')[0] || "";
      setFirstname(firstName);

      // Mettre à jour le localStorage avec l'email courant
      localStorage.setItem('paw_user_email', u.email ?? "");

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

      // Vérifier si l'user a un membership entreprise
      const { data: membershipData } = await supabase
        .from("company_memberships")
        .select("company_id, anonymous_id, role, companies(name)")
        .eq("user_id", u.id)
        .maybeSingle();

      if (membershipData) {
        setMembership({
          role: membershipData.role as "admin" | "employee",
          company_name: (membershipData.companies as unknown as { name: string })?.name ?? "votre entreprise",
        });
        if (membershipData.role === "employee") {
          setIsB2B(true);
          setCompanyId(membershipData.company_id);
          setAnonymousId(membershipData.anonymous_id);
        }
      }

      setLoading(false);

      // Vérifier si redirection depuis entreprise sans droits admin
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("error") === "not_admin") {
          setNotAdminError(true);
          window.history.replaceState({}, "", "/dashboard");
        }
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

  useEffect(() => {
    if (!user) return;
    const key = `paw_feedback_shown_${user.id}`;
    if (localStorage.getItem(key)) return;
    const premiumSince = localStorage.getItem("paw_premium_since");
    if (!premiumSince) return;
    const diff = Date.now() - new Date(premiumSince).getTime();
    if (diff >= 48 * 60 * 60 * 1000) setShowFeedbackBanner(true);
  }, [user]);

  async function deleteAccount() {
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    setDeleteLoading(true);

    const res = await fetch("/api/delete-account", { method: "DELETE" });
    if (!res.ok) {
      setDeleteLoading(false);
      alert("Erreur lors de la suppression. Contacte hello@postureatwork.com");
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
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
  const latestAssessment = latest ?? null;
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { delay },
  });

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
        <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "20px 16px" : "20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: c.mainBg }}>
      <div style={{ maxWidth: 860, margin: "0 auto",
        padding: isMobile ? "80px 16px 40px" : "100px 24px 60px" }}>

        {/* ── FEEDBACK BANNER ── */}
        {showFeedbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: 18, padding: "18px 20px", marginBottom: 16,
              background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)",
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 28 }}>💬</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "var(--text-primary)", margin: "0 0 4px" }}>
                2 minutes pour améliorer PAW ?
              </p>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", margin: 0 }}>
                Ton avis est précieux pour nous aider à construire le meilleur outil de santé au travail.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/feedback" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "9px 18px", borderRadius: 100, border: "none",
                  background: "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  Donner mon avis →
                </button>
              </Link>
              <button
                onClick={() => {
                  setShowFeedbackBanner(false);
                  localStorage.setItem(`paw_feedback_shown_${user!.id}`, "true");
                }}
                style={{
                  padding: "9px 14px", borderRadius: 100,
                  background: "transparent", border: "0.5px solid var(--border-2)",
                  color: "var(--t50)", fontFamily: T.b, fontSize: 12, cursor: "pointer",
                }}
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        )}

        {/* ── iOS NOTIFICATION BANNER ── */}
        {showIosBanner && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 16, padding: "14px 18px", marginBottom: 16, background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)", display: "flex", alignItems: "flex-start", gap: 12 }}>
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

        {notAdminError && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 16,
            background: "rgba(244,162,97,0.1)", border: "0.5px solid rgba(244,162,97,0.3)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "#f4a261", margin: 0 }}>
              Tu n&apos;as pas accès au dashboard entreprise. Contacte ton administrateur PAW.
            </p>
          </div>
        )}

        {/* ── 1. GREETING ── */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: T.h, fontWeight: 900,
            fontSize: isMobile ? 28 : 34, color: "var(--text-primary)",
            margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Bonjour{firstname ? ` ${firstname}` : ""} 👋
          </p>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t50)", margin: 0 }}>
            {latestAssessment
              ? `Dernier bilan : ${new Date(latestAssessment.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`
              : "Tu n'as pas encore fait ton bilan"}
          </p>
        </motion.div>

        {latestAssessment ? (
          <>
            {/* ── 2. SCORE GLOBAL ── */}
            <motion.div {...fadeUp(0.05)} style={{ marginBottom: 16 }}>
              <div style={{ borderRadius: 20, padding: "32px",
                background: "var(--bg-card)", border: "0.5px solid var(--border)",
                display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

                <HeroCircle score={latestAssessment.global_score} />

                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600,
                    color: "var(--t40)", textTransform: "uppercase",
                    letterSpacing: "0.06em", margin: "0 0 4px" }}>
                    Score santé au travail
                  </p>
                  <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: isMobile ? 18 : 20,
                    color: "var(--text-primary)", margin: "0 0 12px" }}>
                    {latestAssessment.global_score >= 70 ? "Bon niveau général" :
                     latestAssessment.global_score >= 50 ? "Des améliorations possibles" :
                     "Attention — des points critiques identifiés"}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: T.b, fontSize: 13, fontWeight: 600,
                      padding: "5px 14px", borderRadius: 100,
                      background: latestAssessment.video_analysis
                        ? "rgba(116,198,157,0.12)" : "rgba(244,162,97,0.12)",
                      color: latestAssessment.video_analysis ? "#74c69d" : "#f4a261",
                      border: `0.5px solid ${latestAssessment.video_analysis
                        ? "rgba(116,198,157,0.25)" : "rgba(244,162,97,0.25)"}` }}>
                      {latestAssessment.video_analysis ? "✅ Bilan complet" : "⚠️ Vidéo manquante"}
                    </span>
                  </div>
                </div>

                <Link href="/results" style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div style={{ padding: "10px 18px", borderRadius: 100,
                    background: "rgba(43,92,230,0.1)", border: "0.5px solid rgba(43,92,230,0.2)",
                    fontFamily: T.b, fontSize: 13, fontWeight: 600, color: "#7c9fff",
                    cursor: "pointer" }}>
                    Voir mes scores →
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* ── 3. SCORES RAPIDES ── */}
            <motion.div {...fadeUp(0.08)} style={{ marginBottom: 16 }}>
              <div style={{ borderRadius: 16, padding: "18px 20px",
                background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
                <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700,
                  color: "var(--t40)", textTransform: "uppercase",
                  letterSpacing: "0.06em", margin: "0 0 14px" }}>
                  Tes 6 dimensions
                </p>
                <div style={{ display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
                  gap: 10 }}>
                  {[
                    { key: "setup",        emoji: "💻", label: "Setup",     href: "/conseils/setup" },
                    { key: "pain",         emoji: "🩺", label: "Douleurs",  href: "/conseils/douleurs" },
                    { key: "habits",       emoji: "⏱️", label: "Habitudes", href: "/conseils/habitudes" },
                    { key: "sleep_energy", emoji: "🌙", label: "Sommeil",   href: "/conseils/sommeil" },
                    { key: "nutrition",    emoji: "🍽️", label: "Nutrition", href: "/conseils/nutrition" },
                    { key: "lifestyle",    emoji: "🏃", label: "Lifestyle", href: "/conseils/lifestyle" },
                  ].map(({ key, emoji, label, href }) => {
                    const score = latestAssessment.scores?.[key as keyof typeof latestAssessment.scores] ?? 0;
                    const color = score >= 70 ? "#74c69d" : score >= 50 ? "#f4a261" : "#f09595";
                    return (
                      <Link key={key} href={href}
                        style={{ textDecoration: "none" }}>
                        <motion.div
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          style={{ padding: "14px 16px", borderRadius: 12,
                            background: "var(--bg-card-2)", border: "0.5px solid var(--border)",
                            cursor: "pointer", position: "relative" }}>
                          <div style={{ position: "absolute", top: 8, right: 10,
                            fontSize: 10, color: "var(--t30)" }}>→</div>
                          <div style={{ display: "flex", justifyContent: "space-between",
                            alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 18 }}>{emoji}</span>
                            <span style={{ fontFamily: T.h, fontWeight: 700,
                              fontSize: 20, color }}>{score}</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 100,
                            background: "var(--border)", overflow: "hidden" }}>
                            <div style={{ width: `${score}%`, height: "100%",
                              borderRadius: 100, background: color }} />
                          </div>
                          <p style={{ fontFamily: T.b, fontSize: 13,
                            color: "var(--t45)", margin: "6px 0 0" }}>{label}</p>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* ── 4. ACTIONS RAPIDES ── */}
            <motion.div {...fadeUp(0.1)} style={{ marginBottom: 16 }}>
              <div style={{ display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 10 }}>

                <Link href="/final-report" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "20px", borderRadius: 16,
                    background: "var(--bg-card)", border: "0.5px solid var(--border)",
                    cursor: "pointer", height: "100%" }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📋</span>
                    <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 16,
                      color: "var(--text-primary)", margin: "0 0 4px" }}>Mon rapport</p>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", margin: 0 }}>
                      Priorités · Actions · Détail
                    </p>
                  </div>
                </Link>

                <Link href="/video-intro" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "20px", borderRadius: 16,
                    background: latestAssessment.video_analysis
                      ? "var(--bg-card)"
                      : "rgba(43,92,230,0.06)",
                    border: latestAssessment.video_analysis
                      ? "0.5px solid var(--border)"
                      : "0.5px solid rgba(43,92,230,0.25)",
                    cursor: "pointer", height: "100%" }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🎥</span>
                    <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 16,
                      color: "var(--text-primary)", margin: "0 0 4px" }}>
                      {latestAssessment.video_analysis ? "Refaire l'analyse" : "Analyse vidéo"}
                    </p>
                    <p style={{ fontFamily: T.b, fontSize: 13,
                      color: latestAssessment.video_analysis ? "var(--t50)" : "#7c9fff",
                      margin: 0 }}>
                      {latestAssessment.video_analysis ? "Posture · Setup" : "⚡ À compléter"}
                    </p>
                  </div>
                </Link>

                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "20px", borderRadius: 16,
                    background: "var(--bg-card)", border: "0.5px solid var(--border)",
                    cursor: "pointer", height: "100%" }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🧘</span>
                    <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 16,
                      color: "var(--text-primary)", margin: "0 0 4px" }}>Mes exercices</p>
                    <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", margin: 0 }}>
                      Programme · 10 min/jour
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* ── 5. SIGNALEMENT B2B ── */}
            {isB2B && !signalSent && (
              <motion.div {...fadeUp(0.12)}>
                <div style={{ padding: "20px", borderRadius: 20, marginBottom: 16,
                  background: "rgba(244,162,97,0.06)", border: "0.5px solid rgba(244,162,97,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>💬</span>
                    <div>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15,
                        color: "var(--text-primary)", margin: 0 }}>
                        Signaler un problème à votre RH
                      </p>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)", margin: "2px 0 0" }}>
                        Anonyme · Visible uniquement par votre responsable RH
                      </p>
                    </div>
                  </div>
                  <SignalForm
                    companyId={companyId!}
                    anonymousId={anonymousId!}
                    onSent={() => setSignalSent(true)}
                  />
                </div>
              </motion.div>
            )}

            {/* ── REFAIRE LE BILAN ── */}
            <div style={{ textAlign: "center", paddingTop: 8, marginBottom: 16 }}>
              <Link href="/questionnaire" style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t35)", cursor: "pointer" }}>
                  🔄 Nouveau bilan
                </span>
              </Link>
            </div>
          </>
        ) : (
          /* ── PAS DE BILAN ── */
          <motion.div {...fadeUp(0.05)} style={{ textAlign: "center", padding: "48px 24px" }}>
            <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>📋</span>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22,
              color: "var(--text-primary)", marginBottom: 8 }}>
              Tu n&apos;as pas encore fait ton bilan
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
              lineHeight: 1.65, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
              10 minutes pour comprendre ce que ton corps essaie de te dire au travail.
            </p>
            <Link href="/questionnaire" style={{ textDecoration: "none" }}>
              <div style={{ display: "inline-block", padding: "15px 32px",
                borderRadius: 100, background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Commencer mon bilan →
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── DELETE ACCOUNT ── */}
        <div style={{ textAlign: "center", paddingTop: 24 }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ background: "none", border: "none", fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "rgba(240,149,149,0.45)", cursor: "pointer", textDecoration: "underline" }}
          >
            Supprimer mon compte
          </button>
        </div>

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={() => setShowDeleteModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              borderRadius: 24, padding: "28px", maxWidth: 420, width: "100%",
              background: "var(--bg-secondary)", border: "0.5px solid var(--border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
              <h2 style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: 20, color: "var(--text-primary)", margin: "12px 0 6px" }}>
                Supprimer mon compte
              </h2>
              <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "var(--t55)", lineHeight: 1.6 }}>
                Cette action est <strong style={{ color: "#f09595" }}>irréversible</strong>. Voici ce qui sera supprimé définitivement :
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { emoji: "📊", text: "Tous tes bilans et scores PAW" },
                { emoji: "🎥", text: "Tes analyses vidéo posturales" },
                { emoji: "📈", text: "Ton historique et ton évolution" },
                { emoji: "🏅", text: "Tes badges et ta progression" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", borderRadius: 10, background: "rgba(226,75,74,0.06)", border: "0.5px solid rgba(226,75,74,0.15)" }}>
                  <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  <span style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "var(--t70)" }}>{item.text}</span>
                </div>
              ))}

              {membership?.role === "admin" && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", marginTop: 4 }}>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#f09595", margin: "0 0 6px", fontWeight: 700 }}>
                    🏢 Attention — Compte administrateur entreprise
                  </p>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "var(--t60)", margin: 0, lineHeight: 1.6 }}>
                    Tu es admin de <strong style={{ color: "var(--text-primary)" }}>{membership.company_name}</strong>.
                    En supprimant ton compte, <strong style={{ color: "#f09595" }}>l&apos;ensemble du dashboard RH, les données de tes employés et l&apos;historique de l&apos;entreprise seront supprimés définitivement</strong> si tu es le seul administrateur.
                  </p>
                </div>
              )}

              {membership?.role === "employee" && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(244,162,97,0.08)", border: "0.5px solid rgba(244,162,97,0.25)", marginTop: 4 }}>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#f4a261", margin: "0 0 4px", fontWeight: 600 }}>
                    🏢 Compte lié à {membership.company_name}
                  </p>
                  <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12, color: "var(--t55)", margin: 0, lineHeight: 1.6 }}>
                    Ton bilan sera retiré du dashboard RH de ton entreprise.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={deleteAccount}
                disabled={deleteLoading}
                style={{
                  padding: "14px 0", borderRadius: 100, border: "none",
                  background: "#e24b4a", color: "#fff",
                  fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: 14,
                  cursor: deleteLoading ? "default" : "pointer",
                  opacity: deleteLoading ? 0.6 : 1,
                }}>
                {deleteLoading ? "Suppression en cours…" : "Oui, supprimer définitivement"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "13px 0", borderRadius: 100, border: "0.5px solid var(--border)",
                  background: "transparent", color: "var(--t55)",
                  fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, fontSize: 14,
                  cursor: "pointer",
                }}>
                Annuler — garder mon compte
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

