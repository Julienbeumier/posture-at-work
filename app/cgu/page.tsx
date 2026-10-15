import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";

// Projet de CGU à faire relire par un juriste avant publication : non indexé tant que ce n'est pas fait.
export const metadata: Metadata = {
  title: "Conditions générales d'utilisation et de vente",
  robots: { index: false, follow: false },
};

export default function CGU() {
  return (
    <LegalPage title="Conditions générales d'utilisation et de vente" updated="octobre 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions encadrent l&apos;utilisation de PostureAtWork (« PAW »), un service en ligne de bilan
          ergonomique comprenant un questionnaire, une analyse vidéo par intelligence artificielle, des conseils et des
          exercices, ainsi que l&apos;offre PAW Entreprise destinée aux employeurs.
        </p>
      </LegalSection>

      <LegalSection title="2. Nature du service — pas un avis médical">
        <p>
          PAW fournit des informations de prévention et d&apos;ergonomie. Il ne pose aucun diagnostic et ne remplace pas une
          consultation médicale ou paramédicale. L&apos;analyse vidéo est réalisée par une IA à partir d&apos;images fixes : elle
          peut être inexacte. En cas de douleur persistante ou inhabituelle, consultez un professionnel de santé.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte et accès">
        <p>
          Le questionnaire peut être utilisé gratuitement. Certaines fonctions (analyse détaillée par dimension, analyse
          vidéo, exercices) sont réservées à l&apos;offre premium. Vous êtes responsable de la confidentialité de vos
          identifiants.
        </p>
      </LegalSection>

      <LegalSection title="4. Offre premium (particuliers)">
        <p>
          L&apos;offre premium est vendue au prix de 19,99 € TTC, en un paiement unique, sans abonnement ni renouvellement
          automatique. L&apos;accès est accordé pour la durée d&apos;exploitation du service. Le paiement est traité par
          Stripe.
        </p>
        <p style={{ marginTop: 8 }}>
          Droit de rétractation : [À COMPLÉTER APRÈS AVIS JURIDIQUE — le contenu numérique fourni immédiatement peut faire
          l&apos;objet d&apos;une renonciation expresse au droit de rétractation de 14 jours ; la case correspondante devra
          figurer avant le paiement].
        </p>
      </LegalSection>

      <LegalSection title="5. Offre PAW Entreprise">
        <p>
          L&apos;employeur dispose d&apos;un tableau de bord présentant exclusivement des résultats agrégés. Les réponses
          individuelles des employés ne lui sont pas communiquées. La participation des employés est volontaire. Conditions
          tarifaires et durée : définies dans le devis ou le contrat de l&apos;entreprise. [À COMPLÉTER]
        </p>
      </LegalSection>

      <LegalSection title="6. Données personnelles">
        <p>
          Les données de santé sont traitées avec votre consentement et uniquement pour fournir le service. Voir la{" "}
          <a href="/politique-confidentialite" style={{ color: "#6f9bff" }}>politique de confidentialité</a>.
        </p>
      </LegalSection>

      <LegalSection title="7. Liens affiliés et produits tiers">
        <p>
          Les produits recommandés sont vendus par des tiers (par exemple Amazon). PAW n&apos;est pas partie à ces ventes et
          peut percevoir une commission d&apos;affiliation. Les effets des produits varient selon les personnes.
        </p>
      </LegalSection>

      <LegalSection title="8. Responsabilité">
        <p>
          PAW s&apos;efforce de fournir des contenus fiables mais ne garantit pas de résultat sur votre santé. La responsabilité
          de PAW ne saurait être engagée pour un usage des conseils contraire à leur finalité de prévention. [À COMPLÉTER APRÈS
          AVIS JURIDIQUE]
        </p>
      </LegalSection>

      <LegalSection title="9. Droit applicable">
        <p>
          Droit belge. En cas de litige, les parties recherchent une solution amiable avant toute action. Les consommateurs
          peuvent recourir au service de médiation de la Belgique ou à la plateforme européenne de règlement en ligne des
          litiges. [À COMPLÉTER]
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p><a href="mailto:hello@postureatwork.com" style={{ color: "#6f9bff" }}>hello@postureatwork.com</a></p>
      </LegalSection>
    </LegalPage>
  );
}
