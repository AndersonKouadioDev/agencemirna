import * as React from "react";
import Link from "next/link";

/**
 * Rendu du corps d'article.
 *
 * Le champ est annoncé « markdown » dans l'admin mais était injecté tel quel
 * dans un `whitespace-pre-wrap` : un rédacteur qui écrivait `## Titre`,
 * `- item` ou `[texte](url)` voyait les caractères littéralement, et les
 * classes `prose` accolées ne produisaient rien faute du plugin typography.
 * On tient donc la promesse plutôt que de la retirer.
 *
 * Le rendu construit directement des éléments React — jamais de
 * `dangerouslySetInnerHTML` : le balisage produit se limite aux quelques
 * éléments listés ici et un article ne peut pas injecter de HTML, ce qui
 * dispense d'une passe d'assainissement séparée. Les URL de lien sont en
 * plus filtrées sur leur schéma, pour écarter `javascript:` et `data:`.
 */

/**
 * Gras, italique, code, lien : la première occurrence gagne.
 *
 * Les variantes à souligné (`_` et `__`) exigent une frontière de mot de part
 * et d'autre, contrairement aux astérisques : sans cette garde, un article qui
 * citait deux fois un chemin du site — « /contact_us », « /about_us » — ou un
 * nom de champ comme `prix_month` voyait tout le texte intermédiaire basculer
 * en italique, souligné avalé au passage.
 */
const INLINE_RE =
  /\*\*([\s\S]+?)\*\*|(?<![\p{L}\p{N}])__([\s\S]+?)__(?![\p{L}\p{N}])|\*([\s\S]+?)\*|(?<![\p{L}\p{N}])_([\s\S]+?)_(?![\p{L}\p{N}])|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/u;

/** Seuls ces schémas sont émis ; le reste retombe en texte simple. */
function hrefSur(brut: string): string | null {
  const url = brut.trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (/^(mailto|tel):/i.test(url)) return url;
  if (url.startsWith("/")) return url;
  return null;
}

function renduInline(texte: string, cle: string): React.ReactNode[] {
  const noeuds: React.ReactNode[] = [];
  let reste = texte;
  let n = 0;

  while (reste.length > 0) {
    const m = INLINE_RE.exec(reste);
    if (!m) {
      noeuds.push(reste);
      break;
    }
    if (m.index > 0) noeuds.push(reste.slice(0, m.index));
    const k = `${cle}-${n++}`;

    const gras = m[1] ?? m[2];
    const italique = m[3] ?? m[4];

    if (gras !== undefined) {
      noeuds.push(
        <strong key={k} className="font-semibold text-secondary">
          {renduInline(gras, k)}
        </strong>,
      );
    } else if (italique !== undefined) {
      noeuds.push(<em key={k}>{renduInline(italique, k)}</em>);
    } else if (m[5] !== undefined) {
      noeuds.push(
        <code
          key={k}
          className="rounded bg-stone-100 px-1.5 py-0.5 text-[0.9em] text-secondary"
        >
          {m[5]}
        </code>,
      );
    } else if (m[6] !== undefined) {
      const href = hrefSur(m[7]);
      const libelle = renduInline(m[6], k);
      if (!href) {
        // On restitue le markdown brut plutôt que le seul libellé : une URL
        // refusée qui contient une parenthèse (« javascript:alert(1) ») laissait
        // la parenthèse fermante orpheline derrière le texte, et le rédacteur
        // lisait « clic) » sans comprendre que son lien avait été écarté.
        noeuds.push(<React.Fragment key={k}>{m[0]}</React.Fragment>);
      } else if (href.startsWith("/")) {
        noeuds.push(
          <Link
            key={k}
            href={href}
            className="font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            {libelle}
          </Link>,
        );
      } else {
        noeuds.push(
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            {libelle}
          </a>,
        );
      }
    }
    reste = reste.slice(m.index + m[0].length);
  }

  return noeuds;
}

/** Les retours à la ligne simples sont préservés : le champ a longtemps été
 *  saisi comme du texte brut, les couper reflowerait les articles existants. */
function renduParagraphe(lignes: string[], cle: string): React.ReactNode[] {
  return lignes.flatMap((ligne, i) =>
    i === 0
      ? renduInline(ligne, `${cle}-l${i}`)
      : [<br key={`${cle}-br${i}`} />, ...renduInline(ligne, `${cle}-l${i}`)],
  );
}

