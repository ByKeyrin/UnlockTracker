# UnlockTracker — Module Filtres (Sprint 4)

Documentation du module de **filtres avancés et de recherche** du client React
(`client/`). Conventions : `docs/CONVENTIONS.md`, `docs/TEMPLATES.md`.
Compte rendu de sprint : `docs/SPRINT_04.md`.

- **Date de rédaction** : 2026-10-18 (agent BIC, documentation)
- **Code livré par** : Pixel (agent code)
- **Périmètre observé** : `client/src/features/filters/` et
  `client/src/hooks/useFilters.ts`

---

## 1. Description du module

Le module répond au **Parcours 2 — « Filtrer pour choisir un jeu »** de
`docs/FUNCTIONAL.md` et à la règle **R6 — Filtres combinables**. Il permet à
Kevin de croiser une **recherche textuelle** (nom ou thème) avec des filtres
avancés : **série**, **difficulté**, **statut** et **durée maximale**, avec une
mise à jour instantanée des résultats.

Principes du module :

- **État centralisé** dans le hook `useFilters` : un seul objet
  `FiltresAvances` porte la recherche *et* les filtres, ce qui permet de tout
  combiner dans une fonction pure (`applyFilters`).
- **Multi-sélection** sur les groupes série / difficulté / statut (cases à
  cocher) : au sein d'un groupe, les valeurs cochées sont combinées par **OU
  logique** ; entre les groupes, la combinaison est un **ET logique** (R6).
- **Persistance** : l'état des filtres est conservé dans le `localStorage`
  (`sweatbook_filters`) et l'historique de recherche dans
  `sweatbook_search_history` — comme la collection (`sweatbook_games`, cf.
  `useGames`), avec repli silencieux sur les valeurs par défaut en cas de
  données corrompues.
- **Responsive** : panneau de filtres latéral permanent sur desktop (`lg:`),
  modal plein écran sur mobile avec compteur de filtres actifs.
- **Recherche insensible à la casse et aux accents** (normalisation NFD,
  suppression des diacritiques) sur le nom et le thème des jeux.

Fichiers du module :

| Fichier | Rôle |
|---|---|
| `client/src/features/filters/FiltersScreen.tsx` | Écran « Filtres » : assemble recherche, panneau et résultats |
| `client/src/features/filters/FilterPanel.tsx` | Panneau de filtres avancés (desktop + modal mobile) |
| `client/src/features/filters/SearchBar.tsx` | Barre de recherche instantanée (suggestions + historique) |
| `client/src/hooks/useFilters.ts` | État des filtres, setters, combinaison et persistance |

Intégration : `App.tsx` monte `FiltersScreen` sur l'onglet « Filtres »
(`Onglet = 'catalogue' | 'suivi' | 'filtres'` dans `types/index.ts`). Les
données viennent de `useGames()` (`allGames`), le filtre ne fait que les
dériver.

---

## 2. Composants

### 2.1 `FilterPanel` — `client/src/features/filters/FilterPanel.tsx`

Panneau de filtres avancés. Props (`FilterPanelProps`, chacune documentée) :

| Prop | Type | Rôle |
|---|---|---|
| `filters` | `FiltresAvances` | État courant des filtres (contrôlé) |
| `series` | `string[]` | Séries disponibles dans la collection |
| `onToggleSerie` | `(serie: string) => void` | Coche/décoche une série |
| `onToggleDifficulte` | `(d: FiltreDifficulte) => void` | Coche/décoche une difficulté |
| `onToggleStatut` | `(s: FiltreStatut) => void` | Coche/décoche un statut |
| `onDureeMaxChange` | `(duree: number \| null) => void` | Change la durée maximale (`null` = toutes) |
| `onReset` | `() => void` | Réinitialise tous les filtres |
| `isOpen` | `boolean` (déf. `false`) | Ouverture de la modal mobile |
| `onClose` | `() => void` | Fermeture de la modal mobile |

Contenu (délégué au sous-composant interne `FilterFields`, partagé entre les
deux rendus) :

1. **Série** — cases à cocher multiples (`fieldset`/`legend`), une par série de
   la collection.
2. **Difficulté** — cases à cocher 1–3, affichées en étoiles
   (`aria-label={`Difficulté ${n} sur 3`}`).
3. **Statut** — cases à cocher « Non joué / En cours / Terminé »
   (`STATUT_LABELS` local).
4. **Durée maximale** — `<select>` « Toutes les durées » ou `≤ X min` pour
   `X ∈ DUREES_FILTRE` (30, 45, 60, 75, 90 min).
5. **Bouton « Réinitialiser les filtres »**.

Rendu : `<aside className="hidden lg:block">` pour le desktop, et modal
(`role="dialog"`, `aria-modal="true"`, clic sur le fond = fermeture,
`stopPropagation` sur le contenu) quand `isOpen` est vrai, limitée au mobile
par `lg:hidden`. État visuel des cases : variant `has-[:checked]:` Tailwind,
dark mode complet.

