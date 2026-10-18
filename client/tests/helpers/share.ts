import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Helpers E2E de l'écran « Partage » UnlockTracker.
 * Agent : TEMPER (QA)
 *
 * Ce module centralise les fixtures et les sélecteurs réutilisables des tests
 * du partage (`tests/share.spec.ts`). Si le DOM du partage évolue, on ne
 * modifie les sélecteurs qu'ici, pas dans chaque test.
 *
 * Contrat avec le code de l'application (UI sans profils, collection unique) :
 *   - `ShareScreen` : écran « Partage » (onglet du header), titre « Partage »
 *     (h2), puis une vue d'ensemble en `<ul>` de 4 cartes : « Aventures »,
 *     « Jeux joués », « En cours » et « Progression » (pourcentage) ;
 *   - `SharedList`  : `<section aria-label="Jeux joués" data-testid=
 *     "shared-list">` (h2 « Liste des jeux joués ») listant UNIQUEMENT les
 *     jeux terminés (`statut === 'termine'`), triés par date de fin
 *     décroissante puis par nom, avec le récapitulatif « N jeux terminés sur
 *     M. » ; l'état vide affiche « Aucun jeu terminé pour le moment. ».
 *
 * Données (hook `useGames`) : la collection unique est persistée dans le
 * localStorage sous la clé `sweatbook_games` (JSON `UnlockGame[]`).
 */

/** Clé `localStorage` de la collection unique (hook `useGames`). */
export const GAMES_STORAGE_KEY = 'sweatbook_games';

/** Jeu de test de la collection partagée (forme du hook `useGames`). */
export interface TestShareGame {
  /** Identifiant unique du jeu. */
  id: string;
  /** Nom de l'aventure (français). */
  nom: string;
  /** Titre officiel anglais de l'aventure. */
  nomEn: string;
  /** Série d'appartenance (ex : `'1'`, `'HS'`, `'Short'`). */
  serie: string;
  /** Numéro du jeu dans sa série. */
  numero: number;
  /** Thème du scénario (ex : « Polar »). */
  theme: string;
  /** Difficulté de 1 à 3 (échelle des boîtes Unlock!). */
  difficulte: 1 | 2 | 3;
  /** Durée estimée en minutes. */
  duree: number;
  /** Statut de la partie. */
  statut: 'non_joue' | 'en_cours' | 'termine';
  /** Date de fin de partie (ISO `AAAA-MM-DD`), si terminé. */
  dateFin?: string;
  /** Identifiant de la boîte contenant l'aventure. */
  boiteId: string;
  /** Année de sortie de la boîte. */
  annee: number;
  /** Gamme d'appartenance. */
  gamme: 'originale' | 'star-wars' | 'short';
}

/**
 * Prépare un jeu de données de test déterministe pour l'écran Partage.
 *
 * Les 5 jeux couvrent tous les statuts de la collection partagée :
 *   - « Le Vol du Diamant »      : terminé le 2026-05-10 ;
 *   - « L'Île du Trésor »        : terminé le 2026-03-15 ;
 *   - « Le Mystère de la Momie » : terminé le 2026-05-25 (le plus récent) ;
 *   - « Mission Apollo »         : en cours (donc absent de la liste) ;
 *   - « Le Manoir Hanté »        : jamais joué (absent de la liste).
 *
 * Statistiques attendues sur la vue d'ensemble :
 *   - Aventures : 5 ; Jeux joués : 3 ; En cours : 1 ; Progression : 60 %.
 * Liste des jeux joués attendue (tri par date décroissante) :
 *   1. Le Mystère de la Momie (2026-05-25)
 *   2. Le Vol du Diamant (2026-05-10)
 *   3. L'Île du Trésor (2026-03-15)
 *
 * Les données sont injectées AVANT la navigation via `addInitScript` : elles
 * sont donc en place dès le premier rendu React.
 *
 * @param page - La page Playwright sur laquelle injecter les données
 * @returns La liste des jeux de test (collection partagée), pour les attentes
 * @example
 * const games = seedShareGames(page);   // injection dans le localStorage
 * await openShareScreen(page);
 * expect(games).toHaveLength(5);
 */
export function seedShareGames(page: Page): TestShareGame[] {
  const games = baseGames().map((game) => ({ ...game }));
  // Statuts de la collection partagée : 3 terminés, 1 en cours, 1 non joué.
  const statuts: Record<string, TestShareGame['statut']> = {
    'share-1': 'termine',
    'share-2': 'termine',
    'share-3': 'termine',
    'share-4': 'en_cours',
    'share-5': 'non_joue',
  };
  for (const game of games) {
    game.statut = statuts[game.id];
  }

  injectGames(page, games);
  return games;
}

/**
 * Prépare une collection SANS aucun jeu terminé (état vide de la liste).
 *
 * Les 5 jeux sont tous `non_joue` ou `en_cours` : la liste des jeux joués
 * doit afficher « Aucun jeu terminé pour le moment. » et la vue d'ensemble
 * doit annoncer 0 jeu joué (0 % de progression).
 *
 * @param page - La page Playwright sur laquelle injecter les données
 * @returns La liste des jeux de test injectés
 * @example
 * seedShareGamesWithoutCompleted(page);
 * await openShareScreen(page);
 */
