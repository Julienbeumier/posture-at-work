import { NextResponse } from "next/server";
import { getSessionUser, getSupabaseAdmin, getCompanyAdminMembership } from "@/lib/server-auth";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Le signalement doit appartenir à l'entreprise dont l'utilisateur est admin
    const { data: signal } = await supabaseAdmin
      .from("company_signals")
      .select("company_id")
      .eq("id", id)
      .maybeSingle();
    if (!signal) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    const membership = await getCompanyAdminMembership(user.id, signal.company_id);
    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    await supabaseAdmin.from("company_signals").update({ treated: true }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
