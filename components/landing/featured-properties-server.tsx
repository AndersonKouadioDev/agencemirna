import { getAllBiens } from "@/src/actions/bien.actions";
import FeaturedPropertiesCarousel from "./featured-properties-carousel";

/**
 * Wrapper Server Component qui charge les 9 biens les plus récents
 * et les passe au carousel client.
 */
export default async function FeaturedPropertiesServer() {
  const all = await getAllBiens();
  const biens = (all ?? []).slice(0, 9);
  return <FeaturedPropertiesCarousel biens={biens} />;
}
