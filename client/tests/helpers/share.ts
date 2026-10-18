import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Helpers E2E de l'écran « Partage » UnlockTracker (Sprint 5).
 * Agent : TEMPER (QA)
 *
 * Ce module centralise les fixtures et les sélecteurs réutilisables des tests
 * du partage multi-utilisateurs (`tests/share.spec.ts`). Si le DOM du partage
 * évolue, on ne modifie les sélecteurs qu'ici, pas dans chaque test.
 *
 * Contrat avec le code de l'application (composants de Pixel, sprint 5) :
 *   - `ShareScreen`     : écran « Partage » (onglet du header), titre
 *     « Partage 🎭 NomDuProfil » (h2) ;
 *   - `ProfileSelector` : `<section aria-label="Choix du profil">` avec un
 *     bouton par profil (« Kevin », « Copine »), `aria-pressed` sur le profil
 *     actif ; la sélection est persistée dans le localStorage (clé
 *     `sweatbook_profile`, valeur brute `'kevin'` ou `'copine'`) ;
 *   - `ProfileStats`    : `<section aria-label="Statistiques par profil">`
 *     avec une carte par profil (« Jeux joués », « En cours », « Progression »,
 *     « Minutes jouées ») et une barre `role="progressbar"` nommée
 *     « Progression de <Profil> » ;
 *   - comparaison       : barre `role="img"` « Répartition comparative des
 *     jeux terminés par profil », message « … a joué le plus … » (ou
 *     « Égalité parfaite ») et légende « Kevin : N jeux (P %) » ;
 *   - `SharedList`      : `<section aria-label="Jeux joués par les profils">`
 *     (h2 « Liste partagée ») listant les jeux terminés par AU MOINS un
 *     profil (règle R5 : statuts communs), avec des boutons de filtre
 *     (`aria-label="Filtres de la liste partagée"`) : « Tous les joués »,
 *     « Joués ensemble », « Kevin », « Copine ».
 *
 * Données (hook `useProfile`) : la collection de chaque profil est persistée
 * dans le localStorage sous la clé `sweatbook_profile_games_<id>` (JSON
 * `UnlockGame[]`). Les profils sont fixes : « Kevin » et « Copine ».
 */

/** Clé `localStorage` du profil actif (valeur brute `'kevin'` ou `'copine'`). */
export const ACTIVE_PROFILE_KEY = 'sweatbook_profile';

/** Préfixe des clés `localStorage` des collections de jeux par profil. */
export const PROFILE_GAMES_PREFIX = 'sweatbook_profile_games_';

/** Jeu de test partagé entre les profils (forme du hook `useProfile`). */
export interface TestShareGame {
  /** Identifiant unique du jeu (commun aux deux profils). */
  id: string;
  /** Nom de la boîte Unlock!. */
  nom: string;
  /** Série d'appartenance (simple chiffre, ex : `'2'`). */
  serie: string;
  /** Numéro du jeu dans sa série. */
  numero: number;
  /** Thème du scénario (ex : « Polar »). */
  theme: string;
  /** Difficulté de 1 à 3 (échelle des boîtes Unlock!). */
  difficulte: 1 | 2 | 3;
  /** Durée estimée en minutes. */
  duree: number;
  /** Statut de la partie POUR le profil concerné. */
  statut: 'non_joue' | 'en_cours' | 'termine';
  /** Date de fin de partie (ISO `AAAA-MM-DD`), si terminé. */
  dateFin?: string;
}

/**
 * Prépare un jeu de données de test déterministe pour l'écran Partage.
 *
 * Les 5 jeux sont suivis par les DEUX profils mais avec des statuts
 * différents, ce qui couvre tous les cas de la liste partagée :
 *   - « Le Vol du Diamant »    : terminé par Kevin ET Copine (« ensemble ») ;
 *   - « L'Île du Trésor »      : terminé par Kevin seul ;
 *   - « Le Mystère de la Momie » : terminé par Copine seule ;
 *   - « Mission Apollo »       : en cours pour les deux (donc absent de la
 *     liste partagée, qui ne montre que les jeux terminés) ;
 *   - « Le Manoir Hanté »      : terminé par Kevin seul.
 *
 * Statistiques attendues :
 *   - Kevin  : 3 joués, 1 en cours, 60 %, 180 min ;
 *   - Copine : 2 joués, 1 en cours, 40 %, 150 min.
 *
 * Les données sont injectées AVANT la navigation via `addInitScript` : elles
 * sont donc en place dès le premier rendu React.
 *
 * @param page - La page Playwright sur laquelle injecter les données
 * @returns La liste des jeux de test (catalogue commun), pour les attentes
 * @example
 * const games = seedShareGames(page);   // injection dans le localStorage
 * await openShareScreen(page);
 * expect(games).toHaveLength(5);
 */
