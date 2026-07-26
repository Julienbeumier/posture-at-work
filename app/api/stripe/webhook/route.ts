import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { premiumWelcomeEmail } from "@/lib/emails/templates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.error("[webhook] Pas de user_id dans metadata");
      return NextResponse.json({ error: "No user_id" }, { status: 400 });
    }

    await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      is_premium: true,
      premium_activated_at: new Date().toISOString(),
      premium_source: "stripe",
    }, { onConflict: "user_id" });

    await supabaseAdmin.from("purchases")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq("stripe_session_id", session.id);

    console.log(`[webhook] Premium activé pour user ${userId}`);

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (authError) {
        console.error("[webhook] Erreur getUserById:", authError);
      } else if (authData?.user?.email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const firstName = authData.user.user_metadata?.full_name?.split(" ")[0]
          ?? authData.user.user_metadata?.name?.split(" ")[0]
          ?? undefined;

        const result = await resend.emails.send({
          from: "PostureAtWork <hello@postureatwork.com>",
          to: authData.user.email,
          subject: "🎉 Bienvenue dans PAW Premium — ton analyse t'attend",
          html: premiumWelcomeEmail(firstName),
        });

        console.log("[webhook] Email bienvenue envoyé:", result);
      } else {
        console.warn("[webhook] Pas d'email trouvé pour user:", userId);
      }
    } catch (emailErr) {
      console.error("[webhook] Erreur envoi email:", emailErr);
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;

    const { data: purchase } = await supabaseAdmin
      .from("purchases")
      .select("user_id")
      .eq("stripe_payment_intent", paymentIntentId)
      .maybeSingle();

    if (purchase?.user_id) {
      await supabaseAdmin.from("profiles").update({
        is_premium: false,
        premium_source: null,
      }).eq("user_id", purchase.user_id);

      await supabaseAdmin.from("purchases").update({
        status: "refunded",
      }).eq("stripe_payment_intent", paymentIntentId);
    }
  }

  return NextResponse.json({ received: true });
}
