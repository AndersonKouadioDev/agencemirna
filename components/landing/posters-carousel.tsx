import { getActiveAnnonces } from "@/src/actions/public";
import PostersCarouselClient, {
  type PosterItem,
} from "./posters-carousel-client";

/**
 * Wrapper Server Component : charge les promotions actives depuis Supabase
 * et les transforme en posters pour le carousel horizontal sous le hero.
 *
 * Si aucune promo active → la section ne s'affiche pas (silencieux).
 * Idée : l'admin publie des "affiches/créas" via /admin/annonces et elles
 * apparaissent automatiquement ici (en plus de /annonces et du marquee).
 */
export default async function PostersCarousel() {
  const promos = await getActiveAnnonces();

  if (promos.length === 0) return null;

  const posters: PosterItem[] = promos.map((p) => ({
    id: p.id,
    title: p.title,
    image: p.image || "/images/placeholder.jpg",
    href: p.cta_url || "/annonces",
  }));

  return <PostersCarouselClient posters={posters} />;
}
