"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import {
  type CategoryDef, type GenericAnswers, type JobType,
  defaultAnswers, JOB_META,
} from "@/lib/questionnaire-profiles";
import { calculateJobScores } from "@/lib/scoring";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const PAIN_EMOJIS = ["😊", "🙂", "😐", "😕", "😖", "😫"];
const PAIN_LABELS = ["Aucune", "Légère", "Modérée", "Importante", "Sévère", "Sévère+"];
const WELLBEING_OPTIONS = [
  { value: 1, emoji: "😩", label: "Épuisé" },
  { value: 2, emoji: "😕", label: "Pas top" },
  { value: 3, emoji: "😐", label: "Ça va" },
  { value: 4, emoji: "😊", label: "Bien" },
  { value: 5, emoji: "🔥", label: "Excellent" },
];

function isAnswered(id: string, answers: GenericAnswers, type: string): boolean {
  const val = answers[id];
  if (type === "slider") return true;
  if (type === "painscale" || type === "wellbeing") return val !== null && val !== undefined;
  if (type === "multiselect") return Array.isArray(val) && (val as string[]).length > 0;
  return typeof val === "string" && val !== "";
}

function isCatDone(cat: CategoryDef, answers: GenericAnswers): boolean {
  return cat.requiredQ.every((id) => {
    const q = cat.questions.find((q) => q.id === id);
    return q ? isAnswered(id, answers, q.type) : true;
  });
}

function isAllDone(categories: CategoryDef[], answers: GenericAnswers): boolean {
  return categories.every((c) => isCatDone(c, answers));
}

function completedCount(categories: CategoryDef[], answers: GenericAnswers): number {
  return categories.filter((c) => isCatDone(c, answers)).length;
}

// ─── Question Components ──────────────────────────────────────────────────

