"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function DesincritContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const error = params.get("error");

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative" }}>
      <BackgroundBlobs blobs={[{ top: "-5%", right: "-5%", color: "rgba(43,92,230,0.10)", size: 400 }]} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 420 }}>
        {error ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", marginBottom: 10 }}>
              Lien invalide
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.50)", lineHeight: 1.65, marginBottom: 28 }}>
              Ce lien de désinscription est invalide ou a expiré.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "#f0f0fa", marginBottom: 10 }}>
              Tu as été désinscrit avec succès
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.50)", lineHeight: 1.65, marginBottom: 28 }}>
              {email ? `L'adresse ${email} ne recevra plus d'emails PAW.` : "Tu ne recevras plus nos emails."}
            </p>
          </>
        )}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ padding: "13px 28px", borderRadius: 100, background: "#2b5ce6", fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#fff", display: "inline-block" }}>
            Retour à l'accueil →
          </div>
        </Link>
      </div>
    </main>
  );
}

export default function DesincritPage() {
  return (
    <Suspense>
      <DesincritContent />
    </Suspense>
  );
}
