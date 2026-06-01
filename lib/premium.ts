import type { SupabaseClient } from "@supabase/supabase-js";

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("paw_premium") === "true";
}

export async function checkPremiumFromDB(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
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
