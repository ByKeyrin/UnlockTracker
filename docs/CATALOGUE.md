# UnlockTracker — Module Catalogue (Sprint 2)

Documentation du module **Catalogue** du client React (`client/src/`). Elle couvre les
composants `GameCard`, `GameList`, `CatalogueScreen`, le hook `useGames` et les données
de démonstration `data/games.ts`.

Référentiels : `docs/CONVENTIONS.md` (nommage, JSDoc, structure) et `docs/TEMPLATES.md`
(modèles de code). Constat d'audit JSDoc en fin de document.

---

## 1. Description du module

Le catalogue est l'écran d'accueil de l'application : il affiche la collection des jeux
*Unlock!* de Kevin, permet de **rechercher** par nom ou thème, de **filtrer** par série,
de **trier** (par série ou difficulté) et de **marquer un jeu comme joué**.

Positionnement dans l'application :

```
App.tsx (onglets : Catalogue | Suivi | Filtres)
└── features/catalogue/CatalogueScreen.tsx   ← écran
    ├── barre de recherche (état local)
    ├── filtre par série (boutons aria-pressed)
    └── features/catalogue/GameList.tsx      ← liste + tri + recherche
        └── features/catalogue/GameCard.tsx  ← carte d'un jeu
```

Flux de données : `CatalogueScreen` consomme `useGames({ serie })` → jeu de données
persisté en `localStorage` (données de démo au premier lancement) → `GameList` applique
la recherche et le tri → `GameCard` affiche chaque jeu et remonte `onMarkPlayed`.

> **Note d'implémentation** : à ce stade du Sprint 2, la persistance est locale
> (`localStorage`) avec un jeu de démonstration embarqué. Le branchement à l'API REST
> (`src/services/api.ts`, cf. `docs/TECHNICAL.md` § 4) reste à faire.

## 2. Composants

### 2.1 `GameCard` — `client/src/features/catalogue/GameCard.tsx`

Affiche la carte d'un jeu Unlock! (nom, série, numéro, thème, durée, difficulté en
étoiles, statut) avec un bouton « Marquer comme joué ».

- **Props** (`GameCardProps`) :
  | Prop | Type | Description |
  |---|---|---|
  | `game` | `UnlockGame` | Jeu Unlock! à afficher |
  | `onMarkPlayed?` | `(gameId: string) => void` | Callback déclenché pour marquer le jeu comme joué |
- **Constantes locales** :
  - `STATUT_LABELS` : libellés affichés par statut (`Non joué`, `En cours`, `Terminé`).
  - `STATUT_CLASSES` : classes Tailwind du badge par statut (variants `dark:` inclus).
- **Comportement** : le bouton est `disabled` quand `game.statut === 'termine'`
  (libellé « Joué ✓ ») ; la difficulté est rendue en étoiles avec `aria-label`
  « Difficulté : N sur 3 ». Un `<article>` sémantique contient `<header>`, une
  liste de définitions `<dl>` et l'action.

```tsx
<GameCard game={game} onMarkPlayed={markPlayed} />
```

### 2.2 `GameList` — `client/src/features/catalogue/GameList.tsx`

Affiche la liste des jeux en grille responsive (`grid` 1 / 2 / 3 colonnes selon le
viewport), avec tri et recherche.

- **Props** (`GameListProps`) :
  | Prop | Type | Description |
  |---|---|---|
  | `games` | `UnlockGame[]` | Jeux à afficher |
  | `recherche?` | `string` (défaut `''`) | Recherche textuelle sur le nom ou le thème |
  | `onMarkPlayed?` | `(gameId: string) => void` | Callback transmis à chaque `GameCard` |
- **Type exporté** : `TriJeux = 'serie' | 'difficulte'` — critères de tri disponibles.
- **Comportement** :
  - Compteur « N jeu(x) affiché(s) » + `<select>` de tri (état local `tri`).
  - Recherche insensible à la casse sur `nom` **ou** `theme` (chaîne trimmée).
  - Tri mémoïsé (`useMemo`) :
    - `serie` : comparaison `localeCompare(..., 'fr', { numeric: true })` puis numéro croissant ;
    - `difficulte` : difficulté croissante, puis nom (`localeCompare` français) en cas d'égalité.
  - État vide : message « Aucun jeu ne correspond à la recherche. » (bordure en pointillés).

