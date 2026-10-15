import Link from "next/link";
import type { ReactNode } from "react";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: "0 0 12px" }}>{title}</h2>
      <div style={{ fontFamily: T.b, fontSize: 14, color: "var(--t70)", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 80, paddingBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)" }}>← Accueil</span>
          </Link>
        </div>
        <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.5px" }}>{title}</h1>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t50)", marginBottom: 40 }}>Dernière mise à jour : {updated}</p>
        {children}
      </div>
    </main>
  );
}
