"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "@/contexts/ThemeContext";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assessment {
  id: string;
  created_at: string;
  global_score: number;
  scores: Record<string, number>;
  answers: Record<string, unknown>;
  job_type?: string;
  video_analysis: {
    personne?: Record<string, unknown>;
    poste?: Record<string, unknown>;
    analyzed_at?: string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sc(s: number) { return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595"; }

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  };
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
  const [type, setType] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [loading, setLoading] = useState(false);

  const types = [
    { key: "douleur",    label: "🩺 Douleur physique",     showZone: true,  showIntensity: true },
    { key: "equipement", label: "🪑 Problème d'équipement", showZone: false, showIntensity: false },
    { key: "contrainte", label: "⚠️ Contrainte posturale",  showZone: true,  showIntensity: false },
    { key: "autre",      label: "💬 Autre",                 showZone: false, showIntensity: false },
  ];
  const zones = ["Lombaires / dos bas", "Cervicales / nuque", "Épaules", "Poignets / mains", "Jambes / genoux", "Pieds", "Autre"];
  const selectedType = types.find(t => t.key === type);

  async function handleSubmit() {
    if (!type || !description.trim()) return;
    setLoading(true);
    await supabase.from("signals").insert({
      company_id: companyId, anonymous_id: anonymousId, type,
      zone: zone || null, description: description.trim(),
      intensity: selectedType?.showIntensity ? intensity : null,
    });
    setLoading(false);
    onSent();
  }

  return (
    <div style={{ borderRadius: 20, padding: "20px 22px", background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 14px" }}>
        📣 Signalement entreprise
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {types.map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: type === t.key ? "rgba(244,162,97,0.15)" : "rgba(255,255,255,0.04)",
                border: `0.5px solid ${type === t.key ? "rgba(244,162,97,0.4)" : "rgba(255,255,255,0.08)"}`,
                fontFamily: T.b, fontSize: 12, fontWeight: 600,
                color: type === t.key ? "#f4a261" : "rgba(255,255,255,0.5)", textAlign: "left" as const }}>
              {t.label}
            </button>
          ))}
        </div>
        {selectedType?.showZone && (
          <select value={zone} onChange={e => setZone(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 10, outline: "none",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)",
              color: zone ? "var(--text-primary)" : "rgba(255,255,255,0.35)", fontFamily: T.b, fontSize: 13 }}>
            <option value="">Zone concernée (optionnel)</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        )}
        {selectedType?.showIntensity && (
          <div>
            <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
              Intensité : <strong style={{ color: "#f4a261" }}>{intensity}/5</strong>
            </p>
            <input type="range" min={1} max={5} step={1} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f4a261" }} />
          </div>
        )}
        {type && (
          <textarea placeholder="Décrivez brièvement le problème…"
            value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ padding: "10px 12px", borderRadius: 10, outline: "none", resize: "none",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)", fontFamily: T.b, fontSize: 13, lineHeight: 1.5 }} />
        )}
        {type && description.trim() && (
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: "12px 0", borderRadius: 100, border: "none", cursor: "pointer",
              background: "#f4a261", color: "#fff", opacity: loading ? 0.7 : 1,
              fontFamily: T.h, fontWeight: 700, fontSize: 14 }}>
            {loading ? "Envoi…" : "Envoyer le signalement →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DailyChecklist ──────────────────────────────────────────────────────────

function DailyChecklist({ scores }: { scores: Record<string, number> | null }) {
  const allTasks: Array<{ id: string; text: string; dim: string }> = [];
  const s = scores ?? {};

  if ((s.setup ?? 100) < 75) {
    allTasks.push({ id: "screen_height", dim: "setup",
      text: "Vérifie que le haut de ton écran est au niveau de tes yeux" });
    allTasks.push({ id: "chair_position", dim: "setup",
      text: "Pieds à plat, genoux à 90°, lombaires contre le dossier" });
  }
  if ((s.habits ?? s.habitudes ?? 100) < 75) {
    allTasks.push({ id: "break_alarm", dim: "habitudes",
      text: "Programme une alarme dans 45 min pour te lever" });
    allTasks.push({ id: "lunch_break", dim: "habitudes",
      text: "Mange loin de ton écran aujourd'hui" });
  }
  if ((s.pain ?? 100) < 75) {
    allTasks.push({ id: "chin_tuck", dim: "douleurs",
      text: "Fais 10 rétractions cervicales maintenant (rentre le menton)" });
    allTasks.push({ id: "stretch_break", dim: "douleurs",
      text: "2 minutes d'étirements dos/nuque avant 12h" });
  }
  if ((s.nutrition ?? 100) < 75) {
    allTasks.push({ id: "water", dim: "nutrition",
      text: "Bois un grand verre d'eau maintenant" });
    allTasks.push({ id: "protein_lunch", dim: "nutrition",
      text: "Prévois une source de protéine à chaque repas aujourd'hui" });
  }
  if ((s.sleep_energy ?? s.mode_de_vie ?? 100) < 75) {
    allTasks.push({ id: "screen_off", dim: "mode-de-vie",
      text: "Coupe les écrans 30 min avant de dormir ce soir" });
  }
  allTasks.push({ id: "posture_check", dim: "setup",
    text: "Fais un check de ta posture maintenant — dos droit, épaules relâchées" });
  allTasks.push({ id: "water_2", dim: "nutrition",
    text: "1,5L d'eau aujourd'hui — tu en es où ?" });

  const tasks = allTasks.slice(0, 4);

  const todayKey = `paw_checklist_${new Date().toISOString().split("T")[0]}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(todayKey) ?? "{}"); }
    catch { return {}; }
  });

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { localStorage.setItem(todayKey, JSON.stringify(next)); } catch {}
  }

  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = tasks.length;

  const dimColors: Record<string, string> = {
    setup: "#7c9fff",
    habitudes: "#f4a261",
    douleurs: "#f09595",
    nutrition: "#74c69d",
    "mode-de-vie": "#c4b5fd",
  };

  return (
    <div style={{ padding: "20px 24px", borderRadius: 20,
      background: "var(--bg-card)", border: "0.5px solid var(--border)",
      marginBottom: 14 }}>

      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16,
            color: "var(--text-primary)", margin: 0 }}>
            Checklist du jour
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ height: 4, width: 80, borderRadius: 100,
            background: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 100,
              background: doneCount === totalCount ? "#74c69d" : "#2b5ce6",
              width: `${(doneCount / totalCount) * 100}%`,
              transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontFamily: T.b, fontSize: 12, color: "var(--t45)" }}>
            {doneCount}/{totalCount}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map(task => (
          <motion.div key={task.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggle(task.id)}
            style={{ display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 12, cursor: "pointer",
              background: checked[task.id] ? "rgba(116,198,157,0.06)" : "var(--bg-card-2)",
              border: `0.5px solid ${checked[task.id] ? "rgba(116,198,157,0.2)" : "var(--border)"}`,
              transition: "all 0.15s" }}>

            <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${checked[task.id] ? "#74c69d" : "var(--border-2)"}`,
              background: checked[task.id] ? "#74c69d" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s" }}>
              {checked[task.id] && (
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>
              )}
            </div>

            <p style={{ fontFamily: T.b, fontSize: 13, margin: 0,
              flex: 1, lineHeight: 1.4,
              color: checked[task.id] ? "var(--t40)" : "var(--t65)",
              textDecoration: checked[task.id] ? "line-through" : "none",
              transition: "all 0.15s" }}>
              {task.text}
            </p>

            <span style={{ fontFamily: T.b, fontSize: 10, fontWeight: 600,
              padding: "2px 8px", borderRadius: 100, flexShrink: 0,
              color: dimColors[task.dim] ?? "var(--t40)",
              background: `${dimColors[task.dim] ?? "var(--t40)"}15` }}>
              {task.dim}
            </span>
          </motion.div>
        ))}
      </div>

      {doneCount === totalCount && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10,
            background: "rgba(116,198,157,0.08)",
            border: "0.5px solid rgba(116,198,157,0.25)",
            textAlign: "center" }}>
          <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13,
            color: "#74c69d", margin: 0 }}>
            🎉 Checklist complète — excellent travail aujourd&apos;hui !
          </p>
        </motion.div>
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
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [notAdminError, setNotAdminError] = useState(false);
  const [isB2B, setIsB2B] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [signalSent, setSignalSent] = useState(false);
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
      if (Date.now() - new Date(savedAt).getTime() > 4 * 60 * 60 * 1000) {
        localStorage.removeItem("paw_pending_assessment"); return;
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
        user_id: u.id, global_score: parsedScores.global,
        scores: parsedScores, answers: parsedAnswers, job_type: jobType ?? "bureau",
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

      const { data: assessmentsData } = await supabase
        .from("assessments").select("*").eq("user_id", u.id)
        .order("created_at", { ascending: false });
      if (assessmentsData && assessmentsData.length > 0) setAssessments(assessmentsData);

      const { data: membershipData } = await supabase
        .from("company_memberships").select("company_id, anonymous_id, role, companies(name)")
        .eq("user_id", u.id).maybeSingle();
      if (membershipData?.role === "employee") {
        setIsB2B(true);
        setCompanyId(membershipData.company_id);
        setAnonymousId(membershipData.anonymous_id);
      }

      setLoading(false);

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("error") === "not_admin") {
          setNotAdminError(true);
          window.history.replaceState({}, "", "/dashboard");
        }
      }

      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
          !(window.navigator as unknown as Record<string, unknown>)["standalone"];
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
    if (Date.now() - new Date(premiumSince).getTime() >= 48 * 60 * 60 * 1000) setShowFeedbackBanner(true);
  }, [user]);

  async function requestNotificationPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
      await fetch("/api/send-notification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, action: "save" }),
      });
    } catch { /* user denied */ }
  }

  // ─── Computed ────────────────────────────────────────────────────────────────

  const latestAssessment = assessments[0] ?? null;
  const displayName = firstname || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

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

        {/* ── ALERTS ── */}
        {notAdminError && (
          <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 14,
            background: "rgba(244,162,97,0.1)", border: "0.5px solid rgba(244,162,97,0.3)",
            display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "#f4a261", margin: 0 }}>
              Tu n&apos;as pas accès au dashboard entreprise. Contacte ton administrateur PAW.
            </p>
          </div>
        )}

        {showFeedbackBanner && (
          <motion.div {...fadeUp(0)} style={{ marginBottom: 14,
            borderRadius: 18, padding: "18px 20px",
            background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)",
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
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
                <button style={{ padding: "9px 18px", borderRadius: 100, border: "none",
                  background: "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Donner mon avis →
                </button>
              </Link>
              <button
                onClick={() => { setShowFeedbackBanner(false); localStorage.setItem(`paw_feedback_shown_${user!.id}`, "true"); }}
                style={{ padding: "9px 14px", borderRadius: 100,
                  background: "transparent", border: "0.5px solid var(--border-2)",
                  color: "var(--t50)", fontFamily: T.b, fontSize: 12, cursor: "pointer" }}>
                Plus tard
              </button>
            </div>
          </motion.div>
        )}

        {showIosBanner && (
          <motion.div {...fadeUp(0)} style={{ marginBottom: 14,
            borderRadius: 16, padding: "14px 18px",
            background: "rgba(43,92,230,0.10)", border: "0.5px solid rgba(43,92,230,0.25)",
            display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📱</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 13, color: "var(--text-primary)", margin: "0 0 4px" }}>
                Active les rappels
              </p>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "var(--t55)", margin: 0, lineHeight: 1.5 }}>
                Sur iOS, ajoute l&apos;app à ton écran d&apos;accueil pour recevoir des rappels posture.
              </p>
            </div>
            <button onClick={() => setShowIosBanner(false)}
              style={{ background: "none", border: "none", color: "var(--t30)", fontSize: 16, cursor: "pointer", padding: 0 }}>
              ✕
            </button>
          </motion.div>
        )}

        {/* ── 1. HEADER SCORE ── */}
        <motion.div {...fadeUp(0)} style={{
          padding: "24px", borderRadius: 20,
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
          marginBottom: 16,
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

          <HeroCircle score={latestAssessment?.global_score ?? 0} />

          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontFamily: T.h, fontWeight: 900,
              fontSize: isMobile ? 22 : 26, color: "var(--text-primary)", margin: "0 0 4px" }}>
              Bonjour{displayName ? ` ${displayName}` : ""} 👋
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", margin: "0 0 10px" }}>
              {latestAssessment
                ? `Bilan du ${new Date(latestAssessment.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`
                : "Pas encore de bilan"}
            </p>
            <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600,
              padding: "4px 12px", borderRadius: 100,
              background: (latestAssessment?.global_score ?? 0) >= 70
                ? "rgba(116,198,157,0.15)" : "rgba(244,162,97,0.15)",
              color: (latestAssessment?.global_score ?? 0) >= 70 ? "#74c69d" : "#f4a261",
              border: `0.5px solid ${(latestAssessment?.global_score ?? 0) >= 70
                ? "rgba(116,198,157,0.3)" : "rgba(244,162,97,0.3)"}` }}>
              {(latestAssessment?.global_score ?? 0) >= 70 ? "✅ Bon niveau" :
               (latestAssessment?.global_score ?? 0) >= 50 ? "🟠 À améliorer" :
               "🔴 Points critiques"}
            </span>
          </div>

          <Link href="/questionnaire" style={{ textDecoration: "none", flexShrink: 0 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ padding: "12px 20px", borderRadius: 100,
                background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Nouveau bilan →
            </motion.div>
          </Link>
        </motion.div>

        {latestAssessment && (
          <>
            {/* ── 2. DEUX GRANDES CARDS ── */}
            <div style={{ display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 14, marginBottom: 14 }}>

              {/* Card Scores */}
              <motion.div {...fadeUp(0.06)}>
                <Link href="/results" style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ scale: 1.01, y: -2 }}
                    style={{ padding: "24px", borderRadius: 20, cursor: "pointer",
                      background: "var(--bg-card)", border: "0.5px solid var(--border)",
                      height: "100%", minHeight: 200 }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{ fontSize: 24 }}>📊</span>
                      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18,
                        color: "var(--text-primary)", margin: 0 }}>
                        Mes scores
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {Object.entries(latestAssessment.scores ?? {})
                        .filter(([k]) => k !== "global" && k !== "job_type")
                        .sort(([, a], [, b]) => (a as number) - (b as number))
                        .slice(0, 3)
                        .map(([key, score]) => {
                          const labels: Record<string, string> = {
                            setup: "💻 Setup",
                            pain: "🩺 Douleurs",
                            habits: "⏱️ Habitudes",
                            sleep_energy: "🌙 Mode de vie",
                            mode_de_vie: "🌙 Mode de vie",
                            nutrition: "🍽️ Nutrition",
                            lifestyle: "🏃 Lifestyle",
                          };
                          const s = score as number;
                          const color = s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595";
                          return (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", flex: 1 }}>
                                {labels[key] ?? key}
                              </span>
                              <div style={{ width: 80, height: 4, borderRadius: 100,
                                background: "var(--border)", overflow: "hidden" }}>
                                <div style={{ width: `${s}%`, height: "100%",
                                  borderRadius: 100, background: color }} />
                              </div>
                              <span style={{ fontFamily: T.h, fontWeight: 700,
                                fontSize: 14, color, width: 28, textAlign: "right" }}>
                                {s}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <p style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", fontWeight: 600, margin: 0 }}>
                      Voir toutes mes dimensions →
                    </p>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Card Exercices */}
              <motion.div {...fadeUp(0.08)}>
                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ scale: 1.01, y: -2 }}
                    style={{ padding: "24px", borderRadius: 20, cursor: "pointer",
                      background: "var(--bg-card)", border: "0.5px solid var(--border)",
                      height: "100%", minHeight: 200 }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{ fontSize: 24 }}>🧘</span>
                      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18,
                        color: "var(--text-primary)", margin: 0 }}>
                        Mes exercices
                      </p>
                    </div>

                    {(() => {
                      const lowestDim = Object.entries(latestAssessment.scores ?? {})
                        .filter(([k]) => k !== "global" && k !== "job_type")
                        .sort(([, a], [, b]) => (a as number) - (b as number))
                        [0]?.[0];
                      const focusMap: Record<string, string> = {
                        setup: "Posture et nuque",
                        pain: "Soulagement des douleurs",
                        habits: "Mobilité au bureau",
                        sleep_energy: "Récupération",
                        mode_de_vie: "Récupération",
                        nutrition: "Bien-être global",
                        lifestyle: "Activité physique",
                      };
                      return (
                        <div>
                          <div style={{ padding: "10px 14px", borderRadius: 10,
                            background: "rgba(116,198,157,0.08)",
                            border: "0.5px solid rgba(116,198,157,0.2)", marginBottom: 10 }}>
                            <p style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600,
                              color: "#74c69d", margin: "0 0 4px" }}>
                              🎯 Focus du moment
                            </p>
                            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t65)", margin: 0 }}>
                              {focusMap[lowestDim ?? "setup"] ?? "Bien-être général"}
                            </p>
                          </div>
                          <p style={{ fontFamily: T.b, fontSize: 12,
                            color: "var(--t45)", margin: "0 0 12px", lineHeight: 1.5 }}>
                            Programme adapté à tes résultats · 10 min/jour
                          </p>
                        </div>
                      );
                    })()}

                    <p style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", fontWeight: 600, margin: 0 }}>
                      Voir mon programme →
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* ── 3. CHECKLIST DU JOUR ── */}
            <motion.div {...fadeUp(0.09)}>
              <DailyChecklist scores={latestAssessment.scores} />
            </motion.div>

            {/* ── 4. CARTE ANALYSE VIDÉO ── */}
            <motion.div {...fadeUp(0.1)} style={{ marginBottom: 14 }}>
              <Link href={latestAssessment?.video_analysis ? "/final-report" : "/video-intro"}
                style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.01, y: -2 }}
                  style={{ padding: "24px", borderRadius: 20, cursor: "pointer",
                    background: latestAssessment?.video_analysis
                      ? "rgba(43,92,230,0.08)"
                      : "rgba(43,92,230,0.06)",
                    border: `1px solid ${latestAssessment?.video_analysis
                      ? "rgba(43,92,230,0.3)" : "rgba(43,92,230,0.2)"}` }}>

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>🎥</span>
                      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18,
                        color: "var(--text-primary)", margin: 0 }}>
                        Analyse vidéo IA
                      </p>
                    </div>
                    {latestAssessment?.video_analysis && (
                      <span style={{ fontFamily: T.b, fontSize: 12, fontWeight: 700,
                        padding: "4px 12px", borderRadius: 100,
                        background: "rgba(116,198,157,0.15)", color: "#74c69d",
                        border: "0.5px solid rgba(116,198,157,0.3)" }}>
                        ✅ Complétée
                      </span>
                    )}
                  </div>

                  {latestAssessment?.video_analysis ? (() => {
                    const va = latestAssessment.video_analysis as {
                      personne?: { globalPostureScore?: number; mainIssues?: Array<{ zone: string; severity: string; consequence?: string }> };
                      poste?: { globalSetupScore?: number; mainIssues?: Array<{ element: string; severity: string; fix?: string }> };
                      debout?: { globalPostureScore?: number; mainIssues?: Array<{ zone: string; severity: string; consequence?: string }> };
                    };

                    const postureScore = va?.personne?.globalPostureScore ?? va?.debout?.globalPostureScore;
                    const setupScore = va?.poste?.globalSetupScore;
                    const postureIssues = va?.personne?.mainIssues ?? va?.debout?.mainIssues ?? [];
                    const setupIssues = va?.poste?.mainIssues ?? [];

                    const getColor = (s: number) => s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595";
                    const getBg = (s: number) => s >= 70 ? "rgba(116,198,157,0.08)" : s >= 50 ? "rgba(244,162,97,0.08)" : "rgba(240,149,149,0.08)";
                    const getBorder = (s: number) => s >= 70 ? "rgba(116,198,157,0.2)" : s >= 50 ? "rgba(244,162,97,0.2)" : "rgba(240,149,149,0.2)";

                    const allIssues = [...postureIssues.slice(0, 2), ...setupIssues.slice(0, 1)];

                    return (
                      <div>
                        {/* Scores */}
                        <div style={{ display: "grid",
                          gridTemplateColumns: setupScore !== undefined ? "1fr 1fr" : "1fr",
                          gap: 10, marginBottom: 16 }}>

                          {postureScore !== undefined && (
                            <div style={{ padding: "14px 16px", borderRadius: 14,
                              background: getBg(postureScore),
                              border: `0.5px solid ${getBorder(postureScore)}` }}>
                              <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 600,
                                color: "var(--t45)", margin: "0 0 6px",
                                textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                                Posture
                              </p>
                              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32,
                                color: getColor(postureScore), margin: "0 0 4px", lineHeight: 1,
                                letterSpacing: "-1px" }}>
                                {postureScore}
                                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--t35)" }}>/100</span>
                              </p>
                              <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t45)", margin: 0 }}>
                                {postureScore >= 70 ? "Bonne posture globale" :
                                 postureScore >= 50 ? "Quelques corrections nécessaires" :
                                 "Points critiques identifiés"}
                              </p>
                            </div>
                          )}

                          {setupScore !== undefined && (
                            <div style={{ padding: "14px 16px", borderRadius: 14,
                              background: getBg(setupScore),
                              border: `0.5px solid ${getBorder(setupScore)}` }}>
                              <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 600,
                                color: "var(--t45)", margin: "0 0 6px",
                                textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                                Setup
                              </p>
                              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32,
                                color: getColor(setupScore), margin: "0 0 4px", lineHeight: 1,
                                letterSpacing: "-1px" }}>
                                {setupScore}
                                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--t35)" }}>/100</span>
                              </p>
                              <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t45)", margin: 0 }}>
                                {setupScore >= 70 ? "Poste bien configuré" :
                                 setupScore >= 50 ? "Ajustements recommandés" :
                                 "Poste à reconfigurer"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Issues */}
                        {allIssues.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700,
                              color: "var(--t40)", textTransform: "uppercase" as const,
                              letterSpacing: "0.06em", margin: "0 0 8px" }}>
                              Points identifiés
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {allIssues.map((issue: { zone?: string; element?: string; severity: string }, i) => {
                                const sevColor = issue.severity === "élevé" ? "#f09595" :
                                                 issue.severity === "modéré" ? "#f4a261" : "#74c69d";
                                return (
                                  <div key={i} style={{ display: "flex", alignItems: "center",
                                    gap: 10, padding: "8px 12px", borderRadius: 10,
                                    background: "var(--bg-card-2)", border: "0.5px solid var(--border)" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%",
                                      background: sevColor, flexShrink: 0 }} />
                                    <span style={{ fontFamily: T.b, fontSize: 12,
                                      color: "var(--t65)", flex: 1 }}>
                                      {issue.zone ?? issue.element}
                                    </span>
                                    <span style={{ fontFamily: T.b, fontSize: 11, fontWeight: 600,
                                      color: sevColor, padding: "2px 8px", borderRadius: 100,
                                      background: `${sevColor}15` }}>
                                      {issue.severity}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <p style={{ fontFamily: T.b, fontSize: 13, color: "#7c9fff",
                          fontWeight: 600, margin: 0 }}>
                          Voir mon rapport complet →
                        </p>
                      </div>
                    );
                  })() : (
                    <div>
                      <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
                        lineHeight: 1.7, margin: "0 0 14px" }}>
                        Le questionnaire révèle ce que tu <em>penses</em> de ta posture.
                        La vidéo montre ce que ton corps <em>fait réellement</em> —
                        en 40 secondes depuis ton PC ou ton mobile.
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                        {["40 secondes", "IA posturale", "Rapport immédiat", "PC ou mobile"].map((tag, i) => (
                          <span key={i} style={{ fontFamily: T.b, fontSize: 12, fontWeight: 600,
                            padding: "4px 12px", borderRadius: 100,
                            background: "rgba(43,92,230,0.12)", color: "#7c9fff",
                            border: "0.5px solid rgba(43,92,230,0.2)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "inline-block", padding: "12px 24px",
                        borderRadius: 100, background: "#2b5ce6", color: "#fff",
                        fontFamily: T.h, fontWeight: 700, fontSize: 14 }}>
                        Analyser ma posture →
                      </div>
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>

            {/* ── 5. TIP DU JOUR ── */}
            {(() => {
              const ALL_TIPS = [
                "Les cervicales supportent 5kg — ta tête en avant à 45° en charge 22kg.",
                "2 minutes de marche toutes les 45 min réduisent la pression discale de 40%.",
                "Un écran trop bas force ta nuque en flexion permanente. Le haut de l'écran doit être au niveau des yeux.",
                "La règle 20-20-20 : toutes les 20 min, fixe un point à 6m pendant 20 secondes.",
                "Dormir 7h+ réduit la perception de la douleur de 25% dès la première nuit.",
                "Manger devant l'écran = 30% de calories en plus sans s'en rendre compte.",
                "Un manque d'eau de 1% réduit les capacités cognitives de 10%.",
                "Travailler depuis le canapé = 3h de tension musculaire pour 1h de travail.",
                "Le stress chronique maintient les muscles en tension — cause directe de TMS.",
                "30g de protéines au petit-déjeuner stabilisent la glycémie jusqu'à midi.",
                "Les disques intervertébraux sont composés à 80% d'eau — boire régulièrement les protège.",
                "Une vraie pause déjeuner sans écran réduit la fatigue musculaire de l'après-midi de 30%.",
                "Régler sa chaise correctement réduit la pression lombaire de 40%.",
                "5 min de cohérence cardiaque (5s inspiration, 5s expiration) réduisent le cortisol.",
                "Un laptop seul sans rehausseur génère 30-40° de flexion cervicale permanente.",
              ];
              const tip = ALL_TIPS[Math.floor(Date.now() / 86400000) % ALL_TIPS.length];
              return (
                <motion.div {...fadeUp(0.12)}>
                  <div style={{ padding: "16px 20px", borderRadius: 16,
                    background: "var(--bg-card)", border: "0.5px solid var(--border)",
                    display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                    <div>
                      <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700,
                        color: "var(--t40)", textTransform: "uppercase",
                        letterSpacing: "0.06em", margin: "0 0 4px" }}>
                        Tip du jour
                      </p>
                      <p style={{ fontFamily: T.b, fontSize: 14,
                        color: "var(--text-primary)", margin: 0, lineHeight: 1.65 }}>
                        {tip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* ── 6. SIGNALEMENT B2B ── */}
            {isB2B && !signalSent && (
              <motion.div {...fadeUp(0.14)} style={{ marginTop: 14 }}>
                <SignalForm
                  companyId={companyId!}
                  anonymousId={anonymousId!}
                  onSent={() => setSignalSent(true)}
                />
              </motion.div>
            )}
          </>
        )}

        {/* ── État vide ── */}
        {!latestAssessment && (
          <motion.div {...fadeUp(0.05)} style={{ textAlign: "center", padding: "48px 24px" }}>
            <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>📋</span>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22,
              color: "var(--text-primary)", marginBottom: 8 }}>
              Tu n&apos;as pas encore fait ton bilan
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)",
              lineHeight: 1.65, maxWidth: 380, margin: "0 auto 24px" }}>
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

      </div>
    </main>
  );
}
