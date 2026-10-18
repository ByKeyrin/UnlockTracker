# UnlockTracker — Sprint 2 : Catalogue

Suivi du Sprint 2 du client React (`client/`). Documentation détaillée du module :
`docs/CATALOGUE.md`. Conventions : `docs/CONVENTIONS.md`, `docs/TEMPLATES.md`.

- **Date de rédaction** : 2026-10-18 (agent BIC, documentation)
- **Code livré par** : Pixel (agent code)
- **Statut du doc** : code observé au moment de la rédaction (commit `802f6b4`
  « sprint2: catalogue des jeux Unlock (données, filtres, recherche) »). Git géré
  par Pixel — BIC ne commit ni ne push.

## 1. Objectif

Rendre l'écran **Catalogue** réellement fonctionnel : afficher la collection des jeux
*Unlock!*, la parcourir (recherche, filtre par série, tri) et marquer un jeu comme joué.
C'est la première brique fonctionnelle de l'application après le squelette du Sprint 1
(navigation par onglets, dark mode, smoke tests).

Périmètre retenu pour ce sprint : **frontend uniquement**, persistance `localStorage`
avec jeu de démonstration (`data/games.ts`). Le branchement à l'API REST est reporté
(sous-section « Restant »).

## 2. Composants livrés

| Fichier | Rôle |
|---|---|
| `client/src/features/catalogue/GameCard.tsx` | Carte d'un jeu (nom, série, numéro, thème, durée, difficulté ⭐, statut) + bouton « Marquer comme joué » |
| `client/src/features/catalogue/GameList.tsx` | Grille responsive de `GameCard`, compteur, tri (série / difficulté), recherche nom ou thème, état vide |
| `client/src/features/catalogue/CatalogueScreen.tsx` | Écran : recherche, filtre par série (7 séries + « Toutes »), orchestration via `useGames` |
| `client/src/hooks/useGames.ts` | Hook de collection : chargement, persistance `localStorage`, CRUD (`addGame`, `updateGame`, `deleteGame`), `markPlayed`, `resetDemo`, filtres |
| `client/src/data/games.ts` | Données de démo : 20 jeux Unlock! (séries 1–7), export `DEMO_GAMES` |
| `client/src/types/index.ts` | Type `UnlockGame` partagé (déjà présent, consommé par le module) |

Intégration : `App.tsx` monte `CatalogueScreen` sur l'onglet « Catalogue » (onglet actif
par défaut).

## 3. Fonctionnalités

- [x] Affichage de la collection en grille responsive (1 / 2 / 3 colonnes).
- [x] Recherche textuelle insensible à la casse sur le **nom** et le **thème**.
- [x] Filtre par **série** (boutons `aria-pressed`, toggle « Toutes »).
- [x] Tri par **série** (défaut, tri numérique naturel) ou par **difficulté**,
      avec départage alphabétique français.
- [x] Marquage d'un jeu comme **joué** (`markPlayed` → statut `termine`, bouton désactivé).
- [x] Badge de statut coloré (3 statuts : `non_joue`, `en_cours`, `termine`), variant `dark:`.
- [x] Difficulté affichée en étoiles avec `aria-label` accessible.
- [x] État vide (« Aucun jeu ne correspond à la recherche. »).
- [x] Persistance de la collection en `localStorage` (clé `sweatbook_games`), données
      de démo au premier lancement, `resetDemo()` pour réinitialiser.
- [x] CRUD complet exposé par `useGames` (ajout / mise à jour / suppression) — non
      encore câblé dans l'UI (réservé aux écrans Suivi / Filtres).
- [x] Audit JSDoc conforme `docs/CONVENTIONS.md` § 2 (détail dans `docs/CATALOGUE.md` § 6).

## 4. Tests

| Type | Où | Statut | Commentaire |
|---|---|---|---|
| Smoke tests E2E (Sprint 1) | `client/tests/smoke.spec.ts` (Playwright, agent TEMPER) | ✅ Vert | 3 tests : chargement page + erreurs console, titre, navigation. Dernière exécution enregistrée : `test-results/.last-run.json` → `status: "passed"`. Non rejoués par BIC à l'issue de ce Sprint 2. |
| Typecheck | `npx tsc -b` (`npm run build`) | ✅ OK | Vérifié par BIC le 2026-10-18 : aucune erreur TypeScript sur le code du catalogue. |
| Tests unitaires (hook / composants) | — | ❌ Absents | Aucun test Vitest/RTL ; les tests de nommage prévus (`<Nom>.test.tsx`) ne sont pas encore en place. |
| Tests E2E catalogue | `client/tests/helpers/catalogue.ts` (agent TEMPER, en cours) | 🟡 En cours | Helpers Playwright du catalogue : `seedGames()` (jeu de données déterministe injecté dans `localStorage`), `gameCards()`, `searchGame()`, sélecteur de tri. Le fichier de tests `tests/catalogue.spec.ts` référencé par le helper n'existe pas encore. |

## 5. Restant

- [ ] **Branchement API REST** : remplacer le `localStorage` par `services/api.ts`
      (`GET /api/games` + filtres, `POST /api/games/:id/play`…), cf. `TECHNICAL.md` § 4.
- [ ] **UI des filtres difficulté et statut** : `useGames` les supporte déjà
      (`UseGamesFilters`), mais seul le filtre série est exposé dans le catalogue
      (à intégrer via l'onglet `Filtres` ou `FilterBar`).
- [ ] **Ajout / édition / suppression de jeux dans l'UI** : opérations `addGame`,
      `updateGame`, `deleteGame` prêtes côté hook.
- [ ] **Pagination de `GameList`** prévue par `TECHNICAL.md` § 5 (non implémentée).
- [ ] **Tests** : tests unitaires (`useGames`, `GameList` recherche/tri) et finaliser
      les tests E2E du catalogue (`tests/catalogue.spec.ts` : recherche, filtre série,
      tri, marquage joué — helpers déjà posés par TEMPER).
- [ ] **Alignement des conventions de nommage** : champs français (`nom`, `serie`,
      `difficulte`…) vs noms API prévus (`title`, `series`, `difficulty`…), difficulté
      1–3 vs 1–5, statuts `'non_joue' | 'en_cours' | 'termine'` vs `'todo' | 'played'`
      — arbitrage à trancher (détail : `docs/CATALOGUE.md` § 6).
- [ ] **Renommage de la clé `localStorage`** `'sweatbook_games'` (nom hérité non
      conforme à l'appellation du projet), avec migration.
- [ ] Correction mineure : « Tri disponibles » → « Tris disponibles » (`GameList.tsx`).
- [ ] Extraction des classes Tailwind dupliquées des boutons de série
      (`CatalogueScreen.tsx`, cf. `CONVENTIONS.md` § 5).

## 6. Écarts / risques

- La persistance locale impose une **migration des données** au moment du passage à
  l'API (format `UnlockGame` français ≠ format API `Game` anglais).
- Pas de test automatisé du catalogue : toute régression sur la recherche / le tri ne
  serait pas détectée.
