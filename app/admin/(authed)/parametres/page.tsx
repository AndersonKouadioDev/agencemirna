import { listTaxonomy } from "@/src/actions/admin/taxonomy";
import { TaxonomyManager } from "./taxonomy-manager";

export const metadata = { title: "Paramètres · Admin Mirna" };

export default async function AdminParametresPage() {
  const [types, services, categories] = await Promise.all([
    listTaxonomy("types_bien"),
    listTaxonomy("services_bien"),
    listTaxonomy("categories_bien"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configuration des référentiels utilisés dans la création de biens.
          Ajoutez, renommez ou supprimez les types, services et catégories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaxonomyManager
          table="types_bien"
          title="Types de bien"
          description="Appartement, Studio, Villa, Terrain, etc."
          items={types}
        />
        <TaxonomyManager
          table="services_bien"
          title="Services / Transactions"
          description="Vente, Location, Bail commercial, Gestion locative, etc."
          items={services}
        />
        <TaxonomyManager
          table="categories_bien"
          title="Catégories"
          description="Meublé, Non meublé, Semi-meublé."
          items={categories}
        />
      </div>
    </div>
  );
}
