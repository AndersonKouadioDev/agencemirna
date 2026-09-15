import { getPublicitesPourEmplacement } from "@/src/actions/public";
import { emplacementPub, type CleEmplacement } from "@/src/lib/publicites";
import { PubCarte } from "./pub-carte";
import { CarrouselPub } from "./carrousel-pub";

/**
 * Une balise à poser dans une page : l'endroit où les publicités de cet
 * emplacement s'affichent.
 *
 * Elle ne rend RIEN quand il n'y a rien — pas de cadre, pas d'espace réservé,
 * pas de « votre publicité ici ». Une page sans pub doit être exactement la
 * page d'avant. Une pub : elle seule. Plusieurs : un carrousel.
 *
 * Server Component : la lecture se fait au rendu, et la table absente
 * (migration 0027 non appliquée) renvoie un tableau vide.
 */
export async function EmplacementPub({
  cle,
  className,
}: {
  cle: CleEmplacement;
  className?: string;
}) {
  const definition = emplacementPub(cle);
  if (!definition) return null;

  const pubs = await getPublicitesPourEmplacement(cle);
  if (pubs.length === 0) return null;

  return (
    <div className={className} data-emplacement-pub={cle}>
      {pubs.length === 1 ? (
        <PubCarte pub={pubs[0]} format={definition.format} />
      ) : (
        <CarrouselPub pubs={pubs} format={definition.format} />
      )}
    </div>
  );
}
