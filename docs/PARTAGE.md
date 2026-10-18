# UnlockTracker — Module Partage (Sprint 5)

Documentation du module de **partage multi-utilisateurs** du client React
(`client/`). Conventions : `docs/CONVENTIONS.md`, `docs/TEMPLATES.md`.
Compte rendu de sprint : `docs/SPRINT_05.md`.

- **Date de rédaction** : 2026-10-18 (agent BIC, documentation)
- **Code livré par** : Pixel (agent code)
- **Périmètre observé** : `client/src/features/share/`,
  `client/src/hooks/useProfile.ts` et `client/src/data/profiles.ts`

---

## 1. Description du module

Le module donne vie à la dimension **partagée** d'UnlockTracker : Kevin et sa
copine disposent chacun d'un **profil** avec sa propre progression, et
l'écran « Partage » compare leurs statistiques et liste les jeux joués par
l'un et/ou l'autre. Il répond à la **R5 — Listes partagées** de
`docs/FUNCTIONAL.md` (« un jeu marqué joué par l'un apparaît [dans la vue
partagée] pour l'autre ») et au **Parcours 4 — Vérifier la progression**
(croiser « qui a fait quoi »).

Principes du module :

- **Profils nommés** : deux profils fixes (`kevin`, `copine`) définis une fois
  pour toutes dans `data/profiles.ts` (`PROFILS`), avec avatar emoji et
  couleur d'accent dédiée par composant.
- **Collections séparées par profil** : chaque profil possède sa propre
  liste de jeux suivis, indexée par `ProfilId` (`GamesByProfil`). C'est une
  évolution du modèle « une seule liste commune » des sprints 1–4 (voir
  « Écarts / risques » dans `docs/SPRINT_05.md`).
- **Persistance `localStorage`** : le profil actif est mémorisé
  (`sweatbook_profile`) et chaque collection est écrite dans sa propre clé
  (`sweatbook_profile_games_<id>`), avec repli silencieux sur les données de
  démonstration par profil en cas de clé absente ou corrompue.
- **Changement de profil instantané** : la sélection est un état React persisté
  ; aucun rechargement de page n'est nécessaire.
- **Comparaison** : statistiques par profil (joués, en cours, progression,
  minutes jouées), palmarès « qui a joué le plus ? » et barre comparative.

Fichiers du module :

| Fichier | Rôle |
|---|---|
| `client/src/features/share/ShareScreen.tsx` | Écran « Partage » : assemble le sélecteur, les stats et la liste partagée |
| `client/src/features/share/ProfileSelector.tsx` | Sélecteur de profil actif (avatar + nom, couleurs par profil) |
| `client/src/features/share/ProfileStats.tsx` | Statistiques par profil + comparaison (leader, barre comparative) |
| `client/src/features/share/SharedList.tsx` | Liste partagée des jeux joués, filtrable par profil / « ensemble » |
| `client/src/hooks/useProfile.ts` | Profil actif, collections par profil, persistance `localStorage` |
| `client/src/data/profiles.ts` | Données des profils (`PROFILS`) et démonstration par profil |

Intégration : `App.tsx` ajoute l'onglet **« Partage »**
(`Onglet = 'catalogue' | 'suivi' | 'filtres' | 'partage'` dans
`types/index.ts`) qui monte `ShareScreen`. Les types `Profil` et `ProfilId`
sont définis dans `types/index.ts` (source unique, `CONVENTIONS.md` § 4).

---

## 2. Composants

### 2.1 `ProfileSelector` — `client/src/features/share/ProfileSelector.tsx`

Sélecteur de profil actif. Props (`ProfileSelectorProps`, chacune documentée) :

| Prop | Type | Rôle |
|---|---|---|
| `profils` | `Profil[]` | Profils à afficher |
| `profilActifId` | `ProfilId` | Profil actuellement sélectionné |
| `onSelectProfil` | `(id: ProfilId) => void` | Changement de profil |

