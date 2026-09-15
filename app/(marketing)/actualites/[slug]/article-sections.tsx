import Image from "next/image";
import type { PublicArticleSection } from "@/src/actions/public";
import { normaliserUrlImage } from "@/src/lib/image-url";
import { ArticleMarkdown } from "./article-markdown";

/**
 * Rendu du corps d'un article, section par section.
 *
 * Depuis la migration 0023 un article n'est plus un bloc de texte unique :
 * chaque section porte son titre, son markdown, jusqu'à trois images et la
 * place de ces images face au texte.
 *
 * Le texte passe toujours par `ArticleMarkdown`, qui construit des éléments
 * React sans jamais recourir à `dangerouslySetInnerHTML` : une section ne peut
 * donc pas injecter de HTML, et ce fichier n'a pas non plus à assainir quoi que
 * ce soit. Toute la mise en forme (titres, gras, listes, liens, citations) est
 * écrite explicitement dans ce moteur, le projet n'ayant pas le plugin
 * typography qui ferait vivre les classes `prose`.
 */

const DISPOSITIONS = ["gauche", "centre", "droite", "entoure"] as const;
type Disposition = (typeof DISPOSITIONS)[number];

/**
 * Le contrat public expose `position_image` en `string` brut. Une valeur
 * inattendue — ligne écrite directement en base, contrainte CHECK ajoutée après
 * coup — doit retomber sur une disposition lisible plutôt que de laisser la
 * section sans mise en page du tout.
 */
function dispositionSur(valeur: string): Disposition {
  return DISPOSITIONS.includes(valeur as Disposition)
    ? (valeur as Disposition)
    : "droite";
}

export type SectionRendue = {
  id: string;
  titre: string;
  texte: string;
  images: string[];
  disposition: Disposition;
};

/**
 * Normalise les sections avant rendu, et écarte celles qui n'ont rien à dire.
 *
 * Les adresses d'images sont filtrées ici parce que `next/image` LÈVE sur un
 * hôte absent des `remotePatterns` — la page entière tomberait — et parce
 * qu'une source vide produirait un `<img src="">` étalé sur plusieurs centaines
 * de pixels. Une section vidée de tout (ni titre, ni texte, ni image
 * exploitable) est retirée : sinon l'article afficherait des blancs que le
 * lecteur ne peut pas interpréter.
 */
export function preparerSections(
  sections: PublicArticleSection[],
): SectionRendue[] {
  return (sections ?? [])
    .map((section) => ({
      id: section.id,
      titre: (section.titre ?? "").trim(),
      texte: (section.contenu_md ?? "").trim(),
      // La limite de trois est déjà une contrainte CHECK ; on la retient aussi
      // côté rendu, les grilles ci-dessous n'ayant de forme que jusqu'à trois.
      images: (section.images ?? [])
        .map((url) => normaliserUrlImage(url))
        .filter((url): url is string => typeof url === "string")
        .slice(0, 3),
      disposition: dispositionSur(section.position_image),
    }))
    .filter(
      (section) =>
        section.titre !== "" || section.texte !== "" || section.images.length > 0,
    );
}

/**
 * Le moteur markdown donne à son premier et à son dernier bloc la marge d'un
 * texte qui court seul. Dans une colonne, cette marge décale le texte par
 * rapport au haut des images et fausse l'interligne entre le titre de section
 * et son premier paragraphe : on l'arase aux extrémités seulement.
 */
const TEXTE_ARASE = "[&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0";

function BlocTexte({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div className={`${TEXTE_ARASE} ${className ?? ""}`}>
      <ArticleMarkdown source={source} />
    </div>
  );
}

/**
 * Sous 768 px les images forment toujours une seule colonne, au-dessus du
 * texte : côte à côte sur 375 px elles deviendraient des vignettes, et un
 * flottant y réduirait le texte à quelques mots par ligne.
 */
