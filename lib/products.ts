/**
 * Catalogue unique des produits recommandés (liens affiliés Amazon).
 *
 * Règle : tout lien Amazon du site passe par ce fichier. Pour ajouter, retirer
 * ou changer un produit (ou remplacer une recherche par un lien SiteStripe),
 * on ne modifie qu'ici.
 */

export const AMAZON_TAG = "postureatwo09-21";

export interface CatalogProduct {
  name: string;
  /** Terme de recherche Amazon, utilisé tant qu'aucun lien produit n'est renseigné. */
  search: string;
  /** Lien produit précis (SiteStripe). Prioritaire sur la recherche quand il est renseigné. */
  link?: string;
  price?: string;
}

export const CATALOG = {
  // Poste de bureau
  rehausseur_ecran:    { name: "Rehausseur écran GRIFEMA", search: "Rehausseur écran GRIFEMA", price: "~28€" },
  support_laptop:      { name: "Support laptop ergonomique", search: "Support laptop ergonomique", price: "~30€" },
  souris_verticale:    { name: "Souris verticale Trust Verto", search: "Souris verticale Trust Verto", price: "~25€" },
  repose_poignets:     { name: "Repose-poignets gel clavier", search: "Repose-poignets gel clavier" },
  coussin_lombaire:    { name: "Coussin lombaire FORTEM", search: "Coussin lombaire FORTEM", price: "~30€" },
  repose_pieds:        { name: "Repose-pieds ergonomique", search: "Repose-pieds ergonomique", price: "~35€" },
  bureau_assis_debout: { name: "Bureau assis-debout SONGMICS", search: "Bureau assis-debout SONGMICS", price: "~200€" },
  coussin_equilibre:   { name: "Coussin d'équilibre BODYMATE", search: "Coussin d'équilibre BODYMATE", price: "~30€" },
  tabouret_haut:       { name: "Tabouret haut ergonomique", search: "tabouret haut ergonomique bureau" },
  // Postes debout et métiers physiques
  tapis_anti_fatigue:  { name: "Tapis anti-fatigue", search: "Tapis anti-fatigue ergonomique", price: "~45€" },
  semelles:            { name: "Semelles orthopédiques de travail", search: "Semelles orthopédiques de travail", price: "~30€" },
  chaussettes:         { name: "Chaussettes de compression graduée", search: "Chaussettes de compression graduée", price: "~20€" },
  coussin_jambes:      { name: "Coussin de surélévation des jambes", search: "Coussin de surélévation des jambes", price: "~30€" },
  ceinture_lombaire:   { name: "Ceinture lombaire de travail", search: "ceinture lombaire travail manutention", price: "~30€" },
  genouilleres:        { name: "Genouillères de chantier", search: "genouillères travail chantier" },
  gants_vibrations:    { name: "Gants anti-vibrations", search: "gants anti vibrations travail" },
  chaussures_soin:     { name: "Chaussures professionnelles de soin", search: "chaussures professionnelles soignant confort" },
  // Récupération et sommeil
  foam_roller:         { name: "Foam roller", search: "Foam roller", price: "~25€" },
  balle_massage:       { name: "Balle de massage BLACKROLL", search: "Balle de massage BLACKROLL", price: "~15€" },
  oreiller_cervical:   { name: "Oreiller ergonomique cervical HOMCA", search: "Oreiller ergonomique cervical HOMCA" },
  lunettes_lumiere_bleue: { name: "Lunettes anti-lumière bleue Horus X", search: "Lunettes anti-lumière bleue Horus X", price: "~30€" },
  // Nutrition
  gourde:              { name: "Gourde graduée 1,5 L", search: "Gourde graduée avec horaires 1.5L", price: "~15€" },
  magnesium:           { name: "Magnésium bisglycinate", search: "Magnésium bisglycinate", price: "~20€/mois" },
} as const satisfies Record<string, CatalogProduct>;

export type ProductId = keyof typeof CATALOG;

/** Lien affilié à partir d'un terme de recherche libre. */
export function amazonSearchUrl(search: string): string {
  return `https://www.amazon.fr/s?k=${encodeURIComponent(search)}&tag=${AMAZON_TAG}`;
}

/** Lien affilié d'un produit du catalogue (lien produit s'il existe, sinon recherche). */
export function productUrl(id: ProductId): string {
  const p: CatalogProduct = CATALOG[id];
  return p.link ?? amazonSearchUrl(p.search);
}

export function productName(id: ProductId): string {
  return CATALOG[id].name;
}

/** Liste lisible par l'IA, pour qu'elle ne propose que des produits du catalogue. */
export const CATALOG_SEARCH_TERMS: string[] = Object.values(CATALOG).map((p) => p.search);

// ─── Retrouver un produit du catalogue à partir d'un texte libre ──────────────

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set(["de", "du", "des", "la", "le", "les", "un", "une", "et", "pour", "avec", "en", "au", "bureau", "ergonomique", "reglable"]);
const tokens = (s: string) => norm(s).split(" ").filter((t) => t.length > 2 && !STOP.has(t));

/**
 * Associe un nom ou une recherche libre (par exemple écrits par l'IA) à un produit
 * du catalogue. Renvoie null si rien ne correspond clairement : le produit est
 * alors écarté, pour ne jamais afficher un article hors catalogue.
 */
export function matchCatalog(name: string, search?: string): ProductId | null {
  const ids = Object.keys(CATALOG) as ProductId[];
  const texts = [name, search ?? ""].filter(Boolean);
  for (const id of ids) {
    const p: CatalogProduct = CATALOG[id];
    if (texts.some((t) => norm(t) === norm(p.search) || norm(t) === norm(p.name))) return id;
  }
  const wanted = new Set(texts.flatMap(tokens));
  let best: { id: ProductId; score: number } | null = null;
  for (const id of ids) {
    const p: CatalogProduct = CATALOG[id];
    const own = [...new Set([...tokens(p.name), ...tokens(p.search)])];
    const hits = own.filter((t) => wanted.has(t)).length;
    const score = hits / Math.max(2, Math.min(own.length, 4));
    if (hits >= 2 && score >= 0.5 && (!best || score > best.score)) best = { id, score };
  }
  return best?.id ?? null;
}

/** Lien affilié pour un terme de recherche : lien produit du catalogue s'il existe, sinon recherche. */
export function urlFromSearch(search: string): string {
  const id = matchCatalog("", search);
  return id ? productUrl(id) : amazonSearchUrl(search);
}
