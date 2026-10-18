# UnlockTracker — Sprint 3 : Suivi

Suivi du Sprint 3 du client React (`client/`). Documentation détaillée du module :
`docs/SUIVI.md`. Conventions : `docs/CONVENTIONS.md`, `docs/TEMPLATES.md`.

- **Date de rédaction** : 2026-10-18 (agent BIC, documentation)
- **Code livré par** : Pixel (agent code)
- **Statut du doc** : code observé au moment de la rédaction (sprint non encore
  commité — dernier commit `802f6b4` « sprint2: catalogue des jeux Unlock »). Git
  géré par Pixel — BIC ne commit ni ne push.

## 1. Objectif

Rendre l'écran **Suivi** réellement fonctionnel : afficher les **statistiques de la
collection** (total, joués, en cours, non joués, progression), la **chronologie des
parties terminées** et un **historique complet** avec possibilité de réinitialiser un
jeu. C'est la réponse au Parcours 4 (« Vérifier la progression ») et aux règles
métier **R4 — Annulation** et **R9 — Progression** de `docs/FUNCTIONAL.md`.

Périmètre retenu : **frontend uniquement**, persistance `localStorage` inchangée.
La saisie de la date de partie / joueurs (Parcours 3) et le découpage de progression
par série restent hors périmètre (cf. « Restant »).

## 2. Composants livrés

| Fichier | Rôle |
|---|---|
| `client/src/features/tracking/StatsCards.tsx` | 4 cartes de compteurs (Total, Joués, En cours, Non joués) + barre de progression globale en % (`role="progressbar"`) |
| `client/src/features/tracking/PlayedTimeline.tsx` | Chronologie verticale des parties terminées, triées par date de fin décroissante (sans date → en dernier), pastilles de statut |
| `client/src/features/tracking/GameHistory.tsx` | Historique complet filtrable par statut (Tous / Non joués / En cours / Terminés), tri série/numéro, bouton « Réinitialiser » par ligne |
| `client/src/features/tracking/TrackingScreen.tsx` | Écran (onglet « Suivi ») : orchestre les 3 blocs, `handleReset` remet un jeu à `non_joue` et efface `dateFin` |
| `client/src/features/tracking/trackingUtils.ts` | Utilitaires partagés : `STATUT_ICONS`, `STATUT_LABELS`, `formatDate()` (ISO → français long, heure locale) |
| `client/src/types/index.ts` | Extension `UnlockGame` : champ optionnel `dateFin?: string` (ISO `AAAA-MM-JJ`) |
| `client/src/hooks/useGames.ts` | Évolution : `markPlayed` renseigne `dateFin` (date du jour, `todayIso()`), `updateGame` utilisé pour la réinitialisation |
| `client/src/data/games.ts` | Évolution : `dateFin` sur les jeux de démo terminés |

Intégration : `App.tsx` monte `TrackingScreen` sur l'onglet « Suivi ».

## 3. Fonctionnalités

- [x] Statistiques en temps réel (R9) : total, joués, en cours, non joués, calculés
      en `useMemo` à partir des statuts de la collection complète.
- [x] Progression globale en pourcentage (`Math.round(joues / total × 100)`, protégé
      division par zéro) avec barre de progression accessible.
- [x] Chronologie des parties terminées : tri par `dateFin` décroissante, sans date
      en dernier, départage alphabétique français ; date formatée en français
      (« 14 février 2026 ») dans un `<time dateTime>`.
- [x] Historique complet : filtre par statut (`aria-pressed`, `fieldset/legend`),
      tri naturel par série puis numéro, compteur et état vide.
- [x] Réinitialisation d'un jeu (R4) : bouton « Réinitialiser » → statut
      `non_joue`, `dateFin` effacée, bouton désactivé si déjà non joué.
- [x] Formatage de dates ISO robuste (`formatDate`) : heure locale (pas de décalage
      UTC), « Date inconnue » en cas d'entrée absente ou malformée.