function PainScale({ value, onChange, cat }: {
  value: number | null; onChange: (v: number) => void; cat: CategoryDef;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const sel = value === v;
        return (
          <motion.div key={v} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => onChange(v)}
            style={{ height: 60, borderRadius: 12, background: sel ? cat.selectedBg : "rgba(255,255,255,0.05)", border: sel ? `1px solid ${cat.color}66` : "0.5px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, overflow: "hidden" }}
          >
            <span style={{ fontSize: 16 }}>{PAIN_EMOJIS[v]}</span>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 11, color: sel ? cat.selectedColor : "rgba(220,220,245,0.4)" }}>{v}</span>
            <span style={{ fontSize: 8, color: sel ? cat.selectedColor : "rgba(220,220,245,0.25)", textAlign: "center", padding: "0 2px", width: "100%" }}>{PAIN_LABELS[v]}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function WellbeingScale({ value, onChange, cat }: {
  value: number | null; onChange: (v: number) => void; cat: CategoryDef;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
      {WELLBEING_OPTIONS.map((opt) => {
        const sel = value === opt.value;
        return (
          <motion.div key={opt.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={() => onChange(opt.value)}
            style={{ height: 68, borderRadius: 14, background: sel ? cat.selectedBg : "rgba(255,255,255,0.05)", border: sel ? `1px solid ${cat.color}55` : "0.5px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, overflow: "hidden" }}
          >
            <span style={{ fontSize: 22 }}>{opt.emoji}</span>
            <span style={{ fontSize: 9, fontFamily: T.b, color: sel ? cat.selectedColor : "rgba(220,220,245,0.35)", textAlign: "center", padding: "0 3px", width: "100%" }}>{opt.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function MultiSelectGrid({ options, value, onChange, cat }: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  cat: CategoryDef;
}) {
  function toggle(val: string) {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt) => {
        const sel = value.includes(opt.value);
        return (
          <motion.div key={opt.value} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => toggle(opt.value)}
            style={{ padding: "12px 18px", borderRadius: 100, background: sel ? cat.selectedBg : "rgba(255,255,255,0.06)", border: sel ? `1px solid ${cat.color}55` : "0.5px solid rgba(255,255,255,0.10)", color: sel ? cat.selectedColor : "rgba(220,220,245,0.75)", fontSize: 14, fontFamily: T.b, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s ease" }}
          >
            <span>{opt.label}</span>
            {sel && <span style={{ color: cat.color, fontWeight: 700, fontSize: 13 }}>✓</span>}
          </motion.div>
        );
      })}
    </div>
  );
}

function ChoiceGrid({ options, value, onChange, cat }: {
  options: { value: string; label: string }[]; value: string;
  onChange: (v: string) => void; cat: CategoryDef;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt) => {
        const sel = value === opt.value;
        return (
          <motion.div key={opt.value} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onChange(opt.value)}
            style={{ padding: "12px 18px", borderRadius: 100, background: sel ? cat.selectedBg : "rgba(255,255,255,0.06)", border: sel ? `1px solid ${cat.color}55` : "0.5px solid rgba(255,255,255,0.10)", color: sel ? cat.selectedColor : "rgba(220,220,245,0.75)", fontSize: 14, fontFamily: T.b, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s ease" }}
          >
            <span>{opt.label}</span>
            {sel && <span style={{ color: cat.color, fontWeight: 700, fontSize: 13 }}>✓</span>}
          </motion.div>
        );
      })}
    </div>
  );
}

function SliderInput({ id, value, min, max, step, unit, reference, onChange, cat }: {
  id: string; value: number; min: number; max: number; step: number; unit: string;
  reference?: string; onChange: (v: number) => void; cat: CategoryDef;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 40, color: cat.selectedColor }}>{value}<span style={{ fontSize: 22 }}>{unit}</span></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "rgba(220,220,245,0.35)", fontSize: 11, width: 24, textAlign: "center" }}>{min}</span>
        <input type="range" id={id} min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: cat.color, background: `linear-gradient(to right, ${cat.color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`, height: 4, borderRadius: 100, outline: "none", appearance: "none" }}
        />
        <span style={{ color: "rgba(220,220,245,0.35)", fontSize: 11, width: 24, textAlign: "center" }}>{max}</span>
      </div>
      {reference && <p style={{ textAlign: "center", color: "rgba(220,220,245,0.35)", fontSize: 12, fontFamily: T.b }}>{reference}</p>}
    </div>
  );
}

function QBlock({ number, question, children, answered, cat }: {
  number: string; question: string; children: React.ReactNode; answered: boolean; cat: CategoryDef;
}) {
  return (
    <div style={{ padding: "20px", borderRadius: 18, background: answered ? cat.colorBg : "rgba(255,255,255,0.02)", border: answered ? `0.5px solid ${cat.colorBorder}` : "0.5px solid rgba(255,255,255,0.06)", transition: "all 0.3s ease", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: answered ? cat.colorBg : "rgba(255,255,255,0.05)", border: answered ? `1px solid ${cat.color}55` : "0.5px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontFamily: T.h, fontWeight: 700, color: answered ? cat.color : "rgba(220,220,245,0.35)" }}>
          {answered ? "✓" : number}
        </div>
        <p style={{ color: "#f0f0fa", fontSize: 14, fontFamily: T.b, lineHeight: 1.5, margin: 0 }}>{question}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function ProfileQuestionnaire({
  categories, jobType, firstname,
}: {
  categories: CategoryDef[];
  jobType: JobType;
  firstname: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<GenericAnswers>(() => defaultAnswers(categories));
  const catRefs = useRef<(HTMLElement | null)[]>(Array(categories.length).fill(null));
  const scrolledCats = useRef<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const update = useCallback((id: string, value: GenericAnswers[string]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const TOAST_MSGS = [
    "✅ Catégorie complétée — tu avances bien !",
    "📊 Données enregistrées — continue !",
    "🎯 Mi-parcours — encore quelques questions",
    "💪 Presque fini !",
    "🏁 Dernière ligne droite !",
  ];

  useEffect(() => {
    categories.forEach((_, i) => {
      if (i < categories.length - 1 && isCatDone(categories[i], answers) && !scrolledCats.current.has(i)) {
        scrolledCats.current.add(i);
        const msg = TOAST_MSGS[Math.min(i, TOAST_MSGS.length - 1)];
        setToast(msg);
        setTimeout(() => setToast(null), 1800);
        setTimeout(() => {
          catRefs.current[i + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  function handleSubmit() {
    const scores = calculateJobScores(jobType, answers);
    sessionStorage.setItem("postureatwork_scores", JSON.stringify(scores));
    sessionStorage.setItem("postureatwork_answers", JSON.stringify(answers));
    sessionStorage.setItem("paw_job_type_active", jobType);
    localStorage.setItem("paw_job_answers", JSON.stringify(answers));
    router.push("/results");
  }

  const done = completedCount(categories, answers);
  const allDone = isAllDone(categories, answers);
  const meta = JOB_META[jobType];

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <BackgroundBlobs blobs={[
        { top: "0%", right: "-5%", color: "rgba(43,92,230,0.12)", size: 400 },
        { top: "50%", left: "-8%", color: "rgba(226,75,74,0.08)", size: 350 },
      ]} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div key={toast} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3 }}
            style={{ position: "fixed", bottom: 24, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" }}
          >
            <div style={{ background: "rgba(43,92,230,0.90)", backdropFilter: "blur(10px)", borderRadius: 100, padding: "12px 24px", color: "#fff", fontFamily: T.b, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(15,15,26,0.95)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "#f0f0fa" }}>PAW</span>
              <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: "#7c9fff" }}>.</span>
              <span style={{ padding: "2px 10px", borderRadius: 100, background: "rgba(43,92,230,0.15)", fontFamily: T.b, fontSize: 11, color: "#7c9fff" }}>
                {meta.emoji} {meta.label}
              </span>
            </div>
            <span style={{ color: "rgba(220,220,245,0.40)", fontSize: 13, fontFamily: T.b }}>
              {done} / {categories.length}
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 10 }}>
            <motion.div style={{ height: "100%", borderRadius: 100, background: "#2b5ce6" }} animate={{ width: `${(done / categories.length) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {categories.map((cat, i) => {
              const isDone = isCatDone(cat, answers);
              return (
                <button key={cat.id} onClick={() => document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  style={{ padding: "5px 12px", borderRadius: 100, background: isDone ? cat.colorBg : "rgba(255,255,255,0.05)", border: isDone ? `0.5px solid ${cat.colorBorder}` : "0.5px solid rgba(255,255,255,0.08)", color: isDone ? cat.selectedColor : "rgba(220,220,245,0.35)", fontFamily: T.h, fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                  {cat.emoji} {isDone ? "✓" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 40px" }}>

        {firstname && (
          <div style={{ textAlign: "center", paddingBottom: 12 }}>
            <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 15, color: "rgba(220,220,245,0.55)" }}>
              Bonjour {firstname} 👋
            </span>
          </div>
        )}

        {categories.map((cat, catIdx) => {
          const isDone = isCatDone(cat, answers);
          return (
            <section key={cat.id} id={cat.id} ref={(el) => { catRefs.current[catIdx] = el; }} style={{ scrollMarginTop: 80, marginBottom: 12 }}>
              <div style={{ borderRadius: 22, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "20px 22px", background: cat.colorBg, borderBottom: `0.5px solid ${cat.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.colorBg, border: `0.5px solid ${cat.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      {cat.emoji}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 17, color: "#f0f0fa", margin: 0, letterSpacing: "-0.3px" }}>{cat.title}</h2>
                      <p style={{ color: "rgba(220,220,245,0.40)", fontSize: 12, fontFamily: T.b, margin: 0 }}>{cat.subtitle}</p>
                    </div>
                  </div>
                  {isDone && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: "5px 14px", borderRadius: 100, background: cat.colorBg, border: `1px solid ${cat.colorBorder}`, color: cat.selectedColor, fontFamily: T.h, fontWeight: 700, fontSize: 12 }}>
                      ✓ Complété
                    </motion.div>
                  )}
                </div>
                {/* Body */}
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.015)", border: `0.5px solid ${cat.colorBorder}`, borderTop: "none", borderRadius: "0 0 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {cat.questions.map((q, qi) => {
                    const ans = answers[q.id];
                    const answered = isAnswered(q.id, answers, q.type);
                    return (
                      <QBlock key={q.id} number={String(qi + 1)} question={q.label} answered={answered} cat={cat}>
                        {q.type === "choice" && (
                          <ChoiceGrid cat={cat} value={ans as string ?? ""} onChange={(v) => update(q.id, v)} options={q.options ?? []} />
                        )}
                        {q.type === "multiselect" && (
                          <MultiSelectGrid cat={cat} value={(ans as string[]) ?? []} onChange={(v) => update(q.id, v)} options={q.options ?? []} />
                        )}
                        {q.type === "painscale" && (
                          <PainScale cat={cat} value={ans as number | null} onChange={(v) => update(q.id, v)} />
                        )}
                        {q.type === "wellbeing" && (
                          <WellbeingScale cat={cat} value={ans as number | null} onChange={(v) => update(q.id, v)} />
                        )}
                        {q.type === "slider" && (
                          <SliderInput id={q.id} cat={cat} value={ans as number ?? q.min ?? 5} min={q.min ?? 0} max={q.max ?? 10} step={q.step ?? 1} unit={q.unit ?? ""} reference={q.reference} onChange={(v) => update(q.id, v)} />
                        )}
                      </QBlock>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating CTA */}
      <AnimatePresence>
        {allDone && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 20 }}
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, padding: "16px 20px 24px", background: "linear-gradient(to top, #0f0f1a 60%, transparent)" }}
          >
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <div onClick={handleSubmit} style={{ display: "block", width: "100%", padding: "18px 24px", borderRadius: 100, background: "#2b5ce6", color: "#fff", fontFamily: T.h, fontWeight: 800, fontSize: 16, textAlign: "center", cursor: "pointer", boxShadow: "0 0 40px rgba(43,92,230,0.5)" }}>
                Voir mes résultats →
              </div>
              <p style={{ textAlign: "center", color: "rgba(220,220,245,0.30)", fontSize: 12, fontFamily: T.b, marginTop: 8 }}>
                Toutes les questions sont répondues ✓
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
