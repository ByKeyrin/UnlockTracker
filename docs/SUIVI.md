# UnlockTracker — Module Suivi (Sprint 3)

Documentation du module **Suivi** du client React (`client/src/`). Elle couvre les
composants `StatsCards`, `PlayedTimeline`, `GameHistory`, l'écran `TrackingScreen`
et les utilitaires `trackingUtils.ts`.

Référentiels : `docs/CONVENTIONS.md` (nommage, JSDoc, structure) et `docs/TEMPLATES.md`
(modèles de code). Constat d'audit JSDoc en fin de document.

---

## 1. Description du module

Le module Suivi répond au **Parcours 4** de `docs/FUNCTIONAL.md` : « Vérifier la
progression ». Il donne à Kevin une vue d'ensemble de sa collection *Unlock!* :
combien de jeux sont joués, en cours ou restants, quand les parties ont été
terminées (chronologie) et un historique complet avec possibilité de **réinitialiser**
un jeu en « non joué » (règle métier **R4 — Annulation**).

Positionnement dans l'application :

```
App.tsx (onglets : Catalogue | Suivi | Filtres)
└── features/tracking/TrackingScreen.tsx   ← écran (onglet « Suivi »)
    ├── features/tracking/StatsCards.tsx       ← compteurs + barre de progression
    ├── features/tracking/PlayedTimeline.tsx   ← chronologie des parties terminées
    └── features/tracking/GameHistory.tsx      ← historique filtrable + réinitialisation
        └── features/tracking/trackingUtils.ts ← icônes, libellés, format de date
```

Flux de données : `TrackingScreen` consomme `useGames()` (sans filtre) → récupère
`allGames` (collection complète persistée en `localStorage`) et `updateGame` → passe
`allGames` aux trois composants présentationnels → `GameHistory` remonte `onReset`,
traité par `handleReset` qui remet le jeu à `statut: 'non_joue'` et efface `dateFin`.

> **Note d'implémentation** : comme le Catalogue (Sprint 2), la persistance reste
> locale (`localStorage`, clé `sweatbook_games`). Les dates de fin de partie sont
> stockées dans le champ `dateFin` ajouté au type `UnlockGame` (cf. § 3).

## 2. Composants

### 2.1 `StatsCards` — `client/src/features/tracking/StatsCards.tsx`

Affiche quatre cartes de statistiques (Total jeux, Joués, En cours, Non joués) et
une barre de **progression globale** en pourcentage.

- **Props** (`StatsCardsProps`) :
  | Prop | Type | Description |
  |---|---|---|
  | `games` | `UnlockGame[]` | Collection complète des jeux à analyser |
- **Interface locale** : `StatCard` (`label`, `valeur`, `accentClass`) — modèle
  d'une carte de la grille ; l'accent coloré est un liseré gauche Tailwind
  (`border-l-indigo-500`, `-green-500`, `-amber-500`, `-slate-400`).
- **Comportement** :
  - Compteurs calculés dans un `useMemo` (voir § 4) à chaque changement de `games`.
  - Grille responsive 2 / 4 colonnes (`grid-cols-2 sm:grid-cols-4`).
  - Barre de progression accessible : `role="progressbar"` avec `aria-valuenow`,
    `aria-valuemin`, `aria-valuemax` et `aria-label` ; largeur animée
    (`transition-[width] duration-300`).
  - Texte explicatif « N jeu(x) terminé(s) sur M » avec pluriel conditionnel.

```tsx
<StatsCards games={allGames} />
```

### 2.2 `PlayedTimeline` — `client/src/features/tracking/PlayedTimeline.tsx`

Affiche la **chronologie des parties terminées**, du plus récent au plus ancien,
sous forme de liste verticale à pastilles.

- **Props** (`PlayedTimelineProps`) :
  | Prop | Type | Description |
  |---|---|---|
  | `games` | `UnlockGame[]` | Collection complète des jeux dont on extrait la chronologie |
- **Comportement** :
  - Sélectionne les jeux `statut === 'termine'` puis trie par `dateFin`
    **décroissante** (comparaison de chaînes ISO, valide pour `AAAA-MM-JJ`) ;
    les jeux sans date de fin sont classés **en dernier** (comparaison avec `''`).
    Départage alphabétique français (`localeCompare(..., 'fr')`) en cas d'égalité.
  - Chaque entrée : pastille décorative (`aria-hidden`) portant l'icône du statut,
    carte `<article>` avec nom, badge « Terminé », série / numéro / thème et date
    dans un `<time dateTime={game.dateFin}>` formaté en français.
  - État vide : message invitant à lancer une partie depuis le catalogue.

```tsx
<PlayedTimeline games={allGames} />
```

