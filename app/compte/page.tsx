"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { checkPremium, clearPremiumCache } from "@/lib/premium";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const LOCAL_KEYS = [
  "paw_premium", "paw_premium_uid", "paw_premium_since", "paw_company_id", "paw_is_b2b",
  "paw_firstname", "paw_age", "paw_job_type", "paw_hours_week", "paw_onboarding",
];

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ borderRadius: 20, padding: "22px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: 16 }}>
      <h2 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: "0 0 16px", lineHeight: 1.6 }}>{subtitle}</p>}
      {!subtitle && <div style={{ height: 12 }} />}
      {children}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, outline: "none",
  background: "var(--bg-card2)", border: "1px solid var(--border2)", color: "var(--text-primary)",
  fontFamily: T.b, fontSize: 14, marginBottom: 10,
};

function Button({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "11px 20px", borderRadius: 100, border: danger ? "1px solid #ff7b7b" : "none",
        background: disabled ? "var(--bg-card2)" : danger ? "rgba(255,123,123,0.15)" : "#2b5ce6",
        color: disabled ? "var(--t50)" : danger ? "#ff7b7b" : "#fff",
        fontFamily: T.h, fontWeight: 700, fontSize: 14, cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"} style={{ fontFamily: T.b, fontSize: 13, margin: "0 0 10px", color: kind === "ok" ? "#3fe0a0" : "#ff7b7b" }}>
      {children}
    </p>
  );
}

export default function ComptePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [premium, setPremium] = useState(false);
  const [companyRole, setCompanyRole] = useState<"admin" | "employee" | null>(null);

  // Mot de passe
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pwdBusy, setPwdBusy] = useState(false);

  // Suppression
  const [confirmText, setConfirmText] = useState("");
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/auth?redirect=/compte"); return; }
      setUser(u);
      setPremium(await checkPremium(supabase, u.id));
      const { data: m } = await supabase.from("company_memberships").select("role").eq("user_id", u.id).limit(1).maybeSingle();
      setCompanyRole((m?.role as "admin" | "employee" | undefined) ?? null);
      setReady(true);
    }
    load();
  }, [router]);

  const isEmailAccount = (user?.app_metadata?.provider ?? "email") === "email";

  async function changePassword() {
    setPwdMsg(null);
    if (newPwd.length < 8) { setPwdMsg({ kind: "error", text: "Le nouveau mot de passe doit faire 8 caractères minimum." }); return; }
    if (newPwd !== confirmPwd) { setPwdMsg({ kind: "error", text: "Les deux mots de passe ne correspondent pas." }); return; }
    if (!currentPwd) { setPwdMsg({ kind: "error", text: "Saisissez votre mot de passe actuel." }); return; }
    if (newPwd === currentPwd) { setPwdMsg({ kind: "error", text: "Le nouveau mot de passe doit être différent de l'actuel." }); return; }
    setPwdBusy(true);
    const supabase = createClient();
    // Vérifie le mot de passe actuel avant d'autoriser le changement
    const { error: authError } = await supabase.auth.signInWithPassword({ email: user!.email!, password: currentPwd });
    if (authError) { setPwdMsg({ kind: "error", text: "Le mot de passe actuel est incorrect." }); setPwdBusy(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdBusy(false);
    if (error) { setPwdMsg({ kind: "error", text: error.message }); return; }
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setPwdMsg({ kind: "ok", text: "Mot de passe mis à jour." });
  }

  async function signOut() {
    await createClient().auth.signOut();
    clearPremiumCache();
    LOCAL_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch { /* indisponible */ } });
    router.push("/");
  }

  async function deleteAccount() {
    setDeleteMsg(null);
    setDeleteBusy(true);
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteMsg(data.error ?? "La suppression a échoué. Réessayez ou contactez hello@postureatwork.com.");
        setDeleteBusy(false);
        return;
      }
      await createClient().auth.signOut();
      LOCAL_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch { /* indisponible */ } });
      router.push("/?compte=supprime");
    } catch {
      setDeleteMsg("Erreur réseau. Réessayez.");
      setDeleteBusy(false);
    }
  }

  if (!ready || !user) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--main-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: T.b, color: "var(--t55)", fontSize: 14 }}>Chargement…</p>
      </main>
    );
  }

  const canDelete = confirmText.trim().toUpperCase() === "SUPPRIMER";

  return (
    <main style={{ minHeight: "100vh", background: "var(--main-bg)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "88px 20px 0" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)" }}>← Mon espace</span>
        </Link>
        <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: "var(--text-primary)", margin: "14px 0 20px" }}>Mon compte</h1>

        <Card title="Informations">
          <p style={{ fontFamily: T.b, fontSize: 14, color: "var(--text-primary)", margin: "0 0 6px" }}>{user.email}</p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: "0 0 4px" }}>
            Connexion : {isEmailAccount ? "email et mot de passe" : "Google"}
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: "0 0 4px" }}>
            Formule : {premium ? "Premium" : "Gratuit"}
            {companyRole === "employee" && " (offert par votre employeur)"}
          </p>
          {companyRole === "admin" && (
            <p style={{ fontFamily: T.b, fontSize: 13, color: "var(--t55)", margin: 0 }}>Rôle : administrateur d&apos;un espace entreprise</p>
          )}
          {!premium && (
            <div style={{ marginTop: 12 }}>
              <Link href="/premium" style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: T.b, fontWeight: 700, fontSize: 13, color: "#6f9bff" }}>Découvrir le premium →</span>
              </Link>
            </div>
          )}
        </Card>

        {isEmailAccount ? (
          <>
            <Card title="Changer de mot de passe">
              <input type="password" placeholder="Mot de passe actuel" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} autoComplete="current-password" style={inputStyle} />
              <input type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={newPwd} onChange={e => setNewPwd(e.target.value)} autoComplete="new-password" style={inputStyle} />
              <input type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} autoComplete="new-password" style={inputStyle} />
              {pwdMsg && <Notice kind={pwdMsg.kind}>{pwdMsg.text}</Notice>}
              <Button onClick={changePassword} disabled={pwdBusy || !currentPwd || !newPwd || !confirmPwd}>
                {pwdBusy ? "Mise à jour…" : "Mettre à jour"}
              </Button>
            </Card>
          </>
        ) : (
          <Card title="Mot de passe" subtitle="Votre compte est lié à Google : le mot de passe se gère depuis votre compte Google.">
            <span />
          </Card>
        )}

        <Card title="Session">
          <Button onClick={signOut}>Se déconnecter</Button>
        </Card>

        <Card
          title="Supprimer mon compte"
          subtitle="Cette action est définitive : vos bilans, check-ins et accès sont supprimés."
        >
          {companyRole === "admin" && (
            <Notice kind="error">
              Vous êtes administrateur d&apos;un espace entreprise. S&apos;il n&apos;y a pas d&apos;autre administrateur, l&apos;espace entreprise et ses données seront supprimés aussi.
            </Notice>
          )}
          {premium && (
            <Notice kind="error">
              Attention : la suppression du compte entraîne la perte définitive de tous les avantages Premium{companyRole === "employee" ? " (offerts par votre employeur)" : ""}. Aucun remboursement n&apos;est effectué.
            </Notice>
          )}
          <input
            type="text"
            placeholder="Tapez SUPPRIMER pour confirmer"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            style={inputStyle}
            aria-label="Tapez SUPPRIMER pour confirmer"
          />
          {deleteMsg && <Notice kind="error">{deleteMsg}</Notice>}
          <Button danger onClick={deleteAccount} disabled={!canDelete || deleteBusy}>
            {deleteBusy ? "Suppression…" : "Supprimer définitivement mon compte"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