### 2.2 `SearchBar` — `client/src/features/filters/SearchBar.tsx`

Barre de recherche instantanée avec autocomplete. Props (`SearchBarProps`) :

| Prop | Type | Rôle |
|---|---|---|
| `value` | `string` | Recherche courante (composant contrôlé) |
| `onChange` | `(recherche: string) => void` | Appelé à chaque frappe |
| `games` | `UnlockGame[]` (déf. `[]`) | Collection servant aux suggestions |
| `placeholder` | `string` (déf. `'Nom ou thème…'`) | Texte d'aide |

Comportements :

- **Suggestions** (max 6, `SUGGESTIONS_MAX`) : noms et thèmes des jeux
  contenant la saisie, comparaison normalisée (casse + accents) — mêmes règles
  que `applyFilters`.
- **Historique des recherches** (max 8, `HISTORY_MAX`) : affiché quand l'input
  est vide et le focus actif ; persisté dans le `localStorage`
  (`sweatbook_search_history`) via `loadHistory` / `saveHistory`. Chaque entrée
  est supprimable individuellement, « Tout effacer » vide l'historique.
- **Validation** (`commitSearch`) : Entrée valide la première suggestion (ou la
  saisie brute), met à jour l'historique (sans doublon, plus récent en premier)
  et ferme la liste. `Escape` ferme la liste.
- **Effacement** : bouton « ✕ » (`aria-label="Effacer la recherche"`) qui vide
  le champ et rend le focus à l'input.
