"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = {
  h: "var(--font-nunito), sans-serif",
  b: "var(--font-jakarta), sans-serif",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleStart() {
    if (!name.trim()) return;
    localStorage.setItem("paw_firstname", name.trim());
    router.push("/questionnaire");
  }

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
      }}
    >
      <BackgroundBlobs blobs={[
        { top: "-5%", right: "-5%", color: "rgba(43,92,230,0.18)", size: 500 },
      ]} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#f0f0fa" }}>PAW</span>
          <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "#7c9fff" }}>.</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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

          <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.55)", marginBottom: 10 }}>
            Comment tu t&apos;appelles ?
          </p>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
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
            onClick={handleStart}
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
            Commencer mon bilan →
          </div>
        </motion.div>
      </div>
    </main>
  );
}
