"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: "⚡",
    title: "Rapide",
    description: "5 minutes chrono. Pas d'inscription, pas de blabla.",
  },
  {
    icon: "🎯",
    title: "Personnalisé",
    description: "Tes résultats sont calculés selon tes vraies réponses.",
  },
  {
    icon: "💡",
    title: "Actionnable",
    description: "Des conseils concrets à appliquer dès aujourd'hui.",
  },
];

const stats = [
  { value: "73%", label: "des travailleurs sédentaires ont des douleurs chroniques" },
  { value: "2x", label: "plus de risques cardio après 8h assises/jour" },
  { value: "5min", label: "pour obtenir ton bilan complet" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧘</span>
          <span className="font-bold text-lg text-white">PostureAtWork</span>
        </div>
        <Link
          href="/questionnaire"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Commencer →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border border-green-500/30 text-green-400 bg-green-500/10">
            Bilan santé gratuit • Résultats immédiats
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6"
        >
          Votre corps souffre
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #22c55e, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            au bureau.
          </span>
          <br />
          Découvrez pourquoi.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
        >
          En 5 minutes, obtenez un screening complet de votre santé au travail
          — posture, douleurs, énergie — et des recommandations concrètes
          adaptées à votre situation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/questionnaire">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-4 rounded-2xl font-bold text-base text-white overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: "0 0 40px rgba(34,197,94,0.35)",
              }}
            >
              <span className="relative z-10">Commencer mon bilan →</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
          </Link>
          <p className="text-slate-500 text-sm">
            Gratuit · Sans inscription · 5 min
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="text-3xl font-extrabold text-green-400 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm leading-relaxed">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Pourquoi faire ce bilan ?
          </h2>
          <p className="text-slate-400">
            La plupart des douleurs liées au travail sont évitables.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
              className="rounded-2xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What you'll get */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <div
          className="rounded-3xl p-8 sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ce que vous obtenez
              </h2>
              <ul className="space-y-3">
                {[
                  "Score global sur 100 avec analyse détaillée",
                  "4 indicateurs : Posture, Douleurs, Énergie, Habitudes",
                  "Interprétation personnalisée de vos résultats",
                  "2-3 exercices ciblés selon vos points faibles",
                  "Rapport complet envoyé par email",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-400 font-bold mt-0.5">✓</span>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div
                className="w-48 h-48 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "conic-gradient(#22c55e 0deg 252deg, rgba(255,255,255,0.05) 252deg 360deg)",
                  boxShadow: "0 0 60px rgba(34,197,94,0.2)",
                }}
              >
                <div
                  className="w-36 h-36 rounded-full flex flex-col items-center justify-center"
                  style={{ background: "#0a0a0a" }}
                >
                  <span className="text-4xl font-extrabold text-white">70</span>
                  <span className="text-slate-400 text-xs">exemple</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 text-center px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Prêt à prendre soin de vous ?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            En 5 minutes, vous saurez exactement où vous en êtes et quoi faire.
          </p>
          <Link href="/questionnaire">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-2xl font-bold text-base text-white"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: "0 0 40px rgba(34,197,94,0.35)",
              }}
            >
              Commencer mon bilan gratuit →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-slate-600 text-sm">
        PostureAtWork — Screening santé pour les travailleurs sédentaires
      </footer>
    </main>
  );
}