export function seedShareGamesWithoutCompleted(page: Page): TestShareGame[] {
  const games = baseGames().map((game, index) => ({
    ...game,
    statut: index === 0 ? ('en_cours' as const) : ('non_joue' as const),
    dateFin: undefined,
  }));
  injectGames(page, games);
  return games;
}

/**
 * Retourne le catalogue de test de base (statuts neutres, sans date de fin).
 *
 * Copie défensive : chaque appel retourne de nouveaux objets modifiables.
 *
 * @returns Les 5 jeux de test (dates de fin incluses pour les terminés)
 */
function baseGames(): TestShareGame[] {
  return [
    {
      id: 'share-1',
      nom: 'Le Vol du Diamant',
      nomEn: 'The Diamond Heist',
      serie: '1',
      numero: 1,
      theme: 'Polar',
      difficulte: 3,
      duree: 60,
      statut: 'non_joue',
      dateFin: '2026-05-10',
      boiteId: 'escape-adventures',
      annee: 2017,
      gamme: 'originale',
    },
    {
      id: 'share-2',
      nom: "L'Île du Trésor",
      nomEn: 'Treasure Island',
      serie: '1',
      numero: 2,
      theme: 'Aventure',
      difficulte: 1,
      duree: 45,
      statut: 'non_joue',
      dateFin: '2026-03-15',
      boiteId: 'escape-adventures',
      annee: 2017,
      gamme: 'originale',
    },
    {
      id: 'share-3',
      nom: 'Le Mystère de la Momie',
      nomEn: 'The Mummy Mystery',
      serie: '2',
      numero: 1,
      theme: 'Aventure',
      difficulte: 2,
      duree: 90,
      statut: 'non_joue',
      dateFin: '2026-05-25',
      boiteId: 'mystery-adventures',
      annee: 2017,
      gamme: 'originale',
    },
    {
      id: 'share-4',
      nom: 'Mission Apollo',
      nomEn: 'Apollo Mission',
      serie: '2',
      numero: 2,
      theme: 'Science-fiction',
      difficulte: 1,
      duree: 60,
      statut: 'non_joue',
      boiteId: 'mystery-adventures',
      annee: 2017,
      gamme: 'originale',
    },
    {
      id: 'share-5',
      nom: 'Le Manoir Hanté',
      nomEn: 'The Haunted Manor',
      serie: '3',
      numero: 1,
      theme: 'Horreur',
      difficulte: 2,
      duree: 75,
      statut: 'non_joue',
      boiteId: 'secret-adventures',
      annee: 2017,
      gamme: 'originale',
    },
  ];
}

/**
 * Injecte une collection dans le localStorage avant chaque navigation.
 *
 * @param page - La page Playwright courante
 * @param games - La collection à injecter (JSON `UnlockGame[]`)
 */
function injectGames(page: Page, games: TestShareGame[]): void {
  // addInitScript s'exécute avant les scripts de la page à CHAQUE navigation :
  // les données de test sont donc toujours en place au premier rendu React.
  void page.addInitScript(
    (seed: { key: string; games: unknown }) => {
      // On ne seed QUE si la clé est absente : après un rechargement, la
      // persistance de l'application (useGames) doit être respectée.
      if (localStorage.getItem(seed.key) === null) {
        localStorage.setItem(seed.key, JSON.stringify(seed.games));
      }
    },
    { key: GAMES_STORAGE_KEY, games },
  );
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
    page.getByRole('heading', { name: /^partage$/i }),
    'le titre « Partage » doit être affiché',
  ).toBeVisible();
}

/**
 * Retourne la carte de la vue d'ensemble portant un libellé.
 *
 * @param page - La page Playwright courante
 * @param libellé - Le libellé de la carte (« Aventures », « Jeux joués »,
 *                  « En cours » ou « Progression »)
 * @returns Le locator de la carte de statistique
 * @example
 * await expect(overviewCard(page, 'Jeux joués')).toContainText('3');
 */
export function overviewCard(page: Page, libellé: string): Locator {
  return page.getByRole('listitem').filter({ hasText: libellé }).first();
}

/**
 * Retourne la liste des jeux joués (`SharedList`).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de la liste des jeux joués
 */
export function sharedList(page: Page): Locator {
  return page
    .getByTestId('shared-list')
    .or(page.getByRole('region', { name: 'Jeux joués' }))
    .first();
}

/**
 * Retourne le nom d'un jeu affiché dans la liste des jeux joués.
 *
 * Les jeux sont vérifiés par leur nom plutôt que par une structure de DOM
 * précise : le test reste valide que les lignes soient rendues en `<li>`,
 * en `<article>` ou sous toute autre forme.
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du jeu attendu dans la liste
 * @returns Le locator du nom du jeu dans la liste des jeux joués
 */
export function sharedGame(page: Page, nom: string): Locator {
  return sharedList(page).getByText(nom, { exact: true });
}