const CLASSE_TITRE: Record<number, string> = {
  2: "font-agate text-2xl sm:text-3xl font-bold text-secondary mt-10 mb-4 leading-tight",
  3: "font-agate text-xl sm:text-2xl font-bold text-secondary mt-8 mb-3 leading-tight",
  4: "text-lg font-semibold text-secondary mt-6 mb-2",
};

const EST_LISTE = /^\s*[-*+]\s+/;
const EST_LISTE_NUM = /^\s*\d+[.)]\s+/;
const EST_TITRE = /^(#{1,6})\s+(.*)$/;
const EST_CITATION = /^>\s?/;
const EST_FILET = /^(-{3,}|\*{3,}|_{3,})$/;
const EST_CLOTURE = /^(```|~~~)/;

function nouveauBloc(ligne: string): boolean {
  const l = ligne.trim();
  return (
    l === "" ||
    EST_TITRE.test(l) ||
    EST_LISTE.test(ligne) ||
    EST_LISTE_NUM.test(ligne) ||
    EST_CITATION.test(l) ||
    EST_FILET.test(l) ||
    EST_CLOTURE.test(l)
  );
}

export function ArticleMarkdown({ source }: { source: string }) {
  const lignes = source.replace(/\r\n?/g, "\n").split("\n");
  const blocs: React.ReactNode[] = [];
  let i = 0;
  let n = 0;

  while (i < lignes.length) {
    const ligne = lignes[i];
    const nette = ligne.trim();
    const cle = `b${n++}`;

    if (nette === "") {
      i++;
      continue;
    }

    if (EST_CLOTURE.test(nette)) {
      const tampon: string[] = [];
      i++;
      while (i < lignes.length && !EST_CLOTURE.test(lignes[i].trim())) {
        tampon.push(lignes[i]);
        i++;
      }
      i++; // saute la clôture
      blocs.push(
        <pre
          key={cle}
          className="overflow-x-auto rounded-xl bg-secondary/95 p-4 text-sm text-white"
        >
          <code>{tampon.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (EST_FILET.test(nette)) {
      blocs.push(<hr key={cle} className="my-10 border-stone-200" />);
      i++;
      continue;
    }

    const titre = EST_TITRE.exec(nette);
    if (titre) {
      // « # » rend un h2 : le h1 de la page est déjà le titre de l'article.
      const niveau = Math.min(titre[1].length + 1, 4);
      const Balise = `h${niveau}` as "h2" | "h3" | "h4";
      blocs.push(
        <Balise key={cle} className={CLASSE_TITRE[niveau]}>
          {renduInline(titre[2], cle)}
        </Balise>,
      );
      i++;
      continue;
    }

    if (EST_CITATION.test(nette)) {
      const tampon: string[] = [];
      while (i < lignes.length && EST_CITATION.test(lignes[i].trim())) {
        tampon.push(lignes[i].trim().replace(EST_CITATION, ""));
        i++;
      }
      blocs.push(
        <blockquote
          key={cle}
          className="my-6 border-l-4 border-primary/60 pl-5 text-neutral-700 italic"
        >
          {renduParagraphe(tampon, cle)}
        </blockquote>,
      );
      continue;
    }

    if (EST_LISTE.test(ligne) || EST_LISTE_NUM.test(ligne)) {
      const numerotee = EST_LISTE_NUM.test(ligne);
      const motif = numerotee ? EST_LISTE_NUM : EST_LISTE;
      const items: string[] = [];
      while (i < lignes.length && motif.test(lignes[i])) {
        items.push(lignes[i].replace(motif, ""));
        i++;
      }
      const contenu = items.map((item, j) => (
        <li key={`${cle}-i${j}`} className="leading-relaxed">
          {renduInline(item, `${cle}-i${j}`)}
        </li>
      ));
      blocs.push(
        numerotee ? (
          <ol key={cle} className="my-5 list-decimal space-y-2 pl-6">
            {contenu}
          </ol>
        ) : (
          <ul key={cle} className="my-5 list-disc space-y-2 pl-6">
            {contenu}
          </ul>
        ),
      );
      continue;
    }

    const tampon: string[] = [ligne];
    i++;
    while (i < lignes.length && !nouveauBloc(lignes[i])) {
      tampon.push(lignes[i]);
      i++;
    }
    blocs.push(
      <p key={cle} className="my-5 text-base sm:text-lg leading-relaxed">
        {renduParagraphe(tampon, cle)}
      </p>,
    );
  }

  return <div className="text-neutral-800">{blocs}</div>;
}
