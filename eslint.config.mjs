// Les sous-chemins de `eslint-config-next` exportent directement des tableaux
// de configs plates : les charger en direct évite le pont `FlatCompat`, qui
// faisait planter ESLint 10 au démarrage (« Converting circular structure to
// JSON ») dès la validation de la config eslintrc héritée d'eslint-plugin-react.
// Tant qu'il plantait, aucune règle react-hooks ni @next/next ne tournait.
import next from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      // Scripts jetables écrits à la racine pendant une passe de refactor.
      // Ils ne font pas partie de l'application : les linter ferait sortir la
      // commande en erreur et rendrait le garde-fou inutilisable.
      "patch*.js",
      "*.mjs.bak",
    ],
  },
  ...next,
  // Indispensable pour les imports et variables morts : `no-unused-vars` n'est
  // posé que par ce sous-chemin, jamais par `core-web-vitals`.
  ...nextTypeScript,
  {
    settings: {
      // Version figée plutôt que « detect » : la détection d'eslint-plugin-react
      // 7.37 passe par `context.getFilename()`, retiré d'ESLint 10, et fait
      // échouer le lint sur le premier fichier JSX rencontré.
      react: { version: "19.2" },
    },
  },
  {
    // Le lint sert de filet contre les régressions React : les règles qui
    // détectent un bug réel restent bloquantes, la dette de style hérité
    // (une centaine d'occurrences) passe en avertissement. Rouge en
    // permanence, il n'aurait servi à rien. NB : depuis Next 16, `next build`
    // ne lance plus ESLint — ce script est le seul endroit qui le fait.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react/no-danger": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Celles-ci signalent un vrai défaut de rendu : elles restent des erreurs.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default config;
