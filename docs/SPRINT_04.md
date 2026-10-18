# UnlockTracker — Sprint 4 : Filtres

Suivi du Sprint 4 du client React (`client/`). Documentation détaillée du module :
`docs/FILTRES.md`. Conventions : `docs/CONVENTIONS.md`, `docs/TEMPLATES.md`.

- **Date de rédaction** : 2026-10-18 (agent BIC, documentation)
- **Code livré par** : Pixel (agent code)
- **Statut du doc** : code observé au moment de la rédaction (sprint non encore
  commité — dernier commit `000bbcd` « sprint3: suivi des jeux joués »). Git
  géré par Pixel — BIC ne commit ni ne push.

## 1. Objectif

Rendre l'écran **Filtres** réellement fonctionnel : **recherche instantanée**
avec suggestions et historique, et **filtres avancés combinables** (série,
difficulté, statut, durée maximale) avec mise à jour immédiate des résultats.
C'est la réponse au **Parcours 2 — « Filtrer pour choisir un jeu »** et à la
règle métier **R6 — Filtres combinables** (ET logique entre les groupes,
durée par intervalles) de `docs/FUNCTIONAL.md`.

Périmètre retenu : **frontend uniquement**, persistance `localStorage`
(`sweatbook_filters`, `sweatbook_search_history`). La durée par intervalles
précis de R6 et les tests restent hors périmètre (cf. « Restant »).

## 2. Composants livrés

| Fichier | Rôle |
|---|---|
| `client/src/features/filters/FilterPanel.tsx` | Panneau de filtres avancés : séries (cases à cocher multiples), difficulté 1–3 (étoiles), statut (multi-sélection), durée maximale (`≤ X min`), bouton « Réinitialiser ». Responsive : aside desktop (`lg:`) + modal mobile (`role="dialog"`, `aria-modal`) via `isOpen`/`onClose` ; sous-composant interne `FilterFields` partagé |
| `client/src/features/filters/SearchBar.tsx` | Barre de recherche instantanée contrôlée : suggestions (noms + thèmes, max 6), historique persisté (`sweatbook_search_history`, max 8, suppression unitaire et « Tout effacer »), validation Entrée / fermeture Échap, bouton effacer, pattern ARIA `combobox`/`listbox` |
| `client/src/features/filters/FiltersScreen.tsx` | Écran (onglet « Filtres ») : assemble `SearchBar` + `FilterPanel` + résultats (`GameCard`), bouton mobile « Filtres avancés » avec badge du nombre de groupes actifs (`compterFiltresActifs`), compteur `aria-live`, état vide |
| `client/src/hooks/useFilters.ts` | Hook d'état : `FiltresAvances` (séries, difficultés, statuts, `dureeMax`, `recherche`), setters (`toggle*`, `setDureeMax`, `setRecherche`, `resetFilters`), application pure `applyFilters`, persistance `localStorage` avec validation de forme (`isFiltresAvances`), constantes `FILTRES_INITIAUX` / `DUREES_FILTRE` |

Intégration : `App.tsx` monte `FiltersScreen` sur l'onglet « Filtres » ;
la collection vient de `useGames()` (`allGames`).

## 3. Fonctionnalités

- [x] Recherche instantanée sur le nom ou le thème, insensible à la casse et
      aux accents (normalisation NFD), résultats mis à jour à chaque frappe.
- [x] Suggestions de recherche (autocomplete) et historique persisté dans le
      `localStorage` (8 entrées max, suppression par entrée ou global).
- [x] Filtres combinables par **ET logique** (R6) : série + difficulté + statut
      + durée + recherche ; **OU logique** au sein de chaque groupe
      multi-sélection (vide = « tous »).
- [x] Filtre par durée maximale (30/45/60/75/90 min ou toutes) — variante
      simplifiée des intervalles de R6 (cf. « Restant »).
- [x] Mise à jour instantanée de la liste et du compteur de résultats
      (Parcours 2), sans bouton « Appliquer ».
- [x] Réinitialisation globale des filtres et de la recherche en un clic.
- [x] Persistance des filtres (`sweatbook_filters`) entre les sessions, avec
      validation de forme des données relues et repli sur les valeurs par
      défaut en cas de corruption.
- [x] Responsive : panneau latéral fixe sur desktop, modal plein écran sur
      mobile avec badge du nombre de filtres actifs.
- [x] Accessibilité : `fieldset`/`legend`, `aria-pressed` implicite des cases,
      `aria-label` sur les étoiles de difficulté, `combobox`/`listbox` sur la
      recherche, `aria-live` sur le compteur, `role="dialog"`/`aria-modal` sur
      la modal, `focus-visible:ring-2` sur les contrôles.