export function seedShareGames(page: Page): TestShareGame[] {
  /** Catalogue commun aux deux profils (statuts neutres, non joués). */
  const catalogue: TestShareGame[] = [
    {
      id: 'share-1',
      nom: 'Le Vol du Diamant',
      serie: '1',
      numero: 1,
      theme: 'Polar',
      difficulte: 3,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'share-2',
      nom: "L'Île du Trésor",
      serie: '1',
      numero: 2,
      theme: 'Aventure',
      difficulte: 1,
      duree: 45,
      statut: 'non_joue',
    },
    {
      id: 'share-3',
      nom: 'Le Mystère de la Momie',
      serie: '2',
      numero: 1,
      theme: 'Aventure',
      difficulte: 2,
      duree: 90,
      statut: 'non_joue',
    },
    {
      id: 'share-4',
      nom: 'Mission Apollo',
      serie: '2',
      numero: 2,
      theme: 'Science-fiction',
      difficulte: 1,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'share-5',
      nom: 'Le Manoir Hanté',
      serie: '3',
      numero: 1,
      theme: 'Horreur',
      difficulte: 2,
      duree: 75,
      statut: 'non_joue',
    },
  ];

  /** Statuts propres à Kevin : 3 terminés (Vol, Île, Manoir), 1 en cours. */
  const statutsKevin: Record<string, TestShareGame['statut']> = {
    'share-1': 'termine',
    'share-2': 'termine',
    'share-3': 'non_joue',
    'share-4': 'en_cours',
    'share-5': 'termine',
  };
  /** Statuts propres à Copine : 2 terminés (Vol, Momie), 1 en cours. */
  const statutsCopine: Record<string, TestShareGame['statut']> = {
    'share-1': 'termine',
    'share-2': 'non_joue',
    'share-3': 'termine',
    'share-4': 'en_cours',
    'share-5': 'non_joue',
  };

  // Copie défensive : chaque test reçoit ses propres objets modifiables.
  const games = catalogue.map((game) => ({ ...game }));
  const kevinGames = games.map((game) => ({ ...game, statut: statutsKevin[game.id] }));
  const copineGames = games.map((game) => ({
    ...game,
    statut: statutsCopine[game.id],
    dateFin: statutsCopine[game.id] === 'termine' ? '2026-05-10' : undefined,
  }));

  // addInitScript s'exécute avant les scripts de la page à CHAQUE navigation :
  // les données de test sont donc toujours en place au premier rendu React.
  void page.addInitScript(
    (seed: {
      activeKey: string;
      prefix: string;
      kevin: unknown;
      copine: unknown;
    }) => {
      // On ne seed QUE si la clé est absente : après un rechargement, la
      // persistance de l'application (useProfile) doit être respectée.
      if (localStorage.getItem(seed.activeKey) === null) {
        localStorage.setItem(seed.activeKey, 'kevin');
      }
      if (localStorage.getItem(seed.prefix + 'kevin') === null) {
        localStorage.setItem(seed.prefix + 'kevin', JSON.stringify(seed.kevin));
      }
      if (localStorage.getItem(seed.prefix + 'copine') === null) {
        localStorage.setItem(
          seed.prefix + 'copine',
          JSON.stringify(seed.copine),
        );
      }
    },
    {
      activeKey: ACTIVE_PROFILE_KEY,
      prefix: PROFILE_GAMES_PREFIX,
      kevin: kevinGames,
      copine: copineGames,
    },
  );

  return games;
}

/**
 * Ouvre l'onglet « Partage » de l'application.
 *
 * @param page - La page Playwright courante
 * @returns Une promesse résolue une fois l'écran Partage affiché
 * @example
 * await openShareScreen(page);
 */
export async function openShareScreen(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // L'application est une SPA à onglets : l'écran Partage s'ouvre par le
  // bouton d'onglet « Partage » du header (composant App).
  await page.getByRole('button', { name: 'Partage', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: /partage/i }),
    'le titre « Partage » doit être affiché',
  ).toBeVisible();
}

