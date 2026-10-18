import { expect, type Locator, type Page } from '@playwright/test';
import { STORAGE_KEY, type TestGame } from './catalogue';

/**
 * Helpers E2E de l'écran « Filtres » UnlockTracker (Sprint 4).
 * Agent : TEMPER (QA)
 *
 * Ce module centralise les fixtures et les sélecteurs réutilisables des tests
 * des filtres (`tests/filters.spec.ts`). Si le DOM des filtres évolue, on ne
 * modifie les sélecteurs qu'ici, pas dans chaque test.
 *
 * Contrat avec le code de l'application (composants de Pixel, sprint 4) :
 *   - `FilterPanel` : panneau latéral `<aside>` (desktop) contenant 3
 *     `<fieldset>` de cases à cocher — « Série » (« Série 1 », « Série 2 »…),
 *     « Difficulté » (étoiles avec `aria-label="Difficulté N sur 3"`) et
 *     « Statut » (« Non joué », « En cours », « Terminé ») — plus un select
 *     « Durée maximale » et un bouton « Réinitialiser les filtres » ;
 *   - `SearchBar`   : `<input type="search">` (role `combobox`) labellisé
 *     « Rechercher », avec autocomplétion : `<ul role="listbox">` contenant
 *     des `<li role="option">` cliquables ;
 *   - `FiltersScreen` : compteur de résultats « N résultat(s) »
 *     (`aria-live="polite"`) et liste des jeux filtrés (composant `GameCard`) ;
 *   - les filtres sont MULTI-SÉLECTION : dans un groupe, cocher plusieurs
 *     cases élargit les résultats (OU) ; entre les groupes, les filtres se
 *     combinent (ET) ; recherche instantanée sur le nom ou le thème.
 */

/**
 * Prépare un jeu de données de test déterministe pour l'écran Filtres.
 *
 * Les 5 jeux couvrent 3 séries, les 3 difficultés ET les 3 statuts afin de
 * pouvoir vérifier chaque filtre indépendamment des autres :
 *   - série 1 : Le Vol du Diamant (diff. 3, non joué), L'Île du Trésor
 *     (diff. 1, en cours) ;
 *   - série 2 : Le Mystère de la Momie (diff. 2, terminé), Mission Apollo
 *     (diff. 1, non joué) ;
 *   - série 3 : Le Manoir Hanté (diff. 2, terminé).
 *
 * Les jeux sont injectés dans le `localStorage` AVANT la navigation
 * (clé `sweatbook_games` lue par le hook `useGames`).
 *
 * @param page - La page Playwright sur laquelle injecter les données (optionnel)
 * @returns La liste des jeux de test injectés, pour calculer les attentes
 * @example
 * const games = seedFilterGames(page);   // injection dans le localStorage
 * await openFiltersScreen(page);
 * expect(await readResultCount(page)).toBe(games.length);
 */
