"use client";

import * as React from "react";
import { NOM_CHAMP_PIEGE, type ControleAntiRobot } from "@/src/lib/anti-spam";

/**
 * Protection anti-robots des formulaires publics, sans service tiers :
 *
 *   const { piegeRef, controle } = useAntiRobot();
 *   <form>… <ChampPiege ref={piegeRef} /> …</form>
 *   await createLead({ …, anti_robot: controle() });
 *
 * - le champ piège est invisible pour un visiteur, mais les robots qui
 *   remplissent tous les champs d'une page le remplissent aussi ;
 * - la durée entre l'affichage du formulaire et l'envoi est mesurée par le
 *   navigateur (et non comparée à l'heure du serveur, que l'horloge du
 *   téléphone peut contredire).
 *
 * Le tri lui-même se fait côté serveur, dans src/lib/anti-spam.ts.
 */
export function useAntiRobot() {
  const affichageA = React.useRef<number | null>(null);
  const piegeRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    affichageA.current = Date.now();
  }, []);

  const controle = React.useCallback(
    (): ControleAntiRobot => ({
      piege: piegeRef.current?.value ?? "",
      duree_ms:
        affichageA.current === null ? null : Date.now() - affichageA.current,
    }),
    [],
  );

  return { piegeRef, controle };
}

/**
 * Hors écran plutôt qu'en `display: none` : certains robots sautent les champs
 * masqués. Exclu de la navigation au clavier et des lecteurs d'écran.
 */
export function ChampPiege({ ref }: { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label>
        Ne pas remplir ce champ
        <input
          ref={ref}
          type="text"
          name={NOM_CHAMP_PIEGE}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
