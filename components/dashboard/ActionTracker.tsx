"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

type ThemeLike = {
  textPrimary: string; textMuted: string; border: string; cardGrad: string; bgCard2: string;
};

type Status = "todo" | "in_progress" | "done";
type Action = {
  id: string; title: string; notes: string | null; status: Status;
  owner: string | null; due_date: string | null;
};

const STATUS_LABEL: Record<Status, string> = { todo: "À faire", in_progress: "En cours", done: "Fait" };
const STATUS_COLOR: Record<Status, string> = { todo: "#f0a04b", in_progress: "#6f9bff", done: "#3fe0a0" };

export default function ActionTracker({ c, companyId }: { c: ThemeLike; companyId: string }) {
  const [actions, setActions] = useState<Action[] | null>(null);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: e } = await createClient()
      .from("company_actions")
      .select("id, title, notes, status, owner, due_date")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (e) { setError("Impossible de charger le plan d'action."); setActions([]); return; }
    setActions((data ?? []) as Action[]);
  }, [companyId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function add() {
    const t = title.trim();
    if (!t) return;
    setBusy(true); setError(null);
    const { error: e } = await createClient().from("company_actions").insert({
      company_id: companyId, title: t.slice(0, 200),
      owner: owner.trim().slice(0, 100) || null, due_date: due || null,
    });
    setBusy(false);
    if (e) { setError("L'action n'a pas pu être ajoutée."); return; }
    setTitle(""); setOwner(""); setDue("");
    load();
  }

  async function update(id: string, patch: Partial<Action>) {
    setActions(prev => prev?.map(a => a.id === id ? { ...a, ...patch } : a) ?? prev);
    const { error: e } = await createClient().from("company_actions")
      .update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (e) { setError("La modification a échoué."); load(); }
  }

  async function remove(id: string) {
    setActions(prev => prev?.filter(a => a.id !== id) ?? prev);
    const { error: e } = await createClient().from("company_actions").delete().eq("id", id);
    if (e) { setError("La suppression a échoué."); load(); }
  }

  const today = new Date().toISOString().slice(0, 10);
  const done = actions?.filter(a => a.status === "done").length ?? 0;
  const input: React.CSSProperties = {
    padding: "9px 12px", borderRadius: 10, border: `1px solid ${c.border}`, background: c.bgCard2,
    color: c.textPrimary, fontFamily: T.b, fontSize: 13, minWidth: 0,
  };

  return (
    <div style={{ borderRadius: 20, padding: "20px 22px", background: c.cardGrad, border: `1px solid ${c.border}`, marginBottom: 20 }}>
      <p style={{ fontFamily: T.h, fontWeight: 800, fontSize: 15, color: c.textPrimary, margin: "0 0 4px" }}>
        ✅ Plan d&apos;action
      </p>
      <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: "0 0 14px", lineHeight: 1.6 }}>
        Notez les actions décidées, qui s&apos;en occupe et pour quand. Visible uniquement par les administrateurs.
        {actions && actions.length > 0 && ` ${done}/${actions.length} terminée${done > 1 ? "s" : ""}.`}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <input aria-label="Nouvelle action" placeholder="Ex. : racheter 10 rehausseurs d'écran" value={title}
          onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          maxLength={200} style={{ ...input, flex: "1 1 240px" }} />
        <input aria-label="Responsable" placeholder="Responsable" value={owner}
          onChange={e => setOwner(e.target.value)} maxLength={100} style={{ ...input, flex: "0 1 150px" }} />
        <input aria-label="Échéance" type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...input, flex: "0 1 150px" }} />
        <button type="button" onClick={add} disabled={busy || !title.trim()}
          style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "#3fe0a0", color: "#04201a",
            fontFamily: T.b, fontWeight: 700, fontSize: 13, cursor: busy || !title.trim() ? "not-allowed" : "pointer",
            opacity: busy || !title.trim() ? 0.5 : 1 }}>
          Ajouter
        </button>
      </div>

      {error && <p role="alert" style={{ fontFamily: T.b, fontSize: 13, color: "#ff8a8a", margin: "0 0 10px" }}>{error}</p>}

      {actions === null ? (
        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted }}>Chargement…</p>
      ) : actions.length === 0 ? (
        <p style={{ fontFamily: T.b, fontSize: 13, color: c.textMuted, margin: 0 }}>Aucune action pour le moment.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map(a => {
            const late = a.status !== "done" && a.due_date && a.due_date < today;
            return (
              <div key={a.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 12, border: `1px solid ${c.border}`, background: c.bgCard2 }}>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <p style={{ fontFamily: T.b, fontSize: 13.5, fontWeight: 600, color: c.textPrimary, margin: 0,
                    textDecoration: a.status === "done" ? "line-through" : "none", opacity: a.status === "done" ? 0.6 : 1 }}>
                    {a.title}
                  </p>
                  <p style={{ fontFamily: T.b, fontSize: 12, color: late ? "#ff8a8a" : c.textMuted, margin: "2px 0 0" }}>
                    {a.owner ? `👤 ${a.owner}` : "Sans responsable"}
                    {a.due_date && ` · 📅 ${new Date(a.due_date + "T00:00:00").toLocaleDateString("fr-BE")}${late ? " (en retard)" : ""}`}
                  </p>
                </div>
                <select aria-label={`Statut : ${a.title}`} value={a.status}
                  onChange={e => update(a.id, { status: e.target.value as Status })}
                  style={{ ...input, color: STATUS_COLOR[a.status], fontWeight: 700 }}>
                  {(Object.keys(STATUS_LABEL) as Status[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <button type="button" aria-label={`Supprimer l'action : ${a.title}`} onClick={() => remove(a.id)}
                  style={{ background: "transparent", border: "none", color: c.textMuted, cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