export function seedFilterGames(page?: Page): TestGame[] {
  const fixtures: TestGame[] = [
    {
      id: 'filter-1',
      nom: 'Le Vol du Diamant',
      serie: '1',
      numero: 1,
      theme: 'Polar',
      difficulte: 3,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'filter-2',
      nom: "L'Île du Trésor",
      serie: '1',
      numero: 2,
      theme: 'Aventure',
      difficulte: 1,
      duree: 45,
      statut: 'en_cours',
    },
    {
      id: 'filter-3',
      nom: 'Le Mystère de la Momie',
      serie: '2',
      numero: 1,
      theme: 'Aventure',
      difficulte: 2,
      duree: 90,
      statut: 'termine',
    },
    {
      id: 'filter-4',
      nom: 'Mission Apollo',
      serie: '2',
      numero: 2,
      theme: 'Science-fiction',
      difficulte: 1,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'filter-5',
      nom: 'Le Manoir Hanté',
      serie: '3',
      numero: 1,
      theme: 'Horreur',
      difficulte: 2,
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
 * Ouvre l'onglet « Filtres » de l'application.
 *
 * @param page - La page Playwright courante
 * @returns Une promesse résolue une fois l'écran Filtres affiché
 * @example
 * await openFiltersScreen(page);
 */
export async function openFiltersScreen(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // L'application est une SPA à onglets : l'écran Filtres s'ouvre par le
  // bouton d'onglet « Filtres » du header (composant App).
  await page.getByRole('button', { name: 'Filtres', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Filtres' }),
    'le titre « Filtres » doit être affiché',
  ).toBeVisible();
}

/**
 * Retourne le panneau de filtres (`FilterPanel`).
 *
 * Sur desktop, c'est le panneau latéral `<aside>` ; en mobile, la modal
 * `role="dialog"` quand elle est ouverte.
 *
 * @param page - La page Playwright courante
 * @returns Le locator du panneau de filtres
 */
export function filterPanel(page: Page): Locator {
  return page
    .getByTestId('filter-panel')
    .or(page.getByRole('complementary'))
    .or(page.locator('main aside'))
    .first();
}

/**
 * Retourne la case à cocher d'un filtre par série (« Série 1 », « Série 2 »…).
 *
 * @param page - La page Playwright courante
 * @param serie - Le numéro de série (`'1'`, `'2'`…)
 * @returns Le locator de la case à cocher correspondante
 * @example
 * await serieCheckbox(page, '1').check();
 */
export function serieCheckbox(page: Page, serie: string): Locator {
  return filterPanel(page)
    .locator('label')
    .filter({ hasText: `Série ${serie}` })
    .getByRole('checkbox');
}

/**
 * Retourne la case à cocher d'un filtre par difficulté (1 à 3 étoiles).
 *
 * @param page - La page Playwright courante
 * @param difficulte - Le niveau de difficulté (1, 2 ou 3)
 * @returns Le locator de la case à cocher correspondante
 * @example
 * await difficulteCheckbox(page, 2).check();
 */
export function difficulteCheckbox(page: Page, difficulte: number): Locator {
  return filterPanel(page)
    .locator('label')
    .filter({
      has: page.locator(`[aria-label="Difficulté ${difficulte} sur 3"]`),
    })
    .getByRole('checkbox');
}

/**
 * Retourne la case à cocher d'un filtre par statut.
 *
 * @param page - La page Playwright courante
 * @param statut - Le statut visé (`'non_joue'`, `'en_cours'`, `'termine'`)
 * @returns Le locator de la case à cocher correspondante
 * @example
 * await statutCheckbox(page, 'termine').check();
 */
export function statutCheckbox(
  page: Page,
  statut: 'non_joue' | 'en_cours' | 'termine',
): Locator {
  const libelles: Record<string, string> = {
    non_joue: 'Non joué',
    en_cours: 'En cours',
    termine: 'Terminé',
  };
  return filterPanel(page)
    .locator('label')
    .filter({ hasText: new RegExp(`^\\s*${libelles[statut]}\\s*$`) })
    .getByRole('checkbox');
}

/**
 * Retourne le champ de recherche des filtres (« Rechercher »).
 *
 * @param page - La page Playwright courante
 * @returns Le locator du champ de saisie de recherche
 */
export function searchInput(page: Page): Locator {
  return page
    .getByTestId('filter-search')
    .or(page.getByRole('combobox', { name: /recherch/i }))
    .or(page.getByLabel(/recherch/i))
    .first();
}

/**
 * Retourne les suggestions affichées par l'autocomplétion de la recherche.
 *
 * @param page - La page Playwright courante
 * @returns Le locator des suggestions (`role="option"`)
 */
export function autocompleteOptions(page: Page): Locator {
  return page.getByRole('option').filter({ visible: true });
}

/**
 * Retourne la suggestion d'autocomplétion contenant un texte donné.
 *
 * @param page - La page Playwright courante
 * @param texte - Le texte cherché dans les suggestions (ex : « Momie »)
 * @returns Le locator cliquable de la suggestion
 * @example
 * await suggestion(page, 'Momie').click();
 */
export function suggestion(page: Page, texte: string): Locator {
  return autocompleteOptions(page)
    .filter({ hasText: texte })
    .first()
    .getByRole('button');
}

/**
 * Retourne le compteur de résultats des filtres (« N résultat(s) »).
 *
 * @param page - La page Playwright courante
 * @returns Le locator du compteur de résultats
 */
export function resultsCounter(page: Page): Locator {
  return page
    .getByTestId('results-count')
    .or(page.locator('main').getByText(/\d+\s*résultat/i))
    .first();
}

/**
 * Retourne le bouton « Réinitialiser les filtres » du panneau de filtres.
 *
 * @param page - La page Playwright courante
 * @returns Le locator du bouton de réinitialisation
 */
export function resetButton(page: Page): Locator {
  return page.getByRole('button', { name: /réinitialiser/i });
}

/**
 * Retourne le résultat (nom de jeu) affiché par l'écran Filtres.
 *
 * Les résultats sont vérifiés par leur nom plutôt que par une structure de
 * DOM précise : le test reste valide que les jeux soient rendus en `<article>`,
 * en `<li>` ou sous toute autre forme.
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du jeu attendu dans les résultats
 * @returns Le locator du nom du jeu dans les résultats
 */
export function resultByName(page: Page, nom: string): Locator {
  return page.locator('main').getByText(nom, { exact: true });
}

/**
 * Lit la valeur affichée par le compteur de résultats.
 *
 * @param page - La page Playwright courante
 * @returns Le nombre de résultats affiché par le compteur
 * @example
 * expect(await readResultCount(page)).toBe(2);
 */
export async function readResultCount(page: Page): Promise<number> {
  const texte = await resultsCounter(page).innerText();
  const match = /\d+/.exec(texte);
  expect(
    match,
    `le compteur « ${texte} » doit contenir un nombre`,
  ).not.toBeNull();
  return Number(match![0]);
}
