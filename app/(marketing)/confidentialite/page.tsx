import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Agence Mirna",
  description: "Protection de vos données personnelles",
};

export default function ConfidentialitePage() {
  return (
    <div className="bg-[#FAF5EE] min-h-screen pt-40 sm:pt-48 pb-20">
      <div className="container mx-auto max-w-4xl px-6 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
        <h1 className="text-4xl font-bold font-agate text-secondary mb-8">Politique de Confidentialité</h1>
        
        <div className="prose max-w-none text-stone-600 space-y-6">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">1. Collecte des données</h2>
          <p>Nous collectons les informations que vous nous fournissez volontairement, notamment lors de l&apos;utilisation des formulaires de contact, de demande d&apos;estimation ou de demande de visite (nom, prénom, email, téléphone).</p>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">2. Utilisation des données</h2>
          <p>Les informations recueillies sont utilisées exclusivement pour :</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Vous recontacter suite à une demande</li>
            <li>Gérer votre dossier client</li>
            <li>Vous envoyer des propositions de biens correspondants à vos critères</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">3. Protection des données</h2>
          <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès, modification ou destruction non autorisée. Vos données ne sont jamais vendues à des tiers.</p>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">4. Vos droits</h2>
          <p>Vous disposez d&apos;un droit d&apos;accès, de rectification, et de suppression de vos données personnelles. Pour exercer ce droit, veuillez nous contacter via la page Contact de notre site.</p>
        </div>
      </div>
    </div>
  );
}
