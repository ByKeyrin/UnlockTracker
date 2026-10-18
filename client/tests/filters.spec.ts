import { expect, test } from '@playwright/test';
import {
  autocompleteOptions,
  difficulteCheckbox,
  filterPanel,
  openFiltersScreen,
  readResultCount,
  resetButton,
  resultByName,
  resultsCounter,
  searchInput,
  seedFilterGames,
  serieCheckbox,
  statutCheckbox,
  suggestion,
} from './helpers/filters';

/**
 * UnlockTracker — Tests E2E des filtres (Sprint 4)
 * Agent : TEMPER (QA)
 *
 * Objectif : vérifier le parcours « Filtrer pour choisir un jeu »
 * (FUNCTIONAL.md) sur l'écran Filtres :
 *   1. La page filtres se charge (onglet « Filtres », aucune erreur console)
 *   2. Le panneau de filtres est visible (série, difficulté, statut, recherche)
 *   3. Le filtre par série fonctionne
 *   4. Le filtre par difficulté fonctionne
 *   5. Le filtre par statut fonctionne
 *   6. La recherche avec autocomplétion fonctionne
 *   7. Le compteur de résultats se met à jour
 *   8. Le bouton « Réinitialiser » efface les filtres
 *
 * Les données de test sont injectées dans le localStorage par
 * `seedFilterGames()` : 5 jeux couvrant 3 séries, les 3 difficultés et les
 * 3 statuts. Les filtres sont des cases à cocher multi-sélection
 * (OU dans un groupe, ET entre les groupes).
 */

