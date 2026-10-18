import { expect, type Page } from '@playwright/test';

/**
 * Helpers E2E du catalogue Unlock! (Sprint 2).
 * Agent : TEMPER (QA)
 *
 * Ce module centralise les fixtures et les sélecteurs réutilisables des tests
 * du catalogue (`tests/catalogue.spec.ts`). Si le DOM du catalogue évolue, on
 * ne modifie les sélecteurs qu'ici, pas dans chaque test.
 *
 * Contrat avec le code de l'application (hook `useGames`) :
 *   - la collection est persistée dans `localStorage` sous la clé
 *     `sweatbook_games` → `seedGames()` injecte des données de test dedans ;
 *   - chaque carte de jeu est un `<article>` (composant `GameCard`) ;
 *   - la grille est un `<ul>` contenant ces articles (composant `GameList`) ;
 *   - la recherche est un `<input type="search">` labellisé « Rechercher » ;
 *   - le filtre par série est un groupe de boutons « Toutes » / « Série N » ;
 *   - le tri est un `<select>` labellisé « Trier par » (Série | Difficulté).
 */

/** Clé `localStorage` utilisée par `useGames` pour persister la collection. */
export const STORAGE_KEY = 'sweatbook_games';

/** Jeu de test manipulé par les fixtures du catalogue. */
export interface TestGame {
  /** Identifiant unique du jeu. */
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
  /** Statut de la partie. */
  statut: 'non_joue' | 'en_cours' | 'termine';
}

/**
 * Prépare un jeu de données de test déterministe pour le catalogue.
 *
 * Les jeux couvrent 2 séries, plusieurs thèmes et les 3 niveaux de difficulté
 * afin de pouvoir vérifier la recherche (nom + thème), le filtre par série et
 * le tri par difficulté sans dépendre des données de démonstration.
 *
 * Si un `page` est fourni, les jeux sont injectés dans le `localStorage` du
 * navigateur AVANT la navigation : `useGames` les chargera au démarrage.
 *
 * @param page - La page Playwright sur laquelle injecter les données (optionnel)
 * @returns La liste des jeux de test injectés, pour calculer les attentes
 * @example
 * const games = seedGames(page);          // injection dans le localStorage
 * await page.goto('/');
 * await expect(gameCards(page)).toHaveCount(games.length);
 */
export function seedGames(page?: Page): TestGame[] {
  // Copie défensive : chaque test reçoit ses propres objets modifiables.
  const fixtures: TestGame[] = [
    {
      id: 'test-1',
      nom: 'Le Vol du Diamant',
      serie: '1',
      numero: 1,
      theme: 'Polar',
      difficulte: 3,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'test-2',
      nom: "L'Île du Trésor",
      serie: '1',
      numero: 2,
      theme: 'Aventure',
      difficulte: 1,
      duree: 45,
      statut: 'non_joue',
    },
    {
      id: 'test-3',
      nom: 'Le Mystère de la Momie',
      serie: '2',
      numero: 1,
      theme: 'Aventure',
      difficulte: 2,
      duree: 90,
      statut: 'non_joue',
    },
    {
      // Déjà terminé : sert à vérifier le rendu du statut « Joué ✓ ».
      id: 'test-4',
      nom: 'Mission Apollo',
      serie: '2',
      numero: 2,
      theme: 'Science-fiction',
      difficulte: 1,
      duree: 60,
      statut: 'termine',
    },
  ];
  // Copie défensive : chaque test reçoit ses propres objets modifiables.
  const games = fixtures.map((game) => ({ ...game }));

  if (page) {
    // addInitScript s'exécute avant les scripts de la page à CHAQUE navigation :
    // les données de test sont donc toujours en place au premier rendu React.
    void page.addInitScript(
      (seed: { storageKey: string; value: unknown }) => {
        // On ne seed QUE si la clé est absente : après un rechargement, la
        // persistance de l'application (useGames) doit être respectée.
        if (localStorage.getItem(seed.storageKey) === null) {
          localStorage.setItem(seed.storageKey, JSON.stringify(seed.value));
        }
      },
      { storageKey: STORAGE_KEY, value: games },
    );
  }

  return games;
}

/**
 * Retourne le locator des cartes de jeux affichées dans la grille.
 *
 * @param page - La page Playwright courante
 * @returns Le locator correspondant à chaque carte de jeu (`GameCard`)
 */
export function gameCards(page: Page) {
  // Priorité au `data-testid` s'il est ajouté un jour, sinon les <article>
  // rendus par GameCard dans le <main> font l'affaire.
  return page
    .getByTestId('game-card')
    .or(page.locator('main article'))
    .filter({ visible: true });
}

/**
 * Retourne le conteneur de la grille de jeux (le `<ul>` des cartes).
 *
 * @param page - La page Playwright courante
 * @returns Le locator du conteneur de la grille (`GameList`)
 */
export function gameList(page: Page) {
  return page
    .getByTestId('game-list')
    .or(page.locator('main ul').filter({ has: page.locator('article') }))
    .first();
}

/**
 * Retourne le champ de recherche du catalogue (« Rechercher »).
 *
 * @param page - La page Playwright courante
 * @returns Le locator du champ de saisie de recherche
 */
export function searchInput(page: Page) {
  return page
    .getByRole('searchbox', { name: /recherch/i })
    .or(page.getByLabel(/recherch/i))
    .first();
}

/**
 * Recherche un jeu dans le catalogue (par nom ou par thème).
 *
 * La fonction vide le champ, saisit la requête puis attend que la valeur soit
 * bien prise en compte par React avant de rendre la main au test.
 *
 * @param page - La page Playwright courante
 * @param query - La chaîne recherchée (nom ou thème d'un jeu)
 * @returns Une promesse résolue une fois la recherche appliquée
 * @example
 * await searchGames(page, 'Polar');
 */
export async function searchGames(page: Page, query: string): Promise<void> {
  const input = searchInput(page);
  await expect(input, 'le champ de recherche doit être visible').toBeVisible();
  await input.fill(query);
  await expect(input).toHaveValue(query);
}

/**
 * Retourne le bouton de filtre par série (« Toutes » ou « Série N »).
 *
 * @param page - La page Playwright courante
 * @param serie - Le numéro de série (`'1'`, `'2'`…) ou `undefined` pour « Toutes »
 * @returns Le locator du bouton de filtre demandé
 * @example
 * await seriesButton(page, '2').click();
 */
export function seriesButton(page: Page, serie?: string) {
  const name = serie === undefined ? /^toutes$/i : new RegExp(`^série ${serie}$`, 'i');
  return page.getByRole('button', { name, exact: true });
}

/**
 * Retourne le select de tri du catalogue (« Trier par : Série | Difficulté »).
 *
 * @param page - La page Playwright courante
 * @returns Le locator du contrôle de tri
 */
export function sortControl(page: Page) {
  return page
    .getByLabel(/trier par/i)
    .or(page.getByRole('combobox'))
    .first();
}
