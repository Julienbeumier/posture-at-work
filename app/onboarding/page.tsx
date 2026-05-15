"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

const AGE_OPTIONS = ["18-25", "26-35", "36-45", "46-55", "55+"];

const JOB_OPTIONS = [
  { emoji: "💻", label: "Bureau", value: "bureau" },
  { emoji: "🏪", label: "Debout", value: "debout" },
  { emoji: "🔧", label: "Artisan", value: "artisan" },
  { emoji: "🚗", label: "Transport", value: "transport" },
  { emoji: "🏥", label: "Médical", value: "medical" },
  { emoji: "🎓", label: "Enseignement", value: "enseignement" },
];

const HOURS_OPTIONS = ["< 20h", "20-35h", "35-40h", "> 40h"];

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [jobType, setJobType] = useState("");
  const [hoursWeek, setHoursWeek] = useState("");
  const [direction, setDirection] = useState(1);

  function goForward(next: Step) {
    setDirection(1);
    setStep(next);
  }

  function goBack() {
    setDirection(-1);
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  }

  function handleNameNext() {
    if (!name.trim()) return;
    localStorage.setItem("paw_firstname", name.trim());
    goForward(2);
  }

  function handleAgeSelect(value: string) {
    setAge(value);
    localStorage.setItem("paw_age", value);
    goForward(3);
  }

  function handleJobSelect(value: string) {
    setJobType(value);
    localStorage.setItem("paw_job_type", value);
    goForward(4);
  }

  function handleHoursSelect(value: string) {
    setHoursWeek(value);
    localStorage.setItem("paw_hours_week", value);
    goForward(5);
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const transition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

  const selectedJob = JOB_OPTIONS.find((j) => j.value === jobType);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundBlobs
        blobs={[
          { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.18)", size: 500 },
        ]}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#f0f0fa" }}>
            PAW
          </span>
          <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#7c9fff" }}>
            .
          </span>
        </div>

        {/* Progress bar (steps 1-4 only) */}
        {step <= 4 && (
          <div
            style={{
              width: "100%",
              height: 4,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 100,
              marginBottom: 40,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(step / 4) * 100}%`,
                background: "linear-gradient(90deg, #2b5ce6, #7c9fff)",
                borderRadius: 100,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        )}

        {/* Back button (steps 2-4) */}
        {step >= 2 && step <= 4 && (
          <button
            onClick={goBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(220,220,245,0.45)",
              fontSize: 13,
              cursor: "pointer",
              padding: "0 0 24px 0",
              fontFamily: T.b,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Retour
          </button>
        )}

        {/* Animated step content */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <h1
                  style={{
                    fontFamily: T.h,
                    fontWeight: 900,
                    fontSize: 30,
                    color: "#f0f0fa",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 10,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  Avant de commencer…
                </h1>
                <p
                  style={{
                    fontFamily: T.b,
                    fontSize: 15,
                    color: "rgba(220,220,245,0.50)",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 40,
                    lineHeight: 1.6,
                  }}
                >
                  On va personnaliser ton bilan
                </p>

                <p
                  style={{
                    fontFamily: T.b,
                    fontSize: 13,
                    color: "rgba(220,220,245,0.55)",
                    marginBottom: 10,
                  }}
                >
                  Comment tu t&apos;appelles ?
                </p>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                  placeholder="Ton prénom"
                  autoComplete="given-name"
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#f0f0fa",
                    fontSize: 16,
                    fontFamily: T.b,
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 16,
                  }}
                />

                <div
                  onClick={handleNameNext}
                  style={{
                    width: "100%",
                    padding: "17px 24px",
                    borderRadius: 100,
                    background: name.trim() ? "#2b5ce6" : "rgba(43,92,230,0.20)",
                    color: name.trim() ? "#fff" : "rgba(255,255,255,0.25)",
                    fontFamily: T.h,
                    fontWeight: 800,
                    fontSize: 16,
                    textAlign: "center",
                    cursor: name.trim() ? "pointer" : "default",
                    boxShadow: name.trim() ? "0 0 40px rgba(43,92,230,0.4)" : "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                >
                  Suivant →
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <h1
                  style={{
                    fontFamily: T.h,
                    fontWeight: 900,
                    fontSize: 28,
                    color: "#f0f0fa",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 10,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  Quel âge as-tu ?
                </h1>
                <p
                  style={{
                    fontFamily: T.b,
                    fontSize: 14,
                    color: "rgba(220,220,245,0.45)",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 32,
                  }}
                >
                  Pour adapter les exercices à ton profil
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  {AGE_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleAgeSelect(opt)}
                      style={{
                        padding: "12px 22px",
                        borderRadius: 100,
                        background: age === opt ? "rgba(43,92,230,0.20)" : "rgba(255,255,255,0.06)",
                        border: `0.5px solid ${age === opt ? "#7c9fff" : "rgba(255,255,255,0.15)"}`,
                        color: age === opt ? "#7c9fff" : "rgba(220,220,245,0.75)",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: T.b,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <h1
                  style={{
                    fontFamily: T.h,
                    fontWeight: 900,
                    fontSize: 28,
                    color: "#f0f0fa",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 10,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  Quel est ton métier ?
                </h1>
                <p
                  style={{
                    fontFamily: T.b,
                    fontSize: 14,
                    color: "rgba(220,220,245,0.45)",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 32,
                  }}
                >
                  On ajuste les recommandations selon ton activité
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  {JOB_OPTIONS.map((job) => (
                    <div
                      key={job.value}
                      onClick={() => handleJobSelect(job.value)}
                      style={{
                        padding: "18px 10px",
                        borderRadius: 16,
                        background:
                          jobType === job.value
                            ? "rgba(43,92,230,0.20)"
                            : "rgba(255,255,255,0.06)",
                        border: `0.5px solid ${
                          jobType === job.value ? "#7c9fff" : "rgba(255,255,255,0.15)"
                        }`,
                        color: jobType === job.value ? "#7c9fff" : "rgba(220,220,245,0.75)",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{job.emoji}</div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: T.b,
                        }}
                      >
                        {job.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <h1
                  style={{
                    fontFamily: T.h,
                    fontWeight: 900,
                    fontSize: 28,
                    color: "#f0f0fa",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 10,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  Combien d&apos;heures par semaine ?
                </h1>
                <p
                  style={{
                    fontFamily: T.b,
                    fontSize: 14,
                    color: "rgba(220,220,245,0.45)",
                    textAlign: "center",
                    margin: 0,
                    marginBottom: 32,
                  }}
                >
                  Temps de travail habituel
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  {HOURS_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleHoursSelect(opt)}
                      style={{
                        padding: "12px 22px",
                        borderRadius: 100,
                        background:
                          hoursWeek === opt ? "rgba(43,92,230,0.20)" : "rgba(255,255,255,0.06)",
                        border: `0.5px solid ${
                          hoursWeek === opt ? "#7c9fff" : "rgba(255,255,255,0.15)"
                        }`,
                        color: hoursWeek === opt ? "#7c9fff" : "rgba(220,220,245,0.75)",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: T.b,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <div
                  style={{
                    padding: "36px 28px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.10)",
                    textAlign: "center",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: T.h,
                      fontWeight: 900,
                      fontSize: 32,
                      color: "#f0f0fa",
                      margin: 0,
                      marginBottom: 12,
                      letterSpacing: "-0.5px",
                      lineHeight: 1.2,
                    }}
                  >
                    Parfait {name} 👋
                  </h1>

                  <p
                    style={{
                      fontFamily: T.b,
                      fontSize: 15,
                      color: "rgba(220,220,245,0.55)",
                      margin: 0,
                      marginBottom: 24,
                      lineHeight: 1.6,
                    }}
                  >
                    Ton bilan est personnalisé pour un profil
                  </p>

                  <div
                    style={{
                      display: "inline-block",
                      padding: "10px 20px",
                      borderRadius: 100,
                      background: "rgba(43,92,230,0.15)",
                      border: "0.5px solid rgba(43,92,230,0.30)",
                      color: "#7c9fff",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: T.b,
                      marginBottom: 32,
                    }}
                  >
                    {selectedJob?.emoji} {selectedJob?.label} — {hoursWeek}/semaine
                  </div>

                  <div
                    onClick={() => router.push("/questionnaire")}
                    style={{
                      width: "100%",
                      padding: "17px 24px",
                      borderRadius: 100,
                      background: "#2b5ce6",
                      color: "#fff",
                      fontFamily: T.h,
                      fontWeight: 800,
                      fontSize: 16,
                      textAlign: "center",
                      cursor: "pointer",
                      boxShadow: "0 0 40px rgba(43,92,230,0.4)",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                    }}
                  >
                    Commencer mon bilan →
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
