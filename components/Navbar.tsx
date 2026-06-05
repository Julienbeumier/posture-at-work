"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };
const HIDDEN_ON = ["/questionnaire", "/video-capture"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { premium } = usePremium();
  const { theme, toggle: toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Avatar dropdown — close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Hamburger menu — close on any click outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    setMenuOpen(false);
    setIsMenuOpen(false);
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

  const menuItemStyle: React.CSSProperties = {
    display: "block",
    padding: "12px 20px",
    color: "var(--t85)",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: T.h,
    textDecoration: "none",
    cursor: "pointer",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? "rgba(15,15,26,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.07)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              PAW
            </span>
            <span style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#7c9fff" }}>.</span>
          </div>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Theme toggle pill */}
          <button
            onClick={toggleTheme}
            aria-label="Changer de thème"
            style={{
              position: "relative", display: "flex", alignItems: "center",
              width: 64, height: 32, borderRadius: 100, padding: 4, cursor: "pointer",
              background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(43,92,230,0.12)",
              border: theme === "dark" ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(43,92,230,0.25)",
              transition: "all 0.3s ease", outline: "none",
            }}
          >
            <span style={{
              position: "absolute", left: theme === "dark" ? 4 : 32, width: 24, height: 24,
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, lineHeight: 1,
              background: theme === "dark" ? "rgba(255,255,255,0.15)" : "#2b5ce6",
              transition: "left 0.25s ease, background 0.25s ease",
            }}>
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
            <span style={{ position: "absolute", right: theme === "dark" ? 6 : "auto", left: theme === "light" ? 6 : "auto", fontSize: 11, opacity: 0.4 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </button>

          {/* Entreprise link (desktop) */}
          <Link href="/entreprise" className="hidden md:block" style={{ textDecoration: "none" }}>
            <div style={{ color: "var(--t55)", fontSize: 14, cursor: "pointer", fontFamily: T.h }}>
              Entreprise
            </div>
          </Link>

          {/* Desktop nav links (hidden on mobile) */}
          <span className="hidden md:flex items-center" style={{ gap: 8 }}>
            {user ? (
              <>
                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "7px 16px", borderRadius: 100, background: "rgba(43,92,230,0.18)", color: "#7c9fff", border: "0.5px solid rgba(43,92,230,0.30)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Mobilité
                  </div>
                </Link>
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "7px 16px", borderRadius: 100, background: "rgba(43,92,230,0.18)", color: "#7c9fff", border: "0.5px solid rgba(43,92,230,0.30)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Dashboard
                  </div>
                </Link>
              </>
            ) : (
              <Link href="/auth" style={{ textDecoration: "none" }}>
                <div style={{ color: "var(--t55)", fontSize: 14, cursor: "pointer" }}>
                  Se connecter
                </div>
              </Link>
            )}
          </span>

          {/* Avatar dropdown (desktop, connected) */}
          {user && (
            <div className="hidden md:block" style={{ position: "relative" }} ref={menuRef}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{ width: 34, height: 34, borderRadius: "50%", background: premium ? "linear-gradient(135deg, #f59e0b, #d4622a)" : "linear-gradient(135deg, #2b5ce6, #7c9fff)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: T.h }}
                >
                  {initials}
                </div>
                {premium && <span style={{ position: "absolute", top: -6, right: -6, fontSize: 12, lineHeight: 1 }}>👑</span>}
              </div>
              {menuOpen && (
                <div style={{ position: "absolute", right: 0, top: 42, width: 180, borderRadius: 16, background: "rgba(18,18,30,0.98)", border: "0.5px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--border)" }}>
                    <p style={{ color: "var(--t55)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                  </div>
                  <div onClick={() => { router.push("/dashboard"); setMenuOpen(false); }} style={{ padding: "10px 16px", color: "var(--t75)", fontSize: 13, cursor: "pointer" }}>
                    📊 Mon compte
                  </div>
                  <div onClick={signOut} style={{ padding: "10px 16px", color: "#f09595", fontSize: 13, cursor: "pointer" }}>
                    → Déconnexion
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mon bilan button (non-connected, always visible) */}
          {!user && (
            <Link href="/questionnaire" style={{ textDecoration: "none" }}>
              <div style={{ padding: "11px 18px", borderRadius: 100, background: "rgba(43,92,230,0.18)", color: "#7c9fff", border: "0.5px solid rgba(43,92,230,0.30)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.h, minHeight: 44, display: "flex", alignItems: "center" }}>
                Mon bilan
              </div>
            </Link>
          )}

          {/* Hamburger button (mobile only) */}
          <button
            className="md:hidden"
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen((v) => !v); }}
            style={{ background: "none", border: "none", color: "var(--text-primary)", fontSize: 26, cursor: "pointer", padding: "4px 8px", lineHeight: 1, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Menu"
          >
            {isMenuOpen ? "✕" : "≡"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: 64,
            right: 16,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-3)",
            borderRadius: 16,
            padding: "8px 0",
            zIndex: 100,
            minWidth: 200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {user && (
            <div style={{ padding: "10px 20px 12px", borderBottom: "0.5px solid var(--border-2)", marginBottom: 4 }}>
              <p style={{ fontFamily: T.b, fontSize: 11, color: "var(--t40)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                {user.email}
              </p>
            </div>
          )}
          <Link href="/premium" onClick={() => setIsMenuOpen(false)} style={{ ...menuItemStyle, color: "#fbbf24", background: "rgba(245,158,11,0.06)" }}>
            🎁 Premium gratuit en beta
          </Link>
          <Link href="/onboarding" onClick={() => setIsMenuOpen(false)} style={menuItemStyle}>
            🎯 Nouveau bilan
          </Link>
          <Link href="/mobilite" onClick={() => setIsMenuOpen(false)} style={menuItemStyle}>
            🧘 Mobilité
          </Link>
          <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={menuItemStyle}>
            📊 Dashboard
          </Link>
          <Link href="/exemple-rapport" onClick={() => setIsMenuOpen(false)} style={menuItemStyle}>
            👁️ Voir un exemple
          </Link>
          <Link href="/entreprise" onClick={() => setIsMenuOpen(false)} style={menuItemStyle}>
            🏢 Entreprise
          </Link>
          {!user && (
            <Link href="/auth" onClick={() => setIsMenuOpen(false)} style={menuItemStyle}>
              🔑 Se connecter
            </Link>
          )}
          {user && (
            <button
              onClick={() => { signOut(); setIsMenuOpen(false); }}
              style={{ ...menuItemStyle, background: "none", border: "none", width: "100%", textAlign: "left", color: "#f09595", borderBottom: "none" }}
            >
              → Se déconnecter
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
