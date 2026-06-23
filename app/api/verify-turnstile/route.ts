import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  console.log("[Turnstile] Token reçu:", token?.substring(0, 20) + "...");
  console.log("[Turnstile] Secret key présente:", !!process.env.TURNSTILE_SECRET_KEY);

  const formData = new URLSearchParams();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY ?? "");
  formData.append("response", token ?? "");

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("[Turnstile] Réponse Cloudflare:", JSON.stringify(data));

  return NextResponse.json({ success: data.success, errors: data["error-codes"] });
}
