import { randomBytes, randomInt, timingSafeEqual } from "crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

/** Client Supabase avec la clé service (côté serveur uniquement). */
export function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Utilisateur connecté (session par cookie) ou null. */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Comparaison de secrets à temps constant. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Secret d'administration PAW (jamais exposé au navigateur). */
function adminSecret(): string | null {
  return process.env.ADMIN_SECRET ?? process.env.NEXT_PUBLIC_ADMIN_SECRET ?? null;
}

/** Vrai si la requête porte le bon secret admin (en-tête x-admin-secret). */
export function hasAdminSecret(req: Request): boolean {
  const expected = adminSecret();
  const given = req.headers.get("x-admin-secret");
  return !!expected && !!given && safeEqual(given, expected);
}

/** Comptes autorisés comme administrateurs de la plateforme PAW. */
export function isPlatformAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "julienbeumier@outlook.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** Admin plateforme : secret admin OU session d'un compte admin. */
export async function isPlatformAdmin(req: Request): Promise<boolean> {
  if (hasAdminSecret(req)) return true;
  const user = await getSessionUser();
  return isPlatformAdminEmail(user?.email);
}

/** Appel planifié (cron Vercel) : Authorization: Bearer CRON_SECRET. */
export function isCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  return !!secret && !!header && safeEqual(header, `Bearer ${secret}`);
}

/** Rôle admin d'une entreprise pour cet utilisateur (ou null). */
export async function getCompanyAdminMembership(userId: string, companyId?: string) {
  const admin = getSupabaseAdmin();
  let q = admin
    .from("company_memberships")
    .select("company_id, role")
    .eq("user_id", userId)
    .eq("role", "admin");
  if (companyId) q = q.eq("company_id", companyId);
  const { data } = await q.limit(1).maybeSingle();
  return data;
}

// ─── Limitation de débit (en mémoire, par instance : frein simple, pas une barrière absolue) ───
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Jeton aléatoire cryptographique (hexadécimal). */
export function secureToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

/** Code d'invitation lisible (sans caractères ambigus), cryptographiquement aléatoire. */
export function secureCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[randomInt(alphabet.length)];
  return out;
}
