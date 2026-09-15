"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/app/admin/_components/image-uploader";
import type {
  ArticleSectionRow,
} from "@/src/actions/admin/content";
import { POSITIONS_IMAGE, type PositionImage } from "@/src/lib/article-sections";
import { ApercuSection } from "./apercu-section";
import { EditeurMarkdown } from "@/app/admin/_components/editeur-markdown";

/**
 * Éditeur du corps d'article : une liste de sections ordonnées.
 *
 * Le rang en base est recalculé par `upsertArticle` à partir de l'ordre du
 * tableau : l'interface n'a donc qu'à déplacer les entrées, jamais à saisir
 * un numéro.
 */

/**
 * Section telle que la manipule le formulaire.
 *
 * `cle` n'existe que côté client : une section jamais enregistrée n'a pas
 * encore d'`id`, et se servir de l'index comme clé React remélangeait l'état
 * des champs à chaque déplacement (le texte suivait la position, pas la
 * section).
 */
export type SectionBrouillon = {
  cle: string;
  id?: string;
  titre: string;
  contenu_md: string;
  images: string[];
  position_image: PositionImage;
};

/** Le compteur ne sert qu'à distinguer deux sections de la même page. */
let compteurCles = 0;

export function creerSectionVide(): SectionBrouillon {
  compteurCles += 1;
  return {
    cle: `nouvelle-${compteurCles}`,
    titre: "",
    contenu_md: "",
    images: [],
    position_image: "droite",
  };
}

export function sectionsDepuisBase(
  lignes: ArticleSectionRow[],
): SectionBrouillon[] {
  return lignes.map((ligne) => ({
    cle: ligne.id,
    id: ligne.id,
    titre: ligne.titre ?? "",
    contenu_md: ligne.contenu_md ?? "",
    images: ligne.images ?? [],
    position_image: ligne.position_image,
  }));
}

/**
 * Libellés des dispositions.
 *
 * Volontairement un `Record` exhaustif plutôt qu'une liste libre : ajouter une
 * position au contrat sans l'expliquer au rédacteur casse la compilation ici.
 * Les libellés sont de l'interface, pas du contrat : ils restent ici. Seule la
 * LISTE des positions est importée, pour qu'il n'y en ait qu'une à tenir.
 */
const DISPOSITIONS: Record<PositionImage, { libelle: string; aide: string }> = {
  gauche: {
    libelle: "Images à gauche",
    aide: "Les images tiennent la colonne de gauche, le texte se lit à droite.",
  },
  centre: {
    libelle: "Images centrées",
    aide: "Les images s'affichent pleine largeur, le texte vient dessous.",
  },
  droite: {
    libelle: "Images à droite",
    aide: "Le texte se lit à gauche, les images tiennent la colonne de droite.",
  },
  entoure: {
    libelle: "Texte autour des images",
    aide: "Les images flottent dans le texte, qui s'enroule autour d'elles.",
  },
};

// Ordre d'affichage : celui du contrat, pour qu'une position ajoutée en base
// apparaisse sans retoucher ce fichier.
const ORDRE_DISPOSITIONS: readonly PositionImage[] = POSITIONS_IMAGE;

