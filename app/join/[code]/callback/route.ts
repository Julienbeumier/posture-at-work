import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { searchParams, origin } = new URL(request.url);
  const authCode = searchParams.get("code");
  const { code } = await params;
  const inviteCode = code.toUpperCase();

  if (authCode) {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data } = await supabase.auth.exchangeCodeForSession(authCode);

    if (data.user) {
      // Lier l'user à la company via l'API join
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      // Vérifier le code d'invitation
      const { data: invite } = await supabaseAdmin
        .from("company_invites")
        .select("company_id, expires_at")
        .eq("code", inviteCode)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (invite) {
        // Vérifier si déjà membre
        const { data: existing } = await supabaseAdmin
          .from("company_memberships")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("company_id", invite.company_id)
          .maybeSingle();

        if (!existing) {
          // Compter les membres pour l'anonymous_id
          const { count } = await supabaseAdmin
            .from("company_memberships")
            .select("*", { count: "exact", head: true })
            .eq("company_id", invite.company_id)
            .eq("role", "employee");

          await supabaseAdmin.from("company_memberships").insert({
            company_id: invite.company_id,
            user_id: data.user.id,
            role: "employee",
            anonymous_id: `Employé #${(count ?? 0) + 1}`,
          });
        }
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/join/${inviteCode}?error=callback_failed`);
}
