import { PreviewClient } from "./preview-client";

export const metadata = { title: "Aperçu composants admin" };

/**
 * Page de QA visuel temporaire pour valider <DataTable /> et <ImageUploader />.
 * Pas listée dans la sidebar — accessible uniquement via /admin/dev-preview.
 * À supprimer une fois les CRUD réels en place.
 */
export default function DevPreviewPage() {
  return <PreviewClient />;
}
