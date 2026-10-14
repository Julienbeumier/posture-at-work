"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function ConfirmContent() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setStatus("success");
        const { data: admin } = await supabase
          .from("company_memberships")
          .select("company_id")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setTimeout(() => {
          router.push(admin ? "/entreprise/dashboard" : "/dashboard");
        }, 3000);
      } else {
        setStatus("error");
      }
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{
      minHeight: "100vh", background: "var(--main-bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>

        {status === "loading" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>
              Vérification en cours…
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>
              Email confirmé !
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65, marginBottom: 20 }}>
              Ton compte est activé. Redirection vers ton dashboard dans quelques secondes…
            </p>
            <div style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(29,158,117,0.1)", display: "inline-block" }}>
              <p style={{ fontFamily: T.b, fontSize: 13, color: "#1d9e75", margin: 0 }}>
                Redirection automatique en cours…
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 20, color: "var(--text-primary)", marginBottom: 8 }}>
              Lien invalide ou expiré
            </p>
            <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--t55)", lineHeight: 1.65, marginBottom: 20 }}>
              Ce lien de confirmation n&apos;est plus valide. Reconnecte-toi pour en recevoir un nouveau.
            </p>
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "13px 28px", borderRadius: 100, background: "#2b5ce6",
                fontFamily: T.b, fontWeight: 700, fontSize: 14, color: "#fff",
                display: "inline-block",
              }}>
                Se connecter →
              </div>
            </Link>
          </>
        )}
      </motion.div>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--main-bg)" }} />}>
      <ConfirmContent />
    </Suspense>
  );
}
