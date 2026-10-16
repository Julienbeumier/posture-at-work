"use client";

import { motion } from "framer-motion";
import type { ChecklistTask } from "@/lib/dashboard";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

export default function DailyChecklist({ tasks, checked, onToggle }: {
  tasks: ChecklistTask[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  // Seules les tâches affichées comptent (les anciennes cases cochées sont ignorées).
  const doneCount = tasks.filter(t => checked[t.id]).length;
  const totalCount = tasks.length;
  const complete = totalCount > 0 && doneCount === totalCount;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 100, background: "var(--border)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 100, background: complete ? "#3fe0a0" : "#2b5ce6",
            width: `${totalCount ? (doneCount / totalCount) * 100 : 0}%`, transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontFamily: T.b, fontSize: 13, fontWeight: 600, color: "var(--t55)" }}>
          {doneCount}/{totalCount}
        </span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map(task => {
          const done = !!checked[task.id];
          return (
            <li key={task.id}>
              <button
                type="button"
                aria-pressed={done}
                onClick={() => onToggle(task.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                  padding: "12px 14px", borderRadius: 12, cursor: "pointer", minHeight: 48,
                  background: done ? "rgba(63,224,160,0.08)" : "var(--bg-card-2)",
                  border: `1px solid ${done ? "rgba(63,224,160,0.28)" : "var(--border)"}`,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <span aria-hidden="true" style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                  border: `2px solid ${done ? "#3fe0a0" : "var(--border-2)"}`,
                  background: done ? "#3fe0a0" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#04201a", fontSize: 12, fontWeight: 800,
                }}>{done ? "✓" : ""}</span>
                <span style={{
                  flex: 1, fontFamily: T.b, fontSize: 14, lineHeight: 1.45,
                  color: done ? "var(--t40)" : "var(--text-primary)",
                  textDecoration: done ? "line-through" : "none",
                }}>{task.text}</span>
                <span style={{
                  fontFamily: T.b, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100, flexShrink: 0,
                  color: task.color, background: `${task.color}22`,
                }}>{task.dim}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {complete && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: "12px 0 0", padding: "10px 14px", borderRadius: 10, textAlign: "center",
            background: "rgba(63,224,160,0.1)", border: "1px solid rgba(63,224,160,0.28)",
            fontFamily: T.h, fontWeight: 700, fontSize: 14, color: "#3fe0a0",
          }}
        >
          Checklist complète. Bien joué pour aujourd&apos;hui !
        </motion.p>
      )}
    </div>
  );
}
