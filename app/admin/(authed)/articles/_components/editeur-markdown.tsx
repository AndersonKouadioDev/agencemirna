"use client";

import * as React from "react";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  type LucideIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Zone de saisie markdown accompagnée d'une barre d'outils.
 *
 * Le client a écarté l'éditeur visuel : le texte reste du markdown, enregistré
 * tel quel et rendu par le moteur maison de la vitrine, qui ne construit que
 * des éléments React. La barre ci-dessous n'est donc qu'un raccourci de
 * frappe — tout ce qu'elle insère reste relisible et corrigeable à la main
 * dans la zone de texte, et rien ne peut s'y glisser que le moteur ne sache
 * rendre.
 *
 * Les motifs des outils « ligne » sont calqués sur ceux du moteur
 * (article-markdown.tsx) : un bouton qui reconnaîtrait moins de formes que lui
 * réempilerait son préfixe sur une ligne déjà mise en forme à la main.
 */

type OutilBase = { cle: string; libelle: string; icone: LucideIcon };

type Outil =
  | (OutilBase & {
      genre: "enveloppe";
      avant: string;
      apres: string;
      exemple: string;
    })
  | (OutilBase & {
      genre: "ligne";
      /** `rang` ne compte que les lignes non vides : les listes numérotées. */
      prefixe: (rang: number) => string;
      /** Reconnaît la ligne déjà mise en forme, et sert à retirer le préfixe. */
      motif: RegExp;
      exemple: string;
    })
  | (OutilBase & { genre: "lien"; exemple: string });

const OUTILS: readonly Outil[] = [
  {
    cle: "gras",
    libelle: "Gras",
    icone: Bold,
    genre: "enveloppe",
    avant: "**",
    apres: "**",
    exemple: "texte en gras",
  },
  {
    cle: "italique",
    libelle: "Italique",
    icone: Italic,
    genre: "enveloppe",
    avant: "*",
    apres: "*",
    exemple: "texte en italique",
  },
  {
    cle: "titre",
    libelle: "Titre",
    icone: Heading2,
    genre: "ligne",
    prefixe: () => "## ",
    motif: /^\s*#{1,6}\s+/,
    exemple: "Titre de partie",
  },
  {
    cle: "liste",
    libelle: "Liste à puces",
    icone: List,
    genre: "ligne",
    prefixe: () => "- ",
    motif: /^\s*[-*+]\s+/,
    exemple: "premier point",
  },
  {
    cle: "liste-numerotee",
    libelle: "Liste numérotée",
    icone: ListOrdered,
    genre: "ligne",
    prefixe: (rang) => `${rang + 1}. `,
    motif: /^\s*\d+[.)]\s+/,
    exemple: "première étape",
  },
  {
    cle: "lien",
    libelle: "Lien",
    icone: Link2,
    genre: "lien",
    exemple: "libellé du lien",
  },
  {
    cle: "citation",
    libelle: "Citation",
    icone: Quote,
    genre: "ligne",
    prefixe: () => "> ",
    motif: /^\s*>\s?/,
    exemple: "citation à mettre en avant",
  },
];

/** Une sélection qui ressemble à une adresse sert de cible, pas de libellé. */
const RESSEMBLE_A_UNE_URL = /^(https?:\/\/|\/|mailto:|tel:)/i;

