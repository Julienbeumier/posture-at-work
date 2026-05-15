"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const HIDDEN_ON = ["/questionnaire", "/video-capture"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

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
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 900,
                fontSize: 22,
                color: "#f0f0fa",
                letterSpacing: "-0.5px",
              }}
            >
              PAW
            </span>
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 900,
                fontSize: 22,
                color: "#7c9fff",
              }}
            >
              .
            </span>
          </div>
        </Link>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <>
              {/* Desktop: Mobilité + Dashboard links */}
              <span className="hidden md:flex items-center" style={{ gap: 8 }}>
                <Link href="/mobilite" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "7px 16px",
                      borderRadius: 100,
                      background: "rgba(43,92,230,0.18)",
                      color: "#7c9fff",
                      border: "0.5px solid rgba(43,92,230,0.30)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Mobilité
                  </div>
                </Link>
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "7px 16px",
                      borderRadius: 100,
                      background: "rgba(43,92,230,0.18)",
                      color: "#7c9fff",
                      border: "0.5px solid rgba(43,92,230,0.30)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Dashboard
                  </div>
                </Link>
              </span>

              {/* Avatar dropdown (desktop) */}
              <div style={{ position: "relative" }} ref={menuRef}>
                <div
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2b5ce6, #7c9fff)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}
                >
                  {initials}
                </div>
                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 42,
                      width: 180,
                      borderRadius: 16,
                      background: "rgba(18,18,30,0.98)",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <p
                        style={{
                          color: "rgba(220,220,245,0.55)",
                          fontSize: 11,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div
                      onClick={() => { router.push("/dashboard"); setMenuOpen(false); }}
                      style={{
                        padding: "10px 16px",
                        color: "rgba(220,220,245,0.75)",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      📊 Mon compte
                    </div>
                    <div
                      onClick={signOut}
                      style={{
                        padding: "10px 16px",
                        color: "#f09595",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      → Déconnexion
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger button (mobile only) */}
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f0f0fa",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
                aria-label="Menu"
              >
                ≡
              </button>
            </>
          ) : (
            <>
              {/* Se connecter — desktop only */}
              <span className="hidden md:flex">
                <Link href="/auth" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      color: "rgba(220,220,245,0.55)",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Se connecter
                  </div>
                </Link>
              </span>

              {/* Mon bilan — always visible */}
              <Link href="/questionnaire" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 18px",
                    borderRadius: 100,
                    background: "rgba(43,92,230,0.18)",
                    color: "#7c9fff",
                    border: "0.5px solid rgba(43,92,230,0.30)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}
                >
                  Mon bilan
                </div>
              </Link>

              {/* Hamburger button (mobile only, non-connected) */}
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f0f0fa",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1,
                }}
                aria-label="Menu"
              >
                ≡
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 49,
            background: "rgba(15,15,26,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "0.5px solid rgba(255,255,255,0.08)",
            padding: "12px 24px 20px",
          }}
        >
          {user ? (
            <>
              <div
                style={{
                  paddingBottom: 12,
                  marginBottom: 8,
                  borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                }}
              >
                <p
                  style={{
                    color: "rgba(220,220,245,0.40)",
                    fontSize: 11,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-jakarta), sans-serif",
                  }}
                >
                  {user.email}
                </p>
              </div>
              <Link
                href="/mobilite"
                style={{ textDecoration: "none" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div
                  style={{
                    padding: "13px 0",
                    color: "#7c9fff",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "var(--font-nunito), sans-serif",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                >
                  Mobilité
                </div>
              </Link>
              <Link
                href="/dashboard"
                style={{ textDecoration: "none" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div
                  style={{
                    padding: "13px 0",
                    color: "#7c9fff",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "var(--font-nunito), sans-serif",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                >
                  Dashboard
                </div>
              </Link>
              <div
                onClick={signOut}
                style={{
                  padding: "13px 0",
                  color: "#f09595",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "var(--font-nunito), sans-serif",
                  cursor: "pointer",
                }}
              >
                → Déconnexion
              </div>
            </>
          ) : (
            <Link
              href="/auth"
              style={{ textDecoration: "none" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                style={{
                  padding: "13px 0",
                  color: "rgba(220,220,245,0.65)",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "var(--font-jakarta), sans-serif",
                  cursor: "pointer",
                }}
              >
                Se connecter
              </div>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
