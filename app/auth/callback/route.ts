import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const adminToken = searchParams.get("admin_token");
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

      // Vérifier si nouveau user — envoyer email de bienvenue
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        fetch(`${origin}/api/auth/welcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.user.email,
            firstName: (data.user.user_metadata?.full_name as string | undefined)?.split(" ")[0],
          }),
        }).catch(() => {});
      }

      if (adminToken) {
        const { data: invite } = await supabaseAdmin
          .from("admin_invites")
          .select("company_id, email, used_at")
          .eq("token", adminToken)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (invite && !invite.used_at && invite.email === data.user.email) {
          await supabaseAdmin.from("company_memberships").upsert({
            company_id: invite.company_id,
            user_id: data.user.id,
            role: "admin",
            anonymous_id: "Admin",
          }, { onConflict: "company_id,user_id" });

          await supabaseAdmin.from("profiles").upsert({
            user_id: data.user.id,
            is_premium: true,
            premium_source: "b2b_admin",
            premium_activated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          await supabaseAdmin
            .from("admin_invites")
            .update({ used_at: new Date().toISOString() })
            .eq("token", adminToken);

          return NextResponse.redirect(`${origin}/entreprise/dashboard`);
        }
      }

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
