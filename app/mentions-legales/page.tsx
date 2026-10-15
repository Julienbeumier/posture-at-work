import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";

// Page à finaliser (identité légale de l'éditeur) avant publication : non indexée tant que ce n'est pas fait.
export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: false },
};

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales" updated="octobre 2026">
      <LegalSection title="Éditeur du site">
        <p>
          PostureAtWork (« PAW ») est édité par <strong>Julien Beumier</strong>, kinésithérapeute.
        </p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Adresse : [À COMPLÉTER — adresse du siège / du cabinet, Tubize, Belgique]</li>
          <li>Numéro d&apos;entreprise (BCE) : [À COMPLÉTER]</li>
          <li>Numéro de TVA : [À COMPLÉTER]</li>
          <li>Contact : <a href="mailto:hello@postureatwork.com" style={{ color: "#6f9bff" }}>hello@postureatwork.com</a></li>
        </ul>
      </LegalSection>

      <LegalSection title="Hébergement et prestataires techniques">
        <ul style={{ paddingLeft: 20 }}>
          <li>Hébergement du site : Vercel Inc.</li>
          <li>Base de données et authentification : Supabase (région de l&apos;Union européenne — Irlande)</li>
          <li>Paiement : Stripe</li>
          <li>Envoi d&apos;emails : Resend</li>
          <li>Analyse d&apos;images par IA : Anthropic</li>
          <li>Protection anti-robots : Cloudflare Turnstile</li>
        </ul>
      </LegalSection>

      <LegalSection title="Nature du service">
        <p>
          PostureAtWork est un outil d&apos;information et de prévention en ergonomie. Il ne fournit ni diagnostic médical ni
          traitement et ne remplace pas l&apos;avis d&apos;un professionnel de santé. En cas de douleur persistante, intense ou
          accompagnée de signes inhabituels, consultez un médecin ou un kinésithérapeute.
        </p>
      </LegalSection>

      <LegalSection title="Liens affiliés">
        <p>
          Certaines recommandations de matériel contiennent des liens affiliés (Amazon Partenaires). Si vous achetez via ces
          liens, PAW peut percevoir une commission, sans surcoût pour vous. Les recommandations sont formulées indépendamment de
          cette commission.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Les textes, exercices, questionnaires, illustrations et le code de PostureAtWork sont protégés. Toute reproduction
          sans autorisation écrite est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement de vos données est décrit dans notre{" "}
          <a href="/politique-confidentialite" style={{ color: "#6f9bff" }}>politique de confidentialité</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
