/**
 * Dispositions possibles des images d'une section d'article.
 *
 * Module ordinaire et non `src/actions/admin/content.ts` : ce dernier porte
 * « use server », où tout export doit être une fonction async. Une constante
 * y faisait échouer l'évaluation du module pour TOUTE route qui l'importe —
 * articles, témoignages, FAQ — et l'erreur n'apparaît qu'au build, ni tsc ni
 * ESLint ne la voient.
 *
 * Vivre ici permet aussi au formulaire d'administration de l'importer : la
 * liste n'a plus à être recopiée à la main de part et d'autre.
 */
export const POSITIONS_IMAGE = ["gauche", "centre", "droite", "entoure"] as const;

export type PositionImage = (typeof POSITIONS_IMAGE)[number];
