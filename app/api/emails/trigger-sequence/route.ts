import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data: rows, error } = await supabase
      .from("email_sequences")
      .select("email, firstname, sequence_step, scores")
      .lte("next_send_at", now)
      .not("next_send_at", "is", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!rows?.length) return NextResponse.json({ processed: 0 });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://posture-at-work.vercel.app";

    const results = await Promise.allSettled(
      rows.map((row) =>
        fetch(`${base}/api/emails/send-sequence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: row.email,
            firstname: row.firstname,
            step: (row.sequence_step ?? 1) + 1,
            scores: row.scores,
          }),
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ processed: rows.length, sent });
  } catch (err) {
    console.error("[trigger-sequence]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