Rendu : `<section aria-label="Choix du profil">` avec titre « Qui joue ? » et
une liste de boutons (`<button aria-pressed>`), chacun portant l'avatar
(`aria-hidden`) et le nom du profil, avec le sous-titre « Profil actif » ou
« Changer de profil ». Couleurs d'accent par profil dans la constante locale
`PROFIL_ACCENTS` (indigo pour Kevin, rose pour la copine ; variantes
actif/inactif, dark mode inclus). Accessibilité : `focus-visible:ring-2`,
`aria-pressed` sur les boutons de sélection.

### 2.2 `ProfileStats` — `client/src/features/share/ProfileStats.tsx`

Statistiques séparées par profil et comparaison. Props
(`ProfileStatsProps`) :

| Prop | Type | Rôle |
|---|---|---|
| `profils` | `Profil[]` | Profils à comparer |
| `gamesByProfil` | `GamesByProfil` | Jeux suivis par chaque profil |

Contenu :

1. **Cartes par profil** (une par profil) : jeux joués, en cours, progression
   (en %) et minutes jouées, plus une barre de progression
   (`role="progressbar"`, `aria-valuenow/min/max`) colorée par profil
   (`PROFIL_BARRES`).
2. **Palmarès** « 🏆 … a joué le plus » — ou « Égalité parfaite » si les deux
   profils ont le même total (`leader === null`).
3. **Barre comparative** (`role="img"` + `aria-label`) : répartition des jeux
   terminés entre les profils, avec légende détaillée (nom, nombre, part en %).

Statistiques calculées par la fonction interne `calculerStats(games)`
(interface `StatistiquesProfil`, documentée champ par champ) :

| Champ | Calcul |
|---|---|
| `joues` | jeux de statut `termine` |
| `enCours` | jeux de statut `en_cours` |
| `total` | nombre de jeux suivis |
| `progression` | `joues / total × 100` (arrondi, 0 si total vide) |
| `minutesJouees` | somme des durées des jeux terminés |

### 2.3 `SharedList` — `client/src/features/share/SharedList.tsx`

Liste partagée des jeux joués. Props (`SharedListProps`) :

| Prop | Type | Rôle |
|---|---|---|
| `profils` | `Profil[]` | Profils à représenter |
| `gamesByProfil` | `GamesByProfil` | Jeux suivis par chaque profil |

Comportements :

- **Union des jeux joués** : les lignes sont construites dans l'ordre de la
  collection du premier profil (`useMemo`), en retenant les jeux **terminés par
  au moins un profil** (`jouePar` contient les identifiants des profils ayant
  terminé le jeu ; interface interne `LignePartagee`).
- **Filtres** (`FiltrePartage`, état local) : « Tous les joués » (`tous`),
  « Joués ensemble » (`ensemble`, jeu terminé par **tous** les profils),
  ou un profil précis (`kevin` / `copine`) — libellés dans `FILTRE_LABELS`.
  Boutons en `aria-pressed`.
- **En-tête** : compte le nombre de jeux joués par au moins un profil et dont
  le nombre de terminaisons communes (`nbCommuns`).
- **Lignes** : nom, série et thème du jeu, plus un **badge par profil**
  (✅ vert si le profil a terminé le jeu, « — » gris sinon) avec texte
  `sr-only` explicite et `title` explicatif.
- **État vide** : « Aucun jeu ne correspond à ce filtre pour le moment. »

### 2.4 `ShareScreen` — `client/src/features/share/ShareScreen.tsx`

Écran (onglet « Partage »), sans props. Il appelle `useProfile()` et assemble
`ProfileSelector`, `ProfileStats` et `SharedList`, avec un en-tête qui affiche
le profil actif (« Partage 😎 Kevin ») et une accroche de contexte.

---

## 3. Hook `useProfile` — `client/src/hooks/useProfile.ts`

