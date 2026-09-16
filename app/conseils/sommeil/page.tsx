"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SommeilRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/conseils/mode-de-vie"); }, [router]);
  return null;
}