### 2.3 `GameHistory` — `client/src/features/tracking/GameHistory.tsx`

Affiche l'**historique complet** des jeux avec filtrage par statut et un bouton
« Réinitialiser » par ligne.

- **Props** (`GameHistoryProps`) :
  | Prop | Type | Description |
  |---|---|---|
  | `games` | `UnlockGame[]` | Collection complète des jeux à afficher |
  | `onReset` | `(gameId: string) => void` | Callback pour remettre un jeu en « non joué » |
- **Constantes locales** :
  - `FILTRES` : les 4 boutons de filtre (`tous`, `non_joue`, `en_cours`, `termine`).
  - `STATUT_CLASSES` : classes Tailwind du badge par statut (variants `dark:` inclus).
- **État local** : `filtre: FiltreStatut` (défaut `'tous'`).
- **Comportement** :
  - Liste `visibleGames` mémoïsée : filtre par statut (sauf `'tous'`) puis tri par
    **série** (`localeCompare(..., 'fr', { numeric: true })`) et **numéro** croissants.
  - Filtres en `<fieldset>` / `<legend>`, boutons `aria-pressed`.
  - Chaque ligne : icône de statut (`aria-hidden`), nom, série / numéro, badge de
    statut, date de fin si terminé ; bouton « Réinitialiser » `disabled` quand le
    jeu est déjà `non_joue`.
  - Compteur « N jeu(x) dans l'historique » + état vide « Aucun jeu avec ce statut. ».

```tsx
<GameHistory games={allGames} onReset={handleReset} />
```

### 2.4 `TrackingScreen` — `client/src/features/tracking/TrackingScreen.tsx`

Écran du Suivi : assemble les trois blocs et câble la réinitialisation.

