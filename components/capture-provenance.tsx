"use client";

import * as React from "react";
import { memoriserProvenance } from "@/src/lib/provenance";

/**
 * Retient, à l'arrivée du visiteur, le lien suivi (UTM) ou le site qui l'a
 * amené. Les formulaires joignent ensuite cette provenance à la demande.
 * Sans rendu : ce composant ne fait qu'observer.
 */
export function CaptureProvenance() {
  React.useEffect(() => {
    // L'admin n'est pas un parcours visiteur.
    if (window.location.pathname.startsWith("/admin")) return;
    memoriserProvenance();
  }, []);
  return null;
}
