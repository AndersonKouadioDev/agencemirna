"use server";

import { randomBytes } from "node:crypto";
import { createClient } from "@/src/supabase/server";
import { getAdminUser } from "@/src/supabase/admin-auth";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB par fichier
const BUCKET = "images";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/**
 * Server Action : prépare un envoi DIRECT du navigateur vers Supabase Storage.
 *
 * Le fichier ne transite plus par le serveur Next. C'est ce qui permet de
 * tenir la limite de 8 Mo annoncée dans l'interface : le corps d'une Server
 * Action est plafonné à 1 Mo par défaut, et relever ce plafond ne suffirait
 * pas — Vercel cape de son côté la requête d'une fonction serverless à
 * 4,5 Mo. Un fichier de 3 Mo était donc refusé avec un message technique
 * illisible pour le rédacteur.
 *
 * Ce qui traverse ici n'est que la description du fichier : le contrôle admin,
 * le type et la taille sont vérifiés avant de signer, et le chemin est
 * toujours généré côté serveur — le client ne choisit jamais où il écrit.
 *
 * NB : le navigateur pourrait déclarer une taille inexacte. Le garde-fou
 * définitif reste la limite de taille du bucket, côté Supabase.
 */
export type SignatureEnvoi =
  | { ok: true; signedUrl: string; path: string; publicUrl: string }
  | { ok: false; error: string };

export async function signerEnvoiImage(input: {
  pathPrefix: string;
  fileName: string;
  contentType: string;
  size: number;
}): Promise<SignatureEnvoi> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  if (!input.size || input.size <= 0) {
    return { ok: false, error: "Fichier vide." };
  }
  if (input.size > MAX_SIZE_BYTES) {
    return {
      ok: false,
      error: `Fichier trop volumineux (max ${formatBytes(MAX_SIZE_BYTES)}).`,
    };
  }
  if (!ALLOWED_TYPES.includes(input.contentType)) {
    return {
      ok: false,
      error: `Type de fichier non supporté : ${input.contentType}. Autorisés : ${ALLOWED_TYPES.join(", ")}.`,
    };
  }

  const pathPrefix = sanitizePathPrefix(String(input.pathPrefix ?? "misc").trim());
  const ext = getExtension(input.fileName, input.contentType);
  const random = randomBytes(8).toString("hex");
  const path = `${pathPrefix}/${Date.now()}-${random}${ext}`;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("signerEnvoiImage error:", error);
    return { ok: false, error: error?.message ?? "Signature impossible." };
  }

  const { data: publique } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, signedUrl: data.signedUrl, path, publicUrl: publique.publicUrl };
}

/**
 * Server Action : supprimer une image du bucket Storage.
 * À appeler quand un user retire une image du formulaire (avant ou après save).
 */
export async function deleteAdminImage(path: string): Promise<UploadResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, error: "Non autorisé." };
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, url: "", path };
}

// ---------- Helpers ----------

function sanitizePathPrefix(prefix: string): string {
  // Garde lettres/chiffres/_/-/slash, max 100 chars, pas de leading/trailing slash
  return prefix
    .replace(/[^a-zA-Z0-9_/-]/g, "_")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 100) || "misc";
}

function getExtension(filename: string, mimeType: string): string {
  const fromName = filename.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase();
  if (fromName && fromName.length <= 6) return fromName;
  // Fallback depuis le mime
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
  };
  return map[mimeType] ?? ".bin";
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${(bytes / 1024).toFixed(0)} Ko`;
}
