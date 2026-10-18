# UnlockTracker — Sprint 5 : Partage

Suivi du Sprint 5 du client React (`client/`). Documentation détaillée du module :
`docs/PARTAGE.md`. Conventions : `docs/CONVENTIONS.md`, `docs/TEMPLATES.md`.

- **Date de rédaction** : 2026-10-18 (agent BIC, documentation)
- **Code livré par** : Pixel (agent code)
- **Tests E2E** : TEMPER (agent QA), `client/tests/share.spec.ts`
- **Statut du doc** : code observé au moment de la rédaction (sprint non encore
  commité — dernier commit `2284a1b` « ci: ajout déploiement GitHub Pages » ;
  fichiers du sprint en working tree). Git géré par Pixel — BIC ne commit ni ne
  push.

## 1. Objectif

Donner à Kevin et sa copine une **vue partagée de leur progression** : chacun
son **profil**, ses propres jeux suivis, et un écran « Partage » qui compare
les statistiques des deux joueurs et liste les jeux joués par l'un et/ou
l'autre. C'est la réponse à la **R5 — Listes partagées** et au **Parcours 4 —
« Vérifier la progression »** de `docs/FUNCTIONAL.md`, avec une évolution du
modèle de données (collections **par profil**, cf. « Restant » et « Écarts »).

Périmètre retenu : **frontend uniquement**, persistance `localStorage`
(`sweatbook_profile`, `sweatbook_profile_games_<id>`). Le branchement des
autres écrans sur les profils, la saisie de partie (Parcours 3 / R3) et les
tests unitaires restent hors périmètre (cf. « Restant »).

## 2. Composants livrés

| Fichier | Rôle |
|---|---|
| `client/src/features/share/ProfileSelector.tsx` | Sélecteur de profil actif : boutons avatar + nom, `aria-pressed`, couleurs d'accent par profil (`PROFIL_ACCENTS`), changement instantané |
| `client/src/features/share/ProfileStats.tsx` | Statistiques par profil (joués, en cours, progression %, minutes jouées) + palmarès « qui a joué le plus » + barre comparative ; calculs via `calculerStats` |
| `client/src/features/share/SharedList.tsx` | Liste partagée des jeux terminés par au moins un profil : badges par profil (✅ / —), filtres « Tous les joués / Joués ensemble / par profil » (`FiltrePartage`) |
| `client/src/features/share/ShareScreen.tsx` | Écran onglet « Partage » : en-tête + `ProfileSelector` + `ProfileStats` + `SharedList` |
| `client/src/hooks/useProfile.ts` | Profil actif, collections par profil (`GamesByProfil`), `setProfilActif`, `updateGame`, persistance `localStorage` avec repli démo |
| `client/src/data/profiles.ts` | `PROFILS` (Kevin 😎 / Copine 🥰) et `seedGamesForProfil` (démonstration différenciée par profil) |

Intégration : `App.tsx` ajoute l'onglet **« Partage »**
(`Onglet = 'catalogue' | 'suivi' | 'filtres' | 'partage'`) qui monte
`ShareScreen` ; `types/index.ts` ajoute les types `Profil` et `ProfilId`.

## 3. Fonctionnalités

- [x] **Sélecteur de profil** instantané (Kevin / Copine), sélection persistée
      (`sweatbook_profile`) et repli silencieux sur « kevin » si la valeur est
      absente ou invalide.
- [x] **Données par profil** : collection de jeux propre à chaque profil
      (`sweatbook_profile_games_<id>`), chargée avec repli sur la démonstration
      par profil en cas de clé absente ou de JSON corrompu.
- [x] **Démonstration différenciée** au premier lancement : la copine reçoit
      une variante de `DEMO_GAMES` (`COPIE_OVERRIDES`) pour que les vues
      « ensemble » et « par profil » soient parlantes.
- [x] **Statistiques par profil** : jeux joués, en cours, progression (%),
      minutes jouées cumulées.
