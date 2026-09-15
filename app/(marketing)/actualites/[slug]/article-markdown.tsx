/**
 * Le moteur de rendu markdown a déménagé : il sert maintenant aussi bien le
 * corps d'un article que la description d'un bien, et n'appartient donc plus à
 * la route des actualités.
 *
 * Ce réexport garde intacts les deux appels existants de cette page. L'ancien
 * nom reste valable ; rien n'oblige à le renommer partout d'un coup.
 */
export { TexteRiche as ArticleMarkdown } from "@/components/texte-riche";
