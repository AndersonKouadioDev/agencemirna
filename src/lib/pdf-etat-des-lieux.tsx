import "server-only";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createClient } from "@/src/supabase/server";
import {
  cheminsFichiers,
  cleComparaison,
  dateLongue,
  ETATS,
  estDegrade,
  etatsALEntree,
  libelleEtat,
  libelleType,
  type EtatDesLieux,
} from "@/src/lib/etat-des-lieux";

/**
 * PDF d'un état des lieux signé, généré côté serveur (téléchargement depuis
 * l'admin et pièce jointe des e-mails). Une sortie affiche, pour chaque
 * élément, l'état relevé à l'entrée et signale les dégradations.
 *
 * Les photos sont lues dans le bucket privé avec la session de l'admin, puis
 * intégrées au PDF : le document reste lisible sans lien qui expire.
 */

type ImagePdf = { data: Buffer; format: "jpg" | "png" };

const C = {
  encre: "#1f1208",
  gris: "#6b7280",
  trait: "#e7e5e4",
  fond: "#FAF5EE",
  accent: "#d48f3f",
  rouge: "#dc2626",
};

const s = StyleSheet.create({
  page: { padding: 36, paddingBottom: 54, fontSize: 9.5, fontFamily: "Helvetica", color: C.encre },
  entete: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: C.accent },
  marque: { fontSize: 16, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  petit: { fontSize: 8, color: C.gris },
  titre: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  blocs: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  bloc: { width: "50%", paddingRight: 12, marginBottom: 8 },
  etiquette: { fontSize: 7.5, color: C.gris, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  gras: { fontFamily: "Helvetica-Bold" },
  section: { marginTop: 12 },
  titreSection: { fontSize: 11, fontFamily: "Helvetica-Bold", backgroundColor: C.fond, padding: 6, marginBottom: 4 },
  ligne: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.trait, paddingVertical: 4 },
  enteteTableau: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.encre, paddingVertical: 3 },
  colElement: { width: "30%", paddingRight: 6 },
  colEtat: { width: "15%", paddingRight: 6 },
  colCommentaire: { flex: 1 },
  degrade: { color: C.rouge, fontFamily: "Helvetica-Bold" },
  photos: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  photo: { width: 165, height: 124, objectFit: "cover", marginRight: 6, marginBottom: 6 },
  note: { marginTop: 4, fontSize: 8.5, color: C.gris },
  signatures: { flexDirection: "row", marginTop: 8 },
  signature: { width: "50%", paddingRight: 12 },
  cadreSignature: { borderWidth: 0.5, borderColor: C.trait, height: 80, marginTop: 4, alignItems: "center", justifyContent: "center" },
  imageSignature: { height: 70, objectFit: "contain" },
  pied: { position: "absolute", bottom: 22, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.gris },
});

async function chargerImages(chemins: string[]): Promise<Map<string, ImagePdf>> {
  const supabase = await createClient();
  const images = new Map<string, ImagePdf>();
  await Promise.all(
    chemins.map(async (chemin) => {
      const { data, error } = await supabase.storage.from("etats-des-lieux").download(chemin);
      if (error || !data) {
        console.error("PDF : photo illisible", chemin, error);
        return;
      }
      images.set(chemin, {
        data: Buffer.from(await data.arrayBuffer()),
        format: chemin.toLowerCase().endsWith(".png") ? "png" : "jpg",
      });
    }),
  );
  return images;
}

const couleurEtat = (etat: string) => ETATS.find((e) => e.valeur === etat)?.pdf ?? C.gris;

function Champ({ etiquette, valeur }: { etiquette: string; valeur?: string | null }) {
  return (
    <View style={s.bloc}>
      <Text style={s.etiquette}>{etiquette}</Text>
      <Text>{valeur?.trim() || "—"}</Text>
    </View>
  );
}

