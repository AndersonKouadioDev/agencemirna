
"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Edit, Trash2, EyeOff, Eye, Loader2 } from "lucide-react";
import { CommuneAdminRow, toggleCommuneActive, deleteCommune } from "@/src/actions/admin/communes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function CommunesGrid({ items }: { items: CommuneAdminRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleActive(id: string, current: boolean) {
    if (loadingId) return;
    setLoadingId(id);
    await toggleCommuneActive(id, !current);
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    if (loadingId || !confirm("Supprimer cette commune définitivement ?")) return;
    setLoadingId(id);
    await deleteCommune(id);
    setLoadingId(null);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className={`relative bg-white rounded-xl border p-4 transition-all ${!item.is_active ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md'}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{item.nom}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/communes/${item.id}`}><Edit className="h-4 w-4 mr-2" /> Modifier</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleActive(item.id, item.is_active)}>
                  {item.is_active ? (<><EyeOff className="h-4 w-4 mr-2" /> Désactiver</>) : (<><Eye className="h-4 w-4 mr-2" /> Activer</>)}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-stone-500 font-mono">/{item.slug}</p>
          {loadingId === item.id && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl backdrop-blur-sm z-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
