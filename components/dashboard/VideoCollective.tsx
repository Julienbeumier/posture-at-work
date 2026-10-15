"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Ico } from "@/components/Ico";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export interface EmployeeRow {
  anonymous_id: string;
  joined_at: string;
  global_score: number | null;
  scores: Record<string, number> | null;
  assessed_at: string | null;
  job_type: "bureau" | "debout" | null;
  answers: Record<string, unknown> | null;
  video_analysis: Record<string, unknown> | null;
}

export function analyzeCollectiveVideo(employees: EmployeeRow[], assessed: EmployeeRow[]) {
  const withVideo = employees.filter(e => e.video_analysis !== null);
  if (withVideo.length === 0) return null;

  const bureauWithVideo = withVideo.filter(e => e.job_type === "bureau");
  const deboutWithVideo = withVideo.filter(e => e.job_type === "debout");

  // Zones lues dans l'analyse vidéo (format actuel : bureau = segments, debout = posture).
  const ZONE_KEYS: Record<string, { bureau: string; debout: string }> = {
    head_position: { bureau: "tete_cou", debout: "tete_cou" },
    shoulders: { bureau: "epaules_dos_haut", debout: "epaules" },
    trunk: { bureau: "bas_dos_bassin", debout: "colonne" },
  };
  const statusFromScore = (s: number) => (s >= 70 ? "bon" : s >= 50 ? "attention" : "critique");

  function getSource(emp: EmployeeRow): Record<string, unknown> | null {
    const va = emp.video_analysis as Record<string, unknown> | null;
    if (!va) return null;
    return ((va.personne as Record<string, unknown>) ?? (va.debout as Record<string, unknown>)) ?? null;
  }

  function getStatus(emp: EmployeeRow, zone: string): string | null {
    const source = getSource(emp);
    if (!source) return null;
    // Format actuel : bureau → personne.segments.{zone}, debout → personne.posture.{zone}
    const keys = ZONE_KEYS[zone];
    const segments = source.segments as Record<string, Record<string, unknown>> | undefined;
    const posture = source.posture as Record<string, Record<string, unknown>> | undefined;
    const current = keys ? (segments?.[keys.bureau] ?? posture?.[keys.debout]) : undefined;
    if (current) {
      if (typeof current.status === "string") return current.status;
      if (typeof current.score === "number") return statusFromScore(current.score);
    }
    // Ancien format : posture_analysis.{zone}.status
    const legacy = source.posture_analysis as Record<string, Record<string, unknown>> | undefined;
    return (legacy?.[zone]?.status as string) ?? null;
  }

  function getPostureScore(emp: EmployeeRow): number | null {
    const source = getSource(emp);
    if (!source) return null;
    if (typeof source.globalPostureScore === "number") return source.globalPostureScore;
    const legacy = source.posture_analysis as Record<string, unknown> | undefined;
    return (legacy?.score as number) ?? null;
  }

  // Ce que la vidéo révèle en plus du questionnaire
  function silentRisk(group: EmployeeRow[]) {
    const both = group.filter(e => getPostureScore(e) !== null && typeof e.scores?.pain === "number");
    const silent = both.filter(e => (e.scores!.pain as number) >= 60 && (getPostureScore(e) as number) < 60);
    return { silent: silent.length, total: both.length };
  }

  function posteStats(group: EmployeeRow[]) {
    const els = group
      .map(e => ((e.video_analysis as Record<string, unknown>)?.poste as Record<string, unknown> | null)?.elements as Record<string, Record<string, unknown>> | undefined)
      .filter((x): x is Record<string, Record<string, unknown>> => !!x);
    if (els.length === 0) return null;
    const setups = group
      .map(e => ((e.video_analysis as Record<string, unknown>)?.poste as Record<string, unknown> | null)?.globalSetupScore)
      .filter((x): x is number => typeof x === "number");
    return {
      total: els.length,
      laptopSeul: els.filter(x => x.ecran?.type === "laptop_seul").length,
      ecranTropBas: els.filter(x => x.ecran?.hauteur === "trop_bas").length,
      eclairage: els.filter(x => x.organisation?.eclairage === "mauvais" || x.organisation?.eclairage === "moyen").length,
      sansReposePoignets: els.filter(x => x.clavier_souris?.repose_poignets === false).length,
      sansAccoudoirs: els.filter(x => x.chaise?.accoudoirs === false).length,
      avgSetup: setups.length ? Math.round(setups.reduce((a, b) => a + b, 0) / setups.length) : null,
    };
  }

  function deboutEnvStats(group: EmployeeRow[]) {
    const envs = group
      .map(e => (getSource(e)?.environnement as Record<string, Record<string, unknown> | string> | undefined))
      .filter((x): x is Record<string, Record<string, unknown> | string> => !!x);
    if (envs.length === 0) return null;
    return {
      total: envs.length,
      planInadapte: envs.filter(x => { const h = (x.plan_travail as Record<string, unknown> | undefined)?.hauteur; return h === "trop_bas" || h === "trop_haut"; }).length,
      sansTapis: envs.filter(x => x.tapis_antifatigue === "non").length,
    };
  }

  function countStatus(group: EmployeeRow[], zone: string, status: string): number {
    return group.filter(e => getStatus(e, zone) === status).length;
  }

  function avgPostureScore(group: EmployeeRow[]): number | null {
    const scores = group.map(getPostureScore).filter((s): s is number => s !== null);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  }

  // Scores questionnaire pour croisement
  function avgDimAssessed(group: EmployeeRow[], key: string): number | null {
    const vals = group.map(e => e.scores?.[key]).filter((v): v is number => v !== null && v !== undefined);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }

  const bureauAssessed = assessed.filter(e => e.job_type === "bureau");
  const deboutAssessed = assessed.filter(e => e.job_type === "debout");

  // Tendances bureau
  const bureauTrends = bureauWithVideo.length > 0 ? [
    {
      zone: "Projection de tête",
      emoji: "🦆",
      critique: countStatus(bureauWithVideo, "head_position", "critique"),
      attention: countStatus(bureauWithVideo, "head_position", "attention"),
      bon: countStatus(bureauWithVideo, "head_position", "bon"),
      total: bureauWithVideo.length,
      consequence: "Flexion de nuque prolongée",
    },
    {
      zone: "Épaules enroulées",
      emoji: "🦅",
      critique: countStatus(bureauWithVideo, "shoulders", "critique"),
      attention: countStatus(bureauWithVideo, "shoulders", "attention"),
      bon: countStatus(bureauWithVideo, "shoulders", "bon"),
      total: bureauWithVideo.length,
      consequence: "Tensions trapèzes et risque tendinopathie",
    },
    {
      zone: "Posture tronc",
      emoji: "🌿",
      critique: countStatus(bureauWithVideo, "trunk", "critique"),
      attention: countStatus(bureauWithVideo, "trunk", "attention"),
      bon: countStatus(bureauWithVideo, "trunk", "bon"),
      total: bureauWithVideo.length,
      consequence: "Compression discale et lombalgies chroniques",
    },
  ] : [];

  // Tendances debout
  const deboutTrends = deboutWithVideo.length > 0 ? [
    {
      zone: "Position tronc",
      emoji: "🌿",
      critique: countStatus(deboutWithVideo, "trunk", "critique"),
      attention: countStatus(deboutWithVideo, "trunk", "attention"),
      bon: countStatus(deboutWithVideo, "trunk", "bon"),
      total: deboutWithVideo.length,
      consequence: "Lombalgies par flexion répétée lors de la manutention",
    },
    {
      zone: "Position épaules",
      emoji: "🦅",
      critique: countStatus(deboutWithVideo, "shoulders", "critique"),
      attention: countStatus(deboutWithVideo, "shoulders", "attention"),
      bon: countStatus(deboutWithVideo, "shoulders", "bon"),
      total: deboutWithVideo.length,
      consequence: "Risque tendinopathie par gestes répétitifs",
    },
    {
      zone: "Position tête/cou",
      emoji: "🦆",
      critique: countStatus(deboutWithVideo, "head_position", "critique"),
      attention: countStatus(deboutWithVideo, "head_position", "attention"),
      bon: countStatus(deboutWithVideo, "head_position", "bon"),
      total: deboutWithVideo.length,
      consequence: "Tensions cervicales lors des tâches à hauteur inadaptée",
    },
  ] : [];

  // ── NARRATIVE ENRICHIE ──
  const bureauPainScore = avgDimAssessed(bureauAssessed, "pain");
  const bureauSetupScore = avgDimAssessed(bureauAssessed, "setup");
  const deboutPainScore = avgDimAssessed(deboutAssessed, "pain");
  const deboutHabitsScore = avgDimAssessed(deboutAssessed, "habits");

  const bureauHeadCritique = countStatus(bureauWithVideo, "head_position", "critique");
  const bureauShoulderIssue = countStatus(bureauWithVideo, "shoulders", "attention") + countStatus(bureauWithVideo, "shoulders", "critique");
  const deboutTrunkIssue = countStatus(deboutWithVideo, "trunk", "attention") + countStatus(deboutWithVideo, "trunk", "critique");

  // Narrative bureau
  let bureauNarrative = "";
  let bureauActions: string[] = [];
  let bureauPositif = "";

  if (bureauWithVideo.length > 0) {
    const headPct = Math.round((bureauHeadCritique / bureauWithVideo.length) * 100);
    const shoulderPct = Math.round((bureauShoulderIssue / bureauWithVideo.length) * 100);

    if (headPct >= 50) {
      bureauNarrative = `${bureauHeadCritique}/${bureauWithVideo.length} employés bureau présentent une projection de tête critique à la vidéo.`;
      if (bureauPainScore && bureauPainScore < 55) {
        bureauNarrative += ` Ce résultat est confirmé par le questionnaire : score douleurs nuque moyen ${bureauPainScore}/100 — les deux sources convergent vers le même problème.`;
      } else {
        bureauNarrative += ` Le questionnaire n'avait pas pleinement capté cette problématique — la vidéo révèle une cause posturale sous-jacente.`;
      }
      const ps = posteStats(bureauWithVideo);
      if (ps && (ps.laptopSeul > 0 || ps.ecranTropBas > 0)) {
        bureauNarrative += ` Sur les postes filmés : ${ps.laptopSeul}/${ps.total} utilisent un laptop seul et ${ps.ecranTropBas}/${ps.total} ont un écran trop bas${bureauSetupScore ? ` (setup moyen ${bureauSetupScore}/100)` : ""} — une cause probable de cette flexion de tête.`;
      }
      bureauActions = [
        `Rehausseur d'écran + clavier et souris externes pour les postes en laptop seul`,
        `Exercice rétraction cervicale collectif — 5 min, 3x/semaine`,
        `Vérifier que tous les laptops ont un support`,
      ];
    } else if (shoulderPct >= 50) {
      bureauNarrative = `${bureauShoulderIssue}/${bureauWithVideo.length} employés bureau présentent des épaules enroulées à la vidéo.`;
      if (bureauSetupScore && bureauSetupScore < 60) {
        bureauNarrative += ` Le questionnaire confirme un setup inadapté (${bureauSetupScore}/100) — position clavier/souris incorrecte.`;
      } else {
        bureauNarrative += ` Le questionnaire n'avait pas détecté ce problème — découverte spécifique à l'analyse vidéo.`;
      }
      bureauActions = [
        `Vérifier la hauteur du clavier — doit être au niveau des coudes`,
        `Souris verticale pour les cas de douleurs poignets`,
        `Exercice ouverture pectorale — 30 sec, matin et soir`,
      ];
    } else {
      bureauNarrative = `Posture globalement satisfaisante pour l'équipe bureau.${avgPostureScore(bureauWithVideo) !== null ? ` Score posture moyen ${avgPostureScore(bureauWithVideo)}/100.` : ""}`;
      if (bureauPainScore && bureauPainScore > 60) {
        bureauNarrative += ` Le questionnaire confirme un niveau de douleurs correct (${bureauPainScore}/100).`;
      }
      bureauActions = [`Maintenir les bonnes habitudes et continuer les pauses actives`];
    }

    // Point positif bureau
    const bonTronc = countStatus(bureauWithVideo, "trunk", "bon");
    if (bonTronc >= bureauWithVideo.length * 0.6) {
      bureauPositif = `✅ Point positif : ${bonTronc}/${bureauWithVideo.length} employés ont une posture de tronc correcte.`;
    }
  }

  // Narrative debout
  let deboutNarrative = "";
  let deboutActions: string[] = [];
  let deboutPositif = "";

  if (deboutWithVideo.length > 0) {
    const trunkPct = Math.round((deboutTrunkIssue / deboutWithVideo.length) * 100);

    if (trunkPct >= 50) {
      deboutNarrative = `${deboutTrunkIssue}/${deboutWithVideo.length} employés debout présentent des contraintes lombaires à la vidéo.`;
      if (deboutPainScore && deboutPainScore < 55) {
        deboutNarrative += ` Cohérent avec le questionnaire : score douleurs dos moyen ${deboutPainScore}/100 — les deux sources confirment le problème.`;
      } else {
        deboutNarrative += ` Le questionnaire signalait des douleurs modérées — la vidéo révèle que la cause posturale est plus prononcée qu'attendu.`;
      }
      if (deboutHabitsScore && deboutHabitsScore < 55) {
        deboutNarrative += ` Les mauvaises habitudes de levage (${deboutHabitsScore}/100) aggravent ce risque.`;
      }
      deboutActions = [
        `Formation gestes et postures de levage — priorité absolue`,
        `Installer des tapis anti-fatigue aux postes debout fixes`,
        `Exercice flexion lombaire debout — 5 min en fin de journée`,
      ];
    } else {
      deboutNarrative = `Contraintes lombaires modérées pour l'équipe debout.${avgPostureScore(deboutWithVideo) !== null ? ` Score posture moyen ${avgPostureScore(deboutWithVideo)}/100.` : ""}`;
      deboutActions = [`Maintenir la formation gestes et postures`, `Tapis anti-fatigue recommandés`];
    }

    // Point positif debout
    const bonTete = countStatus(deboutWithVideo, "head_position", "bon");
    const bonEpaules = countStatus(deboutWithVideo, "shoulders", "bon");
    if (bonTete >= deboutWithVideo.length * 0.6) {
      deboutPositif = `✅ Point positif : ${bonTete}/${deboutWithVideo.length} employés ont une position tête/cou correcte — bon signe pour les tâches à hauteur adaptée.`;
    } else if (bonEpaules >= deboutWithVideo.length * 0.6) {
      deboutPositif = `✅ Point positif : ${bonEpaules}/${deboutWithVideo.length} employés ont des épaules bien positionnées.`;
    }
  }

  return {
    total: withVideo.length,
    bureauCount: bureauWithVideo.length,
    deboutCount: deboutWithVideo.length,
    avgScoreBureau: avgPostureScore(bureauWithVideo),
    avgScoreDebout: avgPostureScore(deboutWithVideo),
    bureauTrends,
    deboutTrends,
    bureauNarrative,
    bureauActions,
    bureauPositif,
    deboutNarrative,
    deboutActions,
    deboutPositif,
    silentBureau: silentRisk(bureauWithVideo),
    silentDebout: silentRisk(deboutWithVideo),
    posteBureau: posteStats(bureauWithVideo),
    envDebout: deboutEnvStats(deboutWithVideo),
    simulated: withVideo.some(e => (e.video_analysis as Record<string, unknown>)?.simulated === true),
    notFilmed: employees.filter(e => e.video_analysis === null && e.global_score !== null).length,
  };
}

