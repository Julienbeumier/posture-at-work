"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { checkPremium } from "@/lib/premium";

export function usePremium() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const result = await checkPremium(supabase, user?.id);
      setPremium(result);
      setLoading(false);
    }
    check();
  }, []);

  return { premium, loading };
}
