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
  videoAnalysis?: Record<string, unknown> | null
): Promise<{ error: Error | null }> {
  const client = createClient();
  const { error } = await client.from("assessments").insert([{
    user_id: userId,
    scores,
    answers,
    global_score: scores.global,
    video_analysis: videoAnalysis ?? null,
  }]);
  return { error: error as Error | null };
}
