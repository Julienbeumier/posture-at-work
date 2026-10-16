"use client";

import { useState } from "react";

const T = { b: "var(--font-jakarta), sans-serif" };

type State = "idle" | "busy" | "ok" | "denied" | "ios" | "unsupported";

/** Active les rappels push, uniquement quand la personne le demande. */
export default function RemindersButton() {
  const [state, setState] = useState<State>("idle");

  async function enable() {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as unknown as Record<string, unknown>)["standalone"];
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState(isIos ? "ios" : "unsupported");
      return;
    }
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setState("unsupported"); return; }
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
      const res = await fetch("/api/send-notification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, action: "save" }),
      });
      setState(res.ok ? "ok" : "unsupported");
    } catch {
      setState("unsupported");
    }
  }

  const message: Partial<Record<State, string>> = {
    ok: "Rappels activés. On te rappellera de bouger et de faire tes exercices.",
    denied: "Les notifications sont bloquées dans ton navigateur. Tu peux les autoriser dans ses réglages.",
    ios: "Sur iPhone, ajoute d'abord l'app à ton écran d'accueil (Partager, puis « Sur l'écran d'accueil »), puis reviens ici.",
    unsupported: "Les rappels ne sont pas disponibles sur cet appareil pour le moment.",
  };

  return (
    <div style={{ marginTop: 14 }}>
      {state !== "ok" && (
        <button type="button" onClick={enable} disabled={state === "busy"}
          style={{
            padding: "10px 18px", borderRadius: 100, cursor: state === "busy" ? "default" : "pointer",
            background: "transparent", border: "1px solid var(--border-2)", color: "var(--text-primary)",
            fontFamily: T.b, fontWeight: 700, fontSize: 13, minHeight: 44,
          }}>
          {state === "busy" ? "Activation…" : "Activer les rappels"}
        </button>
      )}
      {message[state] && (
        <p role="status" style={{ fontFamily: T.b, fontSize: 13, lineHeight: 1.55, margin: state === "ok" ? 0 : "10px 0 0", color: state === "ok" ? "#3fe0a0" : "var(--t55)" }}>
          {message[state]}
        </p>
      )}
    </div>
  );
}