/**
 * Retourne le sélecteur de profil (`ProfileSelector`).
 *
 * @param page - La page Playwright courante
 * @returns Le locator du sélecteur de profil
 */
export function profileSelector(page: Page): Locator {
  return page
    .getByTestId('profile-selector')
    .or(page.getByRole('region', { name: 'Choix du profil' }))
    .first();
}

/**
 * Retourne le bouton de choix d'un profil (« Kevin », « Copine »).
 *
 * Le bouton porte `aria-pressed="true"` quand le profil est actif, et son
 * nom accessible inclut « Profil actif » ou « Changer de profil ».
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du profil (ex : « Copine »)
 * @returns Le locator cliquable du bouton de profil
 * @example
 * await profileOption(page, 'Copine').click();
 */
export function profileOption(page: Page, nom: string): Locator {
  return profileSelector(page).getByRole('button', { name: nom });
}

/**
 * Change le profil actif via le `ProfileSelector` (clic sur son bouton).
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du profil à activer (ex : « Copine »)
 * @returns Une promesse résolue une fois le profil sélectionné
 * @example
 * await selectProfile(page, 'Copine');
 */
export async function selectProfile(page: Page, nom: string): Promise<void> {
  await profileOption(page, nom).click();
}

/**
 * Retourne la zone de statistiques par profil (`ProfileStats`).
 *
 * @param page - La page Playwright courante
 * @returns Le locator des statistiques par profil
 */
export function profileStats(page: Page): Locator {
  return page
    .getByTestId('profile-stats')
    .or(page.getByRole('region', { name: 'Statistiques par profil' }))
    .first();
}

/**
 * Retourne la barre de progression d'un profil (« Progression de Kevin »).
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du profil (ex : « Kevin »)
 * @returns Le locator de la barre de progression du profil
 * @example
 * await expect(progressionBar(page, 'Kevin')).toHaveAttribute('aria-valuenow', '60');
 */
export function progressionBar(page: Page, nom: string): Locator {
  return page.getByRole('progressbar', { name: `Progression de ${nom}` });
}

/**
 * Retourne la barre de comparaison des profils (vue « qui a joué le plus »).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de la barre comparative
 */
export function comparisonBar(page: Page): Locator {
  return page
    .getByTestId('profile-comparison')
    .or(
      page.getByRole('img', {
        name: 'Répartition comparative des jeux terminés par profil',
      }),
    )
    .first();
}

/**
 * Retourne la liste partagée des jeux (`SharedList`).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de la liste partagée
 */
export function sharedList(page: Page): Locator {
  return page
    .getByTestId('shared-list')
    .or(page.getByRole('region', { name: 'Jeux joués par les profils' }))
    .first();
}

/**
 * Retourne le nom d'un jeu affiché dans la liste partagée.
 *
 * Les jeux sont vérifiés par leur nom plutôt que par une structure de DOM
 * précise : le test reste valide que les lignes soient rendues en `<li>`,
 * en `<article>` ou sous toute autre forme.
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du jeu attendu dans la liste partagée
 * @returns Le locator du nom du jeu dans la liste partagée
 */
export function sharedGame(page: Page, nom: string): Locator {
  return sharedList(page).getByText(nom, { exact: true });
}

/**
 * Retourne un bouton de filtre de la liste partagée.
 *
 * @param page - La page Playwright courante
 * @param libelle - Le libellé exact du filtre (« Tous les joués »,
 *                  « Joués ensemble », « Kevin » ou « Copine »)
 * @returns Le locator cliquable du bouton de filtre
 * @example
 * await filterButton(page, 'Joués ensemble').click();
 */
export function filterButton(page: Page, libelle: string): Locator {
  return sharedList(page).getByRole('button', { name: libelle, exact: true });
}

/**
 * Applique un filtre de la liste partagée.
 *
 * @param page - La page Playwright courante
 * @param libelle - Le libellé exact du filtre à appliquer
 * @returns Une promesse résolue une fois le filtre appliqué
 * @example
 * await applyProfileFilter(page, 'Kevin');
 */
export async function applyProfileFilter(
  page: Page,
  libelle: string,
): Promise<void> {
  await filterButton(page, libelle).click();
}