function DocumentEdl({
  edl,
  entree,
  images,
}: {
  edl: EtatDesLieux;
  entree: EtatDesLieux | null;
  images: Map<string, ImagePdf>;
}) {
  const comparaison = edl.type === "sortie" && entree ? etatsALEntree(entree) : null;
  const titre = `ÉTAT DES LIEUX ${edl.type === "entree" ? "D'ENTRÉE" : "DE SORTIE"}`;
  const compteursEntree = new Map((entree?.compteurs ?? []).map((c) => [c.libelle, c]));
  const clesEntree = new Map((entree?.cles ?? []).map((c) => [c.libelle, c]));
  const adresse = [edl.bien?.address, edl.bien?.ville_commune].filter(Boolean).join(", ");

  return (
    <Document title={`${titre} — ${edl.bien?.name ?? "Logement"}`} author="Agence Mirna" language="fr">
      <Page size="A4" style={s.page} wrap>
        <View style={s.entete} fixed>
          <View>
            <Text style={s.marque}>AGENCE MIRNA</Text>
            <Text style={s.petit}>Marcory Zone 4, Abidjan · agencemirna.com</Text>
          </View>
          <View>
            <Text style={s.titre}>{titre}</Text>
            <Text style={[s.petit, { textAlign: "right" }]}>Établi le {dateLongue(edl.date_edl)}</Text>
          </View>
        </View>

        <View style={s.blocs}>
          <Champ etiquette="Logement" valeur={[edl.bien?.name, adresse].filter(Boolean).join(" — ")} />
          <Champ etiquette="Agent de l'agence" valeur={edl.agent_nom} />
          <Champ
            etiquette="Locataire"
            valeur={[edl.locataire_nom, edl.locataire_telephone, edl.locataire_email].filter(Boolean).join(" · ")}
          />
          <Champ
            etiquette="Propriétaire"
            valeur={[edl.proprietaire_nom, edl.proprietaire_email].filter(Boolean).join(" · ")}
          />
        </View>

        {comparaison && entree && (
          <Text style={[s.note, { marginBottom: 6 }]}>
            Comparé à l&apos;état des lieux d&apos;entrée du {dateLongue(entree.date_edl)}. Les
            éléments dont l&apos;état s&apos;est dégradé sont signalés en rouge.
          </Text>
        )}

        {edl.pieces.map((piece) => (
          <View key={piece.id} style={s.section}>
            <Text style={s.titreSection} minPresenceAhead={60}>{piece.nom}</Text>
            <View style={s.enteteTableau}>
              <Text style={[s.colElement, s.gras]}>Élément</Text>
              {comparaison && <Text style={[s.colEtat, s.gras]}>À l&apos;entrée</Text>}
              <Text style={[s.colEtat, s.gras]}>État</Text>
              <Text style={[s.colCommentaire, s.gras]}>Commentaire</Text>
            </View>
            {piece.elements.map((el) => {
              const avant = comparaison?.get(cleComparaison(piece.nom, el.nom));
              const degrade = estDegrade(avant?.etat, el.etat);
              return (
                <View key={el.id} style={s.ligne} wrap={false}>
                  <Text style={s.colElement}>{el.nom}</Text>
                  {comparaison && (
                    <Text style={[s.colEtat, { color: couleurEtat(avant?.etat ?? "") }]}>
                      {avant ? libelleEtat(avant.etat) : "—"}
                    </Text>
                  )}
                  <Text style={[s.colEtat, degrade ? s.degrade : { color: couleurEtat(el.etat) }]}>
                    {libelleEtat(el.etat)}
                    {degrade ? " (dégradé)" : ""}
                  </Text>
                  <Text style={s.colCommentaire}>{el.commentaire || ""}</Text>
                </View>
              );
            })}
            {piece.commentaire ? <Text style={s.note}>Remarque : {piece.commentaire}</Text> : null}
            {piece.photos.some((p) => images.has(p)) && (
              <View style={s.photos}>
                {piece.photos.map((p) => {
                  const img = images.get(p);
                  // eslint-disable-next-line jsx-a11y/alt-text -- composant PDF, pas une balise HTML
                  return img ? <Image key={p} style={s.photo} src={img} /> : null;
                })}
              </View>
            )}
          </View>
        ))}

        <View style={s.section} wrap={false}>
          <Text style={s.titreSection}>Compteurs</Text>
          <View style={s.enteteTableau}>
            <Text style={[s.colElement, s.gras]}>Compteur</Text>
            <Text style={[s.colEtat, s.gras]}>N°</Text>
            {entree && <Text style={[s.colEtat, s.gras]}>À l&apos;entrée</Text>}
            <Text style={[s.colCommentaire, s.gras]}>Relevé</Text>
          </View>
          {edl.compteurs.map((c) => (
            <View key={c.id} style={s.ligne}>
              <Text style={s.colElement}>{c.libelle}</Text>
              <Text style={s.colEtat}>{c.numero || "—"}</Text>
              {entree && <Text style={s.colEtat}>{compteursEntree.get(c.libelle)?.releve || "—"}</Text>}
              <Text style={s.colCommentaire}>{c.releve || "—"}</Text>
            </View>
          ))}
          <View style={s.photos}>
            {edl.compteurs.map((c) => {
              const img = c.photo ? images.get(c.photo) : undefined;
              // eslint-disable-next-line jsx-a11y/alt-text -- composant PDF, pas une balise HTML
              return img ? <Image key={c.id} style={s.photo} src={img} /> : null;
            })}
          </View>
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.titreSection}>Clés remises</Text>
          {edl.cles.map((c) => (
            <View key={c.id} style={s.ligne}>
              <Text style={s.colElement}>{c.libelle}</Text>
              {entree && (
                <Text style={s.colEtat}>Entrée : {clesEntree.get(c.libelle)?.nombre ?? "—"}</Text>
              )}
              <Text style={s.colCommentaire}>{c.nombre}</Text>
            </View>
          ))}
        </View>

        {edl.observations ? (
          <View style={s.section} wrap={false}>
            <Text style={s.titreSection}>Observations générales</Text>
            <Text>{edl.observations}</Text>
          </View>
        ) : null}

        <View style={s.section} wrap={false}>
          <Text style={s.titreSection}>Signatures</Text>
          <Text style={s.note}>
            Les parties reconnaissent l&apos;exactitude du présent état des lieux
            {edl.signe_le ? `, signé le ${dateLongue(edl.signe_le)}` : ""}.
          </Text>
          <View style={s.signatures}>
            {(
              [
                ["Le locataire", edl.locataire_nom, edl.signature_locataire],
                ["Pour l'Agence Mirna", edl.agent_nom, edl.signature_agent],
              ] as const
            ).map(([role, nom, chemin]) => {
              const img = chemin ? images.get(chemin) : undefined;
              return (
                <View key={role} style={s.signature}>
                  <Text style={s.etiquette}>{role}</Text>
                  <Text style={s.gras}>{nom || "—"}</Text>
                  <View style={s.cadreSignature}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text -- composant PDF */}
                    {img ? <Image style={s.imageSignature} src={img} /> : <Text style={s.petit}>Non signé</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.pied} fixed>
          <Text>
            {libelleType(edl.type)} · {edl.bien?.name ?? ""} · réf. {edl.id.slice(0, 8)}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function genererPdfEdl(
  edl: EtatDesLieux,
  entree: EtatDesLieux | null,
): Promise<Buffer> {
  const images = await chargerImages(cheminsFichiers(edl));
  return renderToBuffer(<DocumentEdl edl={edl} entree={entree} images={images} />);
}

export function nomFichierEdl(edl: EtatDesLieux): string {
  const nom = (edl.bien?.name ?? "logement")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `etat-des-lieux-${edl.type}-${nom}-${edl.date_edl}.pdf`;
}