function GalerieSection({
  images,
  pleineLargeur,
  legende,
}: {
  images: string[];
  pleineLargeur: boolean;
  legende: string;
}) {
  const cote = pleineLargeur && images.length > 1;
  const colonnes = !cote
    ? ""
    : images.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-3";

  // Un seul visuel pleine largeur reprend le format panoramique de la
  // couverture ; dès qu'ils partagent la largeur, le 4/3 les garde lisibles.
  const format =
    pleineLargeur && images.length === 1 ? "aspect-[16/9]" : "aspect-[4/3]";

  const tailles = !pleineLargeur
    ? "(max-width: 768px) 100vw, 300px"
    : images.length === 1
      ? "(max-width: 768px) 100vw, 720px"
      : images.length === 2
        ? "(max-width: 768px) 100vw, 350px"
        : "(max-width: 768px) 100vw, 230px";

  return (
    <div className={`grid gap-4 ${colonnes}`}>
      {images.map((url, i) => (
        <figure
          key={`${url}-${i}`}
          className={`relative ${format} overflow-hidden rounded-2xl bg-stone-100 shadow-sm`}
        >
          <Image
            src={url}
            alt={
              images.length > 1
                ? `${legende} — illustration ${i + 1} sur ${images.length}`
                : `${legende} — illustration`
            }
            fill
            sizes={tailles}
            className="object-cover"
          />
        </figure>
      ))}
    </div>
  );
}

function CorpsSection({
  section,
  legende,
}: {
  section: SectionRendue;
  legende: string;
}) {
  // Une section dont aucune image n'a survécu au filtrage garde son texte sur
  // toute la largeur, quelle que soit la position enregistrée : une colonne de
  // texte à 40 % face à une colonne vide serait illisible.
  if (section.images.length === 0) {
    return section.texte ? <BlocTexte source={section.texte} /> : null;
  }

  // Images seules : rien contre quoi les caler, elles prennent la largeur.
  if (!section.texte) {
    return (
      <GalerieSection images={section.images} pleineLargeur legende={legende} />
    );
  }

  if (section.disposition === "centre") {
    return (
      <div>
        <div className="mb-6">
          <GalerieSection
            images={section.images}
            pleineLargeur
            legende={legende}
          />
        </div>
        <BlocTexte source={section.texte} />
      </div>
    );
  }

  if (section.disposition === "entoure") {
    // `flow-root` fait de la section un contexte de formatage qui contient le
    // flottant : sans lui il déborderait sur la section suivante. Le texte,
    // lui, reste un bloc ordinaire — c'est ce qui permet à ses lignes de
    // s'enrouler autour de l'image.
    //
    // Le contrat ne stocke pas de côté pour « entouré » : il est figé ici, à
    // gauche, et nulle part ailleurs — l'aperçu de l'admin appelle ce même
    // composant, il suit donc sans réglage. Ouvrir le choix au rédacteur
    // demanderait une colonne de plus, donc une migration.
    return (
      <div className="md:flow-root">
        <div className="mb-6 md:float-left md:mr-8 md:mb-4 md:w-2/5">
          <GalerieSection
            images={section.images}
            pleineLargeur={false}
            legende={legende}
          />
        </div>
        <BlocTexte source={section.texte} />
      </div>
    );
  }

  // « gauche » et « droite » : deux colonnes à partir de 768 px. L'ordre du DOM
  // place toujours les images avant le texte, pour qu'elles restent au-dessus
  // une fois la mise en colonnes abandonnée sur mobile.
  return (
    <div className="md:flex md:items-start md:gap-8">
      <div
        className={`mb-6 md:mb-0 md:w-2/5 md:shrink-0 ${
          section.disposition === "droite" ? "md:order-last" : ""
        }`}
      >
        <GalerieSection
          images={section.images}
          pleineLargeur={false}
          legende={legende}
        />
      </div>
      <BlocTexte source={section.texte} className="md:min-w-0 md:flex-1" />
    </div>
  );
}

export function ArticleSections({
  sections,
  titreArticle,
}: {
  sections: SectionRendue[];
  titreArticle: string;
}) {
  return (
    <div className="space-y-14">
      {sections.map((section) => (
        <section key={section.id}>
          {section.titre && (
            <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary leading-tight mb-4 break-words">
              {section.titre}
            </h2>
          )}
          <CorpsSection
            section={section}
            // Les images n'ont pas d'alternative textuelle en base : le titre
            // de section, à défaut celui de l'article, situe au moins le visuel.
            legende={section.titre || titreArticle}
          />
        </section>
      ))}
    </div>
  );
}
