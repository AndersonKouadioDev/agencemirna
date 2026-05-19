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
 * Server Action : upload d'une image vers Supabase Storage (bucket "images").
 *
 * Sécurité :
 * - Vérifie que le user est admin (sinon 403)
 * - Valide le type MIME et la taille
 * - Génère un nom de fichier aléatoire (anti-collision, anti-énumération)
 *
 * Args (FormData) :
 * - `file` (File) : le fichier à uploader (obligatoire)
 * - `pathPrefix` (string) : préfixe du chemin dans le bucket
 *   ex: "biens/abc-123" → fichier stocké dans biens/abc-123/<random>.jpg
 *
 * Retourne l'URL publique en cas de succès.
 */
export async function uploadAdminImage(
  formData: FormData,
): Promise<UploadResult> {
  // 1. Vérif admin
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, error: "Non autorisé." };
  }

  // 2. Validation du fichier
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Fichier manquant." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Fichier vide." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return {
      ok: false,
      error: `Fichier trop volumineux (max ${formatBytes(MAX_SIZE_BYTES)}).`,
    };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: `Type de fichier non supporté : ${file.type}. Autorisés : ${ALLOWED_TYPES.join(", ")}.`,
    };
  }

  // 3. Path : préfixe (sanitized) + nom aléatoire + extension d'origine
  const rawPrefix = String(formData.get("pathPrefix") ?? "misc").trim();
  const pathPrefix = sanitizePathPrefix(rawPrefix);
  const ext = getExtension(file.name, file.type);
  const random = randomBytes(8).toString("hex");
  const path = `${pathPrefix}/${Date.now()}-${random}${ext}`;

  // 4. Upload via le client Supabase serveur (cookies admin)
  const supabase = await createClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      cacheControl: "31536000", // 1 an : les noms de fichier sont uniques
      upsert: false,
    });

  if (uploadError) {
    console.error("uploadAdminImage error:", uploadError);
    return { ok: false, error: uploadError.message };
  }

  // 5. URL publique
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { ok: true, url: publicUrlData.publicUrl, path };
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
