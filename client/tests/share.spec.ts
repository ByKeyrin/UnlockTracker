import { expect, test } from '@playwright/test';
import {
  openShareScreen,
  overviewCard,
  seedShareGames,
  seedShareGamesWithoutCompleted,
  sharedGame,
  sharedList,
} from './helpers/share';

/**
 * UnlockTracker — Tests E2E de l'écran Partage
 * Agent : TEMPER (QA)
 *
 * Objectif : vérifier la vue de la collection partagée (FUNCTIONAL.md,
 * règle R5 : statuts communs, pas de comptes séparés) sur l'écran Partage :
 *   1. La page partage se charge (onglet « Partage », aucune erreur console)
 *   2. La vue d'ensemble de la collection est affichée (Aventures, Jeux
 *      joués, En cours, Progression)
 *   3. La liste des jeux joués fonctionne (uniquement les jeux terminés,
 *      avec le récapitulatif)
 *   4. Les jeux sont triés par date de fin décroissante
 *   5. L'état vide s'affiche quand aucun jeu n'est terminé
 *
 * Les données de test sont injectées dans le localStorage par
 * `seedShareGames()` : 5 jeux avec des statuts croisés (3 terminés, 1 en
 * cours, 1 jamais joué).
 */

test.describe('Partage — UnlockTracker', () => {
  /**
   * Vérifie que la page de partage se charge correctement.
   *
   * Étapes :
   *   1. On ouvre l'application puis l'onglet « Partage ».
   *   2. On vérifie que le titre de section « Partage » s'affiche.
   *   3. On vérifie qu'aucune erreur console n'est survenue au chargement.
   */
  test('la page partage se charge', async ({ page }) => {
    // On collecte les erreurs console pour détecter un crash de rendu.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    seedShareGames(page);
    await openShareScreen(page);

    // Le titre de la section partage est visible.
    await expect(
      page.getByRole('heading', { name: /^partage$/i }),
      'le titre « Partage » doit être affiché',
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
   * Vérifie que la vue d'ensemble de la collection est affichée.
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec les 5 jeux de test (3 terminés,
   *      1 en cours, 1 non joué).
   *   2. Les 4 cartes de la vue d'ensemble sont présentes : « Aventures »,
   *      « Jeux joués », « En cours », « Progression ».
   *   3. Les valeurs correspondent aux données : 5 aventures, 3 jeux joués,
   *      1 en cours, 60 % de progression.
   */
  test("la vue d'ensemble de la collection est affichée", async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // Les 4 indicateurs de la vue d'ensemble sont affichés avec les bonnes
    // valeurs (5 jeux dont 3 terminés, 1 en cours : 60 % de progression).
    await expect(
      overviewCard(page, 'Aventures'),
      'la carte « Aventures » doit compter les 5 jeux',
    ).toContainText('5');
    await expect(
      overviewCard(page, 'Jeux joués'),
      'la carte « Jeux joués » doit compter les 3 jeux terminés',
    ).toContainText('3');
    await expect(
      overviewCard(page, 'En cours'),
      'la carte « En cours » doit compter le jeu en partie',
    ).toContainText('1');
    await expect(
      overviewCard(page, 'Progression'),
      'la progression doit être de 60 % (3 jeux terminés sur 5)',
    ).toContainText('60 %');
  });

  /**
   * Vérifie que la liste des jeux joués fonctionne (règle R5).
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec 5 jeux de test.
   *   2. La liste des jeux joués est affichée avec son titre et le
   *      récapitulatif « 3 jeux terminés sur 5. ».
   *   3. Les 3 jeux terminés figurent dans la liste, avec leur date de fin.
   *   4. « Mission Apollo » (en cours) et « Le Manoir Hanté » (non joué)
   *      en sont exclus.
   */
  test('la liste des jeux joués fonctionne', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // La liste est affichée avec son titre.
    await expect(
      sharedList(page),
      'la liste des jeux joués doit être visible',
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Liste des jeux joués' }),
      'le titre « Liste des jeux joués » doit être affiché',
    ).toBeVisible();

    // Le récapitulatif compte uniquement les jeux terminés.
    await expect(
      sharedList(page),
      'le récapitulatif doit compter 3 jeux terminés sur 5',
    ).toContainText('3 jeux terminés sur 5.');

    // Les 3 jeux terminés figurent dans la liste.
    for (const nom of [
      'Le Vol du Diamant',
      "L'Île du Trésor",
      'Le Mystère de la Momie',
    ]) {
      await expect(
        sharedGame(page, nom),
        `« ${nom} » doit figurer dans la liste des jeux joués`,
      ).toBeVisible();
    }

    // Chaque ligne indique la date de fin de la partie.
    await expect(
      sharedList(page)
        .getByRole('listitem')
        .filter({ hasText: 'Le Mystère de la Momie' }),
      'la date de fin doit être affichée',
    ).toContainText('Terminé le 2026-05-25');

    // « Mission Apollo » (en cours) et « Le Manoir Hanté » (non joué) ne
    // sont pas des jeux terminés : ils sont exclus de la liste.
    for (const nom of ['Mission Apollo', 'Le Manoir Hanté']) {
      await expect(
        sharedGame(page, nom),
        `« ${nom} » n'est pas terminé et ne doit pas figurer dans la liste`,
      ).toBeHidden();
    }
  });

  /**
   * Vérifie que la liste des jeux joués est triée par date de fin
   * décroissante (le plus récent d'abord).
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec 3 jeux terminés à des dates
   *      différentes (2026-03-15, 2026-05-10, 2026-05-25).
   *   2. L'ordre d'affichage est : Momie (05-25), Diamant (05-10),
   *      Île (03-15).
   */
  test('les jeux sont triés par date de fin décroissante', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // Les lignes de la liste sont dans l'ordre des dates de fin, du plus
    // récent au plus ancien.
    const lignes = sharedList(page).getByRole('listitem');
    await expect(lignes).toHaveCount(3);
    await expect(
      lignes.nth(0),
      'le jeu terminé le plus récent doit être en tête',
    ).toContainText('Le Mystère de la Momie');
    await expect(lignes.nth(1)).toContainText('Le Vol du Diamant');
    await expect(
      lignes.nth(2),
      'le jeu terminé le plus ancien doit être en dernier',
    ).toContainText("L'Île du Trésor");
  });

  /**
   * Vérifie l'état vide de la liste des jeux joués.
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec une collection sans aucun jeu terminé.
   *   2. Le message « Aucun jeu terminé pour le moment. » est affiché.
   *   3. La vue d'ensemble annonce 0 jeu joué et 0 % de progression.
   */
  test("l'état vide s'affiche quand aucun jeu n'est terminé", async ({
    page,
  }) => {
    seedShareGamesWithoutCompleted(page);
    await openShareScreen(page);

    // Le message d'état vide remplace la liste.
    await expect(
      sharedList(page),
      "le message d'état vide doit être affiché",
    ).toContainText('Aucun jeu terminé pour le moment.');

    // La vue d'ensemble reflète l'absence de parties terminées.
    await expect(overviewCard(page, 'Jeux joués')).toContainText('0');
    await expect(overviewCard(page, 'Progression')).toContainText('0 %');
  });
});