- [x] Accessibilité : `aria-label` sur les sections, `progressbar` avec
      `aria-valuenow/min/max`, `<time dateTime>`, décorations `aria-hidden`.
- [x] Dark mode sur tous les blocs (variants `dark:`).
- [x] Audit JSDoc conforme `docs/CONVENTIONS.md` § 2 (détail dans `docs/SUIVI.md` § 6).

## 4. Tests

| Type | Où | Statut | Commentaire |
|---|---|---|---|
| Typecheck | `npx tsc -b` (`npm run build`) | ✅ OK | Vérifié par BIC le 2026-10-18 après livraison du module : aucune erreur TypeScript. |
| Smoke tests E2E (Sprint 1) | `client/tests/smoke.spec.ts` (agent TEMPER) | 🟡 Non rejoués | Dernière exécution connue verte (`test-results/.last-run.json`), non rejouée par BIC sur le code du Sprint 3. |
| Tests E2E catalogue | `client/tests/catalogue.spec.ts` + `tests/helpers/catalogue.ts` (agent TEMPER) | 🟡 Hors périmètre | En cours côté TEMPER, non impactés par ce sprint. |
| Tests du module Suivi | — | ❌ Absents | Aucun test unitaire ni E2E sur StatsCards / PlayedTimeline / GameHistory / TrackingScreen. |

## 5. Restant

- [ ] **Progression par série** (Parcours 4 / R9) : seul le pourcentage **global** est
      affiché ; ajouter le découpage par série (prévu par `FUNCTIONAL.md`).
- [ ] **Saisie de la partie** (Parcours 3 / R3) : date de partie et joueurs
      (`Kevin, Copine` pré-remplis) à la saisie du marquage « joué » — aujourd'hui
      `dateFin` est auto-remplie à la date du jour, sans joueurs
      (cf. table `plays` de `TECHNICAL.md` : `played_at`, `players`, `success`, `notes`).
- [ ] **Tests** : tests unitaires (`formatDate`, calculs de `StatsCards`, tri de
      `PlayedTimeline`/`GameHistory`) et tests E2E du Suivi (réinitialisation,
      filtres de l'historique).
- [ ] **Mutualisation des tables de statut** : `STATUT_LABELS` / classes de badges
      dupliqués entre `GameCard.tsx` (catalogue), `GameHistory.tsx` et
      `trackingUtils.ts` (`CONVENTIONS.md` § 5).
- [ ] **Branchement API REST** : persistance toujours en `localStorage`
      (`sweatbook_games`), reporté depuis le Sprint 2.
- [ ] Reporté du Sprint 2 (inchangé) : renommage de la clé `localStorage`, arbitrage
      des conventions de nommage (FR vs API, difficulté 1–3 vs 1–5, 3 statuts vs 2),
      pagination de `GameList`, UI des filtres difficulté/statut.

## 6. Écarts / risques

- **Champ `dateFin` ajouté aux données persistées** : les collections déjà présentes
  dans le `localStorage` (Sprint 2) n'ont pas de `dateFin` — les jeux déjà marqués
  `termine` s'afficheront « Date inconnue » en chronologie et seront triés en
  dernier. Aucune migration n'est prévue au Sprint 3 (reprise manuelle ou
  `resetDemo()`).
- **Modèle de données partiel** vs `FUNCTIONAL.md` : pas de joueurs, pas de date de
  partie saisie, pas de statut de succès — la table `plays` de `TECHNICAL.md` n'est
  pas encore modélisée (une partie ≠ un jeu). Risque de refonte du suivi au moment
  du branchement API.
- Le tri de la chronologie compare les dates en **chaînes ISO** : correct pour
  `AAAA-MM-JJ`, mais dépendant de la validité des saisies (`formatDate` absorbe les
  cas invalides côté affichage, le tri les met en dernier).
