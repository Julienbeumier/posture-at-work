"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Scores } from "@/lib/scoring";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const DIMS = [
  { key: "setup",        label: "Setup",     color: "#7c9fff" },
  { key: "pain",         label: "Douleurs",  color: "#f09595" },
  { key: "habits",       label: "Habitudes", color: "#f4a261" },
  { key: "sleep_energy", label: "Sommeil",   color: "#74c69d" },
  { key: "nutrition",    label: "Nutrition", color: "#a78bfa" },
  { key: "lifestyle",    label: "Lifestyle", color: "#5dcaa5" },
];

function scoreColor(s: number) { return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595"; }

function scoreBadge(s: number) {
  if (s >= 70) return { label: "Bonne santé au travail", color: "#74c69d", bg: "rgba(116,198,157,0.15)" };
  if (s >= 50) return { label: "À améliorer",            color: "#f4a261", bg: "rgba(244,162,97,0.15)" };
  return          { label: "Attention requise",          color: "#f09595", bg: "rgba(240,149,149,0.15)" };
}

export default function PartagePage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [firstname, setFirstname] = useState("Mon");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("postureatwork_scores");
    if (raw) setScores(JSON.parse(raw));
    const fn = localStorage.getItem("paw_firstname");
    if (fn) setFirstname(fn);
  }, []);

  if (!scores) {
    return (
      <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 340, padding: "0 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "#f0f0fa", marginBottom: 10 }}>
            Aucun bilan disponible
          </h2>
          <p style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.5)", marginBottom: 24 }}>
            Fais d&apos;abord ton bilan PostureAtWork pour générer ta carte de partage.
          </p>
          <div onClick={() => router.push("/questionnaire")} style={{ padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: "pointer", background: "#2b5ce6", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff" }}>
            Faire mon bilan →
          </div>
        </div>
      </main>
    );
  }

  const color = scoreColor(scores.global);
  const badge = scoreBadge(scores.global);

  const SIZE = 160;
  const SW = 9;
  const R = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashFill = (scores.global / 100) * CIRC;

  async function captureCanvas() {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: "#0f0f1a",
      useCORS: true,
      logging: false,
    });
  }

  const handleShare = async () => {
    setBusy(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      const file = new File([blob], "mon-score-paw.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mon score PostureAtWork : ${scores.global}/100`,
          text: `J'ai analysé ma santé au travail avec PAW. Mon score : ${scores.global}/100. Fais le tien !`,
          url: "https://postureatwork.com",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "mon-score-paw.png"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* user cancelled */ }
    finally { setBusy(false); }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "mon-score-paw.png";
      a.click();
    } finally { setBusy(false); }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("https://postureatwork.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* no clipboard */ }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", paddingTop: 56, paddingBottom: 60 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 20px" }}>

        <div onClick={() => router.back()} style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.4)", cursor: "pointer", marginBottom: 24 }}>
          ← Retour
        </div>

        <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", marginBottom: 6 }}>
          📱 Partager mon score
        </h1>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.5)", marginBottom: 28, lineHeight: 1.65 }}>
          Génère ta carte de score et partage-la sur Instagram, WhatsApp ou ailleurs.
        </p>

        {/* ── SHARE CARD (captured by html2canvas) ── */}
        <div
          ref={cardRef}
          style={{
            width: "100%", aspectRatio: "1 / 1",
            background: "#0f0f1a", borderRadius: 20,
            padding: "7%", position: "relative", overflow: "hidden",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Blobs */}
          <div style={{ position: "absolute", top: "-12%", right: "-12%", width: "55%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(43,92,230,0.4) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: "-8%", left: "-5%", width: "40%", height: "40%", borderRadius: "50%", background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`, filter: "blur(30px)" }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: "6%", position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#f0f0fa" }}>PAW</span>
            <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 16, color: "#7c9fff" }}>.</span>
            <span style={{ fontFamily: T.b, fontSize: 10, color: "rgba(220,220,245,0.4)", marginLeft: 4 }}>PostureAtWork</span>
          </div>

          {/* Score circle + name */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3%", marginBottom: "5%", position: "relative", zIndex: 1 }}>
            <div style={{ position: "relative", width: SIZE, height: SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
                <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={color} strokeWidth={SW}
                  strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC - dashFill}
                  style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
                />
              </svg>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 44, color, lineHeight: 1 }}>{scores.global}</span>
                <span style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.4)" }}>/100</span>
              </div>
            </div>

            <p style={{ fontFamily: T.b, fontSize: 12, color: "rgba(220,220,245,0.5)", margin: 0, textAlign: "center" }}>
              {firstname}&apos;s PostureAtWork Score
            </p>
            <div style={{ padding: "4px 12px", borderRadius: 100, background: badge.bg, border: `1px solid ${badge.color}44` }}>
              <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 11, color: badge.color }}>{badge.label}</span>
            </div>
          </div>

          {/* 6 mini-bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5%", marginBottom: "5%", position: "relative", zIndex: 1 }}>
            {DIMS.map((d) => {
              const val = (scores[d.key as keyof Scores] as number) ?? 0;
              return (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "3%" }}>
                  <span style={{ fontFamily: T.b, fontSize: 9, color: "rgba(220,220,245,0.4)", width: "22%", flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ width: `${val}%`, height: "100%", background: d.color, borderRadius: 100 }} />
                  </div>
                  <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 9, color: d.color, width: "10%", textAlign: "right", flexShrink: 0 }}>{val}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: T.b, fontSize: 10, color: "rgba(220,220,245,0.25)" }}>postureatwork.com</span>
            <div style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(43,92,230,0.20)", border: "0.5px solid rgba(43,92,230,0.35)" }}>
              <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 10, color: "#7c9fff" }}>Fais ton bilan gratuit →</span>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleShare}
            disabled={busy}
            style={{
              padding: "14px 0", borderRadius: 100, textAlign: "center", cursor: busy ? "default" : "pointer",
              background: "#2b5ce6", border: "none", boxShadow: "0 4px 20px rgba(43,92,230,0.4)",
              fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff",
              opacity: busy ? 0.7 : 1, width: "100%",
            }}
          >
            {busy ? "Génération…" : "📱 Partager"}
          </button>
          <button
            onClick={handleDownload}
            disabled={busy}
            style={{
              padding: "13px 0", borderRadius: 100, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.12)",
              fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "rgba(220,220,245,0.75)", width: "100%",
            }}
          >
            💾 Télécharger l&apos;image
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: "13px 0", borderRadius: 100, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.12)",
              fontFamily: T.h, fontWeight: 700, fontSize: 14,
              color: copied ? "#74c69d" : "rgba(220,220,245,0.75)", width: "100%",
            }}
          >
            {copied ? "✅ Lien copié !" : "🔗 Copier le lien"}
          </button>
        </div>
      </div>
    </main>
  );
}
