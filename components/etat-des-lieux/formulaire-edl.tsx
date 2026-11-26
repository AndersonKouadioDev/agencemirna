"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Camera,
  Check,
  Clock,
  CloudOff,
  KeyRound,
  Loader2,
  Minus,
  Plus,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PadSignature } from "./pad-signature";
import {
  cleComparaison,
  ETATS,
  etatsALEntree,
  libelleEtat,
  libelleType,
  MODELES_PIECES,
  nouvelId,
  nouvellePiece,
  type DonneesSaisieEdl,
  type ElementEdl,
  type EtatDesLieux,
  type PieceEdl,
} from "@/src/lib/etat-des-lieux";
import {
  compresserPhoto,
  mettreEnAttente,
  photosEnAttente,
  retirerDeLAttente,
  type CiblePhoto,
  type PhotoEnAttente,
} from "@/src/lib/photos-edl-client";
import {
  enregistrerEdl,
  signerEdl,
  signerEnvoiPhotoEdl,
} from "@/src/actions/admin/etats-des-lieux";

type StatutSauvegarde = "a_jour" | "modifie" | "en_cours" | "hors_ligne" | "erreur";

const DELAI_SAUVEGARDE = 1500;

// Appelé depuis des gestionnaires d'événement, jamais pendant le rendu.
const horodatage = () => Date.now();

function donneesDe(edl: EtatDesLieux): DonneesSaisieEdl {
  return {
    date_edl: edl.date_edl,
    locataire_nom: edl.locataire_nom,
    locataire_email: edl.locataire_email,
    locataire_telephone: edl.locataire_telephone,
    proprietaire_nom: edl.proprietaire_nom,
    proprietaire_email: edl.proprietaire_email,
    agent_nom: edl.agent_nom,
    pieces: edl.pieces,
    compteurs: edl.compteurs,
    cles: edl.cles,
    observations: edl.observations,
  };
}

const cleLocale = (id: string) => `mirna-edl-${id}`;

/**
 * Copie locale plus récente que la version du serveur (saisie faite hors
 * connexion, page rechargée avant l'envoi) : c'est elle qu'on reprend.
 * Ce composant n'est rendu que dans le navigateur (voir saisie-edl.tsx).
 */
function donneesInitiales(edl: EtatDesLieux): { donnees: DonneesSaisieEdl; restaurees: boolean } {
  try {
    const brut = localStorage.getItem(cleLocale(edl.id));
    if (brut) {
      const copie = JSON.parse(brut) as { donnees: DonneesSaisieEdl; modifieLe: number };
      if (copie.modifieLe > Date.parse(edl.updated_at)) {
        return { donnees: copie.donnees, restaurees: true };
      }
    }
  } catch {
    // Stockage indisponible (navigation privée) : on part de la version serveur.
  }
  return { donnees: donneesDe(edl), restaurees: false };
}

function attacherPhoto(d: DonneesSaisieEdl, cible: CiblePhoto, chemin: string): DonneesSaisieEdl {
  if (cible.type === "piece") {
    return {
      ...d,
      pieces: d.pieces.map((p) =>
        p.id === cible.id && !p.photos.includes(chemin) ? { ...p, photos: [...p.photos, chemin] } : p,
      ),
    };
  }
  return {
    ...d,
    compteurs: d.compteurs.map((c) => (c.id === cible.id ? { ...c, photo: chemin } : c)),
  };
}

