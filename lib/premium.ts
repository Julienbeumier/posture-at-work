import type { SupabaseClient } from "@supabase/supabase-js";

// Le statut premium vient TOUJOURS de la base (profiles.is_premium).
// Le localStorage ne sert que de cache, et uniquement pour l'utilisateur qui l'a écrit :
// sans cela, un compte premium/B2B laisserait le statut à un autre compte du même navigateur.
const CACHE_FLAG = "paw_premium";
const CACHE_UID = "paw_premium_uid";

export function cachePremium(userId: string): void {
  try {
    localStorage.setItem(CACHE_FLAG, "true");
    localStorage.setItem(CACHE_UID, userId);
  } catch { /* stockage indisponible */ }
}

export function clearPremiumCache(): void {
  try {
    localStorage.removeItem(CACHE_FLAG);
    localStorage.removeItem(CACHE_UID);
  } catch { /* stockage indisponible */ }
}

function isPremiumCachedFor(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CACHE_FLAG) === "true" && localStorage.getItem(CACHE_UID) === userId;
  } catch {
    return false;
  }
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
  if (!userId) return false;
  if (isPremiumCachedFor(userId)) return true;
  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.is_premium) {
    cachePremium(userId);
    return true;
  }
  clearPremiumCache();
  return false;
}