- [x] **Comparaison** : palmarès « 🏆 … a joué le plus » (« Égalité parfaite »
      en cas d'égalité) et barre comparative de répartition avec légende.
- [x] **Liste partagée** : union des jeux terminés par au moins un profil,
      badges par profil (« ✅ » vert / « — » gris, texte `sr-only`), compteur
      des jeux communs.
- [x] **Filtres de la liste partagée** : « Tous les joués », « Joués ensemble »
      (terminés par les deux), ou un profil précis.
- [x] **Accessibilité** : `aria-pressed` sur les sélecteurs, `role="progressbar"`
      avec `aria-valuenow/min/max`, `role="img"` + `aria-label` sur la barre
      comparative, `sr-only` sur les badges, `focus-visible:ring-2`.
- [x] **Dark mode** sur l'ensemble des blocs (variants `dark:`).
- [x] **Audit JSDoc** conforme `docs/CONVENTIONS.md` § 2 (détail dans
      `docs/PARTAGE.md` § 6) : aucune correction nécessaire.

## 4. Tests

| Type | Où | Statut | Commentaire |
|---|---|---|---|
| Typecheck | `npx tsc -b` | ✅ OK | Vérifié par BIC le 2026-10-18 après livraison du module : aucune erreur TypeScript. |
| E2E Partage | `client/tests/share.spec.ts` + `client/tests/helpers/share.ts` (agent TEMPER) | 🔴 4 passés / 3 échoués | Rejoué par BIC le 2026-10-18 (`npx playwright test tests/share.spec.ts`). Passent : chargement de la page, sélecteur visible, changement de profil, stats par profil. Échouent : « la comparaison est visible », « la liste partagée fonctionne », « le filtre par profil fonctionne » — les fixtures injectent `sweatbook_games` / `sweatbook_profiles` alors que l'app lit `sweatbook_profile_games_<id>` / `sweatbook_profile` (voir « Écarts / risques »). |
| Tests E2E catalogue / tracking / filtres | `client/tests/catalogue.spec.ts`, `tracking.spec.ts`, `filters.spec.ts` | 🟡 Non rejoués | Hors périmètre du Sprint 5 ; non rejoués par BIC. |
| Tests unitaires du module Partage | — | ❌ Absents | Aucun test de `calculerStats`, `seedGamesForProfil`, `loadProfilActif`/`loadGames`, ni de l'union/filtrage de `SharedList`. |

## 5. Restant

- [ ] **Stabiliser les E2E Partage** (3 rouges) : aligner les clés
      `localStorage` entre les fixtures TEMPER et l'application (ou adapter les
      helpers), et pourvoir le DOM des `data-testid` attendus
      (`profile-selector`, `profile-stats`, `profile-comparison`,
      `shared-list`…) si le contrat avec TEMPER est retenu.
- [ ] **Brancher les autres écrans sur les profils** : Catalogue, Suivi et
      Filtres utilisent toujours `useGames()` (`sweatbook_games`) — changer de
      profil dans « Partage » n'a aucun effet ailleurs.
- [ ] **Arbitrage R5** : statuts communs (FUNCTIONAL.md) vs statuts par profil
      (code) — trancher et mettre à jour le référentiel fonctionnel.
- [ ] **Saisie de la partie** (Parcours 3 / R3) : `updateGame` est prêt mais
      aucun écran de saisie (date, joueurs, notes) n'est branché.
- [ ] **Tests unitaires** : `calculerStats`, `seedGamesForProfil`,
      `loadProfilActif`/`loadGames`, logique d'union et de filtre de
      `SharedList`.
- [ ] **Profils extensibles** : `ProfilId` en union fermée et couleurs
      (`PROFIL_ACCENTS`, `PROFIL_BARRES`, `FILTRE_LABELS`) câblées en dur pour
      deux profils.
- [ ] Reportés des sprints précédents (inchangés) : branchement API REST,
      persistance multi-clés sans préfixe commun, renommage des clés
      `localStorage`, mutualisation `STATUT_LABELS` / `normaliser()`,
      intervalles de durée R6, pagination de `GameList`.

## 6. Écarts / risques

- **R5 non respectée à la lettre** : `FUNCTIONAL.md` décrit des statuts
  **communs** (« un jeu marqué joué par l'un apparaît joué pour l'autre »),
  alors que le Sprint 5 introduit des **collections séparées par profil** avec
  comparaison. Cohérent avec la demande de comparaison, mais c'est un
  changement de modèle — décision fonctionnelle à entériner.
- **Deux modèles de données cohabitants** : la collection globale
  (`sweatbook_games`, `useGames`) et les collections par profil
  (`sweatbook_profile_games_<id>`, `useProfile`) ne sont pas reliées. La démo
  du Partage diverge donc de celle des autres onglets après quelques actions.
- **Fixtures E2E non alignées** (cause probable des 3 tests rouges) : les
  helpers TEMPER seedent `sweatbook_games` (clé du catalogue) et
  `sweatbook_profiles` (clé inexistante côté app) ; l'application lit
  `sweatbook_profile_games_kevin` / `sweatbook_profile_games_copine` et
  `sweatbook_profile`. Les jeux injectés par les tests ne sont donc jamais
  lus par `useProfile` (repli sur la démonstration).
- **`data-testid` attendus absents** : les helpers recherchent
  `profile-selector`, `profile-stats`, `profile-comparison` en priorité ; les
  composants de Pixel n'en exposent aucun (seuls les fallbacks sémantiques —
  rôles, libellés français — fonctionnent). Le contrat d'intégration décrit
  dans `tests/helpers/share.ts` (liste « Tous les profils »…) diffère aussi
  des libellés réels (« Tous les joués », « Joués ensemble »).
- **Typage `PROFIL_BARRES`** : `Record<string, string>` au lieu de
  `Record<ProfilId, string>` (`CONVENTIONS.md` § 4) — mineur, sans impact
  fonctionnel.
- **Persistance multi-clés** : `sweatbook_profile`,
  `sweatbook_profile_games_*`, `sweatbook_games`, `sweatbook_filters`,
  `sweatbook_search_history` — cinq familles de clés sans préfixe commun ni
  migration ; reprise du risque signalé depuis le Sprint 3.