test.describe('Filtres — UnlockTracker', () => {
  /**
   * Vérifie que la page des filtres se charge correctement.
   *
   * Étapes :
   *   1. On ouvre l'application puis l'onglet « Filtres ».
   *   2. On vérifie que le titre de la section « Filtres » s'affiche.
   *   3. On vérifie qu'aucune erreur console n'est survenue au chargement.
   */
  test('la page filtres se charge', async ({ page }) => {
    // On collecte les erreurs console pour détecter un crash de rendu.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Filtres', exact: true }).click();

    // Le titre de la section filtres est visible.
    await expect(
      page.getByRole('heading', { name: 'Filtres' }),
      'le titre « Filtres » doit être affiché',
    ).toBeVisible();

    // Le contenu principal de l'écran est rendu (pas d'écran vide).
    await expect(page.locator('main')).not.toBeEmpty();

    // Aucune erreur console bloquante (les warnings sont tolérés).
    expect(
      consoleErrors,
      `erreurs console détectées : ${consoleErrors.join(' | ')}`,
    ).toEqual([]);
  });

  /**
   * Vérifie que le panneau de filtres est visible et complet.
   *
   * Étapes :
   *   1. On ouvre l'écran Filtres avec 5 jeux de test.
   *   2. On vérifie que le panneau de filtres (`FilterPanel`) est affiché.
   *   3. On vérifie que les 3 groupes de filtres (« Série », « Difficulté »,
   *      « Statut »), la barre de recherche et le bouton « Réinitialiser les
   *      filtres » sont tous présents.
   */
  test('le panneau de filtres est visible', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // Le panneau de filtres est affiché dans le contenu principal.
    await expect(
      filterPanel(page),
      'le panneau de filtres doit être visible',
    ).toBeVisible();

    // Les 3 groupes de filtres sont présents (fieldset « Série »,
    // « Difficulté » et « Statut »).
    for (const groupe of ['Série', 'Difficulté', 'Statut'] as const) {
      await expect(
        filterPanel(page).getByRole('group', { name: groupe }),
        `le groupe de filtres « ${groupe} » doit être présent`,
      ).toBeVisible();
    }

    // La barre de recherche et le bouton de réinitialisation sont présents.
    await expect(searchInput(page)).toBeVisible();
    await expect(resetButton(page)).toBeVisible();
  });

  /**
   * Vérifie que le filtre par série fonctionne.
   *
   * Étapes :
   *   1. On coche la série 1 : seuls ses 2 jeux restent affichés
   *      (« Le Vol du Diamant » et « L'Île du Trésor »).
   *   2. On décoche la série 1 : les 5 jeux reviennent (aucune série
   *      cochée = toutes les séries).
   */
  test('le filtre par série fonctionne', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // 1. Filtre « Série 1 » : Le Vol du Diamant + L'Île du Trésor.
    await serieCheckbox(page, '1').check();
    await expect(resultsCounter(page)).toContainText('2');
    await expect(
      resultByName(page, 'Le Vol du Diamant'),
      'le 1er jeu de la série 1 doit rester affiché',
    ).toBeVisible();
    await expect(
      resultByName(page, "L'Île du Trésor"),
      'le 2e jeu de la série 1 doit rester affiché',
    ).toBeVisible();
    await expect(
      resultByName(page, 'Mission Apollo'),
      'les jeux des autres séries doivent disparaître',
    ).toBeHidden();

    // 2. Décocher la série : la liste complète revient.
    await serieCheckbox(page, '1').uncheck();
    await expect(resultsCounter(page)).toContainText('5');
    await expect(resultByName(page, 'Mission Apollo')).toBeVisible();
    await expect(resultByName(page, 'Le Manoir Hanté')).toBeVisible();
  });

  /**
   * Vérifie que le filtre par difficulté fonctionne.
   *
   * Étapes :
   *   1. On coche la difficulté 2 (2 étoiles) : seuls les 2 jeux de
   *      difficulté 2 restent affichés (« Le Mystère de la Momie » et
   *      « Le Manoir Hanté »).
   *   2. On bascule sur la difficulté 3 : un seul jeu reste (« Le Vol du
   *      Diamant »), les faciles (difficulté 1) sont masqués.
   */
  test('le filtre par difficulté fonctionne', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // 1. Difficulté 2 : Le Mystère de la Momie + Le Manoir Hanté.
    await difficulteCheckbox(page, 2).check();
    await expect(resultsCounter(page)).toContainText('2');
    await expect(resultByName(page, 'Le Mystère de la Momie')).toBeVisible();
    await expect(resultByName(page, 'Le Manoir Hanté')).toBeVisible();
    await expect(
      resultByName(page, "L'Île du Trésor"),
      "les jeux d'une autre difficulté doivent disparaître",
    ).toBeHidden();

    // 2. Difficulté 3 : Le Vol du Diamant uniquement.
    await difficulteCheckbox(page, 2).uncheck();
    await difficulteCheckbox(page, 3).check();
    await expect(resultsCounter(page)).toContainText('1');
    await expect(resultByName(page, 'Le Vol du Diamant')).toBeVisible();
    await expect(
      resultByName(page, 'Mission Apollo'),
      "les jeux de difficulté 1 ne doivent pas s'afficher",
    ).toBeHidden();
  });

  /**
   * Vérifie que le filtre par statut fonctionne.
   *
   * Étapes :
   *   1. On coche le statut « Terminé » : seuls les 2 jeux terminés restent
   *      affichés (« Le Mystère de la Momie » et « Le Manoir Hanté »).
   *   2. On bascule sur « En cours » : un seul jeu reste (« L'Île du Trésor »).
   *   3. On décoche tout : les 5 jeux reviennent.
   */
  test('le filtre par statut fonctionne', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // 1. Statut « Terminé » : Le Mystère de la Momie + Le Manoir Hanté.
    await statutCheckbox(page, 'termine').check();
    await expect(resultsCounter(page)).toContainText('2');
    await expect(resultByName(page, 'Le Mystère de la Momie')).toBeVisible();
    await expect(resultByName(page, 'Le Manoir Hanté')).toBeVisible();
    await expect(
      resultByName(page, 'Mission Apollo'),
      'les jeux non joués doivent disparaître',
    ).toBeHidden();

    // 2. Statut « En cours » : L'Île du Trésor uniquement.
    await statutCheckbox(page, 'termine').uncheck();
    await statutCheckbox(page, 'en_cours').check();
    await expect(resultsCounter(page)).toContainText('1');
    await expect(resultByName(page, "L'Île du Trésor")).toBeVisible();

    // 3. Aucun statut coché : la liste complète revient.
    await statutCheckbox(page, 'en_cours').uncheck();
    await expect(resultsCounter(page)).toContainText('5');
    await expect(resultByName(page, 'Le Vol du Diamant')).toBeVisible();
  });

  /**
   * Vérifie que la recherche avec autocomplétion fonctionne.
   *
   * Étapes :
   *   1. On tape « mom » dans la recherche : une liste de suggestions apparaît
   *      (autocomplétion) avec « Le Mystère de la Momie ».
   *   2. On clique sur la suggestion : la liste se ferme, la recherche est
   *      validée et le résultat correspondant est affiché seul (compteur à 1).
   */
  test('la recherche avec autocomplétion fonctionne', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // 1. Saisie partielle : l'autocomplétion propose le jeu correspondant.
    await searchInput(page).fill('mom');
    await expect(
      autocompleteOptions(page),
      "l'autocomplétion doit proposer des suggestions",
    ).not.toHaveCount(0);
    await expect(
      suggestion(page, 'Momie'),
      'la suggestion « Le Mystère de la Momie » doit être proposée',
    ).toBeVisible();

    // 2. Sélection de la suggestion : seul ce jeu reste dans les résultats.
    await suggestion(page, 'Momie').click();
    await expect(
      resultByName(page, 'Le Mystère de la Momie'),
      "le jeu choisi dans l'autocomplétion doit s'afficher",
    ).toBeVisible();
    await expect(
      resultByName(page, 'Mission Apollo'),
      'les autres jeux ne doivent pas s’afficher',
    ).toBeHidden();
    await expect(resultsCounter(page)).toContainText('1');
  });

  /**
   * Vérifie que le compteur de résultats se met à jour.
   *
   * Étapes :
   *   1. Au chargement, le compteur affiche les 5 jeux de test.
   *   2. Après le filtre par série 2 : le compteur passe à 2.
   *   3. En combinant avec le statut « Non joué » : le compteur passe à 1
   *      (la combinaison des filtres est bien prise en compte).
   */
  test('le compteur de résultats se met à jour', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // 1. État initial : les 5 jeux de test sont comptés.
    expect(
      await readResultCount(page),
      'le compteur doit annoncer les 5 jeux au chargement',
    ).toBe(5);

    // 2. Filtre par série 2 : Le Mystère de la Momie + Mission Apollo.
    await serieCheckbox(page, '2').check();
    expect(
      await readResultCount(page),
      'le compteur doit passer à 2 après le filtre par série',
    ).toBe(2);

    // 3. Combinaison série 2 + statut « Non joué » : Mission Apollo seul.
    await statutCheckbox(page, 'non_joue').check();
    expect(
      await readResultCount(page),
      'le compteur doit passer à 1 avec les deux filtres combinés',
    ).toBe(1);
  });

  /**
   * Vérifie que le bouton « Réinitialiser » efface les filtres.
   *
   * Étapes :
   *   1. On applique plusieurs filtres (série 1, difficulté 3) et une
   *      recherche (« diamant ») : un seul jeu reste affiché.
   *   2. On clique sur « Réinitialiser les filtres » : toutes les cases sont
   *      décochées, la recherche est effacée et les 5 jeux reviennent
   *      (compteur à 5).
   */
  test('le bouton « Réinitialiser » efface les filtres', async ({ page }) => {
    seedFilterGames(page);
    await openFiltersScreen(page);

    // 1. On accumule les filtres et une recherche : 1 seul résultat.
    await serieCheckbox(page, '1').check();
    await difficulteCheckbox(page, 3).check();
    await searchInput(page).fill('diamant');
    await expect(resultsCounter(page)).toContainText('1');
    await expect(resultByName(page, 'Le Vol du Diamant')).toBeVisible();

    // 2. « Réinitialiser les filtres » : recherche effacée, cases décochées…
    await resetButton(page).click();
    await expect(
      searchInput(page),
      'la recherche doit être effacée',
    ).toHaveValue('');
    await expect(serieCheckbox(page, '1')).not.toBeChecked();
    await expect(difficulteCheckbox(page, 3)).not.toBeChecked();

    // …et les 5 jeux de test reviennent dans les résultats.
    await expect(resultsCounter(page)).toContainText('5');
    for (const nom of [
      'Le Vol du Diamant',
      "L'Île du Trésor",
      'Le Mystère de la Momie',
      'Mission Apollo',
      'Le Manoir Hanté',
    ]) {
      await expect(
        resultByName(page, nom),
        `« ${nom} » doit réapparaître après réinitialisation`,
      ).toBeVisible();
    }
  });
});
