import { listTaxonomy } from "@/src/actions/admin/taxonomy";
import { TaxonomyManager } from "./taxonomy-manager";

export const metadata = { title: "Types, services et catégories" };

/**
 * Gestion des taxonomies de bien.
 *
 * Ces trois listes pilotent à la fois la création d'un bien, le filtrage du
 * catalogue et la navigation du site. Elles n'étaient jusqu'ici modifiables
 * que directement en base : le composant existait mais n'était monté sur
 * aucune route.
 */
export default async function AdminTaxonomiePage() {
  const [types, services, categories] = await Promise.all([
    listTaxonomy("types_bien"),
    listTaxonomy("services_bien"),
    listTaxonomy("categories_bien"),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Types, services et catégories
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ces listes alimentent la création d&apos;un bien, les filtres du
          catalogue et le menu du site. Une entrée sans bien rattaché
          n&apos;apparaît pas dans la navigation.
        </p>
      </div>

      <div className="space-y-6">
        <TaxonomyManager
          table="types_bien"
          title="Types de bien"
          description="Villa, Appartement, Terrain… Le type décrit la nature du bien."
          items={types}
        />
        <TaxonomyManager
          table="services_bien"
          title="Services"
          description="Vente, Location meublée, Gestion locative, Construction. Ce que l'agence propose sur ce bien. Ces quatre libellés sont repris mot pour mot par les pages /services et par le bandeau défilant : les renommer demande une intervention sur le code."
          items={services}
        />
        <TaxonomyManager
          table="categories_bien"
          title="Catégories d'ameublement"
          description="Meublé, Non meublé, Semi-meublé. C'est cette valeur qui déclenche l'affichage du tarif à la nuitée, et c'est l'orthographe exacte qui compte : le site cherche le mot « meublé » dans le libellé."
          items={categories}
        />
      </div>
    </div>
  );
}
