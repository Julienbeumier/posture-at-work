"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };
const ADMIN_EMAIL = "julienbeumier@outlook.com";

function scoreColor(s: number) {
  return s >= 70 ? "#74c69d" : s >= 50 ? "#f4a261" : "#f09595";
}

interface CompanyRow {
  id: string;
  name: string;
  contact_email: string;
  contact_name: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  employee_count: number;
  assessed_count: number;
  avg_score: number | null;
}

interface FeedbackRow {
  id: string;
  email: string;
  nps: number;
  score_questionnaire: number;
  score_recommandations: number;
  score_video: number;
  score_exercices: number;
  commentaire: string;
  created_at: string;
}

export default function AdminPage() {
  const { c } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [activeTab, setActiveTab] = useState<"companies" | "feedbacks">("companies");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }

      const { count: assessCount } = await supabase
        .from("assessments")
        .select("*", { count: "exact", head: true });
      setTotalAssessments(assessCount ?? 0);

      const { count: profileCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      setTotalUsers(profileCount ?? 0);

      const { data: companiesRaw } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (companiesRaw?.length) {
        const companiesWithStats = await Promise.all(
          companiesRaw.map(async (company) => {
            const { count: empCount } = await supabase
              .from("company_memberships")
              .select("*", { count: "exact", head: true })
              .eq("company_id", company.id)
              .eq("role", "employee");

            const { data: assessments } = await supabase
              .from("assessments")
              .select("global_score")
              .eq("company_id", company.id);

            const avgScore = assessments?.length
              ? Math.round(
                  assessments.reduce((sum, a) => sum + (a.global_score ?? 0), 0) /
                  assessments.length
                )
              : null;

            return {
              ...company,
              employee_count: empCount ?? 0,
              assessed_count: assessments?.length ?? 0,
              avg_score: avgScore,
            };
          })
        );
        setCompanies(companiesWithStats);
      }

      const { data: feedbacksRaw } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      setFeedbacks(feedbacksRaw ?? []);

      setLoading(false);
    }
    load();
  }, []);

  const avgNps = feedbacks.length
    ? Math.round(feedbacks.reduce((sum, f) => sum + (f.nps ?? 0), 0) / feedbacks.length * 10) / 10
    : null;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>Chargement admin…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 100, marginBottom: 12,
            background: "rgba(240,149,149,0.12)", border: "0.5px solid rgba(240,149,149,0.3)",
          }}>
            <span style={{ fontFamily: T.b, fontSize: 11, fontWeight: 600, color: "#f09595" }}>
              🔐 Super Admin
            </span>
          </div>
          <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: c.textPrimary, margin: 0 }}>
            Dashboard PAW
          </h1>
        </motion.div>

        {/* KPIs globaux */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Utilisateurs", value: totalUsers, color: "#7c9fff" },
            { label: "Bilans complétés", value: totalAssessments, color: "#74c69d" },
            { label: "Entreprises", value: companies.length, color: "#a78bfa" },
            { label: "NPS moyen", value: avgNps !== null ? `${avgNps}/10` : "—", color: "#f4a261" },
            { label: "Feedbacks reçus", value: feedbacks.length, color: "#5dcaa5" },
          ].map((kpi, i) => (
            <div key={i} style={{
              borderRadius: 16, padding: "18px 16px", textAlign: "center",
              background: c.bgCard, border: `0.5px solid ${c.border}`,
            }}>
              <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 26, color: kpi.color, margin: "0 0 4px" }}>
                {kpi.value}
              </p>
              <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>{kpi.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, padding: 4, borderRadius: 14,
          background: c.bgCard2, border: `0.5px solid ${c.border}`,
          marginBottom: 20,
        }}>
          {(["companies", "feedbacks"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                background: activeTab === tab ? "#2b5ce6" : "transparent",
                color: activeTab === tab ? "#fff" : c.textMuted,
                fontFamily: T.b, fontWeight: 600, fontSize: 13,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {tab === "companies" ? `🏢 Entreprises (${companies.length})` : `💬 Feedbacks (${feedbacks.length})`}
            </button>
          ))}
        </div>

        {/* Tab — Entreprises */}
        {activeTab === "companies" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {companies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>
                  Aucune entreprise inscrite pour l&apos;instant.
                </p>
              </div>
            ) : (
              companies.map((company, i) => (
                <motion.div key={company.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    borderRadius: 16, padding: "18px 20px",
                    background: c.bgCard, border: `0.5px solid ${c.border}`,
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: 0 }}>
                          {company.name}
                        </p>
                        <span style={{
                          padding: "2px 9px", borderRadius: 100,
                          background: "rgba(43,92,230,0.12)", border: "0.5px solid rgba(43,92,230,0.25)",
                          fontFamily: T.b, fontSize: 10, color: "#7c9fff",
                        }}>
                          {company.plan}
                        </span>
                        {!company.is_active && (
                          <span style={{
                            padding: "2px 9px", borderRadius: 100,
                            background: "rgba(240,149,149,0.12)",
                            fontFamily: T.b, fontSize: 10, color: "#f09595",
                          }}>
                            Inactif
                          </span>
                        )}
                      </div>
                      <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: 0 }}>
                        {company.contact_name} · {company.contact_email}
                      </p>
                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: "4px 0 0" }}>
                        Inscrit le {new Date(company.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { label: "employés", value: company.employee_count, color: "#7c9fff" },
                        { label: "bilans", value: company.assessed_count, color: "#74c69d" },
                        { label: "score moy.", value: company.avg_score ?? "—", color: company.avg_score ? scoreColor(company.avg_score) : c.textMuted },
                      ].map((stat, j) => (
                        <div key={j} style={{
                          textAlign: "center", padding: "8px 14px", borderRadius: 12,
                          background: c.bgCard2, border: `0.5px solid ${c.border}`,
                          minWidth: 60,
                        }}>
                          <p style={{ fontFamily: T.h, fontWeight: 900, fontSize: 18, color: stat.color, margin: 0 }}>
                            {stat.value}
                          </p>
                          <p style={{ fontFamily: T.b, fontSize: 10, color: c.textMuted, margin: 0 }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Tab — Feedbacks */}
        {activeTab === "feedbacks" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {feedbacks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontFamily: T.b, fontSize: 14, color: c.textMuted }}>
                  Aucun feedback reçu pour l&apos;instant.
                </p>
              </div>
            ) : (
              feedbacks.map((fb, i) => (
                <motion.div key={fb.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    borderRadius: 16, padding: "18px 20px",
                    background: c.bgCard, border: `0.5px solid ${c.border}`,
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                    <div>
                      <p style={{ fontFamily: T.h, fontWeight: 700, fontSize: 14, color: c.textPrimary, margin: "0 0 2px" }}>
                        {fb.email ?? "Anonyme"}
                      </p>
                      <p style={{ fontFamily: T.b, fontSize: 11, color: c.textMuted, margin: 0 }}>
                        {new Date(fb.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div style={{
                      padding: "6px 14px", borderRadius: 100,
                      background: fb.nps >= 9 ? "rgba(116,198,157,0.15)" : fb.nps >= 7 ? "rgba(244,162,97,0.15)" : "rgba(240,149,149,0.15)",
                      border: `0.5px solid ${fb.nps >= 9 ? "rgba(116,198,157,0.3)" : fb.nps >= 7 ? "rgba(244,162,97,0.3)" : "rgba(240,149,149,0.3)"}`,
                    }}>
                      <span style={{
                        fontFamily: T.h, fontWeight: 900, fontSize: 16,
                        color: fb.nps >= 9 ? "#74c69d" : fb.nps >= 7 ? "#f4a261" : "#f09595",
                      }}>
                        NPS {fb.nps}/10
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: fb.commentaire ? 12 : 0 }}>
                    {[
                      { label: "Questionnaire", value: fb.score_questionnaire },
                      { label: "Recommandations", value: fb.score_recommandations },
                      { label: "Vidéo", value: fb.score_video },
                      { label: "Exercices", value: fb.score_exercices },
                    ].filter(s => s.value).map((s, j) => (
                      <span key={j} style={{
                        padding: "3px 10px", borderRadius: 100,
                        background: c.bgCard2, border: `0.5px solid ${c.border}`,
                        fontFamily: T.b, fontSize: 11, color: c.textSecondary,
                      }}>
                        {s.label} {"⭐".repeat(s.value)}
                      </span>
                    ))}
                  </div>

                  {fb.commentaire && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: c.bgCard2, border: `0.5px solid ${c.border}`,
                    }}>
                      <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>
                        &quot;{fb.commentaire}&quot;
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}

      </div>
    </main>
  );
}
