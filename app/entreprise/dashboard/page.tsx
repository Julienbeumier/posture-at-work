"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import type { Company } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

const DIM_META: Record<string, { label: string; emoji: string; color: string }> = {
  setup:        { label: "Setup & ergonomie",  emoji: "💻", color: "#7c9fff" },
  pain:         { label: "Douleurs",            emoji: "🩺", color: "#f09595" },
  habits:       { label: "Habitudes",           emoji: "⏱️", color: "#f4a261" },
  sleep_energy: { label: "Sommeil & énergie",   emoji: "🌙", color: "#74c69d" },
  lifestyle:    { label: "Mode de vie actif",   emoji: "🏃", color: "#5dcaa5" },
  nutrition:    { label: "Nutrition",           emoji: "🍽️", color: "#a78bfa" },
};

function scoreColor(s: number) {
  return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595";
}

function scoreZone(s: number) {
  return s >= 70 ? "Bon" : s >= 50 ? "À améliorer" : "Critique";
}

interface EmployeeRow {
  anonymous_id: string;
  joined_at: string;
  global_score: number | null;
  scores: Record<string, number> | null;
  assessed_at: string | null;
}

export default function EntrepriseDashboard() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/entreprise/signup"); return; }

      const { data: membership } = await supabase
        .from("company_memberships")
        .select("company_id, role, companies(*)")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!membership) { router.push("/entreprise/signup"); return; }

      const comp = membership.companies as unknown as Company;
      setCompany(comp);

      const { data: members } = await supabase
        .from("company_memberships")
        .select("anonymous_id, joined_at, user_id")
        .eq("company_id", comp.id)
        .eq("role", "employee")
        .order("joined_at", { ascending: true });

      if (!members?.length) { setLoading(false); return; }

      const rows: EmployeeRow[] = await Promise.all(
        members.map(async (m) => {
          const { data: assessment } = await supabase
            .from("assessments")
            .select("global_score, scores, created_at")
            .eq("user_id", m.user_id)
            .eq("company_id", comp.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            anonymous_id: m.anonymous_id,
            joined_at: m.joined_at,
            global_score: assessment?.global_score ?? null,
            scores: assessment?.scores ?? null,
            assessed_at: assessment?.created_at ?? null,
          };
        })
      );

      setEmployees(rows);

      const { data: invite } = await supabase
        .from("company_invites")
        .select("code")
        .eq("company_id", comp.id)
        .is("used_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invite) {
        setInviteCode(invite.code);
        setInviteUrl(`https://postureatwork.com/join/${invite.code}`);
      }

      setLoading(false);
    }
    load();
  }, []);

  async function generateNewCode() {
    if (!company) return;
    setGeneratingCode(true);
    const res = await fetch("/api/entreprise/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: company.id }),
    });
    const data = await res.json();
    setInviteCode(data.code);
    setInviteUrl(data.inviteUrl);
    setGeneratingCode(false);
  }

  function copyInviteUrl() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const assessed = employees.filter(e => e.global_score !== null);
  const avgGlobal = assessed.length
    ? Math.round(assessed.reduce((sum, e) => sum + (e.global_score ?? 0), 0) / assessed.length)
    : null;

  const zoneCounts = {
    critique: assessed.filter(e => (e.global_score ?? 0) < 50).length,
    ameliorer: assessed.filter(e => (e.global_score ?? 0) >= 50 && (e.global_score ?? 0) < 70).length,
    bon: assessed.filter(e => (e.global_score ?? 0) >= 70).length,
  };

  const dimAvgs = Object.keys(DIM_META).map(key => {
    const vals = assessed
      .map(e => e.scores?.[key])
      .filter((v): v is number => v !== undefined && v !== null);
    return {
      key,
      avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
    };
  });

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>Chargement du dashboard…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 0" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontFamily: T.b, fontSize: 12, color: "#7c9fff", fontWeight: 600, marginBottom: 4 }}>
                🏢 Dashboard RH
              </p>
              <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, margin: 0 }}>
                {company?.name}
              </h1>
              <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginTop: 4 }}>
                Plan {company?.plan} · {employees.length} employé{employees.length > 1 ? "s" : ""} inscrit{employees.length > 1 ? "s" : ""} · {assessed.length} bilan{assessed.length > 1 ? "s" : ""} complété{assessed.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>

          <div style={{ borderRadius: 16, padding: "20px", background: c.bgCard, border: `0.5px solid ${c.border}`, textAlign: "center" }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: avgGlobal ? scoreColor(avgGlobal) : c.textMuted, margin: "0 0 4px" }}>
              {avgGlobal ?? "—"}
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>Score moyen équipe</p>
          </div>

          <div style={{ borderRadius: 16, padding: "20px", background: "rgba(240,149,149,0.08)", border: "0.5px solid rgba(240,149,149,0.2)", textAlign: "center" }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "#f09595", margin: "0 0 4px" }}>
              {zoneCounts.critique}
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>Zone critique</p>
          </div>

          <div style={{ borderRadius: 16, padding: "20px", background: "rgba(244,162,97,0.08)", border: "0.5px solid rgba(244,162,97,0.2)", textAlign: "center" }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "#f4a261", margin: "0 0 4px" }}>
              {zoneCounts.ameliorer}
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>À améliorer</p>
          </div>

          <div style={{ borderRadius: 16, padding: "20px", background: "rgba(116,198,157,0.08)", border: "0.5px solid rgba(116,198,157,0.2)", textAlign: "center" }}>
            <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 32, color: "#74c69d", margin: "0 0 4px" }}>
              {zoneCounts.bon}
            </p>
            <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>Bon niveau</p>
          </div>

        </motion.div>

        {/* Moyennes par dimension */}
        {assessed.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ borderRadius: 20, padding: "22px 24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 24 }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 18 }}>
              Scores moyens par dimension
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {dimAvgs.map(({ key, avg }) => {
                const meta = DIM_META[key];
                const color = avg ? scoreColor(avg) : c.textMuted;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary }}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color }}>
                        {avg ?? "—"}
                      </span>
                    </div>
                    <div style={{ height: 6, background: c.bgCard2, borderRadius: 100, overflow: "hidden" }}>
                      <motion.div
                        style={{ height: "100%", borderRadius: 100, background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: avg ? `${avg}%` : "0%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Liste employés */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ borderRadius: 20, padding: "22px 24px", background: c.bgCard, border: `0.5px solid ${c.border}`, marginBottom: 24 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 16 }}>
            Employés ({employees.length})
          </p>

          {employees.length === 0 ? (
            <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, textAlign: "center", padding: "20px 0" }}>
              Aucun employé inscrit pour l&apos;instant. Partagez le lien d&apos;invitation ci-dessous.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {employees.map((emp, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 12,
                  background: c.bgCard2, border: `0.5px solid ${c.border}`,
                  flexWrap: "wrap", gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: emp.global_score ? `${scoreColor(emp.global_score)}18` : c.bgCard,
                      border: `0.5px solid ${emp.global_score ? scoreColor(emp.global_score) + "35" : c.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: T.h, fontWeight: 900, fontSize: 13,
                      color: emp.global_score ? scoreColor(emp.global_score) : c.textMuted,
                    }}>
                      {emp.global_score ?? "—"}
                    </div>
                    <div>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 13, color: c.textPrimary, margin: 0 }}>
                        {emp.anonymous_id}
                      </p>
                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>
                        {emp.assessed_at
                          ? `Bilan le ${new Date(emp.assessed_at).toLocaleDateString("fr-FR")}`
                          : "Pas encore de bilan"}
                      </p>
                    </div>
                  </div>
                  {emp.global_score && (
                    <span style={{
                      padding: "3px 10px", borderRadius: 100,
                      background: `${scoreColor(emp.global_score)}15`,
                      border: `0.5px solid ${scoreColor(emp.global_score)}35`,
                      fontFamily: T.b, fontSize: 11,
                      color: scoreColor(emp.global_score),
                    }}>
                      {scoreZone(emp.global_score)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Invitation */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ borderRadius: 20, padding: "22px 24px", background: "rgba(43,92,230,0.08)", border: "0.5px solid rgba(43,92,230,0.2)", marginBottom: 24 }}>
          <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, marginBottom: 6 }}>
            🔗 Lien d&apos;invitation employés
          </p>
          <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, marginBottom: 16 }}>
            Partagez ce lien à vos employés. Chaque clic crée un compte et lie le bilan à votre entreprise.
          </p>

          {inviteUrl ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{
                flex: 1, padding: "11px 14px", borderRadius: 12,
                background: c.bgCard, border: `1px solid ${c.border2}`,
                fontFamily: T.b, fontSize: 13, color: c.textSecondary,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {inviteUrl}
              </div>
              <button
                onClick={copyInviteUrl}
                style={{
                  padding: "11px 18px", borderRadius: 12, border: "none",
                  background: copied ? "#1d9e75" : "#2b5ce6", color: "#fff",
                  fontFamily: T.h, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                {copied ? "✓ Copié !" : "Copier"}
              </button>
            </div>
          ) : (
            <button
              onClick={generateNewCode}
              disabled={generatingCode}
              style={{
                padding: "12px 24px", borderRadius: 100, border: "none",
                background: "#2b5ce6", color: "#fff",
                fontFamily: T.h, fontWeight: 700, fontSize: 14,
                cursor: "pointer", opacity: generatingCode ? 0.7 : 1,
              }}
            >
              {generatingCode ? "Génération…" : "Générer un lien d'invitation"}
            </button>
          )}

          <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, marginTop: 10 }}>
            Code : <strong>{inviteCode}</strong> · Valable 30 jours ·{" "}
            <span
              onClick={generateNewCode}
              style={{ color: "#7c9fff", cursor: "pointer", textDecoration: "underline" }}
            >
              Générer un nouveau code
            </span>
          </p>
        </motion.div>

      </div>
    </main>
  );
}
