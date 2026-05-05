"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// Pages where navbar is hidden
const HIDDEN_ON = ["/questionnaire", "/video-capture"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Close menu on outside click
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
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-white text-sm hover:opacity-80 transition-opacity"
        >
          <span className="text-lg">🧘</span>
          <span>PostureAtWork</span>
        </Link>

        {/* Right links */}
        <div className="flex items-center gap-1">
          <NavLink href="/stretching">🤸 Étirements</NavLink>

          {user ? (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              {/* Avatar dropdown */}
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                  }}
                >
                  {initials}
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-10 w-44 rounded-2xl py-2 shadow-2xl"
                    style={{
                      background: "rgba(18,18,18,0.98)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-white text-xs font-semibold truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownItem
                      onClick={() => { router.push("/dashboard"); setMenuOpen(false); }}
                    >
                      📊 Mon compte
                    </DropdownItem>
                    <DropdownItem onClick={signOut} danger>
                      → Déconnexion
                    </DropdownItem>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth">
              <button
                className="ml-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: "0 0 16px rgba(34,197,94,0.25)",
                }}
              >
                Connexion
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      style={{
        color: active ? "#fff" : "#64748b",
        background: active ? "rgba(255,255,255,0.07)" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}

function DropdownItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-white/5"
      style={{ color: danger ? "#f87171" : "#cbd5e1" }}
    >
      {children}
    </button>
  );
}
