import type { SupabaseClient } from "@supabase/supabase-js";

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("paw_premium") === "true";
}

export async function activatePremium(
  supabase: SupabaseClient,
  userId?: string
): Promise<void> {
  localStorage.setItem("paw_premium", "true");
  const now = new Date().toISOString();
  localStorage.setItem("paw_premium_activated_at", now);
  if (!localStorage.getItem("paw_premium_since")) {
    localStorage.setItem("paw_premium_since", now);
  }
  if (userId) {
    await supabase.from("profiles").upsert({
      user_id: userId,
      is_premium: true,
      premium_activated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }
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
