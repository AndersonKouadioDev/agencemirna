import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales | Agence Mirna",
  description: "Conditions générales de vente et d'utilisation",
};

export default function ConditionsGeneralesPage() {
  return (
    <div className="bg-[#FAF5EE] min-h-screen pt-40 sm:pt-48 pb-20">
      <div className="container mx-auto max-w-4xl px-6 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
        <h1 className="text-4xl font-bold font-agate text-secondary mb-8">Conditions Générales</h1>
        
        <div className="prose max-w-none text-stone-600 space-y-6">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">1. Objet</h2>
          <p>Les présentes conditions générales ont pour objet de définir les modalités de mise à disposition des services du site Agence Mirna, ainsi que les conditions d&apos;utilisation du service par l&apos;utilisateur.</p>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">2. Services immobiliers</h2>
          <p>L&apos;Agence Mirna agit en tant qu&apos;intermédiaire dans les transactions immobilières (vente, location, gestion). Les informations présentées sur le site le sont à titre indicatif et ne constituent pas un document contractuel.</p>
          
          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">3. Honoraires</h2>
          <p>Nos honoraires de transaction ou de location sont affichés en agence et peuvent être consultés sur simple demande. Ils sont conformes à la réglementation en vigueur en Côte d&apos;Ivoire.</p>

          <h2 className="text-2xl font-bold text-secondary mt-8 mb-4">4. Propriété intellectuelle</h2>
          <p>Tous les éléments du site (textes, images, logos) sont protégés par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable.</p>
        </div>
      </div>
    </div>
  );
}
