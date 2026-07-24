"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateScores, DEFAULT_ANSWERS, type QuestionnaireAnswers } from "@/lib/scoring";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { useTheme } from "@/contexts/ThemeContext";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    index: 0, id: "cat-1",
    title: "Ton setup", subtitle: "Poste de travail & ergonomie", emoji: "💻",
    color: "#2b5ce6", colorBg: "rgba(43,92,230,0.10)", colorBorder: "rgba(43,92,230,0.20)",
    selectedBg: "rgba(43,92,230,0.18)", selectedColor: "#a8c0ff",
    requiredQ: ["q1", "q3", "q4", "q5", "q5b", "q_eclairage"],
  },
  {
    index: 1, id: "cat-2",
    title: "Tes douleurs", subtitle: "État de ton corps", emoji: "🩺",
    color: "#e24b4a", colorBg: "rgba(226,75,74,0.08)", colorBorder: "rgba(226,75,74,0.18)",
    selectedBg: "rgba(226,75,74,0.18)", selectedColor: "#f09595",
    requiredQ: ["q6", "q7", "q8", "q9", "q10", "q11", "q12", "q12b", "q_irradiation", "q_douleur_nuit"],
  },
  {
    index: 2, id: "cat-3",
    title: "Habitudes de travail", subtitle: "Pauses & comportements", emoji: "⏱️",
    color: "#d4622a", colorBg: "rgba(212,98,42,0.08)", colorBorder: "rgba(212,98,42,0.18)",
    selectedBg: "rgba(212,98,42,0.18)", selectedColor: "#f4a261",
    requiredQ: ["q14", "q14b", "q_laptop_hors_bureau"],
  },
  {
    index: 3, id: "cat-4",
    title: "Sommeil & énergie", subtitle: "Récupération & hydratation", emoji: "🌙",
    color: "#2d6a4f", colorBg: "rgba(45,106,79,0.08)", colorBorder: "rgba(45,106,79,0.18)",
    selectedBg: "rgba(45,106,79,0.18)", selectedColor: "#74c69d",
    requiredQ: ["q18", "q20", "q_ecrans_soir"],
  },
  {
    index: 4, id: "cat-5",
    title: "Nutrition & énergie", subtitle: "Alimentation & vitalité", emoji: "🍽️",
    color: "#7c3aed", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["qn1", "qn2", "qn3", "qn4"],
  },
  {
    index: 5, id: "cat-6",
    title: "Ton corps", subtitle: "Historique & habitudes physiques", emoji: "🏃",
    color: "#1d9e75", colorBg: "rgba(29,158,117,0.08)", colorBorder: "rgba(29,158,117,0.18)",
    selectedBg: "rgba(29,158,117,0.18)", selectedColor: "#5dcaa5",
    requiredQ: ["q21", "q24"],
  },
  {
    index: 6, id: "cat-7",
    title: "Ressenti global", subtitle: "Comment tu te sens", emoji: "💭",
    color: "#7c3aed", colorBg: "rgba(124,58,237,0.08)", colorBorder: "rgba(124,58,237,0.18)",
    selectedBg: "rgba(124,58,237,0.18)", selectedColor: "#a78bfa",
    requiredQ: ["q25"],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isQuestionAnswered(q: string, answers: QuestionnaireAnswers): boolean {
  const val = (answers as unknown as Record<string, unknown>)[q];
  if (q === "q21") return Array.isArray(val) && (val as string[]).length > 0;
  if (["q6", "q7", "q8", "q9", "q10", "q25"].includes(q)) return val !== null;
  if (["q13", "q17", "q19", "q_stress_travail"].includes(q)) return true;
  return typeof val === "string" && val !== "";
}

function isCategoryDone(catIndex: number, answers: QuestionnaireAnswers): boolean {
  return CATEGORIES[catIndex].requiredQ.every((q) => isQuestionAnswered(q, answers));
}

function isAllAnswered(answers: QuestionnaireAnswers): boolean {
  return CATEGORIES.every((_, i) => isCategoryDone(i, answers));
}

function completedCount(answers: QuestionnaireAnswers): number {
  return CATEGORIES.filter((_, i) => isCategoryDone(i, answers)).length;
}

// ─── Choice components ────────────────────────────────────────────────────────

interface OptionDef { value: string; label: string; }

function ChoiceGrid({
  options, value, onChange, cat,
}: {
  options: OptionDef[]; value: string;
  onChange: (v: string) => void;
  cat: typeof CATEGORIES[number];
}) {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt) => {
        const sel = value === opt.value;
        return (
          <motion.div
            key={opt.value}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "12px 18px",
              borderRadius: 100,
              background: sel ? cat.selectedBg : theme === "light" ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.06)",
              border: sel ? `1px solid ${cat.color}55` : "0.5px solid var(--border-3)",
              color: sel ? cat.selectedColor : "var(--t75)",
              fontSize: 14,
              fontFamily: T.b,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.15s ease",
            }}
          >
            <span>{opt.label}</span>
            {sel && <span style={{ color: cat.color, fontWeight: 700, fontSize: 13 }}>✓</span>}
          </motion.div>
        );
      })}
    </div>
  );
}