export function FormulaireEdl({
  edl,
  entree,
  liens,
}: {
  edl: EtatDesLieux;
  entree: EtatDesLieux | null;
  liens: Record<string, string>;
}) {
  const router = useRouter();
  const [{ donnees: depart, restaurees }] = React.useState(() => donneesInitiales(edl));
  const [donnees, setDonnees] = React.useState(depart);
  const courant = React.useRef(depart);
  const version = React.useRef(0);
  const minuteur = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [statut, setStatut] = React.useState<StatutSauvegarde>(restaurees ? "modifie" : "a_jour");
  const [erreurSauvegarde, setErreurSauvegarde] = React.useState<string | null>(null);
  const [enregistreA, setEnregistreA] = React.useState<Date | null>(null);
  const [enLigne, setEnLigne] = React.useState(() => navigator.onLine);

  const [apercus, setApercus] = React.useState<Record<string, string>>(liens);
  const [attente, setAttente] = React.useState<PhotoEnAttente[]>([]);
  const [erreurPhoto, setErreurPhoto] = React.useState<string | null>(null);
  const traitementEnCours = React.useRef(false);

  const [signatures, setSignatures] = React.useState<{ locataire: string | null; agent: string | null }>({
    locataire: null,
    agent: null,
  });
  const [signatureEnCours, setSignatureEnCours] = React.useState(false);

  const comparaison = React.useMemo(
    () => (edl.type === "sortie" && entree ? etatsALEntree(entree) : null),
    [edl.type, entree],
  );

  // ── Enregistrement ──────────────────────────────────────────────────────
  const sauvegarder = React.useCallback(
    async (d: DonneesSaisieEdl, versionEnvoyee: number) => {
      if (!navigator.onLine) {
        setStatut("hors_ligne");
        return;
      }
      setStatut("en_cours");
      const res = await enregistrerEdl(edl.id, d);
      if (!res.ok) {
        setStatut("erreur");
        setErreurSauvegarde(res.error);
        return;
      }
      setErreurSauvegarde(null);
      setEnregistreA(new Date());
      // Plus rien en suspens depuis cet envoi : la copie locale ne sert plus.
      if (version.current === versionEnvoyee) {
        setStatut("a_jour");
        try {
          localStorage.removeItem(cleLocale(edl.id));
        } catch {
          // Stockage indisponible : sans conséquence.
        }
      }
    },
    [edl.id],
  );

  const modifier = React.useCallback(
    (f: (d: DonneesSaisieEdl) => DonneesSaisieEdl) => {
      const suivant = f(courant.current);
      courant.current = suivant;
      setDonnees(suivant);
      const v = ++version.current;
      try {
        localStorage.setItem(cleLocale(edl.id), JSON.stringify({ donnees: suivant, modifieLe: Date.now() }));
      } catch {
        // Copie locale impossible : l'enregistrement serveur reste actif.
      }
      setStatut("modifie");
      if (minuteur.current) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(() => void sauvegarder(suivant, v), DELAI_SAUVEGARDE);
    },
    [edl.id, sauvegarder],
  );

  // ── Photos : file d'attente ────────────────────────────────────────────
  const traiterFile = React.useCallback(async () => {
    if (traitementEnCours.current || !navigator.onLine) return;
    traitementEnCours.current = true;
    try {
      const file = await photosEnAttente(edl.id);
      for (const photo of file) {
        const signature = await signerEnvoiPhotoEdl({
          edlId: edl.id,
          contentType: "image/jpeg",
          size: photo.blob.size,
        });
        if (!signature.ok) {
          setErreurPhoto(signature.error);
          break;
        }
        const reponse = await fetch(signature.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: photo.blob,
        }).catch(() => null);
        if (!reponse?.ok) {
          setErreurPhoto("Envoi d'une photo interrompu : nouvel essai au retour de la connexion.");
          break;
        }
        setErreurPhoto(null);
        modifier((d) => attacherPhoto(d, photo.cible, signature.path));
        setApercus((a) => ({ ...a, [signature.path]: a[photo.id] ?? URL.createObjectURL(photo.blob) }));
        await retirerDeLAttente(photo.id);
        setAttente((l) => l.filter((p) => p.id !== photo.id));
      }
    } catch (e) {
      console.error("traiterFile", e);
      setErreurPhoto("Photos non envoyées : nouvel essai au retour de la connexion.");
    } finally {
      traitementEnCours.current = false;
    }
  }, [edl.id, modifier]);

  // Photos restées en attente (page rechargée, connexion coupée).
  React.useEffect(() => {
    let actif = true;
    photosEnAttente(edl.id)
      .then((file) => {
        if (!actif || file.length === 0) return;
        setAttente(file);
        setApercus((a) => {
          const suite = { ...a };
          for (const p of file) suite[p.id] ??= URL.createObjectURL(p.blob);
          return suite;
        });
        void traiterFile();
      })
      .catch((e) => console.error("photosEnAttente", e));
    return () => {
      actif = false;
    };
  }, [edl.id, traiterFile]);

  // Retour de la connexion : on envoie ce qui attend.
  React.useEffect(() => {
    const enLigneDeNouveau = () => {
      setEnLigne(true);
      void sauvegarder(courant.current, version.current);
      void traiterFile();
    };
    const horsLigne = () => setEnLigne(false);
    window.addEventListener("online", enLigneDeNouveau);
    window.addEventListener("offline", horsLigne);
    return () => {
      window.removeEventListener("online", enLigneDeNouveau);
      window.removeEventListener("offline", horsLigne);
    };
  }, [sauvegarder, traiterFile]);

  // Copie locale reprise au chargement : on la renvoie au serveur.
  React.useEffect(() => {
    if (restaurees) {
      toast.info("Saisie non envoyée retrouvée sur la tablette : elle a été reprise.");
      minuteur.current = setTimeout(() => void sauvegarder(courant.current, version.current), 500);
    }
    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    };
  }, [restaurees, sauvegarder]);

  async function ajouterPhotos(cible: CiblePhoto, fichiers: FileList | null) {
    if (!fichiers?.length) return;
    for (const fichier of Array.from(fichiers)) {
      try {
        const blob = await compresserPhoto(fichier);
        const photo: PhotoEnAttente = { id: nouvelId(), edlId: edl.id, cible, blob, creeLe: horodatage() };
        await mettreEnAttente(photo);
        setApercus((a) => ({ ...a, [photo.id]: URL.createObjectURL(blob) }));
        setAttente((l) => [...l, photo]);
      } catch (e) {
        console.error("ajouterPhotos", e);
        toast.error(`Photo « ${fichier.name} » illisible.`);
      }
    }
    void traiterFile();
  }

  // ── Modifications ───────────────────────────────────────────────────────
  const champ = <K extends keyof DonneesSaisieEdl>(cle: K, valeur: DonneesSaisieEdl[K]) =>
    modifier((d) => ({ ...d, [cle]: valeur }));

  const majPiece = (id: string, f: (p: PieceEdl) => PieceEdl) =>
    modifier((d) => ({ ...d, pieces: d.pieces.map((p) => (p.id === id ? f(p) : p)) }));

  const majElement = (pieceId: string, elementId: string, f: (e: ElementEdl) => ElementEdl) =>
    majPiece(pieceId, (p) => ({ ...p, elements: p.elements.map((e) => (e.id === elementId ? f(e) : e)) }));

  const [modelePiece, setModelePiece] = React.useState("Chambre");

  function ajouterPiece() {
    const memes = courant.current.pieces.filter((p) => p.nom.startsWith(modelePiece)).length;
    const nom = memes > 0 ? `${modelePiece} ${memes + 1}` : modelePiece;
    modifier((d) => ({ ...d, pieces: [...d.pieces, nouvellePiece(nom, modelePiece)] }));
    setTimeout(() => document.getElementById("pieces-fin")?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
  }

  // ── Signature ───────────────────────────────────────────────────────────
  const manques = [
    !donnees.locataire_nom.trim() && "le nom du locataire",
    donnees.pieces.length === 0 && "au moins une pièce",
    attente.length > 0 && `l'envoi de ${attente.length} photo${attente.length > 1 ? "s" : ""}`,
    !signatures.locataire && "la signature du locataire",
    !signatures.agent && "la signature de l'agent",
    !enLigne && "le retour de la connexion",
  ].filter((m): m is string => Boolean(m));

  async function signer() {
    if (manques.length > 0 || !signatures.locataire || !signatures.agent) return;
    if (!confirm("Signer et clôturer cet état des lieux ? Il ne pourra plus être modifié.")) return;
    if (minuteur.current) clearTimeout(minuteur.current);
    setSignatureEnCours(true);
    const res = await signerEdl(edl.id, courant.current, {
      locataire: signatures.locataire,
      agent: signatures.agent,
    });
    setSignatureEnCours(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    try {
      localStorage.removeItem(cleLocale(edl.id));
    } catch {
      // Sans conséquence.
    }
    toast.success("État des lieux signé.");
    router.refresh();
  }

  // ── Rendu ───────────────────────────────────────────────────────────────
  const photosAttenteDe = (cible: CiblePhoto) =>
    attente.filter((p) => p.cible.type === cible.type && p.cible.id === cible.id);

  return (
    <div className="space-y-6 pb-24">
      {/* Barre d'état, toujours visible */}
      <div className="sticky top-0 z-20 -mx-6 lg:-mx-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-stone-200 bg-white/95 px-6 lg:px-8 py-3 backdrop-blur">
        <p className="font-semibold text-secondary">
          État des lieux {libelleType(edl.type).toLowerCase()} · {edl.bien?.name ?? "Logement"}
        </p>
        <IndicateurSauvegarde statut={statut} enregistreA={enregistreA} erreur={erreurSauvegarde} />
        {!enLigne && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <CloudOff className="h-3.5 w-3.5" />
            Hors connexion : la saisie reste sur la tablette
          </span>
        )}
        {attente.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Clock className="h-3.5 w-3.5" />
            {/* Un seul nœud texte : dans un conteneur flex, des morceaux séparés perdent leurs espaces. */}
            <span>{`${attente.length} photo${attente.length > 1 ? "s" : ""} en attente d'envoi`}</span>
          </span>
        )}
        <nav className="flex w-full gap-2 overflow-x-auto pb-1 text-xs">
          {[
            ["infos", "Parties"],
            ...donnees.pieces.map((p) => [`piece-${p.id}`, p.nom]),
            ["compteurs", "Compteurs"],
            ["cles", "Clés"],
            ["signatures", "Signatures"],
          ].map(([ancre, libelle]) => (
            <a
              key={ancre}
              href={`#${ancre}`}
              className="shrink-0 rounded-full border border-stone-200 px-3 py-1.5 font-medium text-neutral-700 hover:border-primary hover:text-primary"
            >
              {libelle}
            </a>
          ))}
        </nav>
      </div>

      {erreurPhoto && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{erreurPhoto}</p>
      )}

      {/* Parties */}
      <Carte id="infos" titre="Date et parties">
        <div className="grid gap-4 md:grid-cols-3">
          <ChampTexte libelle="Date de l'état des lieux" type="date" valeur={donnees.date_edl} onChange={(v) => champ("date_edl", v)} />
          <ChampTexte libelle="Agent de l'agence" valeur={donnees.agent_nom ?? ""} onChange={(v) => champ("agent_nom", v)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ChampTexte libelle="Locataire (nom complet) *" valeur={donnees.locataire_nom} onChange={(v) => champ("locataire_nom", v)} />
          <ChampTexte libelle="Téléphone du locataire" type="tel" valeur={donnees.locataire_telephone ?? ""} onChange={(v) => champ("locataire_telephone", v)} />
          <ChampTexte libelle="E-mail du locataire" type="email" valeur={donnees.locataire_email ?? ""} onChange={(v) => champ("locataire_email", v)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ChampTexte libelle="Propriétaire" valeur={donnees.proprietaire_nom ?? ""} onChange={(v) => champ("proprietaire_nom", v)} />
          <ChampTexte libelle="E-mail du propriétaire" type="email" valeur={donnees.proprietaire_email ?? ""} onChange={(v) => champ("proprietaire_email", v)} />
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Le PDF signé sera envoyé aux adresses e-mail renseignées.
        </p>
      </Carte>

      {/* Pièces */}
      {donnees.pieces.map((piece) => {
        const cible: CiblePhoto = { type: "piece", id: piece.id };
        return (
          <Carte
            key={piece.id}
            id={`piece-${piece.id}`}
            titre={
              <Input
                value={piece.nom}
                onChange={(e) => majPiece(piece.id, (p) => ({ ...p, nom: e.target.value }))}
                className="h-10 max-w-xs border-transparent bg-transparent px-0 text-lg font-bold text-secondary shadow-none focus-visible:border-stone-300 focus-visible:px-3"
                aria-label="Nom de la pièce"
              />
            }
            action={
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Retirer la pièce « ${piece.nom} » et sa saisie ?`)) {
                    modifier((d) => ({ ...d, pieces: d.pieces.filter((p) => p.id !== piece.id) }));
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Retirer la pièce
              </button>
            }
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {piece.elements.map((el) => {
                const avant = comparaison?.get(cleComparaison(piece.nom, el.nom));
                return (
                  <div key={el.id} className="rounded-xl border border-stone-200 p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={el.nom}
                        onChange={(e) => majElement(piece.id, el.id, (x) => ({ ...x, nom: e.target.value }))}
                        className="h-9 font-medium"
                        aria-label="Élément"
                      />
                      <button
                        type="button"
                        onClick={() => majPiece(piece.id, (p) => ({ ...p, elements: p.elements.filter((x) => x.id !== el.id) }))}
                        className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Retirer ${el.nom}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {comparaison && (
                      <p className="mt-1.5 text-xs text-neutral-500">
                        À l&apos;entrée : <strong>{avant ? libelleEtat(avant.etat) : "non relevé"}</strong>
                        {avant?.commentaire ? ` — ${avant.commentaire}` : ""}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`État : ${el.nom}`}>
                      {ETATS.map((etat) => (
                        <button
                          key={etat.valeur}
                          type="button"
                          role="radio"
                          aria-checked={el.etat === etat.valeur}
                          onClick={() =>
                            majElement(piece.id, el.id, (x) => ({ ...x, etat: x.etat === etat.valeur ? "" : etat.valeur }))
                          }
                          className={cn(
                            "h-10 rounded-lg border px-3 text-sm font-semibold transition-colors",
                            el.etat === etat.valeur ? etat.couleur : "border-stone-200 bg-white text-neutral-700 hover:bg-stone-50",
                          )}
                        >
                          {etat.libelle}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={el.commentaire}
                      onChange={(e) => majElement(piece.id, el.id, (x) => ({ ...x, commentaire: e.target.value }))}
                      placeholder="Commentaire : rayure, tache, manquant…"
                      className="mt-2 h-9 text-sm"
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                majPiece(piece.id, (p) => ({
                  ...p,
                  elements: [...p.elements, { id: nouvelId(), nom: "", etat: "", commentaire: "" }],
                }))
              }
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Ajouter un élément
            </button>

            <div className="mt-5">
              <Label className="mb-2 block">Photos de la pièce</Label>
              <GaleriePhotos
                chemins={piece.photos}
                attente={photosAttenteDe(cible)}
                apercus={apercus}
                onRetirer={(chemin) => majPiece(piece.id, (p) => ({ ...p, photos: p.photos.filter((x) => x !== chemin) }))}
                onAjouter={(fichiers) => void ajouterPhotos(cible, fichiers)}
              />
            </div>

            <Textarea
              value={piece.commentaire}
              onChange={(e) => majPiece(piece.id, (p) => ({ ...p, commentaire: e.target.value }))}
              placeholder="Remarque sur la pièce (facultatif)"
              rows={2}
              className="mt-4"
            />
          </Carte>
        );
      })}
      <div id="pieces-fin" />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white p-4">
        <span className="text-sm font-semibold text-secondary">Ajouter une pièce :</span>
        <select
          value={modelePiece}
          onChange={(e) => setModelePiece(e.target.value)}
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm"
          aria-label="Type de pièce"
        >
          {Object.keys(MODELES_PIECES).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={ajouterPiece}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {/* Compteurs */}
      <Carte id="compteurs" titre="Compteurs" icone={<Zap className="h-5 w-5 text-primary" />}>
        <div className="space-y-3">
          {donnees.compteurs.map((c) => {
            const cible: CiblePhoto = { type: "compteur", id: c.id };
            const releveEntree = entree?.compteurs.find((x) => x.libelle === c.libelle)?.releve;
            return (
              <div key={c.id} className="rounded-xl border border-stone-200 p-3">
                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <ChampTexte libelle="Compteur" valeur={c.libelle} onChange={(v) => modifier((d) => ({ ...d, compteurs: d.compteurs.map((x) => (x.id === c.id ? { ...x, libelle: v } : x)) }))} />
                  <ChampTexte libelle="N° de compteur" valeur={c.numero} onChange={(v) => modifier((d) => ({ ...d, compteurs: d.compteurs.map((x) => (x.id === c.id ? { ...x, numero: v } : x)) }))} />
                  <ChampTexte
                    libelle={releveEntree ? `Relevé (entrée : ${releveEntree})` : "Relevé / crédit restant"}
                    valeur={c.releve}
                    inputMode="decimal"
                    onChange={(v) => modifier((d) => ({ ...d, compteurs: d.compteurs.map((x) => (x.id === c.id ? { ...x, releve: v } : x)) }))}
                  />
                  <button
                    type="button"
                    onClick={() => modifier((d) => ({ ...d, compteurs: d.compteurs.filter((x) => x.id !== c.id) }))}
                    className="self-end rounded-lg p-2.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Retirer le compteur ${c.libelle}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <GaleriePhotos
                    chemins={c.photo ? [c.photo] : []}
                    attente={photosAttenteDe(cible)}
                    apercus={apercus}
                    unique
                    onRetirer={() => modifier((d) => ({ ...d, compteurs: d.compteurs.map((x) => (x.id === c.id ? { ...x, photo: null } : x)) }))}
                    onAjouter={(fichiers) => void ajouterPhotos(cible, fichiers)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            modifier((d) => ({
              ...d,
              compteurs: [...d.compteurs, { id: nouvelId(), libelle: "", numero: "", releve: "", photo: null }],
            }))
          }
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Ajouter un compteur
        </button>
      </Carte>

      {/* Clés */}
      <Carte id="cles" titre="Clés remises" icone={<KeyRound className="h-5 w-5 text-primary" />}>
        <div className="space-y-2">
          {donnees.cles.map((c) => {
            const nombreEntree = entree?.cles.find((x) => x.libelle === c.libelle)?.nombre;
            const majNombre = (n: number) =>
              modifier((d) => ({ ...d, cles: d.cles.map((x) => (x.id === c.id ? { ...x, nombre: Math.max(0, n) } : x)) }));
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-2">
                <Input
                  value={c.libelle}
                  onChange={(e) => modifier((d) => ({ ...d, cles: d.cles.map((x) => (x.id === c.id ? { ...x, libelle: e.target.value } : x)) }))}
                  className="h-11 flex-1 min-w-48"
                  aria-label="Type de clé"
                />
                {nombreEntree != null && (
                  <span className="text-xs text-neutral-500">Entrée : {nombreEntree}</span>
                )}
                <div className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => majNombre(c.nombre - 1)} aria-label="Une clé de moins">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-lg font-bold">{c.nombre}</span>
                  <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => majNombre(c.nombre + 1)} aria-label="Une clé de plus">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => modifier((d) => ({ ...d, cles: d.cles.filter((x) => x.id !== c.id) }))}
                  className="rounded-lg p-2.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Retirer ${c.libelle}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => modifier((d) => ({ ...d, cles: [...d.cles, { id: nouvelId(), libelle: "", nombre: 1 }] }))}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Ajouter un type de clé
        </button>
      </Carte>

      <Carte id="observations" titre="Observations générales">
        <Textarea
          value={donnees.observations ?? ""}
          onChange={(e) => champ("observations", e.target.value)}
          rows={4}
          placeholder="Propreté générale, réserves du locataire, travaux prévus…"
        />
      </Carte>

      {/* Signatures */}
      <Carte id="signatures" titre="Signatures">
        <p className="mb-4 text-sm text-neutral-600">
          Relisez l&apos;état des lieux avec le locataire, puis faites signer les deux parties.
          Une fois signé, le document ne se modifie plus.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <PadSignature
            libelle={`Le locataire${donnees.locataire_nom ? ` : ${donnees.locataire_nom}` : ""}`}
            onChange={(png) => setSignatures((s) => ({ ...s, locataire: png }))}
          />
          <PadSignature
            libelle={`L'agent${donnees.agent_nom ? ` : ${donnees.agent_nom}` : ""}`}
            onChange={(png) => setSignatures((s) => ({ ...s, agent: png }))}
          />
        </div>
        {manques.length > 0 && (
          <p className="mt-4 text-sm text-amber-800">Avant de signer, il manque : {manques.join(", ")}.</p>
        )}
        <Button
          type="button"
          onClick={signer}
          disabled={manques.length > 0 || signatureEnCours}
          className="mt-4 h-12 w-full rounded-full text-base font-bold md:w-auto md:px-10"
        >
          {signatureEnCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Signer et clôturer
        </Button>
      </Carte>
    </div>
  );
}

function IndicateurSauvegarde({
  statut,
  enregistreA,
  erreur,
}: {
  statut: StatutSauvegarde;
  enregistreA: Date | null;
  erreur: string | null;
}) {
  const heure = enregistreA?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const contenu: Record<StatutSauvegarde, [string, string]> = {
    a_jour: ["text-green-700", heure ? `Enregistré à ${heure}` : "Enregistré"],
    modifie: ["text-neutral-500", "Modifications en cours…"],
    en_cours: ["text-neutral-500", "Enregistrement…"],
    hors_ligne: ["text-amber-700", "Enregistré sur la tablette, envoi au retour du réseau"],
    erreur: ["text-red-700", `Non enregistré : ${erreur ?? "erreur"}`],
  };
  const [couleur, texte] = contenu[statut];
  return <span className={cn("text-xs font-medium", couleur)}>{texte}</span>;
}

function Carte({
  id,
  titre,
  icone,
  action,
  children,
}: {
  id: string;
  titre: React.ReactNode;
  icone?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icone}
          {typeof titre === "string" ? <h2 className="text-lg font-bold text-secondary">{titre}</h2> : titre}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ChampTexte({
  libelle,
  valeur,
  onChange,
  type = "text",
  inputMode,
}: {
  libelle: string;
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {libelle}
      </Label>
      <Input id={id} type={type} inputMode={inputMode} value={valeur} onChange={(e) => onChange(e.target.value)} className="h-11" />
    </div>
  );
}

function GaleriePhotos({
  chemins,
  attente,
  apercus,
  unique = false,
  onRetirer,
  onAjouter,
}: {
  chemins: string[];
  attente: PhotoEnAttente[];
  apercus: Record<string, string>;
  unique?: boolean;
  onRetirer: (chemin: string) => void;
  onAjouter: (fichiers: FileList | null) => void;
}) {
  const inputId = React.useId();
  const plein = unique && chemins.length + attente.length >= 1;
  return (
    <div className="flex flex-wrap gap-2">
      {chemins.map((chemin) => (
        <div key={chemin} className="relative h-24 w-24 overflow-hidden rounded-lg bg-stone-100">
          {apercus[chemin] && (
            // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire ou aperçu local
            <img src={apercus[chemin]} alt="" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onRetirer(chemin)}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            aria-label="Retirer la photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {attente.map((p) => (
        <div key={p.id} className="relative h-24 w-24 overflow-hidden rounded-lg bg-stone-100">
          {apercus[p.id] && (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu local avant envoi
            <img src={apercus[p.id]} alt="" className="h-full w-full object-cover opacity-60" />
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white drop-shadow" />
          </span>
        </div>
      ))}
      {!plein && (
        <label
          htmlFor={inputId}
          className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-300 text-xs font-medium text-neutral-500 hover:border-primary hover:text-primary"
        >
          <Camera className="h-6 w-6" />
          Photo
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple={!unique}
            className="sr-only"
            onChange={(e) => {
              onAjouter(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
