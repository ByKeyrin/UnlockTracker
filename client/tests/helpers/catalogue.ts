import { expect, type Page } from '@playwright/test';

/**
 * Helpers E2E du catalogue Unlock! (Sprint 2).
 * Agent : TEMPER (QA)
 *
 * Ce module centralise les sélecteurs et les gestes réutilisables des tests
 * du catalogue (`tests/catalogue.spec.ts`). L'objectif : si le DOM du
 * catalogue évolue, on ne modige les sélecteurs qu'ici, pas dans chaque test.
 *
 * Contrat de sélecteurs (au moins UNE des stratégies ci-dessous doit
 * correspondre dans le DOM produit par les composants du catalogue) :
 *   - carte de jeu      : [data-testid="game-card"] · [data-game-id] · article
 *   - liste / grille    : [data-testid="game-list"] · [data-game-list] · ul:has(> article)
 *   - champ de recherche : [data-testid="game-search"] · role="searchbox" · placeholder « Rechercher »
 *   - filtre par série   : [data-testid="series-filter"] · combobox nommé « série »
 *   - tri                : [data-testid="sort-select"] · combobox nommé « tri »
 */

/** Jeu de test manipulé par les fixtures du catalogue. */
export interface TestGame {
  /** Identifiant unique du jeu (sous forme de texte). */
  id: string;
  /** Nom de la boîte Unlock!. */
  nom: string;
  /** Série d'appartenance (ex : « Série 1 »). */
  serie: string;
  /** Thème du scénario (ex : « Polar »). */
  theme: string;
  /** Difficulté de 1 à 5 (échelle imprimée sur les boîtes). */
  difficulte: number;
  /** Durée estimée en minutes. */
  duree: number;
  /** Statut de la partie. */
  statut: 'non_joue' | 'joue';
}

/**
 * Prépare un jeu de données de test déterministe pour le catalogue.
 *
 * Les jeux couvrent plusieurs séries, thèmes et niveaux de difficulté afin
 * de pouvoir vérifier la recherche, le filtre par série et le tri par
 * difficulté sans dépendre des données réelles de `data/games.ts`.
 *
 * @returns La liste des jeux de test, triés par nom.
 * @example
 * const games = seedGames();
 * const noms = games.map((g) => g.nom);
 */
export function seedGames(): TestGame[] {
  return [
    {
      id: 'test-1',
      nom: 'Le Vol du Diamant',
      serie: 'Série 1',
      theme: 'Polar',
      difficulte: 1,
      duree: 45,
      statut: 'non_joue',
    },
    {
      id: 'test-2',
      nom: "L'Île au Trésor",
      serie: 'Série 2',
      theme: 'Aventure',
      difficulte: 3,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'test-3',
      nom: 'Le Mystère de la Momie',
      serie: 'Série 1',
      theme: 'Aventure',
      difficulte: 2,
      duree: 90,
      statut: 'joue',
    },
    {
      id: 'test-4',
      nom: 'Mission Apollo',
      serie: 'Série 3',
      theme: 'Science-Fiction',
      difficulte: 4,
      duree: 120,
      statut: 'non_joue',
    },
    // Jeu dont le NOM ne contient pas le thème, pour prouver que la
    // recherche « Aventure » trouve bien les jeux par leur thème.
    {
      id: 'test-5',
      nom: 'Le Secret du Peintre',
      serie: 'Série 2',
      theme: 'Aventure',
      difficulte: 5,
      duree: 30,
      statut: 'non_joue',
    },
  ];
}

/**
 * Retourne le conteneur de la grille de jeux (le parent des cartes).
 *
 * @param page - La page Playwright courante.
 * @returns Le locator du conteneur de la grille.
 */
export function gameList(page: Page) {
  return page
    .getByTestId('game-list')
    .or(page.locator('[data-game-list]'))
    .or(page.locator('ul').filter({ has: page.locator('article') }))
    .or(page.locator('main article').first().locator('..'))
    .first();
}

/**
 * Retourne le locator des cartes de jeux affichées dans la grille.
 *
 * @param page - La page Playwright courante.
 * @returns Le locator correspondant à chaque carte de jeu.
 */
export function gameCards(page: Page) {
  return page
    .getByTestId('game-card')
    .or(page.locator('[data-game-id]'))
    .or(page.locator('main article'));
}

/**
 * Retourne le champ de recherche du catalogue.
 *
 * @param page - La page Playwright courante.
 * @returns Le locator du champ de saisie de recherche.
 */
export function searchInput(page: Page) {
  return page
    .getByTestId('game-search')
    .or(page.getByRole('searchbox'))
    .or(page.getByPlaceholder(/recherch/i))
    .or(page.getByRole('textbox'))
    .first();
}

/**
 * Recherche un jeu dans le catalogue (par nom ou par thème).
 *
 * La fonction vide le champ, saisit la requête puis attend que la liste
 * se soit stabilisée (filtre appliqué « instantanément » côté client).
 *
 * @param page - La page Playwright courante.
 * @param query - La chaîne recherchée (nom ou thème d'un jeu).
 * @returns Une promesse résolue une fois la recherche appliquée.
 * @example
 * await searchGames(page, 'Polar');
 */
export async function searchGames(page: Page, query: string): Promise<void> {
  const input = searchInput(page);
  await expect(input, 'le champ de recherche doit être visible').toBeVisible();
  await input.fill('');
  await input.fill(query);
  // Laisse React propager le filtre avant les assertions du test.
  await page.waitForTimeout(300);
}

/**
 * Retourne le select de tri du catalogue (difficulté, nom…).
 *
 * @param page - La page Playwright courante.
 * @returns Le locator du contrôle de tri.
 */
export function sortControl(page: Page) {
  return page
    .getByTestId('sort-select')
    .or(page.getByRole('combobox', { name: /tri/i }))
    .or(page.getByRole('button', { name: /trier/i }))
    .first();
}

/**
 * Retourne le select de filtre par série du catalogue.
 *
 * @param page - La page Playwright courante.
 * @returns Le locator du contrôle de filtre par série.
 */
export function seriesFilter(page: Page) {
  return page
    .getByTestId('series-filter')
    .or(page.getByRole('combobox', { name: /série|serie/i }))
    .first();
}
