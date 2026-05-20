"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Barre de recherche intégrée au hero — redirige vers /properties
 * avec les query params correspondants pour pré-remplir les filtres.
 *
 * Visuel inspiré des sites premium (Airbnb-like) : 3 champs collés
 * dans un container blanc arrondi, bouton circulaire à droite.
 */
export default function HeroSearchBar() {
  const router = useRouter();
  const [type, setType] = React.useState("");
  const [service, setService] = React.useState("");
  const [search, setSearch] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (type) params.set("type", type);
    if (service) params.set("service", service);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-xl border border-stone-200 p-2 flex flex-col sm:flex-row gap-2 sm:items-stretch"
    >
      {/* Champ recherche */}
      <div className="flex-1 sm:border-r sm:border-stone-200 px-4 py-3">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-0.5">
          Recherche
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cocody, Plateau…"
          className="w-full text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Select type */}
      <div className="sm:border-r sm:border-stone-200 px-4 py-3 min-w-[140px]">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-0.5">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full text-sm font-medium text-neutral-900 focus:outline-none bg-transparent cursor-pointer"
        >
          <option value="">Tous</option>
          <option value="appartement">Appartement</option>
          <option value="studio">Studio</option>
          <option value="villa">Villa</option>
          <option value="terrain">Terrain</option>
          <option value="duplex">Duplex</option>
        </select>
      </div>

      {/* Select service (transaction) */}
      <div className="sm:border-r sm:border-stone-200 px-4 py-3 min-w-[120px]">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-0.5">
          Service
        </label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full text-sm font-medium text-neutral-900 focus:outline-none bg-transparent cursor-pointer"
        >
          <option value="">Tous</option>
          <option value="vente">Vente</option>
          <option value="location">Location</option>
        </select>
      </div>

      {/* Bouton rechercher */}
      <Button
        type="submit"
        size="lg"
        className="rounded-xl sm:rounded-xl sm:w-auto h-auto px-6 sm:px-8 self-stretch"
      >
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="sm:inline">Rechercher</span>
      </Button>
    </form>
  );
}
