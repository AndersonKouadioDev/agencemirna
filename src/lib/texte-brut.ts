/**
 * Aplatit du markdown en texte courant.
 *
 * La description d'un bien se saisit maintenant en texte riche, mais trois
 * endroits n'ont pas de place pour de la mise en forme : la ligne tronquée des
 * cartes « biens similaires », l'aperçu du carrousel d'accueil, et la
 * `<meta description>` que Google reprend telle quelle. Sans cette passe, un
 * rédacteur qui commence sa description par « ## Le bien » voyait les dièses
 * dans les résultats de recherche.
 *
 * Ce n'est pas un rendu : les marques sont retirées, jamais interprétées. Le
 * rendu réel reste celui de <TexteRiche>, seul à décider ce qui s'affiche.
 */
export function texteBrut(source: string | null | undefined): string {
  if (!source) return "";

  return (
    source
      .replace(/\r\n?/g, "\n")
      // Blocs de code clôturés : on garde le code, on retire les clôtures.
      .replace(/^(```|~~~).*$/gm, "")
      // Filets horizontaux : ils ne disent rien une fois la mise en page perdue.
      .replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, "")
      // Préfixes de ligne : titres, citations, puces, numéros.
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "")
      // Liens et images : seul le libellé survit.
      .replace(/!?\[([^\]]*)\]\([^)\s]*(?:\s+"[^"]*")?\)/g, "$1")
      // Emphase et code en ligne. Les marques sont retirées une à une plutôt
      // que par paires : une marque restée seule dans le texte — « 2 * 3 » —
      // ne doit pas empêcher les autres d'être nettoyées.
      .replace(/(\*\*|__|\*|_|`)/g, "")
      // Les sauts de ligne deviennent des espaces : la destination est une
      // ligne unique. Sans cela, un titre et son paragraphe se collaient.
      .replace(/\s*\n\s*/g, " ")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
  );
}
