/**
 * Photos des états des lieux, côté tablette (navigateur uniquement).
 *
 * 1. Compression : une photo de tablette pèse 3 à 8 Mo. Réduite à 1600 px
 *    en JPEG, elle passe à 200-400 Ko : l'envoi tient sur une connexion
 *    faible, et le PDF reste léger (il ne sait lire que JPEG et PNG).
 * 2. File d'attente : chaque photo est d'abord rangée dans IndexedDB, puis
 *    envoyée. Sans réseau, ou si la page est rechargée, rien n'est perdu :
 *    l'envoi reprend quand la connexion revient.
 */

const COTE_MAX = 1600;
const QUALITE = 0.72;

export async function compresserPhoto(fichier: File): Promise<Blob> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    // `from-image` applique l'orientation EXIF : sinon les photos prises en
    // portrait ressortent couchées.
    source = await createImageBitmap(fichier, { imageOrientation: "from-image" });
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(fichier);
    });
  }
  const largeur = source.width;
  const hauteur = source.height;
  const echelle = Math.min(1, COTE_MAX / Math.max(largeur, hauteur));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(largeur * echelle);
  canvas.height = Math.round(hauteur * echelle);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Compression impossible sur cet appareil.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression impossible."))),
      "image/jpeg",
      QUALITE,
    ),
  );
}

export type CiblePhoto = { type: "piece" | "compteur"; id: string };

export type PhotoEnAttente = {
  id: string;
  edlId: string;
  cible: CiblePhoto;
  blob: Blob;
  creeLe: number;
};

const BASE = "mirna-edl";
const MAGASIN = "photos";

function ouvrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BASE, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(MAGASIN)) {
        db.createObjectStore(MAGASIN, { keyPath: "id" }).createIndex("edlId", "edlId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (magasin: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await ouvrir();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(MAGASIN, mode);
    const req = operation(tx.objectStore(MAGASIN));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export const mettreEnAttente = (photo: PhotoEnAttente) =>
  transaction("readwrite", (m) => m.put(photo)).then(() => undefined);

export const retirerDeLAttente = (id: string) =>
  transaction("readwrite", (m) => m.delete(id)).then(() => undefined);

export const photosEnAttente = (edlId: string) =>
  transaction<PhotoEnAttente[]>("readonly", (m) => m.index("edlId").getAll(edlId));
