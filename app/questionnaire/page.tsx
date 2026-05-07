"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { DEFAULT_ANSWERS, type QuestionnaireAnswers } from "@/lib/scoring";

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    index: 0,
    id: "cat-1",
    title: "Ton setup",
    subtitle: "Poste de travail & ergonomie",
    emoji: "💻",
    color: "#22c55e",
    requiredQ: ["q1", "q2", "q3", "q4", "q5", "q5b", "q5c"],
  },
  {
    index: 1,
    id: "cat-2",
    title: "Tes douleurs",
    subtitle: "État de ton corps",
    emoji: "🩺",
    color: "#ef4444",
    requiredQ: ["q6", "q7", "q8", "q9", "q10", "q11", "q12", "q12b"],
  },
  {
    index: 2,
    id: "cat-3",
    title: "Habitudes de travail",
    subtitle: "Pauses & comportements",
    emoji: "⏱️",
    color: "#f59e0b",
    requiredQ: ["q14", "q14b", "q15"], // q13 is slider
  },
  {
    index: 3,
    id: "cat-4",
    title: "Sommeil & énergie",
    subtitle: "Récupération & hydratation",
    emoji: "🌙",
    color: "#3b82f6",
    requiredQ: ["q18", "q20"], // q17, q19 are sliders
  },
  {
    index: 4,
    id: "cat-5",
    title: "Nutrition & énergie",
    subtitle: "Alimentation & vitalité",
    emoji: "🍽️",
    color: "#f97316",
    requiredQ: ["qn1", "qn2", "qn3", "qn4"],
  },
  {
    index: 5,
    id: "cat-6",
    title: "Ton corps",
    subtitle: "Historique & habitudes physiques",
    emoji: "🏃",
    color: "#8b5cf6",
    requiredQ: ["q21", "q22", "q23", "q24"],
  },
  {
    index: 6,
    id: "cat-7",
    title: "Ressenti global",
    subtitle: "Comment tu te sens",
    emoji: "💭",
    color: "#ec4899",
    requiredQ: ["q25"],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isQuestionAnswered(q: string, answers: QuestionnaireAnswers): boolean {
  const val = (answers as unknown as Record<string, unknown>)[q];
  if (q === "q21") return Array.isArray(val) && (val as string[]).length > 0;
  if (["q6", "q7", "q8", "q9", "q10", "q25"].includes(q)) return val !== null;
  if (["q13", "q17", "q19"].includes(q)) return true;
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

// ─── Reusable question components ────────────────────────────────────────────

interface OptionDef {
  value: string;
  label: string;
}

function ChoiceGrid({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: OptionDef[];
  value: string;
  onChange: (v: string) => void;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all"
            style={{
              background: selected ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
              border: selected ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(255,255,255,0.07)",
              color: selected ? "#86efac" : "#94a3b8",
            }}
          >
            <span className="flex-1 leading-snug">{opt.label}</span>
            {selected && <span className="text-green-400 font-bold flex-shrink-0">✓</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

function MultiSelectGrid({
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
}: {
  options: OptionDef[];
  value: string[];
  onChange: (v: string[]) => void;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  function toggle(val: string) {
    if (val === "none") {
      onChange(["none"]);
      return;
    }
    const withoutNone = value.filter((v) => v !== "none");
    if (withoutNone.includes(val)) {
      const next = withoutNone.filter((v) => v !== val);
      onChange(next.length === 0 ? [] : next);
    } else {
      onChange([...withoutNone, val]);
    }
  }

  const hasOther = value.includes("autre");

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(opt.value)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all"
              style={{
                background: selected ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                border: selected ? "1px solid rgba(139,92,246,0.45)" : "1px solid rgba(255,255,255,0.07)",
                color: selected ? "#c4b5fd" : "#94a3b8",
              }}
            >
              <span className="flex-1 leading-snug">{opt.label}</span>
              {selected && <span className="text-purple-400 font-bold flex-shrink-0">✓</span>}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {hasOther && onOtherChange && (
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
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-slate-500"
              style={{
                background: "rgba(139,92,246,0.07)",
                border: "1px solid rgba(139,92,246,0.3)",
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

function PainScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const sel = value === v;
        return (
          <motion.button
            key={v}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(v)}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[52px] flex-1"
            style={{
              background: sel ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
              border: sel ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span className="text-xl leading-none">{PAIN_EMOJIS[v]}</span>
            <span className="text-xs font-bold" style={{ color: sel ? "#f87171" : "#475569" }}>{v}</span>
            <span className="text-[9px] leading-tight text-center" style={{ color: sel ? "#fca5a5" : "#334155" }}>
              {PAIN_LABELS[v]}
            </span>
          </motion.button>
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

function WellbeingScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {WELLBEING_OPTIONS.map((opt) => {
        const sel = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all min-w-[56px] flex-1"
            style={{
              background: sel ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)",
              border: sel ? "1px solid rgba(236,72,153,0.45)" : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span className="text-2xl leading-none">{opt.emoji}</span>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color: sel ? "#f9a8d4" : "#475569" }}>
              {opt.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function SliderInput({
  value, min, max, step, unit, reference, onChange,
}: {
  value: number; min: number; max: number; step: number;
  unit: string; reference?: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl font-extrabold text-white">{value}</span>
        <span className="text-slate-400 text-base ml-2">{unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-xs w-6 text-center">{min}</span>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
          style={{ background: `linear-gradient(to right, #22c55e ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
        />
        <span className="text-slate-500 text-xs w-6 text-center">{max}</span>
      </div>
      {reference && (
        <p className="text-center text-slate-500 text-xs">{reference}</p>
      )}
    </div>
  );
}

// ─── Question block wrapper ───────────────────────────────────────────────────

function QBlock({
  number, question, children, answered,
}: {
  number: string; question: string; children: React.ReactNode; answered: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4 transition-all duration-300"
      style={{
        background: answered ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
        border: answered ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
          style={{
            background: answered ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
            color: answered ? "#22c55e" : "#475569",
          }}
        >
          {answered ? "✓" : number}
        </span>
        <p className="text-slate-200 text-sm font-medium leading-snug">{question}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Category section wrapper ─────────────────────────────────────────────────

function CategorySection({
  cat, done, children, onRef,
}: {
  cat: (typeof CATEGORIES)[number];
  done: boolean;
  children: React.ReactNode;
  onRef: (el: HTMLElement | null) => void;
}) {
  return (
    <section id={cat.id} ref={onRef} className="scroll-mt-24">
      <div className="rounded-3xl overflow-hidden mb-4">
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)`,
            borderBottom: `1px solid ${cat.color}22`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat.emoji}</span>
            <div>
              <h2 className="text-white font-bold text-base">{cat.title}</h2>
              <p className="text-slate-500 text-xs">{cat.subtitle}</p>
            </div>
          </div>
          {done && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
            >
              ✓ Complété
            </motion.span>
          )}
        </div>
        <div
          className="p-4 space-y-3"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: `1px solid ${cat.color}15`,
            borderTop: "none",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ answers, onCatClick }: { answers: QuestionnaireAnswers; onCatClick: (id: string) => void }) {
  const done = CATEGORIES.map((_, i) => isCategoryDone(i, answers));
  const firstIncomplete = done.findIndex((d) => !d);
  const active = firstIncomplete === -1 ? CATEGORIES.length - 1 : firstIncomplete;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
      {CATEGORIES.map((cat, i) => {
        const isDone = done[i];
        const isActive = i === active;
        return (
          <button key={cat.id} onClick={() => onCatClick(cat.id)} className="flex items-center gap-1 flex-shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isDone ? `${cat.color}20` : isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                border: isDone ? `1px solid ${cat.color}50` : isActive ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                color: isDone ? cat.color : isActive ? "#e2e8f0" : "#334155",
              }}
            >
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.title}</span>
              {isDone && <span>✓</span>}
            </div>
            {i < CATEGORIES.length - 1 && (
              <div className="w-3 h-px flex-shrink-0" style={{ background: isDone ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(DEFAULT_ANSWERS);
  const catRefs = useRef<(HTMLElement | null)[]>(Array(CATEGORIES.length).fill(null));
  const scrolledCats = useRef<Set<number>>(new Set());

  const update = useCallback(<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    CATEGORIES.forEach((_, i) => {
      if (i < CATEGORIES.length - 1 && isCategoryDone(i, answers) && !scrolledCats.current.has(i)) {
        scrolledCats.current.add(i);
        setTimeout(() => {
          catRefs.current[i + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    });
  }, [answers]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSubmit() {
    localStorage.setItem("paw_answers", JSON.stringify(answers));
    router.push("/results");
  }

  const allDone = isAllAnswered(answers);
  const done = completedCount(answers);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">PostureAtWork</span>
            <span className="text-slate-500 text-xs">{done} / {CATEGORIES.length} catégories</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-green-500"
              animate={{ width: `${(done / CATEGORIES.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <ProgressBar answers={answers} onCatClick={scrollTo} />
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-2 pb-40">

        {/* ── CAT 1 — SETUP ── */}
        <CategorySection cat={CATEGORIES[0]} done={isCategoryDone(0, answers)} onRef={(el) => { catRefs.current[0] = el; }}>
          <QBlock number="1" question="Quel est ton setup principal ?" answered={!!answers.q1}>
            <ChoiceGrid value={answers.q1} onChange={(v) => update("q1", v)} options={[
              { value: "laptop", label: "💻 Laptop seul" },
              { value: "laptop_screen", label: "💻🖥️ Laptop + écran externe" },
              { value: "desktop", label: "🖥️ Écran fixe desktop" },
              { value: "mixed", label: "🔀 Mixte (bureau + télétravail)" },
            ]} />
          </QBlock>

          <QBlock number="2" question="Où travailles-tu le plus souvent ?" answered={!!answers.q2}>
            <ChoiceGrid value={answers.q2} onChange={(v) => update("q2", v)} options={[
              { value: "office", label: "🏢 Bureau fixe" },
              { value: "remote", label: "🏠 Télétravail" },
              { value: "both", label: "🔀 Les deux" },
              { value: "open", label: "👥 Open space" },
            ]} />
          </QBlock>

          <QBlock number="3" question="Ton écran est-il à hauteur des yeux ?" answered={!!answers.q3}>
            <ChoiceGrid value={answers.q3} onChange={(v) => update("q3", v)} options={[
              { value: "yes", label: "✅ Oui" },
              { value: "approx", label: "🔸 À peu près" },
              { value: "no", label: "❌ Non, il est trop bas" },
              { value: "dunno", label: "🤷 Je sais pas" },
            ]} />
          </QBlock>

          <QBlock number="4" question="Quelle distance entre toi et ton écran ?" answered={!!answers.q4}>
            <ChoiceGrid value={answers.q4} onChange={(v) => update("q4", v)} options={[
              { value: "close", label: "📏 Moins de 50cm" },
              { value: "ideal", label: "📏 50–70cm (idéal)" },
              { value: "far", label: "📏 Plus de 70cm" },
              { value: "dunno", label: "🤷 Je sais pas" },
            ]} />
          </QBlock>

          <QBlock number="5" question="Ton clavier et ta souris sont-ils proches de toi ?" answered={!!answers.q5}>
            <ChoiceGrid value={answers.q5} onChange={(v) => update("q5", v)} cols={3} options={[
              { value: "good", label: "✅ Oui, coudes près du corps" },
              { value: "bad", label: "❌ Non, je tends les bras" },
              { value: "trackpad", label: "🖱️ J'utilise le trackpad" },
            ]} />
          </QBlock>

          <QBlock number="6" question="Sur quoi travailles-tu assis ?" answered={!!answers.q5b}>
            <ChoiceGrid value={answers.q5b} onChange={(v) => update("q5b", v)} options={[
              { value: "adjustable", label: "🪑 Siège de bureau réglable" },
              { value: "fixed", label: "🪑 Chaise fixe (salle à manger, cuisine...)" },
              { value: "couch", label: "🛋️ Canapé / lit parfois" },
              { value: "ball", label: "🧘 Ballon / selle ergonomique" },
            ]} />
          </QBlock>

          <QBlock number="7" question="Portes-tu des lunettes ou lentilles pour travailler ?" answered={!!answers.q5c}>
            <ChoiceGrid value={answers.q5c} onChange={(v) => update("q5c", v)} cols={3} options={[
              { value: "adapted", label: "✅ Oui, adaptées à l'écran" },
              { value: "not_adapted", label: "👓 Oui, mais pas spéciales écran" },
              { value: "none_needed", label: "❌ Non, je n'en ai pas besoin" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* ── CAT 2 — DOULEURS ── */}
        <CategorySection cat={CATEGORIES[1]} done={isCategoryDone(1, answers)} onRef={(el) => { catRefs.current[1] = el; }}>
          {([
            { key: "q6" as const, label: "Douleur nuque / cou", num: "8" },
            { key: "q7" as const, label: "Douleur haut du dos / épaules", num: "9" },
            { key: "q8" as const, label: "Douleur bas du dos", num: "10" },
            { key: "q9" as const, label: "Douleur poignets / avant-bras", num: "11" },
            { key: "q10" as const, label: "Douleur yeux / maux de tête", num: "12" },
          ] as const).map(({ key, label, num }) => (
            <QBlock key={key} number={num} question={label} answered={answers[key] !== null}>
              <PainScale value={answers[key]} onChange={(v) => update(key, v)} />
            </QBlock>
          ))}

          <QBlock number="13" question="Depuis combien de temps as-tu ces douleurs ?" answered={!!answers.q11}>
            <ChoiceGrid value={answers.q11} onChange={(v) => update("q11", v)} options={[
              { value: "none", label: "✨ Pas de douleurs" },
              { value: "days", label: "📅 Quelques jours" },
              { value: "weeks", label: "📅 Quelques semaines" },
              { value: "months", label: "📅 Plusieurs mois" },
              { value: "year", label: "⏳ Plus d'un an" },
            ]} />
          </QBlock>

          <QBlock number="14" question="Tes douleurs apparaissent quand ?" answered={!!answers.q12}>
            <ChoiceGrid value={answers.q12} onChange={(v) => update("q12", v)} options={[
              { value: "morning", label: "🌅 Le matin au réveil" },
              { value: "day", label: "☀️ En cours de journée" },
              { value: "end", label: "🌆 En fin de journée" },
              { value: "always", label: "🔄 Tout le temps" },
              { value: "none", label: "✨ Pas de douleurs" },
            ]} />
          </QBlock>

          <QBlock number="15" question="Tes douleurs disparaissent-elles pendant les vacances ou le week-end ?" answered={!!answers.q12b}>
            <ChoiceGrid value={answers.q12b} onChange={(v) => update("q12b", v)} options={[
              { value: "yes", label: "✅ Oui, complètement" },
              { value: "partial", label: "🔸 Partiellement, elles s'atténuent" },
              { value: "no", label: "❌ Non, elles restent même au repos" },
              { value: "none", label: "✨ Je n'ai pas de douleurs" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* ── CAT 3 — HABITUDES ── */}
        <CategorySection cat={CATEGORIES[2]} done={isCategoryDone(2, answers)} onRef={(el) => { catRefs.current[2] = el; }}>
          <QBlock number="16" question="Combien d'heures par jour es-tu assis ?" answered={true}>
            <SliderInput value={answers.q13} min={1} max={12} step={0.5} unit="h / jour" onChange={(v) => update("q13", v)} />
          </QBlock>

          <QBlock number="17" question="Fais-tu des pauses pour te lever ?" answered={!!answers.q14}>
            <ChoiceGrid value={answers.q14} onChange={(v) => update("q14", v)} options={[
              { value: "never", label: "❌ Jamais" },
              { value: "1x", label: "1️⃣ 1 fois par jour" },
              { value: "2h", label: "🔸 Toutes les 2h" },
              { value: "1h", label: "✅ Toutes les heures ou plus" },
            ]} />
          </QBlock>

          <QBlock number="18" question="Quel type d'activité physique pratiques-tu ?" answered={!!answers.q14b}>
            <ChoiceGrid value={answers.q14b} onChange={(v) => update("q14b", v)} options={[
              { value: "cardio", label: "🏃 Cardio (course, vélo, natation...)" },
              { value: "strength", label: "💪 Musculation / fitness" },
              { value: "yoga", label: "🧘 Yoga / Pilates / étirements" },
              { value: "team", label: "⚽ Sport collectif" },
              { value: "mixed", label: "🔀 Plusieurs types combinés" },
              { value: "none", label: "❌ Aucune activité physique" },
            ]} />
          </QBlock>

          <QBlock number="19" question="Comment gères-tu tes appels au bureau ?" answered={!!answers.q15}>
            <ChoiceGrid value={answers.q15} onChange={(v) => update("q15", v)} options={[
              { value: "headset", label: "🎧 Casque/écouteurs (mains libres)" },
              { value: "hand", label: "📱 Téléphone à la main" },
              { value: "speaker", label: "☎️ Haut-parleur posé sur le bureau" },
              { value: "rarely", label: "🤷 Je téléphone peu au bureau" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* ── CAT 4 — SOMMEIL ── */}
        <CategorySection cat={CATEGORIES[3]} done={isCategoryDone(3, answers)} onRef={(el) => { catRefs.current[3] = el; }}>
          <QBlock number="20" question="Combien d'heures dors-tu par nuit ?" answered={true}>
            <SliderInput value={answers.q17} min={4} max={10} step={0.5} unit="h / nuit" onChange={(v) => update("q17", v)} />
          </QBlock>

          <QBlock number="21" question="Tu te réveilles comment ?" answered={!!answers.q18}>
            <ChoiceGrid value={answers.q18} onChange={(v) => update("q18", v)} cols={3} options={[
              { value: "fresh", label: "😊 Reposé" },
              { value: "tired", label: "😐 Fatigué" },
              { value: "exhausted", label: "😩 Épuisé" },
            ]} />
          </QBlock>

          <QBlock number="22" question="Combien de litres d'eau bois-tu par jour ?" answered={true}>
            <SliderInput
              value={answers.q19} min={0} max={3} step={0.25} unit="L"
              reference="🎯 Objectif recommandé : 1.5 à 2L"
              onChange={(v) => update("q19", v)}
            />
          </QBlock>

          <QBlock number="23" question="Ressens-tu des coups de fatigue dans la journée ?" answered={!!answers.q20}>
            <ChoiceGrid value={answers.q20} onChange={(v) => update("q20", v)} options={[
              { value: "never", label: "✅ Jamais" },
              { value: "sometimes", label: "🔸 Parfois en après-midi" },
              { value: "often", label: "⚠️ Souvent" },
              { value: "always", label: "❌ Tout le temps" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* ── CAT 5 — NUTRITION ── */}
        <CategorySection cat={CATEGORIES[4]} done={isCategoryDone(4, answers)} onRef={(el) => { catRefs.current[4] = el; }}>
          <QBlock number="24" question="Où déjeunes-tu en général ?" answered={!!answers.qn1}>
            <ChoiceGrid value={answers.qn1} onChange={(v) => update("qn1", v)} options={[
              { value: "screen", label: "🖥️ Devant mon écran (je travaille en mangeant)" },
              { value: "cafeteria", label: "🏢 En salle de pause / cafétéria" },
              { value: "outside", label: "🚶 Je sors du bureau" },
              { value: "home", label: "🏠 Chez moi (télétravail)" },
            ]} />
          </QBlock>

          <QBlock number="25" question="Comment te sens-tu après le déjeuner ?" answered={!!answers.qn2}>
            <ChoiceGrid value={answers.qn2} onChange={(v) => update("qn2", v)} options={[
              { value: "energetic", label: "⚡ Énergique, pas de problème" },
              { value: "slight_dip", label: "😐 Légère baisse, ça passe vite" },
              { value: "crash", label: "😴 Coup de barre systématique" },
              { value: "unfocused", label: "🛋️ Mal à me concentrer pendant 1-2h" },
            ]} />
          </QBlock>

          <QBlock number="26" question="As-tu des fringales dans la journée ?" answered={!!answers.qn3}>
            <ChoiceGrid value={answers.qn3} onChange={(v) => update("qn3", v)} options={[
              { value: "never", label: "❌ Jamais" },
              { value: "morning", label: "🔸 Parfois en milieu de matinée" },
              { value: "afternoon", label: "🍫 Souvent en après-midi" },
              { value: "always", label: "🔄 Tout le temps, je grignote régulièrement" },
            ]} />
          </QBlock>

          <QBlock number="27" question="Que manges-tu généralement à midi ?" answered={!!answers.qn4}>
            <ChoiceGrid value={answers.qn4} onChange={(v) => update("qn4", v)} options={[
              { value: "balanced", label: "🥗 Repas équilibré (protéines + légumes)" },
              { value: "sandwich", label: "🥪 Sandwich / repas rapide sur le pouce" },
              { value: "hot", label: "🍕 Repas chaud complet" },
              { value: "varies", label: "🤷 Ça varie beaucoup" },
              { value: "skip", label: "☕ Je saute souvent le repas" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* ── CAT 6 — CORPS ── */}
        <CategorySection cat={CATEGORIES[5]} done={isCategoryDone(5, answers)} onRef={(el) => { catRefs.current[5] = el; }}>
          <QBlock number="28" question="As-tu déjà eu un professionnel de santé te parler de l'un de ces problèmes ?" answered={answers.q21.length > 0}>
            <MultiSelectGrid
              value={answers.q21}
              onChange={(v) => update("q21", v)}
              otherValue={answers.q21_other}
              onOtherChange={(v) => update("q21_other", v)}
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

          <QBlock number="29" question="Fais-tu du sport ?" answered={!!answers.q22}>
            <ChoiceGrid value={answers.q22} onChange={(v) => update("q22", v)} options={[
              { value: "never", label: "❌ Jamais" },
              { value: "1x", label: "1️⃣ 1x / semaine" },
              { value: "2-3x", label: "💪 2–3x / semaine" },
              { value: "daily", label: "🔥 Tous les jours" },
            ]} />
          </QBlock>

          <QBlock number="30" question="Fais-tu des exercices d'étirement ?" answered={!!answers.q23}>
            <ChoiceGrid value={answers.q23} onChange={(v) => update("q23", v)} cols={3} options={[
              { value: "never", label: "❌ Jamais" },
              { value: "sometimes", label: "🔸 Parfois" },
              { value: "regularly", label: "✅ Régulièrement" },
            ]} />
          </QBlock>

          <QBlock number="31" question="Comment décris-tu ta posture spontanément ?" answered={!!answers.q24}>
            <ChoiceGrid value={answers.q24} onChange={(v) => update("q24", v)} options={[
              { value: "good", label: "✅ Je me tiens bien" },
              { value: "bad", label: "😔 Je m'affaisse souvent" },
              { value: "dunno", label: "🤷 Je ne sais pas" },
              { value: "depends", label: "🔄 Ça dépend des moments" },
            ]} />
          </QBlock>
        </CategorySection>

        {/* ── CAT 7 — RESSENTI ── */}
        <CategorySection cat={CATEGORIES[6]} done={isCategoryDone(6, answers)} onRef={(el) => { catRefs.current[6] = el; }}>
          <QBlock number="32" question="Comment tu te sens au travail en ce moment ?" answered={answers.q25 !== null}>
            <WellbeingScale value={answers.q25} onChange={(v) => update("q25", v)} />
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
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3"
            style={{ background: "linear-gradient(to top, #0a0a0a 60%, transparent)" }}
          >
            <div className="max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-bold text-white text-base"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: "0 0 40px rgba(34,197,94,0.4)",
                }}
              >
                Voir mes résultats →
              </motion.button>
              <p className="text-center text-slate-600 text-xs mt-2">Toutes les questions sont répondues ✓</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