```ts
const { profils, profilActif, games, gamesByProfil, setProfilActif, updateGame } = useProfile()
```

- **Entrée** : aucune.
- **Sortie** (`UseProfileResult`, objet nommé, chaque champ documenté) :

| Valeur | Type | Rôle |
|---|---|---|
| `profils` | `Profil[]` | Profils disponibles (constante `PROFILS`) |
| `profilActif` | `Profil` | Profil sélectionné (repli sur `PROFILS[0]` si identifiant inconnu) |
| `games` | `UnlockGame[]` | Collection du profil actif |
| `gamesByProfil` | `GamesByProfil` | Collections de tous les profils (`Record<ProfilId, UnlockGame[]>`) |
| `setProfilActif` | `(id: ProfilId) => void` | Change de profil (instantané, persisté) |
| `updateGame` | `(id: string, patch: Partial<Omit<UnlockGame, 'id'>>) => void` | Met à jour un jeu de la collection du profil actif |

Persistance (deux `useEffect`) :

- le profil actif est réécrit dans `sweatbook_profile` à chaque changement ;
- **toutes** les collections sont réécrites dans
  `sweatbook_profile_games_<profilId>` à chaque modification de
  `gamesByProfil`.

Chargement au montage (fonctions internes documentées) :

- `loadProfilActif()` : lit `sweatbook_profile`, n'accepte que `kevin` ou
  `copine`, sinon (valeur absente, invalide ou `localStorage` indisponible)
  revient à `kevin`.
- `loadAllGames()` / `loadGames(profilId)` : lit `sweatbook_profile_games_<id>` ;
  si la clé est absente, le JSON est corrompu ou le résultat n'est pas un
  tableau, retombe sur `seedGamesForProfil(profilId)` (données de démo),
  sans erreur bloquante.

---

## 4. Données par profil — `client/src/data/profiles.ts`

### 4.1 Profils

Constante `PROFILS: Profil[]` (types `Profil` / `ProfilId` dans
`types/index.ts`) :

| `id` | `nom` | `avatar` | Couleur d'accent (sélecteur / barres) |
|---|---|---|---|
| `kevin` | Kevin | 😎 | indigo (`indigo-*`) |
| `copine` | Copine | 🥰 | rose (`rose-*`) |

### 4.2 Démonstration par profil

`seedGamesForProfil(profilId)` clone la collection de démo (`DEMO_GAMES` de
`data/games.ts`) et applique pour la copine les ajustements de
`COPIE_OVERRIDES`, afin que les vues « ensemble » et « par profil » soient
différenciées au premier lancement :

| Jeu (`id`) | Ajustement profil « copine » | Effet |
|---|---|---|
| `unlock-2-1` | `statut: 'non_joue'`, `dateFin` effacée | terminé par Kevin seul |
| `unlock-2-2` | `statut: 'termine'`, `dateFin: '2026-05-10'` | terminé par la copine seule |
| `unlock-3-1` | `statut: 'termine'`, `dateFin: '2026-05-24'` | terminé par la copine seule |

Kevin reçoit la démo telle quelle.

### 4.3 Clés de persistance

| Clé `localStorage` | Contenu | Écrit par |
|---|---|---|
| `sweatbook_profile` | Identifiant du profil actif (`kevin` \| `copine`) | `useProfile` |
| `sweatbook_profile_games_kevin` | Collection de Kevin (`UnlockGame[]` JSON) | `useProfile` |
| `sweatbook_profile_games_copine` | Collection de la copine (`UnlockGame[]` JSON) | `useProfile` |

Les autres écrans utilisent toujours la clé globale `sweatbook_games`
(`useGames`, Sprints 1–4) — voir « Restant ».

---

## 5. Restant (non couvert par le module)

- **Branchement des autres écrans sur les profils** : le Catalogue, le Suivi et
  les Filtres restent pilotés par `useGames()` (`sweatbook_games`), sans lien
  avec les collections par profil. Changer de profil dans « Partage » ne
  modifie pas ce qui est affiché ailleurs.
