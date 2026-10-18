import { expect, test } from '@playwright/test';
import {
  ACTIVE_PROFILE_KEY,
  applyProfileFilter,
  comparisonBar,
  filterButton,
  openShareScreen,
  profileOption,
  profileSelector,
  profileStats,
  progressionBar,
  seedShareGames,
  selectProfile,
  sharedGame,
  sharedList,
} from './helpers/share';

/**
 * UnlockTracker — Tests E2E du partage multi-utilisateurs (Sprint 5)
 * Agent : TEMPER (QA)
 *
 * Objectif : vérifier le parcours « Partager la liste entre les deux
 * joueurs » (FUNCTIONAL.md, règle R5 : statuts communs, pas de comptes
 * séparés) sur l'écran Partage :
 *   1. La page partage se charge (onglet « Partage », aucune erreur console)
 *   2. Le sélecteur de profil est visible (Kevin et Copine)
 *   3. Changer de profil change les données affichées (profil actif)
 *   4. Les stats par profil sont affichées (cartes + barres de progression)
 *   5. La comparaison est visible (qui a joué le plus, répartition)
 *   6. La liste partagée fonctionne (jeux joués par au moins un profil)
 *   7. Le filtre par profil fonctionne (tous / ensemble / Kevin / Copine)
 *
 * Les données de test sont injectées dans le localStorage par
 * `seedShareGames()` : 5 jeux suivis par les deux profils avec des statuts
 * croisés (Kevin : 3 terminés ; Copine : 2 terminés ; 1 jeu joué ensemble ;
 * 1 jeu jamais terminé, donc absent de la liste partagée).
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
      page.getByRole('heading', { name: /partage/i }),
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
   * Vérifie que le sélecteur de profil (`ProfileSelector`) est visible.
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec les 2 profils du ménage.
   *   2. On vérifie que le sélecteur de profil est affiché.
   *   3. On vérifie que les boutons « Kevin » et « Copine » sont tous les
   *      deux présents et cliquables.
   */
  test('le sélecteur de profil est visible', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // Le sélecteur de profil est affiché dans le contenu principal.
    await expect(
      profileSelector(page),
      'le sélecteur de profil doit être visible',
    ).toBeVisible();

    // Les deux profils du ménage sont proposés.
    for (const nom of ['Kevin', 'Copine']) {
      await expect(
        profileOption(page, nom),
        `le profil « ${nom} » doit être sélectionnable`,
      ).toBeVisible();
    }
  });

  /**
   * Vérifie que changer de profil change les données affichées.
   *
   * Étapes :
   *   1. Avec « Kevin » actif : le titre annonce « Partage … Kevin » et son
   *      bouton est enfoncé (`aria-pressed="true"`).
   *   2. On clique sur « Copine » : le titre annonce maintenant « Partage …
   *      Copine », c'est son bouton qui est enfoncé et le choix est persisté
   *      dans le localStorage (`sweatbook_profile`).
   */
  test('changer de profil change les données', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // 1. Profil par défaut : Kevin est annoncé et sélectionné.
    await expect(
      page.getByRole('heading', { name: /partage.*kevin/i }),
      'le titre doit annoncer le profil « Kevin »',
    ).toBeVisible();
    await expect(
      profileOption(page, 'Kevin'),
      'le bouton « Kevin » doit être enfoncé',
    ).toHaveAttribute('aria-pressed', 'true');

    // 2. Changement de profil : les données affichées sont remplacées.
    await selectProfile(page, 'Copine');
    await expect(
      page.getByRole('heading', { name: /partage.*copine/i }),
      'le titre doit maintenant annoncer le profil « Copine »',
    ).toBeVisible();
    await expect(
      profileOption(page, 'Copine'),
      'le bouton « Copine » doit devenir le profil actif',
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      profileOption(page, 'Kevin'),
      'le bouton « Kevin » ne doit plus être actif',
    ).toHaveAttribute('aria-pressed', 'false');

    // Le choix du profil est persisté (rechargement gardera « Copine »).
    expect(
      await page.evaluate((key) => localStorage.getItem(key), ACTIVE_PROFILE_KEY),
      'le profil actif doit être mémorisé dans le localStorage',
    ).toBe('copine');
  });

  /**
   * Vérifie que les statistiques par profil sont affichées.
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec nos 5 jeux de test
   *      (Kevin : 3 terminés / Copine : 2 terminés).
   *   2. Chaque profil a sa carte de statistiques (« Jeux joués »,
   *      « En cours », « Progression », « Minutes jouées »).
   *   3. Les barres de progression portent les bons pourcentages :
   *      Kevin à 60 % (3/5) et Copine à 40 % (2/5).
   */
  test('les stats par profil sont affichées', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // La zone de statistiques est présente et couvre les deux profils.
    await expect(
      profileStats(page),
      'les statistiques par profil doivent être affichées',
    ).toBeVisible();
    await expect(profileStats(page)).toContainText('Kevin');
    await expect(profileStats(page)).toContainText('Copine');

    // Chaque carte détaille les 4 indicateurs du contrat.
    for (const indicateur of [
      'Jeux joués',
      'En cours',
      'Progression',
      'Minutes jouées',
    ]) {
      await expect(
        profileStats(page),
        `l'indicateur « ${indicateur} » doit être affiché`,
      ).toContainText(indicateur);
    }

    // Les barres de progression portent les pourcentages attendus.
    await expect(
      progressionBar(page, 'Kevin'),
      'la progression de Kevin doit être de 60 % (3 jeux sur 5)',
    ).toHaveAttribute('aria-valuenow', '60');
    await expect(
      progressionBar(page, 'Copine'),
      'la progression de Copine doit être de 40 % (2 jeux sur 5)',
    ).toHaveAttribute('aria-valuenow', '40');
  });

  /**
   * Vérifie que la comparaison des profils est visible.
   *
   * Étapes :
   *   1. La barre comparative « Répartition comparative des jeux terminés par
   *      profil » est affichée.
   *   2. Le message de leader indique que « Kevin a joué le plus avec 3 jeux
   *      terminés ».
   *   3. La légende compare les deux profils (« Kevin : 3 jeux (60 %) »,
   *      « Copine : 2 jeux (40 %) »).
   */
  test('la comparaison est visible', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // 1. La barre comparative est affichée.
    await expect(
      comparisonBar(page),
      'la barre de comparaison des profils doit être visible',
    ).toBeVisible();

    // 2. Le message indique qui a joué le plus (Kevin : 3 terminés).
    await expect(
      page.locator('main'),
      'le message de comparaison doit nommer le leader',
    ).toContainText(/Kevin a joué le plus avec 3 jeux terminés/);

    // 3. La légende compare explicitement les deux profils.
    await expect(
      page.locator('main'),
      'la légende doit comparer les progressions des deux profils',
    ).toContainText('Kevin : 3 jeux (60 %)');
    await expect(page.locator('main')).toContainText('Copine : 2 jeux (40 %)');
  });

  /**
   * Vérifie que la liste partagée fonctionne (règle R5).
   *
   * Étapes :
   *   1. On ouvre l'écran Partage avec 5 jeux de test.
   *   2. La liste partagée affiche les 4 jeux terminés par au moins un
   *      profil (« Mission Apollo », en cours pour les deux, en est exclu),
   *      avec le récapitulatif « 4 jeux joués… dont 1 terminé par les deux ».
   */
  test('la liste partagée fonctionne', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // La liste partagée est affichée avec son titre.
    await expect(
      sharedList(page),
      'la liste partagée doit être visible',
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Liste partagée' }),
      'le titre « Liste partagée » doit être affiché',
    ).toBeVisible();

    // Le récapitulatif compte les jeux joués par au moins un profil.
    await expect(
      sharedList(page),
      'le récapitulatif doit compter 4 jeux joués dont 1 en commun',
    ).toContainText(/4 jeux joués par au moins un profil, dont 1 terminé/);

    // Les 4 jeux terminés par au moins un profil figurent dans la liste.
    for (const nom of [
      'Le Vol du Diamant',
      "L'Île du Trésor",
      'Le Mystère de la Momie',
      'Le Manoir Hanté',
    ]) {
      await expect(
        sharedGame(page, nom),
        `« ${nom} » doit figurer dans la liste partagée`,
      ).toBeVisible();
    }

    // « Mission Apollo » (en cours pour les deux) n'est pas un jeu joué :
    // il est exclu de la liste partagée.
    await expect(
      sharedGame(page, 'Mission Apollo'),
      'un jeu non terminé par personne ne doit pas figurer dans la liste',
    ).toBeHidden();
  });

  /**
   * Vérifie que le filtre par profil de la liste partagée fonctionne.
   *
   * Étapes :
   *   1. Par défaut, « Tous les joués » est actif : les 4 jeux joués sont
   *      affichés.
   *   2. Filtre « Kevin » : ses 3 jeux terminés restent seuls
   *      (« Le Mystère de la Momie » disparaît).
   *   3. Filtre « Joués ensemble » : seul « Le Vol du Diamant » (terminé par
   *      les deux) reste.
   *   4. Filtre « Copine » : ses 2 jeux terminés restent seuls.
   *   5. Retour à « Tous les joués » : les 4 jeux reviennent.
   */
  test('le filtre par profil fonctionne', async ({ page }) => {
    seedShareGames(page);
    await openShareScreen(page);

    // 1. État initial : le filtre « Tous les joués » affiche les 4 jeux joués.
    await expect(filterButton(page, 'Tous les joués')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(sharedGame(page, 'Le Vol du Diamant')).toBeVisible();
    await expect(sharedGame(page, 'Le Mystère de la Momie')).toBeVisible();

    // 2. Filtre « Kevin » : ses 3 jeux terminés uniquement.
    await applyProfileFilter(page, 'Kevin');
    await expect(filterButton(page, 'Kevin')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(
      sharedGame(page, 'Le Vol du Diamant'),
      'le jeu joué ensemble reste affiché pour Kevin',
    ).toBeVisible();
    await expect(
      sharedGame(page, "L'Île du Trésor"),
      'le jeu joué par Kevin seul reste affiché',
    ).toBeVisible();
    await expect(
      sharedGame(page, 'Le Manoir Hanté'),
      'le 2e jeu joué par Kevin seul reste affiché',
    ).toBeVisible();
    await expect(
      sharedGame(page, 'Le Mystère de la Momie'),
      'le jeu joué par Copine seule doit disparaître',
    ).toBeHidden();

    // 3. Filtre « Joués ensemble » : uniquement le jeu terminé par les deux.
    await applyProfileFilter(page, 'Joués ensemble');
    await expect(
      sharedGame(page, 'Le Vol du Diamant'),
      'le jeu joué ensemble doit rester affiché',
    ).toBeVisible();
    for (const nom of ["L'Île du Trésor", 'Le Mystère de la Momie', 'Le Manoir Hanté']) {
      await expect(
        sharedGame(page, nom),
        `« ${nom} » n'a pas été joué par les deux profils`,
      ).toBeHidden();
    }

    // 4. Filtre « Copine » : ses 2 jeux terminés uniquement.
    await applyProfileFilter(page, 'Copine');
    await expect(sharedGame(page, 'Le Vol du Diamant')).toBeVisible();
    await expect(
      sharedGame(page, 'Le Mystère de la Momie'),
      'le jeu joué par Copine seule reste affiché',
    ).toBeVisible();
    await expect(
      sharedGame(page, "L'Île du Trésor"),
      'le jeu joué par Kevin seul doit disparaître',
    ).toBeHidden();

    // 5. « Tous les joués » : la liste complète revient.
    await applyProfileFilter(page, 'Tous les joués');
    for (const nom of [
      'Le Vol du Diamant',
      "L'Île du Trésor",
      'Le Mystère de la Momie',
      'Le Manoir Hanté',
    ]) {
      await expect(
        sharedGame(page, nom),
        `« ${nom} » doit réapparaître sans filtre`,
      ).toBeVisible();
    }
  });
});
