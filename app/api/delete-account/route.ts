import { NextResponse } from "next/server";

const DEMO_COMPANY_ID = "84a0c205-2c9d-4edf-88fe-a2c6272627e0";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(cookieStore);
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Supprimer les données personnelles
    await supabaseAdmin.from("assessments").delete().eq("user_id", user.id);
    await supabaseAdmin.from("daily_checkins").delete().eq("user_id", user.id);
    await supabaseAdmin.from("badges").delete().eq("user_id", user.id);
    await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", user.id);
    await supabaseAdmin.from("video_sessions").delete().eq("user_id", user.id);
    await supabaseAdmin.from("feedback").delete().eq("user_id", user.id);

    // 2. Vérifier si admin d'une company
    const { data: adminMembership } = await supabaseAdmin
      .from("company_memberships")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminMembership) {
      const { data: otherAdmins } = await supabaseAdmin
        .from("company_memberships")
        .select("user_id")
        .eq("company_id", adminMembership.company_id)
        .eq("role", "admin")
        .neq("user_id", user.id);

      if ((!otherAdmins || otherAdmins.length === 0) && adminMembership.company_id !== DEMO_COMPANY_ID) {
        // Dernier admin et pas la demo → supprimer toute la company
        await supabaseAdmin.from("company_signals").delete().eq("company_id", adminMembership.company_id);
        await supabaseAdmin.from("company_invites").delete().eq("company_id", adminMembership.company_id);
        await supabaseAdmin.from("company_memberships").delete().eq("company_id", adminMembership.company_id);
        await supabaseAdmin.from("companies").delete().eq("id", adminMembership.company_id);
      } else if (adminMembership.company_id === DEMO_COMPANY_ID) {
        // Demo company → juste supprimer le membership admin, garder la company intacte
        await supabaseAdmin.from("company_memberships").delete()
          .eq("user_id", user.id)
          .eq("company_id", DEMO_COMPANY_ID);
      } else {
        await supabaseAdmin.from("company_memberships").delete().eq("user_id", user.id);
      }
    } else {
      await supabaseAdmin.from("company_memberships").delete().eq("user_id", user.id);
    }

    // 3. Supprimer le compte auth
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-account]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