export function EditeurMarkdown({
  valeur,
  onChange,
  id,
  rows = 10,
  disabled,
  placeholder,
}: {
  valeur: string;
  onChange: (valeur: string) => void;
  id?: string;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  const refZone = React.useRef<HTMLTextAreaElement>(null);

  // La valeur remonte au parent : au retour du rendu, le navigateur a replacé
  // le curseur en fin de champ. On mémorise la sélection voulue pour la
  // reposer une fois la nouvelle valeur affichée, sinon chaque clic de la
  // barre d'outils éjecte le rédacteur de sa phrase.
  const selectionEnAttente = React.useRef<[number, number] | null>(null);

  React.useEffect(() => {
    const cible = selectionEnAttente.current;
    if (!cible) return;
    selectionEnAttente.current = null;
    const zone = refZone.current;
    if (!zone) return;
    zone.focus();
    zone.setSelectionRange(cible[0], cible[1]);
  });

  function poser(texte: string, debutSelection: number, finSelection: number) {
    selectionEnAttente.current = [debutSelection, finSelection];
    onChange(texte);
  }

  function appliquer(outil: Outil) {
    const zone = refZone.current;
    if (!zone) return;
    const debut = zone.selectionStart;
    const fin = zone.selectionEnd;
    const selection = valeur.slice(debut, fin);

    if (outil.genre === "ligne") {
      // Titre, listes et citation portent sur des lignes entières : on étend la
      // sélection aux bords des lignes touchées avant de préfixer.
      const debutBloc = valeur.lastIndexOf("\n", debut - 1) + 1;
      const finBrute = valeur.indexOf("\n", fin);
      const finBloc = finBrute === -1 ? valeur.length : finBrute;
      const bloc = valeur.slice(debutBloc, finBloc);
      const lignes = bloc.trim() === "" ? [outil.exemple] : bloc.split("\n");

      // Une ligne vide au milieu d'une sélection n'est pas un point de liste :
      // la préfixer produirait un « - » orphelin que le moteur rend en puce
      // vide, et décalerait la numérotation d'une liste ordonnée.
      const utiles = lignes.filter((ligne) => ligne.trim() !== "");
      // Un second clic retire le préfixe au lieu de l'empiler : sans cela, une
      // hésitation produisait « ## ## Titre », que le moteur rend en texte.
      const dejaPose =
        utiles.length > 0 && utiles.every((ligne) => outil.motif.test(ligne));

      let rang = 0;
      const transformees = lignes.map((ligne) => {
        if (ligne.trim() === "") return ligne;
        return dejaPose
          ? ligne.replace(outil.motif, "")
          : outil.prefixe(rang++) + ligne;
      });
      const remplacement = transformees.join("\n");
      poser(
        valeur.slice(0, debutBloc) + remplacement + valeur.slice(finBloc),
        debutBloc,
        debutBloc + remplacement.length,
      );
      return;
    }

    if (outil.genre === "lien") {
      const estUrl = RESSEMBLE_A_UNE_URL.test(selection.trim());
      const libelle = estUrl ? outil.exemple : selection || outil.exemple;
      const cible = estUrl ? selection.trim() : "https://";
      const remplacement = `[${libelle}](${cible})`;
      // On présélectionne la moitié qui reste à saisir : l'adresse quand le
      // rédacteur avait sélectionné son libellé, le libellé quand il venait de
      // coller une adresse.
      const debutLibelle = debut + 1;
      const debutCible = debutLibelle + libelle.length + 2;
      poser(
        valeur.slice(0, debut) + remplacement + valeur.slice(fin),
        estUrl ? debutLibelle : debutCible,
        estUrl ? debutLibelle + libelle.length : debutCible + cible.length,
      );
      return;
    }

    const texte = selection || outil.exemple;
    const remplacement = outil.avant + texte + outil.apres;
    const debutTexte = debut + outil.avant.length;
    poser(
      valeur.slice(0, debut) + remplacement + valeur.slice(fin),
      debutTexte,
      debutTexte + texte.length,
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-input bg-stone-50 px-1.5 py-1">
        {OUTILS.map((outil) => {
          const Icone = outil.icone;
          return (
            <button
              key={outil.cle}
              type="button"
              onClick={() => appliquer(outil)}
              disabled={disabled}
              title={outil.libelle}
              aria-label={outil.libelle}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded text-neutral-600 transition-colors",
                "hover:bg-white hover:text-secondary hover:shadow-sm",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Icone className="h-3.5 w-3.5" />
            </button>
          );
        })}
        <span className="ml-auto pr-1 text-[11px] text-neutral-400">
          Markdown
        </span>
      </div>
      <Textarea
        id={id}
        ref={refZone}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-t-none font-mono text-[13px] leading-relaxed"
      />
    </div>
  );
}
