import { createBrowserClient, createServerClient as _createServerClient } from "@supabase/ssr";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// ─── Browser client (use in Client Components) ───────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const IS_CONFIGURED = SUPABASE_URL.startsWith("http") && SUPABASE_KEY.length > 10;

export function createClient() {
  if (!IS_CONFIGURED) {
    // Return a dummy client that silently no-ops when Supabase isn't set up
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

// ─── Server client (use in Server Components / API Routes) ───────────────────
// Uses the getAll/setAll API (non-deprecated in @supabase/ssr 0.5+)

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  const url = IS_CONFIGURED ? SUPABASE_URL : "https://placeholder.supabase.co";
  const key = IS_CONFIGURED ? SUPABASE_KEY : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

  return _createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          const mutable = cookieStore as unknown as {
            set: (name: string, value: string, options: Record<string, unknown>) => void;
          };
          cookiesToSet.forEach(({ name, value, options }) =>
            mutable.set(name, value, options ?? {})
          );
        } catch {
          // read-only in Server Components — middleware handles refresh
        }
      },
    },
  });
}

// ─── Assessment helpers ───────────────────────────────────────────────────────

export interface AssessmentScores {
  global: number;
  setup: number;
  pain: number;
  habits: number;
  sleep_energy: number;
  lifestyle: number;
}

export async function saveAssessment(
  email: string,
  scores: AssessmentScores,
  answers: Record<string, unknown>
): Promise<{ error: Error | null }> {
  const client = createClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "à_remplir" || key === "à_remplir") {
    return { error: null };
  }

  const { data: { user } } = await client.auth.getUser();

  const { error } = await client.from("assessments").insert([{
    email,
    user_id: user?.id ?? null,
    scores,
    answers,
    global_score: scores.global,
  }]);
  return { error: error as Error | null };
}

export async function saveAssessmentForUser(
  userId: string,
  scores: AssessmentScores,
  answers: Record<string, unknown>,
  videoAnalysis?: Record<string, unknown> | null,
  companyId?: string | null
): Promise<{ error: Error | null }> {
  const client = createClient();
  const { error } = await client.from("assessments").insert([{
    user_id: userId,
    scores,
    answers,
    global_score: scores.global,
    video_analysis: videoAnalysis ?? null,
    company_id: companyId ?? null,
  }]);
  return { error: error as Error | null };
}

// ─── B2B Types ────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  contact_email: string;
  contact_name?: string;
  plan: "starter" | "pme" | "enterprise";
  max_employees: number;
  is_active: boolean;
  created_at: string;
}

export interface CompanyMembership {
  id: string;
  company_id: string;
  user_id: string;
  role: "admin" | "employee";
  anonymous_id: string;
  joined_at: string;
}

export interface CompanyInvite {
  id: string;
  company_id: string;
  email?: string;
  code: string;
  used_at?: string;
  expires_at: string;
  created_at: string;
}

// ─── B2B Helpers ──────────────────────────────────────────────────────────────

export async function getCompanyForUser(userId: string): Promise<Company | null> {
  const client = createClient();
  const { data } = await client
    .from("company_memberships")
    .select("company_id, role, companies(*)")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.companies as unknown as Company) ?? null;
}

export async function getMembershipForUser(userId: string): Promise<CompanyMembership | null> {
  const client = createClient();
  const { data } = await client
    .from("company_memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function validateInviteCode(code: string): Promise<{ company: Company; invite: CompanyInvite } | null> {
  const client = createClient();
  const { data } = await client
    .from("company_invites")
    .select("*, companies(*)")
    .eq("code", code.toUpperCase())
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!data) return null;
  return {
    invite: data as unknown as CompanyInvite,
    company: data.companies as unknown as Company,
  };
}

export async function useInviteCode(
  code: string,
  userId: string,
  companyId: string
): Promise<{ error: Error | null }> {
  const client = createClient();

  const { count } = await client
    .from("company_memberships")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);

  const anonymousId = `Employé #${(count ?? 0) + 1}`;

  await client
    .from("company_invites")
    .update({ used_at: new Date().toISOString(), used_by: userId })
    .eq("code", code.toUpperCase());

  const { error } = await client
    .from("company_memberships")
    .insert({
      company_id: companyId,
      user_id: userId,
      role: "employee",
      anonymous_id: anonymousId,
    });

  return { error: error as Error | null };
}

export async function generateInviteCode(companyId: string): Promise<string | null> {
  const client = createClient();
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const { error } = await client
    .from("company_invites")
    .insert({ company_id: companyId, code });
  if (error) return null;
  return code;
}