- **Accessibilité** : pattern `combobox` (`role="combobox"`,
  `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, listes en
  `role="listbox"` / `role="option"`), fermeture au blur uniquement si le focus
  quitte réellement le composant.

### 2.3 `FiltersScreen` — `client/src/features/filters/FiltersScreen.tsx`

Écran (onglet « Filtres ») qui orchestre le module :

- récupère la collection via `useGames()` (`allGames`, sans filtre) et délègue
  l'état des filtres à `useFilters(allGames)` ;
- dérive la liste des **séries disponibles** (`useMemo` : `Set` puis tri
  numérique français) pour alimenter `FilterPanel` ;
- affiche la `SearchBar`, un bouton « ⚙️ Filtres avancés » **mobile uniquement**
  avec badge du nombre de groupes de filtres actifs
  (`compterFiltresActifs`, hors recherche) ;
- affiche le **compteur de résultats** (`aria-live="polite"`), la grille de
  `GameCard` des jeux filtrés, ou un **état vide** « Aucun jeu ne correspond
  aux filtres sélectionnés. ».

---

## 3. Hook `useFilters` — `client/src/hooks/useFilters.ts`

```ts
const { filters, toggleSerie, …, filteredGames, resultCount } = useFilters(allGames)
```

- **Entrée** : `games: UnlockGame[]` — collection complète à filtrer.
- **Sortie** (`UseFiltersResult`, objet nommé) :

| Valeur | Type | Rôle |
|---|---|---|
| `filters` | `FiltresAvances` | État courant (contrôlé par les composants) |
| `toggleSerie` / `toggleDifficulte` / `toggleStatut` | `(valeur) => void` | Ajoute/retire une valeur de la sélection |
| `setDureeMax` | `(duree: number \| null) => void` | Durée maximale, `null` = toutes |
| `setRecherche` | `(recherche: string) => void` | Recherche textuelle |
| `resetFilters` | `() => void` | Repart de `FILTRES_INITIAUX` |
| `filteredGames` | `UnlockGame[]` | Jeux correspondant (`useMemo`) |
| `resultCount` | `number` | `filteredGames.length` |

État `FiltresAvances` (interface documentée champ par champ) :

```ts
{
  series: string[];        // vide = toutes
  difficultes: (1 | 2 | 3)[]; // vide = toutes
  statuts: FiltreStatut[]; // vide = tous
  dureeMax: number | null; // null = toutes
  recherche: string;       // nom ou thème
}
```

Exports complémentaires : `FILTRES_STORAGE_KEY`, `FILTRES_INITIAUX` (aucun
filtre actif), `DUREES_FILTRE = [30, 45, 60, 75, 90]`, types
`FiltreStatut` / `FiltreDifficulte` (dérivés de `UnlockGame`), fonction pure
`applyFilters(games, filters)`.

Persistance : au montage, `loadFilters()` lit `localStorage` avec validation de
forme (`isFiltresAvances` — tableaux typés, littéraux de statut/difficulté
vérifiés) ; à chaque modification, `useEffect` réécrit la clé
`sweatbook_filters`. Toute valeur invalide ou corrompue ramène
`FILTRES_INITIAUX` sans erreur bloquante.

---

## 4. Combinaison des filtres

La combinaison est implémentée par la fonction pure **`applyFilters`** (exportée
et testable), appliquée dans un `useMemo` sur `[games, filters]`.

Un jeu est affiché s'il satisfait **tous** les filtres actifs (**ET logique**
entre les groupes — R6) :

| Filtre | Condition de conservation | Valeur « inactif » |
|---|---|---|
| Série | `filters.series.includes(game.serie)` | `series: []` |
| Difficulté | `filters.difficultes.includes(game.difficulte)` | `difficultes: []` |
| Statut | `filters.statuts.includes(game.statut)` | `statuts: []` |
| Durée | `game.duree <= filters.dureeMax` | `dureeMax: null` |
| Recherche | `nom` ou `theme` contient le texte (normalisé) | `recherche: ''` |

Règles de sémantique :

- **OU au sein d'un groupe** : avec plusieurs cases cochées, un jeu est retenu
  s'il correspond à *l'une des* valeurs cochées du groupe.
- **ET entre les groupes** : cocher « Série 2 » + « Terminé » + `≤ 60 min`
  n'affiche que les jeux Série 2 terminés de 60 min ou moins.
- **Recherche** : `normaliser()` (minuscules + NFD − diacritiques) appliquée
  aux deux côtés ; la recherche matche le **nom ou** le thème (OU inclusif).
- **Réinitialisation** : `resetFilters()` efface tous les groupes, la durée et
  la recherche en une action (bouton du panneau, badge mobile remis à zéro).
- **Instantanéité** : chaque toggle/setter déclenche un recalcul immédiat via
  `useMemo` — aucun bouton « Appliquer » (Parcours 2 : « La liste se met à jour
  instantanément »).

---

## 5. Restant (non couvert par le module)

- **Durée par intervalles** (R6) : `FUNCTIONAL.md` prévoit des intervalles
  (≤ 45 min, 45–60 min, 60–90 min, > 90 min) ; le code implémente un filtre
  « durée maximale » unique (`≤ X min`), pas d'intervalle ni « > 90 min ».
- **Filtre difficulté 2 à 3 étoiles** (Parcours 2) : plage de difficulté ;
  le code fait de la multi-sélection de valeurs exactes (couvre le besoin par
  l'union des cas, mais sans notion de plage).
- **Recherche sur d'autres champs** : seul le nom et le thème sont cherchés
  (pas la série ni les notes).
- **Tests** : aucun test unitaire (`applyFilters`, `normaliser`) ni E2E
  (combinaison de filtres, suggestions, historique) au moment de la rédaction.

## 6. Audit JSDoc (Étape 1)

Vérification au regard de `docs/CONVENTIONS.md` § 2 (description en français à
la troisième personne, `@param` par paramètre nommé, `@returns` sauf composants
React, JSDoc sur les interfaces **et** leurs champs, `@example` attendu) :

| Élément | Fichier | Statut |
|---|---|---|
| `FilterPanel` + `FilterPanelProps` (9 champs) | `FilterPanel.tsx` | ✅ Conforme (bloc composant + interface + `@param props` + `@example`) |
| `FilterFields` (interne) | `FilterPanel.tsx` | ✅ Conforme (`@param props`) |
| `SearchBar` + `SearchBarProps` (4 champs) | `SearchBar.tsx` | ✅ Conforme |
| `loadHistory` / `saveHistory` / `normaliser` | `SearchBar.tsx` | ✅ Conformes (`@param` + `@returns`) |
| `FiltersScreen` + `compterFiltresActifs` | `FiltersScreen.tsx` | ✅ Conformes |
| `useFilters` + `UseFiltersResult` (9 champs) + `FiltresAvances` (5 champs) | `useFilters.ts` | ✅ Conformes (`@param`/`@returns`/`@example`) |
| `applyFilters` | `useFilters.ts` | ✅ Conforme (description détaillée de la combinaison + `@example`) |
| `loadFilters` / `isFiltresAvances` / `normaliser` | `useFilters.ts` | ✅ Conformes |
| Constantes (`FILTRES_STORAGE_KEY`, `FILTRES_INITIAUX`, `DUREES_FILTRE`, `STATUT_LABELS`, `DIFFICULTES`) et types `FiltreStatut`/`FiltreDifficulte` | tous | ✅ JSDoc d'une ligne présent |

**Aucune correction de JSDoc nécessaire** : tout composant, hook, fonction
exportée et type exporté porte un bloc conforme. Aucune retouche de code n'a
été effectuée par BIC (Pixel gère le code et le git).

### Remarques mineures

- Handlers internes de `SearchBar` (`commitSearch`, `removeHistoryItem`,
  `clearHistory`) documentés en commentaire d'une ligne plutôt qu'en JSDoc
  complet avec `@param`/`@returns` — acceptable pour des closures non
  exportées, conforme à l'esprit de la convention.
- Exemple `@example` de `FilterPanel` tronqué avec `…` : suffisant pour un
  composant à 9 props.