export function EditeurSections({
  sections,
  onChange,
  pathPrefix,
  titreArticle,
  disabled,
  onEnvoiChange,
}: {
  sections: SectionBrouillon[];
  onChange: (sections: SectionBrouillon[]) => void;
  pathPrefix: string;
  /** Sert d'alternative textuelle aux images dans l'aperçu, comme en ligne. */
  titreArticle: string;
  disabled?: boolean;
  /** Total des images encore en vol, toutes sections confondues. */
  onEnvoiChange: (enCours: number) => void;
}) {
  // Un article court se lit d'un coup d'œil ; au-delà, tout est replié pour
  // que le formulaire reste parcourable.
  const [ouvertes, setOuvertes] = React.useState<Set<string>>(
    () => new Set(sections.length <= 3 ? sections.map((s) => s.cle) : []),
  );
  const [envois, setEnvois] = React.useState<Record<string, number>>({});

  const totalEnvois = Object.values(envois).reduce((a, b) => a + b, 0);
  const refEnvoiChange = React.useRef(onEnvoiChange);
  React.useEffect(() => {
    refEnvoiChange.current = onEnvoiChange;
  }, [onEnvoiChange]);
  React.useEffect(() => {
    refEnvoiChange.current(totalEnvois);
  }, [totalEnvois]);

  const noterEnvoi = React.useCallback((cle: string, enCours: number) => {
    setEnvois((actuels) =>
      actuels[cle] === enCours ? actuels : { ...actuels, [cle]: enCours },
    );
  }, []);

  // Un <ImageUploader> démonté ne signalera jamais sa fin d'envoi : sans cet
  // oubli explicite, replier ou supprimer une section laissait son compteur
  // non nul et verrouillait « Enregistrer » pour de bon.
  function oublierEnvoi(cle: string) {
    setEnvois((actuels) => {
      if (!(cle in actuels)) return actuels;
      const suite = { ...actuels };
      delete suite[cle];
      return suite;
    });
  }

  function basculer(cle: string) {
    const suite = new Set(ouvertes);
    if (suite.delete(cle)) {
      oublierEnvoi(cle);
    } else {
      suite.add(cle);
    }
    setOuvertes(suite);
  }

  function modifier(cle: string, champs: Partial<SectionBrouillon>) {
    onChange(sections.map((s) => (s.cle === cle ? { ...s, ...champs } : s)));
  }

  function ajouter() {
    const nouvelle = creerSectionVide();
    onChange([...sections, nouvelle]);
    setOuvertes((actuelles) => new Set(actuelles).add(nouvelle.cle));
  }

  function supprimer(section: SectionBrouillon) {
    const aDuContenu =
      section.titre.trim() !== "" ||
      section.contenu_md.trim() !== "" ||
      section.images.length > 0;
    if (
      aDuContenu &&
      !window.confirm(
        "Supprimer cette section ? Son texte et ses images seront retirés de l'article.",
      )
    ) {
      return;
    }
    oublierEnvoi(section.cle);
    onChange(sections.filter((s) => s.cle !== section.cle));
  }

  function deplacer(index: number, sens: -1 | 1) {
    const cible = index + sens;
    if (cible < 0 || cible >= sections.length) return;
    const suite = [...sections];
    [suite[index], suite[cible]] = [suite[cible], suite[index]];
    onChange(suite);
  }

  return (
    <div className="space-y-3">
      {sections.length === 0 && (
        <p className="rounded-lg border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-neutral-500">
          Aucune section : l&apos;article sera publié sans corps de texte.
        </p>
      )}

      <ol className="space-y-3">
        {sections.map((section, index) => (
          <CarteSection
            key={section.cle}
            section={section}
            index={index}
            total={sections.length}
            ouverte={ouvertes.has(section.cle)}
            envoiEnCours={envois[section.cle] ?? 0}
            disabled={disabled}
            pathPrefix={pathPrefix}
            titreArticle={titreArticle}
            onBasculer={() => basculer(section.cle)}
            onModifier={(champs) => modifier(section.cle, champs)}
            onSupprimer={() => supprimer(section)}
            onDeplacer={(sens) => deplacer(index, sens)}
            onEnvoiChange={noterEnvoi}
          />
        ))}
      </ol>

      <Button
        type="button"
        variant="outline"
        onClick={ajouter}
        disabled={disabled}
        className="w-full border-dashed"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Ajouter une section
      </Button>
    </div>
  );
}

// ---------- Une section repliable ----------