- [x] Dark mode sur l'ensemble des blocs (variants `dark:`).
- [x] Audit JSDoc conforme `docs/CONVENTIONS.md` § 2 (détail dans
      `docs/FILTRES.md` § 6) : aucune correction nécessaire.

## 4. Tests

| Type | Où | Statut | Commentaire |
|---|---|---|---|
| Typecheck | `npx tsc -b` | ✅ OK | Vérifié par BIC le 2026-10-18 après livraison du module : aucune erreur TypeScript. |
| Smoke tests E2E (Sprint 1) | `client/tests/smoke.spec.ts` (agent TEMPER) | 🟡 Non rejoués | Dernière exécution connue verte, non rejouée par BIC sur le code du Sprint 4. |
| Tests E2E catalogue / tracking | `client/tests/catalogue.spec.ts`, `client/tests/tracking.spec.ts` (agent TEMPER) | 🟡 Hors périmètre | En cours côté TEMPER ; navigation vers l'onglet « Filtres » à vérifier si les specs le couvrent. |
| Tests du module Filtres | — | ❌ Absents | Aucun test unitaire (`applyFilters`, `normaliser`) ni E2E (combinaisons, suggestions, historique). |

## 5. Restant

- [ ] **Durée par intervalles** (R6) : remplacer le filtre « durée maximale »
      par les intervalles prévus (≤ 45 min, 45–60 min, 60–90 min, > 90 min).
- [ ] **Plage de difficulté** (Parcours 2 : « 2 à 3 étoiles ») : la
      multi-sélection de valeurs exactes couvre le cas, mais une notion de
      plage reste à arbitrer.
- [ ] **Tests** : unitaires (`applyFilters`, `normaliser`, `isFiltresAvances`)
      et E2E du parcours Filtrer (combinaison ET/OU, réinitialisation,
      persistance, suggestions et historique).
- [ ] **Mutualisation des libellés de statut** : `STATUT_LABELS` dupliqué entre
      `FilterPanel.tsx`, `GameHistory.tsx` et `trackingUtils.ts`
      (`CONVENTIONS.md` § 5) — déjà signalé au Sprint 3.
- [ ] **Mutualisation de `normaliser()`** : fonction identique copiée dans
      `SearchBar.tsx` et `useFilters.ts` (et filtrage `recherche` de
      `GameList.tsx` à harmoniser avec `applyFilters`).
- [ ] **Branchement API REST** : persistance toujours en `localStorage`
      (`sweatbook_games`, `sweatbook_filters`, `sweatbook_search_history`),
      reporté depuis le Sprint 2.
- [ ] Reportés des sprints précédents (inchangés) : renommage de la clé
      `localStorage`, arbitrage des conventions de nommage (FR vs API,
      difficulté 1–3 vs 1–5, 3 statuts vs 2), pagination de `GameList`,
      progression par série, saisie de la partie (Parcours 3 / R3).

## 6. Écarts / risques

- **`FiltreStatut` défini deux fois** : `useGames.ts`
  (`UnlockGame['statut'] | 'tous'`) et `useFilters.ts`
  (`UnlockGame['statut']`) exposent le même nom de type pour des sémantiques
  différentes (filtre « tous » vs multi-sélection). Risque de confusion à
  l'import — à renommer ou mutualiser (`CONVENTIONS.md` § 4 : pas de type
  dupliqué).
- **Filtre de durée simplifié vs R6** : `dureeMax` ne couvre pas l'intervalle
  « > 90 min » ni les bornes basses ; la sélection `DUREES_FILTRE` contient
  30 et 75 min, absentes de `FUNCTIONAL.md` (qui cite 45/60/90).
- **Recherche et filtres non liés au catalogue** : `CatalogueScreen` conserve
  sa propre recherche/filtre série (`CatalogueScreen.tsx` + `GameList.tsx`),
  avec une logique de filtrage partiellement dupliquée par rapport à
  `applyFilters`. Deux expériences « filtres » coexistent ; la cible
  fonctionnelle (Parcours 2) est couverte par l'onglet « Filtres », mais la
  mutualisation reste à décider.
- **Persistance multi-clés** : trois clés `localStorage` (`sweatbook_games`,
  `sweatbook_filters`, `sweatbook_search_history`) sans préfixe commun ni
  migration — reprise du risque signalé au Sprint 3 sur le branchement API.
- **Suggestions limitées à 6 résultats** calculées sur toute la collection à
  chaque frappe (`useMemo`) : correct pour la démo (~15 jeux), à revisiter si
  la collection grandit (indexation, debounce).
