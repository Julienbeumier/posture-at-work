"use client";
import { useEffect } from "react";
export default function OnboardingRedirect() {
  useEffect(() => { window.location.href = "/"; }, []);
  return null;
}