function CarteSection({
  section,
  index,
  total,
  ouverte,
  envoiEnCours,
  disabled,
  pathPrefix,
  titreArticle,
  onBasculer,
  onModifier,
  onSupprimer,
  onDeplacer,
  onEnvoiChange,
}: {
  section: SectionBrouillon;
  index: number;
  total: number;
  ouverte: boolean;
  envoiEnCours: number;
  disabled?: boolean;
  pathPrefix: string;
  titreArticle: string;
  onBasculer: () => void;
  onModifier: (champs: Partial<SectionBrouillon>) => void;
  onSupprimer: () => void;
  onDeplacer: (sens: -1 | 1) => void;
  onEnvoiChange: (cle: string, enCours: number) => void;
}) {
  const base = React.useId();
  const idTitre = `${base}-titre`;
  const idTexte = `${base}-texte`;
  const idPosition = `${base}-position`;
  const idCorps = `${base}-corps`;
  const [apercuVisible, setApercuVisible] = React.useState(true);

  const remonterEnvoi = React.useCallback(
    (enCours: number) => onEnvoiChange(section.cle, enCours),
    [onEnvoiChange, section.cle],
  );

  const premiereLigne = section.contenu_md.trim().split("\n")[0] ?? "";
  const resume =
    section.titre.trim() ||
    (premiereLigne
      ? premiereLigne.replace(/^\s*(?:[#>\-*+]+|\d+[.)])\s*/, "")
      : "") ||
    "Section sans titre";

  // Replier ou supprimer pendant un envoi ferait disparaître le téléverseur en
  // pleine course : les photos du lot n'atteindraient jamais le formulaire.
  const gele = envoiEnCours > 0;

  return (
    <li className="rounded-xl border border-stone-200 bg-white">
      <div className="flex items-center gap-1 px-2 py-2 sm:px-3">
        <button
          type="button"
          onClick={onBasculer}
          disabled={gele}
          aria-expanded={ouverte}
          aria-controls={ouverte ? idCorps : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ouverte ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
          )}
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
            {resume}
          </span>
          {section.images.length > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-neutral-600">
              <ImageIcon className="h-3 w-3" />
              {section.images.length}
            </span>
          )}
          {gele && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              Envoi…
            </span>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <BoutonIcone
            libelle="Monter la section"
            onClick={() => onDeplacer(-1)}
            disabled={disabled || index === 0}
          >
            <MoveUp className="h-3.5 w-3.5" />
          </BoutonIcone>
          <BoutonIcone
            libelle="Descendre la section"
            onClick={() => onDeplacer(1)}
            disabled={disabled || index === total - 1}
          >
            <MoveDown className="h-3.5 w-3.5" />
          </BoutonIcone>
          <BoutonIcone
            libelle="Supprimer la section"
            onClick={onSupprimer}
            disabled={disabled || gele}
            danger
          >
            <Trash2 className="h-3.5 w-3.5" />
          </BoutonIcone>
        </div>
      </div>

      {ouverte && (
        <div
          id={idCorps}
          className="space-y-4 border-t border-stone-200 px-4 py-4"
        >
          <div>
            <Label htmlFor={idTitre} className="mb-1.5 block">
              Titre de la section
            </Label>
            <Input
              id={idTitre}
              value={section.titre}
              onChange={(e) => onModifier({ titre: e.target.value })}
              placeholder="Facultatif — ex : Pourquoi investir à Cocody"
              disabled={disabled}
            />
          </div>

          <div>
            <Label className="mb-1.5 block">
              Images de la section (3 maximum)
            </Label>
            <ImageUploader
              value={section.images}
              onChange={(images) => onModifier({ images })}
              onUploadingChange={remonterEnvoi}
              pathPrefix={pathPrefix}
              maxFiles={3}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={idPosition} className="mb-1.5 block">
              Position des images
            </Label>
            <Select
              value={section.position_image}
              onValueChange={(valeur) =>
                onModifier({ position_image: valeur as PositionImage })
              }
              disabled={disabled}
            >
              <SelectTrigger id={idPosition} className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDRE_DISPOSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {DISPOSITIONS[position].libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-neutral-500">
              {DISPOSITIONS[section.position_image].aide}
              {section.images.length === 0 &&
                " Sans image, le texte occupe toute la largeur."}
            </p>
          </div>

          <div>
            <Label htmlFor={idTexte} className="mb-1.5 block">
              Texte de la section
            </Label>
            <EditeurMarkdown
              id={idTexte}
              valeur={section.contenu_md}
              onChange={(contenu_md) => onModifier({ contenu_md })}
              disabled={disabled}
              placeholder="Rédigez ici. Sélectionnez du texte puis cliquez un bouton de la barre pour le mettre en forme."
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setApercuVisible((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-secondary"
            >
              {apercuVisible ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {apercuVisible ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            </button>
            {apercuVisible && (
              <div className="mt-2 rounded-xl bg-stone-50 p-3">
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Aperçu — rendu réel du blog
                </p>
                <ApercuSection
                  cle={section.cle}
                  titre={section.titre}
                  contenuMd={section.contenu_md}
                  images={section.images}
                  position={section.position_image}
                  titreArticle={titreArticle}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function BoutonIcone({
  libelle,
  onClick,
  disabled,
  danger,
  children,
}: {
  libelle: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={libelle}
      aria-label={libelle}
      className={
        danger
          ? "inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
          : "inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-stone-100 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
      }
    >
      {children}
    </button>
  );
}