- **R5 — statuts communs** : `FUNCTIONAL.md` prévoit une liste *commune*
  (« un jeu marqué joué par l'un apparaît joué pour l'autre ») ; le code
  implémente des statuts *par profil* et une vue comparative. Évolution à
  confirmer côté fonctionnel (arbitrage reporté dans `docs/SPRINT_05.md`).
- **Saisie des joueurs / date de partie** (Parcours 3 / R3) : `updateGame`
  existe mais aucun écran de saisie n'est branché dessus dans ce module.
- **Tests unitaires** : `calculerStats`, `seedGamesForProfil` et la logique
  d'union de `SharedList` ne sont pas couverts par des tests unitaires.
- **Profils extensibles** : `ProfilId` est une union fermée
  (`'kevin' | 'copine'`) et les couleurs (`PROFIL_ACCENTS`, `PROFIL_BARRES`,
  `FILTRE_LABELS`) sont câblées en dur pour ces deux profils.

## 6. Audit JSDoc (Étape 1)

Vérification au regard de `docs/CONVENTIONS.md` § 2 (description en français à
la troisième personne, `@param` par paramètre nommé, `@returns` sauf composants
React, JSDoc sur les interfaces **et** leurs champs, `@example` attendu) :

| Élément | Fichier | Statut |
|---|---|---|
| `ProfileSelector` + `ProfileSelectorProps` (3 champs) | `ProfileSelector.tsx` | ✅ Conforme (bloc composant + interface + `@param props` + `@example`) |
| `ProfileStats` + `ProfileStatsProps` (2 champs) | `ProfileStats.tsx` | ✅ Conforme |
| `StatistiquesProfil` (5 champs) + `calculerStats` | `ProfileStats.tsx` | ✅ Conformes (`@param` + `@returns`) |
| `SharedList` + `SharedListProps` (2 champs) | `SharedList.tsx` | ✅ Conforme |
| `FiltrePartage` / `LignePartagee` (2 champs) | `SharedList.tsx` | ✅ Conformes (types exportés et internes documentés) |
| `ShareScreen` | `ShareScreen.tsx` | ✅ Conforme (`@example` ; `@returns` non requis pour un composant React) |
| `useProfile` + `UseProfileResult` (6 champs) + `GamesByProfil` | `useProfile.ts` | ✅ Conformes (`@returns` + `@example`) |
| `loadProfilActif` / `loadAllGames` / `loadGames` | `useProfile.ts` | ✅ Conformes (`@param` + `@returns`) |
| `PROFILS`, `COPIE_OVERRIDES`, `seedGamesForProfil` | `profiles.ts` | ✅ Conformes (`seedGamesForProfil` avec `@param`/`@returns`/`@example`) |
| Constantes locales (`STORAGE_KEY_PROFIL`, `STORAGE_KEY_GAMES_PREFIX`, `PROFIL_ACCENTS`, `PROFIL_BARRES`, `FILTRE_LABELS`) | tous | ✅ JSDoc d'une ligne présent |

**Aucune correction de JSDoc nécessaire** : tout composant, hook, fonction
exportée et type exporté porte un bloc conforme. Aucune retouche de code n'a
été effectuée par BIC (Pixel gère le code et le git).

### Remarques mineures

- Handlers internes et commentaires de section du JSX (`{/* Cartes de
  statistiques… */}`) documentés en commentaire simple — acceptable pour du
  code non exporté, conforme à l'esprit de la convention (cf. même choix au
  Sprint 4).
- `PROFIL_BARRES` est typé `Record<string, string>` là où `PROFIL_ACCENTS`
  est typé `Record<ProfilId, …>` : les deux devraient viser `ProfilId` pour
  coller à `CONVENTIONS.md` § 4 (typage strict). Sans impact fonctionnel.
