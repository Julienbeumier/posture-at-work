import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase";

const MESSAGES = [
  { title: "💆 Pause posture", body: "Redresse-toi, recule ton écran et fais 3 respirations profondes." },
  { title: "💧 Hydratation", body: "Tu as bu suffisamment d'eau aujourd'hui ? Objectif : 1,5L avant 17h." },
  { title: "🧘 2 minutes", body: "Rétraction cervicale × 10 reps. Menton vers la gorge, tiens 5 sec." },
  { title: "⏱️ Pause active", body: "Lève-toi 2 minutes. Marche, étire-toi — ton dos te remerciera ce soir." },
  { title: "👁️ Règle 20-20-20", body: "Regarde à 6m pendant 20 secondes. Fais-le maintenant." },
  { title: "🪑 Check posture", body: "Dos contre le dossier, pieds à plat. Tu n'as pas bougé depuis 45 min ?" },
  { title: "🌙 Bilan du jour", body: "Exercices faits ? Check-in rapide sur PAW pour garder ton streak." },
];

export async function GET() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:contact@posture-at-work.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  try {
    const supabase = createClient();
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("subscription");

    if (error || !subs?.length) return NextResponse.json({ sent: 0 });

    const msg = MESSAGES[new Date().getDay() % MESSAGES.length];
    let sent = 0;

    await Promise.allSettled(
      subs.map(async (row) => {
        try {
          await webpush.sendNotification(
            JSON.parse(row.subscription as string),
            JSON.stringify({ title: msg.title, body: msg.body, url: "/dashboard" })
          );
          sent++;
        } catch { /* expired subscription — ignore */ }
      })
    );

    return NextResponse.json({ sent });
  } catch (err) {
    console.error("[daily-notification]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
