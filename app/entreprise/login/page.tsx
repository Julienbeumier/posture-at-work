"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntrepriseLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth?redirect=/entreprise/dashboard");
  }, [router]);
  return null;
}