function MultiSelectGrid({
  options, value, onChange, cat, otherValue, onOtherChange,
}: {
  options: OptionDef[]; value: string[]; onChange: (v: string[]) => void;
  cat: typeof CATEGORIES[number]; otherValue?: string; onOtherChange?: (v: string) => void;
}) {
  const { theme } = useTheme();
  function toggle(val: string) {
    if (val === "none") { onChange(["none"]); return; }
    const withoutNone = value.filter((v) => v !== "none");
    if (withoutNone.includes(val)) {
      const next = withoutNone.filter((v) => v !== val);
      onChange(next.length === 0 ? [] : next);
    } else {
      onChange([...withoutNone, val]);
    }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt) => {
        const sel = value.includes(opt.value);
        return (
          <motion.div
            key={opt.value}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggle(opt.value)}
            style={{
              padding: "12px 18px",
              borderRadius: 100,
              background: sel ? cat.selectedBg : theme === "light" ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.06)",
              border: sel ? `1px solid ${cat.color}55` : "0.5px solid var(--border-3)",
              color: sel ? cat.selectedColor : "var(--t75)",
              fontSize: 14,
              fontFamily: T.b,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{opt.label}</span>
            {sel && <span style={{ color: cat.color, fontWeight: 700 }}>✓</span>}
          </motion.div>
        );
      })}
      <AnimatePresence>
        {value.includes("autre") && onOtherChange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              value={otherValue ?? ""}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Précise le problème diagnostiqué…"
              style={{
                width: "100%",
                padding: "12px 18px",
                borderRadius: 100,
                background: cat.colorBg,
                border: `1px solid ${cat.colorBorder}`,
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: T.b,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PAIN_EMOJIS = ["😊", "🙂", "😐", "😕", "😖", "😫"];
const PAIN_LABELS = ["Aucune", "Légère", "Modérée", "Importante", "Sévère", "Très sévère"];

function PainScale({
  value, onChange, cat,
}: { value: number | null; onChange: (v: number) => void; cat: typeof CATEGORIES[number]; }) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: 6 }}>
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const sel = value === v;
        return (
          <motion.div
            key={v}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(v)}
            style={{
              height: 60,
              borderRadius: 12,
              background: sel ? cat.selectedBg : theme === "light" ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)",
              border: sel ? `1px solid ${cat.color}66` : "0.5px solid var(--border-2)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 16 }}>{PAIN_EMOJIS[v]}</span>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 11, color: sel ? cat.selectedColor : "var(--t40)" }}>{v}</span>
            <span style={{ fontSize: 8, color: sel ? cat.selectedColor : "var(--t25)", textAlign: "center", lineHeight: 1.1, overflow: "hidden", padding: "0 2px", width: "100%" }}>
              {PAIN_LABELS[v]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

const WELLBEING_OPTIONS = [
  { value: 1, emoji: "😩", label: "Épuisé" },
  { value: 2, emoji: "😕", label: "Pas top" },
  { value: 3, emoji: "😐", label: "Ça va" },
  { value: 4, emoji: "😊", label: "Bien" },
  { value: 5, emoji: "🔥", label: "Excellent" },
];

function WellbeingScale({
  value, onChange, cat,
}: { value: number | null; onChange: (v: number) => void; cat: typeof CATEGORIES[number]; }) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 6 }}>
      {WELLBEING_OPTIONS.map((opt) => {
        const sel = value === opt.value;
        return (
          <motion.div
            key={opt.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(opt.value)}
            style={{
              height: 68,
              borderRadius: 14,
              background: sel ? cat.selectedBg : theme === "light" ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)",
              border: sel ? `1px solid ${cat.color}55` : "0.5px solid var(--border-2)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 22 }}>{opt.emoji}</span>
            <span style={{ fontSize: 9, fontFamily: T.b, color: sel ? cat.selectedColor : "var(--t35)", textAlign: "center", overflow: "hidden", padding: "0 3px", width: "100%" }}>
              {opt.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function SliderInput({
  value, min, max, step, unit, reference, onChange, cat,
}: {
  value: number; min: number; max: number; step: number; unit: string;
  reference?: string; onChange: (v: number) => void; cat: typeof CATEGORIES[number];
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 40, color: cat.selectedColor }}>{value}<span style={{ fontSize: 22 }}>{unit}</span></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "var(--t35)", fontSize: 11, width: 24, textAlign: "center" }}>{min}</span>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: cat.color,
            background: `linear-gradient(to right, ${cat.color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
            height: 4,
            borderRadius: 100,
            outline: "none",
            appearance: "none",
          }}
        />
        <span style={{ color: "var(--t35)", fontSize: 11, width: 24, textAlign: "center" }}>{max}</span>
      </div>
      {reference && (
        <p style={{ textAlign: "center", color: "var(--t35)", fontSize: 12, fontFamily: T.b }}>{reference}</p>
      )}
    </div>
  );
}

// ─── Question block wrapper ───────────────────────────────────────────────────

function QBlock({
  number, question, note, children, answered, cat,
}: {
  number: string; question: string; note?: string; children: React.ReactNode;
  answered: boolean; cat: typeof CATEGORIES[number];
}) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 18,
        background: answered ? cat.colorBg : theme === "light" ? "rgba(15,23,42,0.03)" : "rgba(255,255,255,0.02)",
        border: answered ? `0.5px solid ${cat.colorBorder}` : "0.5px solid rgba(255,255,255,0.06)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: answered ? cat.colorBg : theme === "light" ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)",
            border: answered ? `1px solid ${cat.color}55` : "0.5px solid var(--border-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 11,
            fontFamily: T.h,
            fontWeight: 700,
            color: answered ? cat.color : "var(--t35)",
          }}
        >
          {answered ? "✓" : number}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "var(--text-primary)", fontSize: 14, fontFamily: T.b, lineHeight: 1.5, margin: 0 }}>
            {question}
          </p>
          {note && (
            <p style={{ color: "var(--t45)", fontSize: 11, fontFamily: T.b, lineHeight: 1.55, margin: "6px 0 0", padding: "6px 10px", borderRadius: 8, background: `${cat.color}12`, borderLeft: `2px solid ${cat.color}40` }}>
              💡 {note}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({
  cat, done, children, onRef,
}: {
  cat: typeof CATEGORIES[number]; done: boolean;
  children: React.ReactNode; onRef: (el: HTMLElement | null) => void;
}) {
  const { theme } = useTheme();
  return (
    <section id={cat.id} ref={onRef} style={{ scrollMarginTop: 80 }}>
      <div style={{ borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
        {/* Header */}
        <div
          style={{
            padding: "20px 22px",
            background: cat.colorBg,
            borderBottom: `0.5px solid ${cat.colorBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: cat.colorBg,
                border: `0.5px solid ${cat.colorBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {cat.emoji}
            </div>
            <div>
              <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 17, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
                {cat.title}
              </h2>
              <p style={{ color: "var(--t40)", fontSize: 12, fontFamily: T.b, margin: 0 }}>
                {cat.subtitle}
              </p>
            </div>
          </div>
          {done && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                background: cat.colorBg,
                border: `1px solid ${cat.colorBorder}`,
                color: cat.selectedColor,
                fontFamily: T.h,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              ✓ Complété
            </motion.div>
          )}
        </div>
        {/* Body */}
        <div
          style={{
            padding: "16px",
            background: theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.015)",
            border: `0.5px solid ${cat.colorBorder}`,
            borderTop: "none",
            borderRadius: "0 0 22px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}



// ─── Main page ────────────────────────────────────────────────────────────────

const TOAST_MESSAGES = [
  "💻 Setup analysé — on commence à voir ton profil",
  "🩺 Données douleurs enregistrées — tu avances bien",
  "⏱️ Mi-parcours ! Tes habitudes sont claires",
  "🌙 Presque fini — encore 2 catégories",
  "🥗 Excellente donnée — ton profil prend forme",
  "🏃 Dernière ligne droite !",
];

function BureauQuestionnaire() {
  const router = useRouter();
  const { c, theme } = useTheme();
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(DEFAULT_ANSWERS);
  const [firstname, setFirstname] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const catRefs = useRef<(HTMLElement | null)[]>(Array(CATEGORIES.length).fill(null));
  const scrolledCats = useRef<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setFirstname(localStorage.getItem("paw_firstname") ?? "");
  }, []);

  const update = useCallback(<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    CATEGORIES.forEach((_, i) => {
      if (i < CATEGORIES.length - 1 && isCategoryDone(i, answers) && !scrolledCats.current.has(i)) {
        scrolledCats.current.add(i);
        if (i < TOAST_MESSAGES.length) {
          let msg = TOAST_MESSAGES[i];
          if (i === 1 && firstname) msg = `${msg} ${firstname}`;
          setToast(msg);
          setTimeout(() => setToast(null), 3000);
        }
        setTimeout(() => {
          catRefs.current[i + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    });
  }, [answers, firstname]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSubmit() {
    const scores = calculateScores(answers);
    sessionStorage.removeItem("postureatwork_answers_debout");
    sessionStorage.setItem("postureatwork_answers", JSON.stringify(answers));
    sessionStorage.setItem("postureatwork_scores", JSON.stringify(scores));
    localStorage.setItem("paw_answers", JSON.stringify(answers));
    router.push("/results");
  }

  const allDone = isAllAnswered(answers);
  const done = completedCount(answers);

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80, background: c.mainBg }}>
      <BackgroundBlobs blobs={[
        { top: "0%", right: "-5%", color: "rgba(43,92,230,0.12)", size: 400 },
        { top: "50%", left: "-8%", color: "rgba(226,75,74,0.08)", size: 350 },
      ]} />

      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: theme === "light" ? "rgba(255,255,255,0.95)" : "rgba(15,15,26,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--t40)", fontSize: 13, fontFamily: T.b, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                ← Retour
              </button>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "var(--text-primary)" }}>PAW</span>
                <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "#7c9fff" }}>.</span>
              </Link>
            </div>
            <span style={{ color: "var(--t40)", fontSize: 13, fontFamily: T.b }}>
              {done} / {CATEGORIES.length} catégories
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: "var(--bg-card-2)", borderRadius: 100, overflow: "hidden", marginBottom: 10 }}>
            <motion.div
              style={{ height: "100%", borderRadius: 100, background: "#2b5ce6" }}
              animate={{ width: `${(done / CATEGORIES.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {/* Pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {CATEGORIES.map((cat, i) => {
              const isDone = isCategoryDone(i, answers);
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollTo(cat.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 100,
                    background: isDone ? cat.colorBg : theme === "light" ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.05)",
                    border: isDone ? `0.5px solid ${cat.colorBorder}` : "0.5px solid var(--border-2)",
                    color: isDone ? cat.selectedColor : "var(--t35)",
                    fontFamily: T.h,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.emoji} {isDone ? "✓" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed", bottom: 24, left: 0, right: 0,
              display: "flex", justifyContent: "center",
              zIndex: 50, pointerEvents: "none",
            }}
          >
            <div style={{
              background: "rgba(43,92,230,0.90)",
              backdropFilter: "blur(10px)",
              borderRadius: 100,
              padding: "12px 24px",
              color: "#ffffff",
              fontFamily: T.b,
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: "nowrap",
            }}>
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "20px 20px 40px" }}>

        {/* Greeting */}
        {firstname && (
          <div style={{ textAlign: "center", paddingBottom: 12 }}>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15, color: "var(--t55)" }}>
              Bonjour {firstname} 👋
            </span>
          </div>
        )}

        {/* CAT 1 — SETUP */}
        <CategorySection cat={CATEGORIES[0]} done={isCategoryDone(0, answers)} onRef={(el) => { catRefs.current[0] = el; }}>
          <QBlock number="1" question="Quel est ton équipement de travail ?" answered={!!answers.q1} cat={CATEGORIES[0]}>
            <ChoiceGrid cat={CATEGORIES[0]} value={answers.q1} onChange={(v) => update("q1", v)} options={[
              { value: "laptop_seul", label: "💻 Laptop seul — sans écran externe" },
              { value: "laptop_ecran", label: "💻🖥️ Laptop + écran externe" },
              { value: "desktop", label: "🖥️ Écran fixe (desktop)" },
              { value: "double_ecran", label: "🖥️🖥️ Double écran" },
            ]} />
          </QBlock>
          <QBlock number="2" question="Ton écran et ton bureau sont-ils bien réglés ?" note="L'écran idéal est à hauteur des yeux à 50-70cm. Le bureau idéal permet de poser les avant-bras à plat, coudes à 90°." answered={!!answers.q3} cat={CATEGORIES[0]}>
            <ChoiceGrid cat={CATEGORIES[0]} value={answers.q3} onChange={(v) => update("q3", v)} options={[
              { value: "oui", label: "✅ Oui — écran à hauteur des yeux, coudes à 90°" },
              { value: "approx", label: "🔸 À peu près — quelques ajustements à faire" },
              { value: "non_bas", label: "❌ Non — écran ou bureau trop bas" },
              { value: "non_haut", label: "❌ Non — bureau trop haut, épaules surélevées" },
            ]} />
          </QBlock>
          <QBlock number="3" question="Quelle distance entre toi et ton écran ?" answered={!!answers.q4} cat={CATEGORIES[0]}>
            <ChoiceGrid cat={CATEGORIES[0]} value={answers.q4} onChange={(v) => update("q4", v)} options={[
              { value: "close", label: "📏 Moins de 50cm" },
              { value: "ideal", label: "📏 50–70cm (idéal)" },
              { value: "far", label: "📏 Plus de 70cm" },
              { value: "dunno", label: "🤷 Je sais pas" },
            ]} />
          </QBlock>
          <QBlock number="4" question="Ton clavier et ta souris sont-ils proches de toi ?" answered={!!answers.q5} cat={CATEGORIES[0]}>
            <ChoiceGrid cat={CATEGORIES[0]} value={answers.q5} onChange={(v) => update("q5", v)} options={[
              { value: "good", label: "✅ Oui, coudes près du corps" },
              { value: "bad", label: "❌ Non, je tends les bras" },
              { value: "trackpad", label: "🖱️ J'utilise le trackpad" },
            ]} />
          </QBlock>
          <QBlock number="5" question="Sur quoi travailles-tu assis ?" answered={!!answers.q5b} cat={CATEGORIES[0]}>
            <ChoiceGrid cat={CATEGORIES[0]} value={answers.q5b} onChange={(v) => update("q5b", v)} options={[
              { value: "adjustable", label: "🪑 Siège de bureau réglable" },
              { value: "fixed", label: "🪑 Chaise fixe (salle à manger, cuisine...)" },
              { value: "couch", label: "🛋️ Canapé / lit parfois" },
              { value: "ball", label: "🧘 Ballon / selle ergonomique" },
            ]} />
          </QBlock>
          <QBlock number="6" question="Comment est l'éclairage de ton poste ?" note="Les reflets et le contre-jour forcent les yeux à compenser, ce qui crée des mauvaises postures (rapprochement de l'écran, inclinaison de la tête)." answered={!!answers.q_eclairage} cat={CATEGORIES[0]}>
            <ChoiceGrid cat={CATEGORIES[0]} value={answers.q_eclairage} onChange={(v) => update("q_eclairage", v)} options={[
              { value: "bon", label: "✅ Bon — pas de reflets sur l'écran" },
              { value: "fenetre_dos", label: "🔸 Fenêtre dans le dos ou de côté" },
              { value: "contre_jour", label: "⚠️ Fenêtre en face — contre-jour" },
              { value: "artificiel", label: "💡 Éclairage artificiel uniquement" },
              { value: "reflets", label: "😟 Reflets visibles sur mon écran" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* CAT 2 — DOULEURS */}
        <CategorySection cat={CATEGORIES[1]} done={isCategoryDone(1, answers)} onRef={(el) => { catRefs.current[1] = el; }}>
          {([
            { key: "q6" as const, label: "Douleur nuque / cou", num: "8" },
            { key: "q7" as const, label: "Douleur haut du dos / épaules", num: "9" },
            { key: "q8" as const, label: "Douleur bas du dos", num: "10" },
            { key: "q9" as const, label: "Douleur poignets / avant-bras", num: "11" },
            { key: "q10" as const, label: "Douleur yeux / maux de tête", num: "12" },
          ] as const).map(({ key, label, num }) => (
            <QBlock key={key} number={num} question={label} answered={answers[key] !== null} cat={CATEGORIES[1]}>
              <PainScale value={answers[key]} onChange={(v) => update(key, v)} cat={CATEGORIES[1]} />
            </QBlock>
          ))}
          <QBlock number="13" question="Depuis combien de temps as-tu ces douleurs ?" answered={!!answers.q11} cat={CATEGORIES[1]}>
            <ChoiceGrid cat={CATEGORIES[1]} value={answers.q11} onChange={(v) => update("q11", v)} options={[
              { value: "none", label: "✨ Pas de douleurs" },
              { value: "days", label: "📅 Quelques jours" },
              { value: "weeks", label: "📅 Quelques semaines" },
              { value: "months", label: "📅 Plusieurs mois" },
              { value: "year", label: "⏳ Plus d'un an" },
            ]} />
          </QBlock>
          <QBlock number="14" question="Tes douleurs apparaissent quand ?" answered={!!answers.q12} cat={CATEGORIES[1]}>
            <ChoiceGrid cat={CATEGORIES[1]} value={answers.q12} onChange={(v) => update("q12", v)} options={[
              { value: "morning", label: "🌅 Le matin au réveil" },
              { value: "day", label: "☀️ En cours de journée" },
              { value: "end", label: "🌆 En fin de journée" },
              { value: "always", label: "🔄 Tout le temps" },
              { value: "none", label: "✨ Pas de douleurs" },
            ]} />
          </QBlock>
          <QBlock number="15" question="Tes douleurs disparaissent-elles pendant les vacances ou le week-end ?" answered={!!answers.q12b} cat={CATEGORIES[1]}>
            <ChoiceGrid cat={CATEGORIES[1]} value={answers.q12b} onChange={(v) => update("q12b", v)} options={[
              { value: "yes", label: "✅ Oui, complètement" },
              { value: "partial", label: "🔸 Partiellement, elles s'atténuent" },
              { value: "no", label: "❌ Non, elles restent même au repos" },
              { value: "none", label: "✨ Je n'ai pas de douleurs" },
            ]} />
          </QBlock>
          <QBlock number="20" question="Tes douleurs te réveillent-elles la nuit ?" answered={!!answers.q_douleur_nuit} cat={CATEGORIES[1]}>
            <ChoiceGrid cat={CATEGORIES[1]} value={answers.q_douleur_nuit} onChange={(v) => update("q_douleur_nuit", v)} options={[
              { value: "non", label: "✅ Non, je dors sans douleurs" },
              { value: "inconfortable", label: "🔸 Parfois je me réveille inconfortable" },
              { value: "reveille", label: "😟 Oui, les douleurs me réveillent" },
              { value: "souvent", label: "😫 Souvent — ça perturbe mon sommeil" },
            ]} />
          </QBlock>
          <QBlock number="16" question="As-tu des fourmillements, douleurs ou sensation de faiblesse qui descendent dans le bras ou la jambe ?" note="Ces symptômes peuvent indiquer une compression nerveuse cervicale ou lombaire — ils orientent les exercices recommandés." answered={!!answers.q_irradiation} cat={CATEGORIES[1]}>
            <ChoiceGrid cat={CATEGORIES[1]} value={answers.q_irradiation} onChange={(v) => update("q_irradiation", v)} options={[
              { value: "non", label: "✅ Non, aucun symptôme de ce type" },
              { value: "bras", label: "💪 Oui — dans le bras ou la main" },
              { value: "jambe", label: "🦵 Oui — dans la fesse, la jambe ou le pied" },
              { value: "les_deux", label: "⚡ Les deux — bras ET jambe" },
            ]} />
          </QBlock>
          <QBlock number="17" question="As-tu des maux de tête, sensations de tête lourde ou vertiges en journée ?" note="Les céphalées cervicogènes et les vertiges posturaux sont souvent liés aux tensions des muscles de la nuque — directement influencés par ton setup." answered={!!answers.q_maux_tete_nuque} cat={CATEGORIES[1]}>
            <ChoiceGrid cat={CATEGORIES[1]} value={answers.q_maux_tete_nuque} onChange={(v) => update("q_maux_tete_nuque", v)} options={[
              { value: "non", label: "✅ Non, aucun de ces symptômes" },
              { value: "maux_fin_journee", label: "🔸 Maux de tête en fin de journée" },
              { value: "tete_lourde", label: "😟 Tête lourde ou vertiges fréquents" },
              { value: "quotidien", label: "😫 Maux de tête quotidiens depuis la nuque" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* CAT 3 — HABITUDES */}
        <CategorySection cat={CATEGORIES[2]} done={isCategoryDone(2, answers)} onRef={(el) => { catRefs.current[2] = el; }}>
          <QBlock number="16" question="Combien d'heures par jour es-tu assis ?" answered={true} cat={CATEGORIES[2]}>
            <SliderInput value={answers.q13} min={1} max={12} step={0.5} unit="h" reference="⏱ Heures assis par jour" onChange={(v) => update("q13", v)} cat={CATEGORIES[2]} />
          </QBlock>
          <QBlock number="17" question="Fais-tu des pauses pour te lever ?" answered={!!answers.q14} cat={CATEGORIES[2]}>
            <ChoiceGrid cat={CATEGORIES[2]} value={answers.q14} onChange={(v) => update("q14", v)} options={[
              { value: "never", label: "❌ Jamais" },
              { value: "1x", label: "1️⃣ 1 fois par jour" },
              { value: "2h", label: "🔸 Toutes les 2h" },
              { value: "1h", label: "✅ Toutes les heures ou plus" },
            ]} />
          </QBlock>
          <QBlock number="18" question="Quelle activité physique pratiques-tu régulièrement ?" answered={!!answers.q14b} cat={CATEGORIES[2]}>
            <ChoiceGrid cat={CATEGORIES[2]} value={answers.q14b} onChange={(v) => update("q14b", v)} options={[
              { value: "yoga", label: "🧘 Yoga / Pilates" },
              { value: "etirements", label: "🤸 Étirements réguliers" },
              { value: "cardio", label: "🏃 Cardio (course, vélo, natation...)" },
              { value: "musculation", label: "💪 Musculation / fitness" },
              { value: "marche", label: "🚶 Marche quotidienne" },
              { value: "team", label: "⚽ Sport collectif" },
              { value: "mixed", label: "🔀 Plusieurs combinés" },
              { value: "none", label: "❌ Aucune activité physique" },
            ]} />
          </QBlock>
          <QBlock number="20" question="T'arrive-t-il de travailler dans une position non ergonomique ?" note="Le laptop sur les genoux ou les visios depuis le canapé créent des tensions cervicales importantes sur la durée." answered={!!answers.q_laptop_hors_bureau} cat={CATEGORIES[2]}>
            <ChoiceGrid cat={CATEGORIES[2]} value={answers.q_laptop_hors_bureau} onChange={(v) => update("q_laptop_hors_bureau", v)} options={[
              { value: "jamais", label: "✅ Non — toujours correctement installé" },
              { value: "visio_canape", label: "🔸 Parfois en visio depuis le canapé" },
              { value: "souvent", label: "😟 Souvent — laptop dans le canapé ou le lit" },
              { value: "principale", label: "😫 C'est ma position principale" },
            ]} />
          </QBlock>
          <QBlock number="22" question="Comment évalues-tu ton niveau de stress au travail ?" note="Le stress chronique active en permanence les trapèzes et la nuque — travailler sur la posture sans gérer le stress donne des résultats limités." answered={true} cat={CATEGORIES[2]}>
            <SliderInput value={answers.q_stress_travail} min={0} max={5} step={1} unit="" reference="0 = aucun stress · 5 = très important" onChange={(v) => update("q_stress_travail", v)} cat={CATEGORIES[2]} />
          </QBlock>
        </CategorySection>

        {/* CAT 4 — SOMMEIL */}
        <CategorySection cat={CATEGORIES[3]} done={isCategoryDone(3, answers)} onRef={(el) => { catRefs.current[3] = el; }}>
          <QBlock number="20" question="Combien d'heures dors-tu par nuit ?" answered={true} cat={CATEGORIES[3]}>
            <SliderInput value={answers.q17} min={4} max={10} step={0.5} unit="h" reference="😴 Heures de sommeil par nuit" onChange={(v) => update("q17", v)} cat={CATEGORIES[3]} />
          </QBlock>
          <QBlock number="24" question="Utilises-tu des écrans dans l'heure avant de dormir ?" note="La lumière bleue des écrans retarde la production de mélatonine de 1 à 2h — impact direct sur la qualité du sommeil et la récupération musculaire." answered={!!answers.q_ecrans_soir} cat={CATEGORIES[3]}>
            <ChoiceGrid cat={CATEGORIES[3]} value={answers.q_ecrans_soir} onChange={(v) => update("q_ecrans_soir", v)} options={[
              { value: "jamais", label: "✅ Non — j'évite les écrans le soir" },
              { value: "parfois", label: "🔸 Parfois — 30 min max" },
              { value: "souvent", label: "😟 Souvent — 1h ou plus" },
              { value: "toujours", label: "😫 Toujours — jusqu'à m'endormir" },
            ]} />
          </QBlock>
          <QBlock number="21" question="Tu te réveilles comment ?" answered={!!answers.q18} cat={CATEGORIES[3]}>
            <ChoiceGrid cat={CATEGORIES[3]} value={answers.q18} onChange={(v) => update("q18", v)} options={[
              { value: "fresh", label: "😊 Reposé" },
              { value: "tired", label: "😐 Fatigué" },
              { value: "exhausted", label: "😩 Épuisé" },
            ]} />
          </QBlock>
          <QBlock number="22" question="Combien de litres d'eau bois-tu par jour ?" answered={true} cat={CATEGORIES[3]}>
            <SliderInput value={answers.q19} min={0} max={3} step={0.25} unit="L" reference="🎯 Objectif recommandé : 1.5 à 2L" onChange={(v) => update("q19", v)} cat={CATEGORIES[3]} />
          </QBlock>
          <QBlock number="23" question="Ressens-tu des coups de fatigue dans la journée ?" answered={!!answers.q20} cat={CATEGORIES[3]}>
            <ChoiceGrid cat={CATEGORIES[3]} value={answers.q20} onChange={(v) => update("q20", v)} options={[
              { value: "never", label: "✅ Jamais" },
              { value: "sometimes", label: "🔸 Parfois en après-midi" },
              { value: "often", label: "⚠️ Souvent" },
              { value: "always", label: "❌ Tout le temps" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* CAT 5 — NUTRITION */}
        <CategorySection cat={CATEGORIES[4]} done={isCategoryDone(4, answers)} onRef={(el) => { catRefs.current[4] = el; }}>
          <QBlock number="24" question="Où déjeunes-tu en général ?" answered={!!answers.qn1} cat={CATEGORIES[4]}>
            <ChoiceGrid cat={CATEGORIES[4]} value={answers.qn1} onChange={(v) => update("qn1", v)} options={[
              { value: "screen", label: "🖥️ Devant mon écran" },
              { value: "cafeteria", label: "🏢 En salle de pause / cafétéria" },
              { value: "outside", label: "🚶 Je sors du bureau" },
              { value: "home", label: "🏠 Chez moi (télétravail)" },
            ]} />
          </QBlock>
          <QBlock number="25" question="Comment te sens-tu après le déjeuner ?" answered={!!answers.qn2} cat={CATEGORIES[4]}>
            <ChoiceGrid cat={CATEGORIES[4]} value={answers.qn2} onChange={(v) => update("qn2", v)} options={[
              { value: "energetic", label: "⚡ Énergique, pas de problème" },
              { value: "slight_dip", label: "😐 Légère baisse, ça passe vite" },
              { value: "crash", label: "😴 Coup de barre systématique" },
              { value: "unfocused", label: "🛋️ Mal à me concentrer pendant 1-2h" },
            ]} />
          </QBlock>
          <QBlock number="26" question="As-tu des fringales dans la journée ?" answered={!!answers.qn3} cat={CATEGORIES[4]}>
            <ChoiceGrid cat={CATEGORIES[4]} value={answers.qn3} onChange={(v) => update("qn3", v)} options={[
              { value: "never", label: "❌ Jamais" },
              { value: "morning", label: "🔸 Parfois en milieu de matinée" },
              { value: "afternoon", label: "🍫 Souvent en après-midi" },
              { value: "always", label: "🔄 Tout le temps, je grignote régulièrement" },
            ]} />
          </QBlock>
          <QBlock number="27" question="Que manges-tu généralement à midi ?" answered={!!answers.qn4} cat={CATEGORIES[4]}>
            <ChoiceGrid cat={CATEGORIES[4]} value={answers.qn4} onChange={(v) => update("qn4", v)} options={[
              { value: "balanced", label: "🥗 Repas équilibré (protéines + légumes)" },
              { value: "sandwich", label: "🥪 Sandwich / repas rapide" },
              { value: "hot", label: "🍕 Repas chaud complet" },
              { value: "varies", label: "🤷 Ça varie beaucoup" },
              { value: "skip", label: "☕ Je saute souvent le repas" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* CAT 6 — CORPS */}
        <CategorySection cat={CATEGORIES[5]} done={isCategoryDone(5, answers)} onRef={(el) => { catRefs.current[5] = el; }}>
          <QBlock number="28" question="As-tu déjà eu un professionnel de santé te parler de l'un de ces problèmes ?" answered={answers.q21.length > 0} cat={CATEGORIES[5]}>
            <MultiSelectGrid
              value={answers.q21} onChange={(v) => update("q21", v)}
              otherValue={answers.q21_other} onOtherChange={(v) => update("q21_other", v)}
              cat={CATEGORIES[5]}
              options={[
                { value: "none", label: "✨ Non, rien de particulier" },
                { value: "back", label: "🦴 Problème de dos (hernie, lombalgie, scoliose...)" },
                { value: "cervical", label: "🔴 Douleurs cervicales chroniques" },
                { value: "tendinite", label: "💪 Tendinite ou syndrome du canal carpien" },
                { value: "burnout", label: "😮‍💨 Burn-out ou fatigue chronique" },
                { value: "sleep_disorder", label: "🧠 Troubles du sommeil diagnostiqués" },
                { value: "autre", label: "📋 Autre" },
              ]}
            />
          </QBlock>
          <QBlock number="31" question="Comment décris-tu ta posture spontanément ?" answered={!!answers.q24} cat={CATEGORIES[5]}>
            <ChoiceGrid cat={CATEGORIES[5]} value={answers.q24} onChange={(v) => update("q24", v)} options={[
              { value: "good", label: "✅ Je me tiens bien" },
              { value: "bad", label: "😔 Je m'affaisse souvent" },
              { value: "dunno", label: "🤷 Je ne sais pas" },
              { value: "depends", label: "🔄 Ça dépend des moments" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* CAT 7 — RESSENTI */}
        <CategorySection cat={CATEGORIES[6]} done={isCategoryDone(6, answers)} onRef={(el) => { catRefs.current[6] = el; }}>
          <QBlock number="32" question="Comment tu te sens au travail en ce moment ?" answered={answers.q25 !== null} cat={CATEGORIES[6]}>
            <WellbeingScale value={answers.q25} onChange={(v) => update("q25", v)} cat={CATEGORIES[6]} />
          </QBlock>
        </CategorySection>
      </div>

      {/* Floating CTA */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              padding: "16px 20px 24px",
              background: theme === "light" ? "linear-gradient(to top, #F3F7FF 60%, transparent)" : "linear-gradient(to top, #0f0f1a 60%, transparent)",
            }}
          >
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div
                onClick={handleSubmit}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "18px 24px",
                  borderRadius: 100,
                  background: "#2b5ce6",
                  color: "#ffffff",
                  fontFamily: T.h,
                  fontWeight: 800,
                  fontSize: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow: "0 0 40px rgba(43,92,230,0.5)",
                }}
              >
                Voir mes résultats →
              </div>
              <p style={{ textAlign: "center", color: "var(--t30)", fontSize: 12, fontFamily: T.b, marginTop: 8 }}>
                Toutes les questions sont répondues ✓
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

import ProfileQuestionnaire from "./ProfileQuestionnaire";
import { PROFILE_CATEGORIES, type JobType } from "@/lib/questionnaire-profiles";

export default function QuestionnairePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [jobType, setJobType] = useState<string>("");
  const [firstname, setFirstname] = useState<string>("");

  useEffect(() => {
    async function checkAuth() {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/onboarding");
        return;
      }
      setAuthChecked(true);
    }
    checkAuth();
    localStorage.removeItem("paw_example_mode");
    sessionStorage.removeItem("paw_example_mode");
    setJobType(localStorage.getItem("paw_job_type") ?? "bureau");
    setFirstname(localStorage.getItem("paw_firstname") ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authChecked || !jobType) return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%",
        border: "2px solid rgba(43,92,230,0.2)", borderTopColor: "#2b5ce6",
        animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  if (jobType === "bureau" || !PROFILE_CATEGORIES[jobType as Exclude<JobType, "bureau">]) {
    return <BureauQuestionnaire />;
  }

  return (
    <ProfileQuestionnaire
      categories={PROFILE_CATEGORIES[jobType as Exclude<JobType, "bureau">]}
      jobType={jobType as JobType}
      firstname={firstname}
    />
  );
}
