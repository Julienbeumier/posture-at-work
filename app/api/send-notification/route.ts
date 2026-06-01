import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase";

webpush.setVapidDetails(
  "mailto:contact@posture-at-work.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, action, title, message, url } = body;

    if (action === "save") {
      if (!subscription) return NextResponse.json({ error: "Subscription manquante" }, { status: 400 });
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      await supabase.from("push_subscriptions").upsert(
        { user_id: user.id, subscription: JSON.stringify(subscription), updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      return NextResponse.json({ success: true });
    }

    if (action === "send") {
      if (!subscription) return NextResponse.json({ error: "Subscription manquante" }, { status: 400 });
      await webpush.sendNotification(
        typeof subscription === "string" ? JSON.parse(subscription) : subscription,
        JSON.stringify({ title: title ?? "PostureAtWork", body: message ?? "Rappel posture !", url: url ?? "/dashboard" })
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err) {
    console.error("[send-notification]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
