import { estMeuble, estVente } from "@/src/lib/bien-nature";
import { montantUtile, prixPrincipal, prixSurDemande } from "@/src/lib/bien-prix";
import { texteBrut } from "@/src/lib/texte-brut";
import { getAllBiens } from "@/src/actions/bien.actions";
import PropertyCard from "@/components/property-card";
import { formatNumber } from "@/utils/formatNumber";

/**
 * `getAllBiens()` renvoie `any[]` : sans ce type local, une colonne fantôme
 * passait inaperçue de tsc et arrivait à `undefined` dans la carte — c'est ce
 * qui rendait ici le lien d'adresse inerte pendant des mois. Il ne liste que
 * les colonnes réellement présentes dans `biens`.
 */
type BienCarte = {
  id: string;
  image: string | null;
  name: string | null;
  ville_commune: string | null;
  address?: string | null;
  localisation: string | null;
  description: string | null;
  short_description: string | null;
  capacity: number | null;
  area: string | number | null;
  chambre: number | null;
  salle_bains: number | null;
  prix: number | null;
  prix_month: number | null;
  prix_sur_demande?: boolean | null;
  commune_id?: string | null;
  quartier_id?: string | null;
  type_bien_id?: number | null;
  service_bien_id?: number | null;
  services_bien?: {
    name: string | null;
    est_vente?: boolean | null;
    est_meuble?: boolean | null;
  } | null;
  categories_bien?: {
    name: string | null;
    est_meuble?: boolean | null;
  } | null;
};

/** Trois cartes : la grille en compte trois par rangée. */
const NOMBRE_DE_CARTES = 3;

/**
 * Deux prix sont « du même ordre » en deçà de cet écart relatif. 35 % est
 * large à dessein : un catalogue de douze biens ne permet pas d'être exigeant,
 * et ce critère ne sert qu'à départager, jamais à exclure.
 */
const ECART_DE_PRIX_TOLERE = 0.35;

/**
 * Proximité entre deux biens, du plus lourd au plus léger.
 *
 * Les points ne servent qu'à CLASSER. Ce qui exclut un bien est décidé plus
 * bas, et séparément : un critère de tri ne doit jamais pouvoir rattraper une
 * incompatibilité de nature, sans quoi un bien en vente très bien situé
 * repasserait devant une location meublée quelconque.
 */
function proximite(candidat: BienCarte, courant: BienCarte): number {
  let points = 0;

  // Le quartier prime sur la commune : c'est l'échelle à laquelle un acheteur
  // compare réellement deux biens. Les deux ne se cumulent pas — un même
  // quartier implique une même commune, le compter deux fois écraserait tous
  // les autres critères.
  if (courant.quartier_id && candidat.quartier_id === courant.quartier_id) {
    points += 5;
  } else if (courant.commune_id && candidat.commune_id === courant.commune_id) {
    points += 3;
  }

  // Un studio et une villa ne se substituent pas, même dans la même rue.
  if (courant.type_bien_id && candidat.type_bien_id === courant.type_bien_id) {
    points += 3;
  }

  // Deux services peuvent partager une nature sans être le même service
  // (« Gestion locative » et « Location meublée » sont deux locations).
  if (
    courant.service_bien_id &&
    candidat.service_bien_id === courant.service_bien_id
  ) {
    points += 2;
  }

  // Budget comparable. Les deux biens ayant forcément la même nature à ce
  // stade, `prixPrincipal` leur applique la même unité : on compare bien des
  // loyers à des loyers, ou des prix de vente à des prix de vente.
  const prixCourant = prixPrincipal(courant);
  const prixCandidat = prixPrincipal(candidat);
  if (!prixCourant.surDemande && !prixCandidat.surDemande) {
    const ecart =
      Math.abs(prixCandidat.montant - prixCourant.montant) / prixCourant.montant;
    if (ecart <= ECART_DE_PRIX_TOLERE) points += 2;
  }

  // Un couple qui cherche deux chambres ne se voit pas proposer un six-pièces.
  if (courant.chambre != null && candidat.chambre != null) {
    if (Math.abs(candidat.chambre - courant.chambre) <= 1) points += 1;
  }

  return points;
}

