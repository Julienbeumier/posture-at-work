"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("paw_cookies_accepted")) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("paw_cookies_accepted", "true");
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem("paw_cookies_accepted", "false");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "#1b1b2e",
      borderTop: "0.5px solid rgba(255,255,255,0.10)",
      padding: "16px 20px",
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.70)", lineHeight: 1.6, flex: 1, minWidth: 200, margin: 0 }}>
          PAW utilise des cookies pour améliorer ton expérience et sauvegarder tes bilans.{" "}
          <Link href="/politique-confidentialite" style={{ color: "#7c9fff", textDecoration: "underline" }}>
            En savoir plus
          </Link>
        </p>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={refuse}
            style={{ padding: "12px 18px", borderRadius: 100, background: "transparent", border: "1px solid rgba(255,255,255,0.20)", color: "rgba(220,220,245,0.60)", fontFamily: T.b, fontWeight: 600, fontSize: 13, cursor: "pointer", minHeight: 44 }}
          >
            Refuser
          </button>
          <button
            onClick={accept}
            style={{ padding: "12px 18px", borderRadius: 100, background: "#2b5ce6", border: "none", color: "#fff", fontFamily: T.b, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 12px rgba(43,92,230,0.35)", minHeight: 44 }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
