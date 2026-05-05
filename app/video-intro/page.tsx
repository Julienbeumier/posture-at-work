"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    icon: "📱",
    title: "Pose ton téléphone sur le côté",
    desc: "Appuie-le contre un support pour qu'on te voie de la tête aux genoux",
  },
  {
    icon: "🎧",
    title: "Mets tes écouteurs",
    desc: "Tu vas recevoir des instructions vocales en direct pendant la capture",
  },
  {
    icon: "🎯",
    title: "Suis les instructions vocales",
    desc: "L'IA t'guide étape par étape — reste naturel, c'est volontaire",
  },
];

export default function VideoIntroPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Nav */}
      <div className="relative z-10 px-6 py-5 max-w-2xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/results"
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ← Mes résultats
        </Link>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "#a78bfa",
          }}
        >
          Analyse IA
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16 max-w-2xl mx-auto w-full">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))",
              border: "1px solid rgba(139,92,246,0.3)",
              boxShadow: "0 0 60px rgba(139,92,246,0.2)",
            }}
          >
            🎬
          </div>
          <motion.div
            className="absolute -inset-2 rounded-[28px]"
            style={{ border: "1px solid rgba(139,92,246,0.15)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
            Ton score est bon —{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              mais ton corps raconte autre chose.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto">
            Notre IA va analyser ta posture réelle en{" "}
            <strong className="text-white">60 secondes</strong> et générer un
            rapport personnalisé au niveau d'un bilan kiné.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full space-y-3 mb-10"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-4 rounded-2xl px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{step.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full"
        >
          <Link href="/video-capture">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 0 40px rgba(124,58,237,0.4)",
              }}
            >
              Commencer l'analyse →
            </motion.button>
          </Link>
          <p className="text-center text-slate-600 text-xs mt-3">
            Caméra requise · 60 secondes · Résultats immédiats
          </p>
        </motion.div>
      </div>
    </main>
  );
}