- **Aucune prop** (composant d'écran monté par `App.tsx` sur l'onglet `suivi`).
- **Logique** :
  - `const { allGames, updateGame } = useGames()` — collection complète, sans filtre.
  - `handleReset(gameId)` (`useCallback`, JSDoc + `@param` présent) : remet le jeu
    au statut `non_joue` et efface sa date de fin via
    `updateGame(gameId, { statut: 'non_joue', dateFin: undefined })`
    (règle **R4** — annulation d'une saisie erronée).
- **Rendu** : en-tête « Suivi des jeux joués » puis `<StatsCards>`,
  `<PlayedTimeline>`, `<GameHistory>` dans une colonne espacée (`gap-6`).

## 3. Données — `dateFin` et utilitaires

### 3.1 Extension du type `UnlockGame` — `client/src/types/index.ts`

Le champ `dateFin` a été ajouté pour le suivi :

```ts
/** Date de fin de partie (ISO `AAAA-MM-JJ`), renseignée quand le statut passe à `termine`. */
dateFin?: string;
```

- Optionnel : absent des jeux `non_joue` / `en_cours`, présent pour les `termine`.
- Rempli automatiquement par `markPlayed` de `useGames` avec la date du jour
  (`todayIso()`, format ISO) si non déjà renseigné.
- Effacé (`undefined`) par la réinitialisation depuis `GameHistory`.
- Les données de démo (`data/games.ts`) incluent désormais `dateFin` sur les
  3 jeux terminés (ex. `2026-02-14`, `2026-03-21`, `2026-04-05`).

### 3.2 Utilitaires — `client/src/features/tracking/trackingUtils.ts`

| Export | Type | Description |
|---|---|---|
| `STATUT_ICONS` | `Record<statut, string>` | Icône emoji par statut (`⬜`, `⏳`, `✅`) |
| `STATUT_LABELS` | `Record<statut, string>` | Libellé par statut (`Non joué`, `En cours`, `Terminé`) |
| `formatDate(isoDate)` | `(string \| undefined) => string` | Formate une date ISO `AAAA-MM-JJ` en français long (« 14 février 2026 »), ou « Date inconnue » si absente/malformée |

Détail `formatDate` :
- La date est reconstruite en **heure locale** (`new Date(year, month - 1, day)`)
  après `split('-')`, pour éviter le décalage UTC de `new Date(isoString)` et rester
  fidèle au jour saisi.
- Formatage via `Intl.DateTimeFormat('fr-FR', { day, month: 'long', year })`.
- Entrée invalides (`undefined`, `''`, parties non numériques) → « Date inconnue ».

## 4. Calculs (progression, stats)

Tous les calculs sont dérivés en temps réel des statuts (règle **R9**) et mémoïsés
par `useMemo` dans `StatsCards` et `PlayedTimeline`.

### 4.1 Compteurs et progression (`StatsCards`)

```
total      = games.length
joues      = |{ g ∈ games : g.statut === 'termine' }|
enCours    = |{ g ∈ games : g.statut === 'en_cours' }|
nonJoues   = |{ g ∈ games : g.statut === 'non_joue' }|
progression = total === 0 ? 0 : Math.round((joues / total) × 100)
```

- `progression` : pourcentage entier arrondi (`Math.round`), protégé contre la
  division par zéro (collection vide → `0`). Affiché avec la barre `progressbar`.
- Les trois compteurs par statut sont **disjoints** : `joues + enCours + nonJoues = total`.

### 4.2 Chronologie (`PlayedTimeline`)

- Filtre : `statut === 'termine'`.
- Tri : `dateFin` **décroissante** (`dateB.localeCompare(dateA)`) — les dates ISO
  `AAAA-MM-JJ` se comparent correctement en chaînes ; les jeux sans `dateFin`
  (`?? ''`) sont poussés en **dernière position** ; départage par `nom`
  (`localeCompare` français) en cas d'égalité de date.

### 4.3 Historique (`GameHistory`)

- Filtre : `filtre === 'tous' || game.statut === filtre`.
- Tri stable : `serie` (`localeCompare(..., 'fr', { numeric: true })` pour un ordre
  naturel « 1, 2, …, 10 ») puis `numero` croissant.

### 4.4 Réinitialisation (R4)

`handleReset` → `updateGame(id, { statut: 'non_joue', dateFin: undefined })` :
merge partiel (`{ ...game, ...patch }` dans `useGames`), le champ `dateFin` est
remis à `undefined` et omis de la persistance JSON (`JSON.stringify`).

## 5. Restant (non couvert par le module)

- **Progression par série** prévue par `FUNCTIONAL.md` § 2 (Parcours 4) et **R9** :
  seule la progression **globale** est calculée ; un découpage par série reste à
  faire (ex. sous `StatsCards` ou un futur `SeriesProgress`).
- **Date de partie et joueurs** (Parcours 3, R3) : le modèle ne stocke que `dateFin`
  (date auto du jour via `markPlayed`), sans saisie de date ni de joueurs
  (`players`, cf. `TECHNICAL.md` table `plays`).
- **Succès / notes de partie** (`success`, `notes` de la table `plays`) non modélisés.
- **Tests** : aucun test unitaire ou E2E du module Suivi à ce stade.
- **Branchement API REST** : toujours en `localStorage` (reporté depuis le Sprint 2).

## 6. Audit JSDoc (Étape 1)

Vérification au regard de `docs/CONVENTIONS.md` § 2 — **conforme**, sans correction
nécessaire :

| Fichier | Éléments exportés | JSDoc description | `@param` / champs | `@example` | Verdict |
|---|---|---|---|---|---|
| `StatsCards.tsx` | `StatsCardsProps`, `StatsCards` (+ interne `StatCard`) | ✅ 3ᵉ personne (« Affiche… ») | ✅ props + champs documentés | ✅ | ✅ |
| `PlayedTimeline.tsx` | `PlayedTimelineProps`, `PlayedTimeline` | ✅ (« Affiche… ») | ✅ props + champs documentés | ✅ | ✅ |
| `GameHistory.tsx` | `GameHistoryProps`, `GameHistory` (+ constantes `FILTRES`, `STATUT_CLASSES`) | ✅ (« Affiche… ») | ✅ props + champs documentés | ✅ | ✅ |
| `TrackingScreen.tsx` | `TrackingScreen` (+ interne `handleReset`) | ✅ (« Écran… », « Remet… ») | ✅ `@param gameId` sur `handleReset` | ✅ | ✅ |
| `trackingUtils.ts` | `STATUT_ICONS`, `STATUT_LABELS`, `formatDate` | ✅ (« Formate… », multi-phrases avec ligne vide) | ✅ `@param` + `@returns` | ✅ | ✅ |

Points de conformité respectés : description en français à la 3ᵉ personne, JSDoc sur
les interfaces **et** leurs champs, `@returns` présent sur la fonction utilitaire et
absent sur les composants (conformément à la règle), `@example` sur les composants
et `formatDate`, références `{@link}` entre types et composants, pas de JSDoc
redondant.

### Remarques mineures

- `StatsCards.tsx` — interface interne `StatCard` : mélange de noms `label` /
  `accentClass` (anglais) et `valeur` (français). Cohérent avec le code livré par
  Pixel (champs `UnlockGame` en français) mais hétérogène à l'intérieur d'une même
  interface.
- `trackingUtils.ts` et les constantes de `GameHistory` dupliquent partiellement les
  tables de statut de `GameCard.tsx` (`STATUT_LABELS`, `STATUT_CLASSES` du catalogue)
  — candidat à une mutualisation dans `types/` ou un module partagé
  (`CONVENTIONS.md` § 5 : pas de duplication).
