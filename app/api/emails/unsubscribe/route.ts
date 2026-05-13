import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.redirect(new URL("/desinscrit?error=1", req.url));
  }

  await createClient()
    .from("email_sequences")
    .update({ unsubscribed: true })
    .eq("email", email);

  return NextResponse.redirect(new URL(`/desinscrit?email=${encodeURIComponent(email)}`, req.url));
}
