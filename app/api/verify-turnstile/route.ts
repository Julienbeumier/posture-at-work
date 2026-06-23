import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const formData = new URLSearchParams();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY ?? "");
  formData.append("response", token);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json({ success: data.success });
}
