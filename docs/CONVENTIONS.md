# UnlockTracker — Guide de conventions

Référentiel des conventions de code pour le projet **UnlockTracker** (Sprint 1).
Tout nouveau code livré dans `client/` doit respecter ce document.

Stack concernée : **Vite + React 19 + TypeScript + Tailwind CSS** (lint : `oxlint`).

---

## 1. Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers de composants | `PascalCase.tsx` | `GameCard.tsx` |
| Fichiers de hooks | `camelCase.ts`, préfixe `use` | `useGames.ts` |
| Fichiers de types | `index.ts` (ou `PascalCase.ts` si module thématique) | `types/index.ts` |
| Fichiers de services | `camelCase.ts` | `api.ts` |
| Fichiers de style | `camelCase.css` | `index.css` |
| Composants React | `PascalCase` | `GameCard` |
| Hooks | `camelCase`, préfixe `use` | `usePlayStatus` |
| Variables / fonctions | `camelCase` | `fetchGames()` |
| Constantes globales | `UPPER_SNAKE_CASE` | `MAX_DIFFICULTY` |
| Types & interfaces | `PascalCase`, **sans** préfixe `I` | `Game`, `Series`, `Play` |
| Props de composants | `<NomComposant>Props` | `GameCardProps` |
| Événements / callbacks | `on<Event>` (props) · `handle<Event>` (handlers) | `onClick` / `handleClick` |
| Booleéens | préfixe `is` / `has` / `can` | `isPlayed`, `hasFilters` |
| Attributs JSON de l'API | `camelCase` côté client (`durationMin`), `snake_case` en SQL (`duration_min`) | — |
| Dossiers | `camelCase` ou `kebab-case` (retenir `camelCase`) | `components/`, `hooks/` |

Règles supplémentaires :
- Un composant = un fichier, un export par défaut (voir `docs/TECHNICAL.md` § 5).
- Pas d'abréviations : `gameList`, pas `gL`.
- Les noms de fichiers de tests (futur) : `<Nom>.test.tsx` à côté du fichier testé.

---

## 2. Format JSDoc

Chaque **composant**, **hook**, **fonction exportée** et **type exporté** porte un bloc JSDoc.
Format imposé :

```ts
/**
 * Description en une phrase, à la troisième personne du singulier
 * (« Affiche… », « Récupère… », « Représente… »).
 *
 * @param paramName - Description du paramètre
 * @returns Description de la valeur retournée
 * @throws {Error} Cas d'erreur éventuel
 * @example
 * const games = useGames({ difficulty: 3 })
 */
```

Règles :
- Langue : **français** pour la description (cohérent avec la doc produit), tags JSDoc standards en anglais.
- Une ligne vide entre la description et les tags si la description fait plus d'une phrase.
- `@param` obligatoire pour chaque paramètre nommé ; `@returns` obligatoire sauf pour les composants React (le JSX est explicite).
- Les composants React documentent leurs props via `@param props -` ou directement sur l'interface `Props` (les deux : bloc JSDoc sur le composant + JSDoc sur les champs de l'interface).
- Les types et interfaces portent un JSDoc sur la déclaration **et** sur chaque champ non évident.
- Pas de JSDoc redondant qui répète le nom de la fonction : `/** getGames */` est interdit.

Exemple complet sur un composant : voir `docs/TEMPLATES.md`.

---

## 3. Structure des composants React

Ordre interne d'un fichier composant :

1. **Imports** — un groupe par ordre : React/externes, alias `@/`, chemins relatifs, styles.
2. **Constantes locales** (le cas échéant).
3. **Interfaces / types** (`Props`).
4. **Composant** — fonction fléchée ou déclaration `function`, hooks en haut.
5. **Export par défaut**.

