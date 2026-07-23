import type { SupabaseClient } from "@supabase/supabase-js";

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("paw_premium") === "true";
}

export async function activatePremium(
  _supabase: SupabaseClient,
  _userId?: string
): Promise<void> {
  console.warn("[premium] activatePremium appelé directement — utiliser Stripe checkout");
  // Le premium est activé exclusivement par le webhook Stripe
}

export async function checkPremium(
  supabase: SupabaseClient,
  userId?: string
): Promise<boolean> {
  if (isPremium()) return true;
  if (!userId) return false;
  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.is_premium) {
    localStorage.setItem("paw_premium", "true");
    return true;
  }
  return false;
}