### 2.3 `CatalogueScreen` — `client/src/features/catalogue/CatalogueScreen.tsx`

Écran du catalogue : assemble la recherche, le filtre par série et la liste.

- **Aucune prop** (composant d'écran monté par `App.tsx` sur l'onglet `catalogue`).
- **État local** :
  - `recherche: string` — saisie du champ `<input type="search">` ;
  - `serie: string | undefined` — série active, `undefined` = toutes.
- **Constante** : `SERIES = ['1' … '7']` — séries proposées par les boutons de filtre
  (« Toutes » + « Série 1 » à « Série 7 »).
- **Accessibilité** : `<fieldset>` / `<legend>` pour le groupe de filtres, `aria-pressed`
  sur les boutons de série, `focus-visible:ring-2` sur les contrôles.
- Les classes conditionnelles des boutons de série (actif / inactif) sont dupliquées
  entre le bouton « Toutes » et la boucle — candidat à une extraction en `const`
  (cf. `docs/CONVENTIONS.md` § 5).

## 3. Hook `useGames` — `client/src/hooks/useGames.ts`

Charge la collection de jeux depuis le `localStorage` (ou les données de démo au premier
lancement) et fournit les opérations CRUD, la marque « joué » et le filtrage.

- **Entrée** (`UseGamesFilters`) :
  | Filtre | Type | Description |
  |---|---|---|
  | `serie?` | `string` | Série à afficher, `undefined` pour toutes |
  | `difficulte?` | `1 \| 2 \| 3` | Difficulté exacte, `undefined` pour toutes |
  | `statut?` | `FiltreStatut` | `'non_joue' \| 'en_cours' \| 'termine' \| 'tous'` |
- **Retour** (`UseGamesResult`) :
  | Valeur | Type | Description |
  |---|---|---|
  | `games` | `UnlockGame[]` | Jeux **après** application des filtres |
  | `allGames` | `UnlockGame[]` | Collection complète, sans filtre |
  | `addGame(game)` | `(game: UnlockGame) => void` | Ajoute un jeu |
  | `updateGame(id, patch)` | `(id: string, patch: Partial<Omit<UnlockGame, 'id'>>) => void` | Met à jour un jeu (merge partiel, `id` protégé) |
  | `deleteGame(id)` | `(id: string) => void` | Supprime un jeu |
  | `markPlayed(id)` | `(id: string) => void` | Passe le jeu au statut `termine` |
  | `resetDemo()` | `() => void` | Réinitialise la collection avec `DEMO_GAMES` |
- **Fonctions internes** (non exportées) :
  - `loadGames()` — lit `localStorage['sweatbook_games']` ; renvoie les clones de
    `DEMO_GAMES` si la clé est absente, si le JSON est corrompu ou si le
    `localStorage` est indisponible (try/catch).
  - `filterGames(games, filters)` — filtre combinatoire série + difficulté + statut
    (le statut `'tous'` ou `undefined` ne filtre rien).
- **Persistance** : un `useEffect` écrit la collection complète dans le `localStorage`
  à chaque modification.

```ts
const { games, markPlayed } = useGames({ serie: '2' })
```

> **À noter** : la clé de stockage est `'sweatbook_games'` — nom hérité qui ne
> reflète pas l'appellation « UnlockTracker » (à renommer lors du branchement API,
> avec migration de la clé existante).

## 4. Données — `client/src/data/games.ts`

- Export unique : `DEMO_GAMES: UnlockGame[]` — jeu de démonstration de **20 jeux**
  répartis sur les séries 1 à 7 (2 à 3 jeux par série), avec thèmes, difficultés (1–3),
  durée (60 min) et statuts variés (`non_joue`, `en_cours`, `termine`).
- Identifiants stables au format `unlock-<série>-<numéro>` (ex. `unlock-2-1`).
- Chargé au premier lancement pour peupler le `localStorage` ; chaque entrée est
  clonée (`{ ...game }`) avant insertion pour éviter toute mutation partagée.
- Type associé : `UnlockGame` (`client/src/types/index.ts`) :

```ts
export interface UnlockGame {
  id: string
  nom: string
  serie: string
  numero: number
  theme: string
  difficulte: 1 | 2 | 3
  duree: number // minutes
  statut: 'non_joue' | 'en_cours' | 'termine'
}
```