Bonnes pratiques :
- Composants **fonctionnels** uniquement (pas de classes).
- Un composant = une responsabilité ; au-delà de ~150 lignes, extraire des sous-composants.
- `useState` / `useReducer` pour l'état local ; pas de Redux (état global minimal, cf. TECHNICAL.md).
- La logique d'appel API vit dans `src/services/` + `src/hooks/`, jamais dans le JSX.
- Déstructuration des props dans la signature : `function GameCard({ title, difficulty }: GameCardProps)`.
- Ordre des attributs JSX : `key`, `ref`, attributs sémantiques (`type`, `href`, `aria-*`), données, callbacks, `className`.
- Accessibilité : alt obligatoire sur `<img>`, `aria-hidden` sur les décorations, éléments sémantiques (`section`, `nav`, `button`).

---

## 4. Types TypeScript

- Mode strict : `strict: true` (déjà activé par le `tsconfig` Vite). Pas de `any` ; utiliser `unknown` + narrowing si nécessaire.
- `interface` pour les formes d'objets extensibles (props, entités API), `type` pour unions, littéraux et utilitaires.
- Chaque entité API a son type dans `src/types/index.ts` et reste alignée avec le schéma SQL (cf. TECHNICAL.md § 3) :

```ts
/** Statut de jeu partagé. */
export type GameStatus = 'todo' | 'played'

/** Jeu du catalogue Unlock!. */
export interface Game {
  /** Identifiant unique (SQL : `games.id`). */
  id: number
  /** Titre français du jeu. */
  title: string
  /** Série d'appartenance. */
  series: Series
  /** Numéro dans la série (1, 2, 3…). */
  number: number
  /** Thème (ex : « Polar », « Aventure »). */
  theme: string
  /** Difficulté de 1 à 5. */
  difficulty: number
  /** Durée estimée en minutes. */
  durationMin: number
  /** Statut de la partie. */
  status: GameStatus
}
```

Règles :
- Propriétés optionnelles explicites avec `?` + JSDoc qui précise la valeur par défaut le cas échéant.
- Pas d'enum TypeScript : unions de littéraux (`type GameStatus = 'todo' | 'played'`).
- Pas de `!` (non-null assertion) sauf sur `document.getElementById('root')!` du point d'entrée.
- Les réponses API sont typées : `Promise<Game[]>`, jamais `Promise<any>`.
- Pas de type dupliqué : un seul endroit (`types/index.ts`) exporte vers les composants, hooks et services.

---

## 5. Style guide Tailwind

- **Tailwind en classes utilitaires** dans le `className` ; pas de CSS ad hoc par composant sauf animations/thèmes complexes (dans `index.css` avec `@layer`).
- Ordre de regroupement des classes (lisible, de l'extérieur vers l'intérieur) :
  1. Layout : `flex`, `grid`, `items-*`, `justify-*`, `gap-*`
  2. Box model : `w-*`, `h-*`, `p-*`, `m-*`
  3. Typographie : `text-*`, `font-*`, `leading-*`
  4. Apparence : `bg-*`, `border-*`, `rounded-*`, `shadow-*`
  5. États : `hover:`, `focus:`, `disabled:` (en suffixe de chaque groupe)
- Extraction en `const` pour les classes conditionnelles longues :

```tsx
const badgeClass = isPlayed
  ? 'bg-green-100 text-green-800'
  : 'bg-gray-100 text-gray-600'
```

- Composants réutilisables (boutons, badges) : variante via props (`variant`, `size`) mappant vers des classes, pas de duplication de longues chaînes de classes.
- Utiliser les couleurs de la palette Tailwind par défaut ; pas de valeurs arbitraires (`bg-[#fff]`) sauf design validé.
- Responsive : d'abord mobile (`flex-col` puis `sm:flex-row`).
- Espacement : échelle Tailwind (`gap-4`, `p-6`…), pas de `p-[13px]`.
- Accessibilité : `focus-visible:ring-2` sur les éléments interactifs.
- Préfixes verbeux interdits : ne pas répéter `class`-like custom (`card card-big`) quand Tailwind couvre le besoin.
