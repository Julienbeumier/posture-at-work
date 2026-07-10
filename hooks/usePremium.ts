"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export function usePremium() {
  const [premium, setPremium] = useState<boolean>(
    typeof window !== "undefined" && localStorage.getItem("paw_premium") === "true"
  );
  const [loading] = useState<boolean>(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (localStorage.getItem("paw_premium") === "true") {
          localStorage.removeItem("paw_premium");
          setPremium(false);
        }
        return;
      }

      if (localStorage.getItem("paw_premium") === "true") return;

      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.is_premium) {
        localStorage.setItem("paw_premium", "true");
        setPremium(true);
      }
    }

    check();
  }, []);

  return { premium, loading };
}