/**
 * Les biens réellement comparables, les mieux classés d'abord.
 *
 * La nature est ÉLIMINATOIRE, et c'est tout le correctif : la section ne
 * retenait jusqu'ici que les trois biens les plus récents du catalogue, si
 * bien qu'un visiteur en train de consulter une location meublée se voyait
 * proposer des terrains à vendre. Un prix de vente et un tarif à la nuitée ne
 * se comparent pas — les cartes affichaient d'ailleurs « /jour » à côté d'un
 * montant sec, dans la même rangée.
 *
 * Mieux vaut une seule carte juste que trois dont deux sont hors sujet : on ne
 * complète donc jamais la rangée avec des biens d'une autre nature.
 */
function biensComparables(
  tous: BienCarte[],
  courant: BienCarte,
): BienCarte[] {
  const venteCourante = estVente(courant);
  const meubleCourant = estMeuble(courant);

  return tous
    .filter(
      (bien) =>
        bien.id !== courant.id &&
        estVente(bien) === venteCourante &&
        estMeuble(bien) === meubleCourant,
    )
    .map((bien) => ({ bien, score: proximite(bien, courant) }))
    // `sort` est stable depuis ES2019 : à score égal, l'ordre d'entrée est
    // conservé, et `getAllBiens` trie déjà du plus récent au plus ancien.
    .sort((a, b) => b.score - a.score)
    .slice(0, NOMBRE_DE_CARTES)
    .map(({ bien }) => bien);
}

export default async function SimilarProperties({
  bien: bienCourant,
}: {
  bien: BienCarte;
}) {
  const allBiens = (await getAllBiens()) as BienCarte[];
  const similarBiens = biensComparables(allBiens, bienCourant);

  if (similarBiens.length === 0) {
    return null;
  }

  // Le titre annonçait « d'autres propriétés exclusives » quelle que soit la
  // nature du bien consulté. Le dire juste coûte une ligne.
  const sousTitre = estVente(bienCourant)
    ? "D'autres biens à vendre dans notre catalogue."
    : estMeuble(bienCourant)
      ? "D'autres locations meublées dans notre catalogue."
      : "D'autres biens à louer dans notre catalogue.";

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-agate font-bold text-secondary">
            Ces biens pourraient aussi vous intéresser
          </h2>
          <p className="text-stone-500 mt-2">{sousTitre}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {similarBiens.map((bien) => {
            const prixJour = montantUtile(bien.prix);
            const prixMois = montantUtile(bien.prix_month);

            return (
              <PropertyCard
                key={bien.id}
                id={bien.id}
                imageUrl={bien.image}
                altText={bien.name || "Bien"}
                // « Abidjan » était écrit en dur : la carte affirmait une
                // commune sur un bien qui n'en a pas. La carte masque déjà
                // l'épingle quand l'adresse est vide.
                address={bien.address?.trim() || bien.ville_commune || ""}
                title={bien.name || "Bien immobilier"}
                // La colonne est `localisation` ; `lien_localisation` n'existe
                // pas dans `biens` et arrivait donc toujours à `undefined`.
                localisation={bien.localisation ?? undefined}
                // `short_description` existe précisément pour cette ligne
                // tronquée : la description longue y était coupée net. Et
                // celle-ci se saisit maintenant en texte riche — sans
                // `texteBrut`, un « ## » de titre s'afficherait tel quel.
                detail={
                  bien.short_description?.trim() || texteBrut(bien.description)
                }
                capacity={bien.capacity ?? undefined}
                area={bien.area ? `${bien.area} m²` : undefined}
                bedrooms={bien.chambre ?? undefined}
                bathrooms={bien.salle_bains ?? undefined}
                status={bien.services_bien?.name || "Disponible"}
                furnished={estMeuble(bien)}
                forSale={estVente(bien)}
                price={prixJour != null ? `${formatNumber(prixJour)} FCFA` : ""}
                pricePerMonth={
                  prixMois != null ? `${formatNumber(prixMois)} FCFA` : ""
                }
                priceOnRequest={prixSurDemande(bien)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
