"use client";

import Link from "next/link";
import BackgroundBlobs from "@/components/BackgroundBlobs";

const T = { h: "var(--font-nunito), sans-serif", b: "var(--font-jakarta), sans-serif" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: T.h, fontWeight: 800, fontSize: 18, color: "#f0f0fa", margin: "0 0 12px" }}>{title}</h2>
      <div style={{ fontFamily: T.b, fontSize: 14, color: "rgba(220,220,245,0.78)", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function PolitiqueConfidentialite() {
  return (
    <main style={{ minHeight: "100vh", background: "#1f2d4d", paddingBottom: 80, position: "relative" }}>
      <BackgroundBlobs blobs={[{ top: "-5%", right: "-5%", color: "rgba(43,92,230,0.10)", size: 400 }]} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 80, paddingBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.58)", cursor: "pointer" }}>← Accueil</span>
          </Link>
        </div>

        <h1 style={{ fontFamily: T.h, fontWeight: 900, fontSize: 28, color: "#f0f0fa", marginBottom: 8, letterSpacing: "-0.5px" }}>
          Politique de confidentialité
        </h1>
        <p style={{ fontFamily: T.b, fontSize: 13, color: "rgba(220,220,245,0.54)", marginBottom: 40 }}>
          Dernière mise à jour : octobre 2026
        </p>

        <Section title="1. Qui sommes-nous">
          <p>PostureAtWork est un outil de bilan santé au bureau développé de manière indépendante. Pour toute question relative à tes données, contacte-nous à : <a href="mailto:hello@postureatwork.com" style={{ color: "#6f9bff" }}>hello@postureatwork.com</a></p>
        </Section>

        <Section title="2. Données collectées">
          <p>Nous collectons uniquement :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Ton adresse email (si tu crées un compte)</li>
            <li>Tes réponses au questionnaire santé</li>
            <li>Tes scores calculés par dimension</li>
            <li>Tes check-ins quotidiens (exercices, hydratation, douleurs)</li>
            <li>Des frames vidéo temporaires lors de l&apos;analyse posturale (non stockées — voir section 4)</li>
          </ul>
        </Section>

        <Section title="2 bis. Données de santé et consentement">
          <p>
            Tes réponses au questionnaire (douleurs, sommeil, habitudes) sont des <strong style={{ color: "#f0f0fa" }}>données relatives à la santé</strong>.
            Elles ne sont traitées qu&apos;avec ton consentement, pour te fournir ton bilan. Tu peux retirer ce consentement à tout moment en supprimant ton compte.
          </p>
        </Section>

        <Section title="2 ter. Si ton employeur utilise PAW">
          <p>
            Si tu rejoins PAW via une invitation de ton employeur, celui-ci voit uniquement des résultats <strong style={{ color: "#f0f0fa" }}>agrégés</strong> et
            des identifiants anonymes (« Employé #3 »). Tes réponses individuelles et ton analyse vidéo ne lui sont pas communiquées.
          </p>
        </Section>

        <Section title="3. Utilisation des données">
          <p>Tes données sont utilisées pour :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Générer ton bilan personnalisé</li>
            <li>Sauvegarder ton historique de progression</li>
            <li>Personnaliser les recommandations</li>
          </ul>
          <p style={{ marginTop: 12 }}>Tes données ne sont <strong style={{ color: "#f0f0fa" }}>jamais vendues ni partagées</strong> avec des tiers à des fins commerciales.</p>
        </Section>

        <Section title="4. Analyse vidéo IA">
          <div style={{ borderRadius: 16, padding: "16px 18px", background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.25)", marginBottom: 12 }}>
            <p style={{ margin: 0 }}>
              Les frames extraites de ta vidéo sont envoyées à l&apos;API Anthropic Claude pour analyse posturale.
              Elles <strong style={{ color: "#f0f0fa" }}>ne sont pas stockées sur nos serveurs</strong>.
              La vidéo complète n&apos;est jamais uploadée — seules 4 à 7 images fixes (JPEG) sont transmises, puis immédiatement supprimées après l&apos;analyse.
            </p>
          </div>
          <p>Anthropic est soumis à sa propre politique de confidentialité disponible sur <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#6f9bff" }}>anthropic.com/privacy</a>.</p>
        </Section>

        <Section title="4 bis. Prestataires qui traitent tes données">
          <ul style={{ paddingLeft: 20, marginTop: 4 }}>
            <li>Supabase — base de données et authentification (serveurs dans l&apos;Union européenne, Irlande)</li>
            <li>Vercel — hébergement du site</li>
            <li>Anthropic — analyse des images (voir section 4)</li>
            <li>Stripe — paiement (nous ne voyons jamais ton numéro de carte)</li>
            <li>Resend — envoi des emails</li>
            <li>Cloudflare Turnstile — protection anti-robots</li>
          </ul>
        </Section>

        <Section title="5. Tes droits">
          <p>Conformément au RGPD, tu as le droit de :</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: "#f0f0fa" }}>Accéder</strong> à tes données personnelles</li>
            <li><strong style={{ color: "#f0f0fa" }}>Rectifier</strong> des informations inexactes</li>
            <li><strong style={{ color: "#f0f0fa" }}>Supprimer</strong> ton compte et toutes tes données</li>
            <li><strong style={{ color: "#f0f0fa" }}>Exporter</strong> tes données (portabilité)</li>
          </ul>
          <p style={{ marginTop: 12 }}>Pour exercer ces droits, envoie une demande à <a href="mailto:hello@postureatwork.com" style={{ color: "#6f9bff" }}>hello@postureatwork.com</a>.</p>
        </Section>

        <Section title="6. Supprimer mes données">
          <p>
            Pour demander la suppression complète de ton compte et de toutes tes données, envoie un email à{" "}
            <a href="mailto:hello@postureatwork.com?subject=Suppression de compte" style={{ color: "#ff7b7b" }}>hello@postureatwork.com</a>{" "}
            avec l&apos;objet "Suppression de compte". Nous procéderons sous 72h.
          </p>
          <p style={{ marginTop: 8 }}>Tu peux aussi supprimer ton compte toi-même depuis « Paramètres du compte » (menu en haut à droite), et y télécharger une copie de tes données.</p>
        </Section>

        <Section title="7. Cookies et stockage local">
          <p>
            PostureAtWork utilise le localStorage et le sessionStorage de ton navigateur pour stocker tes préférences et résultats temporaires, ainsi que <strong style={{ color: "#f0f0fa" }}>des cookies strictement nécessaires</strong> au maintien de ta session de connexion. Nous n&apos;utilisons pas de cookies de tracking tiers, ni Google Analytics, ni pixels publicitaires.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Pour toute question concernant cette politique :<br />
            <a href="mailto:hello@postureatwork.com" style={{ color: "#6f9bff" }}>hello@postureatwork.com</a>
          </p>
        </Section>
      </div>
    </main>
  );
}