## 5. Filtres et recherche

Deux niveaux coexistent, appliqués dans cet ordre :

| Niveau | Où | Critères | Implémentation |
|---|---|---|---|
| **Filtres** (état de l'écran) | `CatalogueScreen` → `useGames` | Série (boutons), difficulté, statut (hook prêt, UI partielle) | `filterGames()` dans `useGames.ts`, mémoïsés par `useMemo` |
| **Recherche + tri** (état de la liste) | `GameList` | Recherche nom/thème (insensible casse), tri `serie`/`difficulte` | `visibleGames` dans un `useMemo` |

Détails :
- La **recherche** fonctionne sur `nom` et `theme` avec `includes()` après
  `trim().toLowerCase()` ; une recherche vide ne filtre rien.
- Le **filtre série** passe par le hook (`useGames({ serie })`) : cliquer sur une série
  déjà active la désélectionne (toggle vers `undefined` = « Toutes »).
- Le **filtre difficulté et statut** sont implémentés côté hook (`UseGamesFilters`) mais
  n'ont pas encore de contrôle dans l'écran Catalogue (prévu sur l'onglet `Filtres`).
- Le **tri** est local à `GameList` (non persisté, redéfini au montage) : `serie`
  (défaut) ou `difficulté`, avec départage alphabétique français.

## 6. Audit JSDoc (Étape 1)

Vérification au regard de `docs/CONVENTIONS.md` § 2 — **conforme**, sans correction
nécessaire :

| Fichier | Éléments exportés | JSDoc description | `@param` / champs | `@example` | Verdict |
|---|---|---|---|---|---|
| `GameCard.tsx` | `GameCardProps`, `GameCard` | ✅ 3ᵉ personne (« Affiche… ») | ✅ props + champs documentés | ✅ | ✅ |
| `GameList.tsx` | `TriJeux`, `GameListProps`, `GameList` | ✅ (« Affiche… ») | ✅ props + champs documentés | ✅ | ✅ |
| `CatalogueScreen.tsx` | `CatalogueScreen` | ✅ (« Écran… ») | n/a (sans props) | ✅ | ✅ |
| `useGames.ts` | `FiltreStatut`, `UseGamesFilters`, `UseGamesResult`, `useGames` (+ internes `loadGames`, `filterGames`) | ✅ (« Charge… », « Lit… », « Applique… ») | ✅ `@param` + `@returns` + champs | ✅ | ✅ |
| `data/games.ts` | `DEMO_GAMES` | ✅ | n/a (constante) | n/a | ✅ |

Points de conformité respectés : description en français à la 3ᵉ personne, JSDoc sur
les interfaces **et** leurs champs, `@returns` présent sur les fonctions (absent sur les
composants, conformément à la règle), `@example` sur les composants et le hook,
pas de JSDoc redondant.

Remarque mineure : `GameList.tsx` — « Tri disponibles » (devrait être « Tris
disponibles »). Simple coquille, sans impact.

### Écarts par rapport aux conventions de nommage (§ 1 et § 4)

Ces écarts sont documentés tels quels (code livré par Pixel) et restent à arbitrer :

- Noms de champs **français** (`nom`, `serie`, `numero`, `theme`, `difficulte`,
  `duree`, `statut`) alors que `CONVENTIONS.md` / `TECHNICAL.md` prévoient les noms
  API (`title`, `series`, `number`, `theme`, `difficulty`, `durationMin`, `status`).
- Statuts en littéraux `snake_case` (`'non_joue' | 'en_cours' | 'termine'`) au lieu
  de l'union prévue `'todo' | 'played'` (3 statuts au lieu de 2).
- Difficulté sur une échelle **1–3** (`Difficulty` prévu : 1–5) ; `id: string` au lieu
  de `number` ; `UnlockGame` au lieu de `Game`.
- Persistance `localStorage` au lieu de l'API REST `services/api.ts` prévue
  (`TECHNICAL.md` § 4) — choix assumé pour le Sprint 2 (voir § 1).
- Les composants utilisent un export **nommé** + un export par défaut (la convention
  impose un export par défaut ; l'export nommé est en plus, sans contradiction forte).
