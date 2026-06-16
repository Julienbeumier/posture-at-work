import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { data: adminMembership } = await supabaseAdmin
        .from("company_memberships")
        .select("company_id")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminMembership) {
        return NextResponse.redirect(`${origin}/entreprise/dashboard`);
      }
      return NextResponse.redirect(`${origin}${redirect.startsWith("/") ? redirect : "/dashboard"}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback_error`);
}