type Theme = ReturnType<typeof useTheme>["c"];

function RevealRow({ label, n, total, c }: { label: string; n: number; total: number; c: Theme }) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  const color = pct >= 50 ? "#ff7b7b" : pct >= 25 ? "#ffa347" : "#3fe0a0";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: T.b, fontSize: 12, color: c.textSecondary }}>{label}</span>
        <span style={{ fontFamily: T.h, fontWeight: 800, fontSize: 12, color, flexShrink: 0 }}>{n}/{total}</span>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: c.bgCard2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: color, boxShadow: `0 0 10px ${color}77` }} />
      </div>
    </div>
  );
}

export type Collective = NonNullable<ReturnType<typeof analyzeCollectiveVideo>>;

/** Ce que la vidéo ajoute au questionnaire : risques silencieux + réalité du poste. */
export function VideoRevealBlock({ collective, c, isMobile }: { collective: Collective; c: Theme; isMobile: boolean }) {
  const { silentBureau, silentDebout, posteBureau, envDebout } = collective;
  const silentTotal = silentBureau.silent + silentDebout.silent;
  const silentBase = silentBureau.total + silentDebout.total;
  if (silentTotal === 0 && !posteBureau && !envDebout) return null;

  return (
    <div style={{ marginBottom: 16, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(111,155,255,0.55)", background: "linear-gradient(160deg, rgba(43,92,230,0.38), rgba(43,92,230,0.10))", boxShadow: "0 10px 34px rgba(43,92,230,0.22)" }}>
      <div style={{ padding: isMobile ? "16px" : "20px 22px" }}>
        <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>
          <Ico e="🔎" />Ce que la vidéo révèle en plus du questionnaire
        </p>
        <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: "0 0 16px" }}>
          Le questionnaire donne le ressenti, la vidéo montre ce qui se passe vraiment au poste.
        </p>

        {silentTotal > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,163,71,0.16)", border: "1px solid rgba(255,163,71,0.55)", marginBottom: 14 }}>
            <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 14, color: "#ffa347", margin: "0 0 4px" }}>
              <Ico e="⚠️" />{silentTotal} employé{silentTotal > 1 ? "s" : ""} sur {silentBase} sans douleur marquée, mais avec une posture à risque
            </p>
            <p style={{ fontFamily: T.b, fontSize: 13, color: c.textSecondary, lineHeight: 1.6, margin: 0 }}>
              Ces personnes déclarent peu de gêne : sans la vidéo, aucun signal d&apos;alerte. C&apos;est le moment idéal pour corriger le poste, avant que les douleurs s&apos;installent.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : posteBureau && envDebout ? "1fr 1fr" : "1fr", gap: 18 }}>
          {posteBureau && (
            <div>
              <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#6f9bff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                <Ico e="💻" />Postes bureau observés
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <RevealRow c={c} total={posteBureau.total} n={posteBureau.laptopSeul} label="Portable utilisé seul, sans rehausse" />
                <RevealRow c={c} total={posteBureau.total} n={posteBureau.ecranTropBas} label="Écran trop bas" />
                <RevealRow c={c} total={posteBureau.total} n={posteBureau.eclairage} label="Éclairage ou reflets à améliorer" />
                <RevealRow c={c} total={posteBureau.total} n={posteBureau.sansReposePoignets} label="Poignets sans appui" />
                <RevealRow c={c} total={posteBureau.total} n={posteBureau.sansAccoudoirs} label="Avant-bras sans accoudoirs" />
              </div>
              {posteBureau.avgSetup !== null && (
                <p style={{ fontFamily: T.b, fontSize: 12, color: c.textMuted, margin: "10px 0 0" }}>
                  Score setup moyen observé : <strong style={{ color: c.textPrimary }}>{posteBureau.avgSetup}/100</strong>
                </p>
              )}
            </div>
          )}
          {envDebout && (
            <div>
              <p style={{ fontFamily: T.b, fontSize: 11, fontWeight: 700, color: "#ffa347", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                <Ico e="🏭" />Postes debout observés
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <RevealRow c={c} total={envDebout.total} n={envDebout.planInadapte} label="Hauteur du plan de travail inadaptée" />
                <RevealRow c={c} total={envDebout.total} n={envDebout.sansTapis} label="Sol dur sans tapis anti-fatigue" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

