import { expect, test } from '@playwright/test';
import {
  gameCards,
  gameList,
  searchGames,
  searchInput,
  seedGames,
  seriesButton,
  sortControl,
} from './helpers/catalogue';

/**
 * UnlockTracker — Tests E2E du catalogue (Sprint 2)
 * Agent : TEMPER (QA)
 *
 * Objectif : vérifier le parcours « Consulter le catalogue » (FUNCTIONAL.md).
 *   1. La page catalogue se charge (onglet par défaut, aucune erreur console)
 *   2. Les jeux sont affichés en grille (cartes complètes, disposition CSS grid)
 *   3. La recherche fonctionne (par nom ET par thème)
 *   4. Le filtre par série fonctionne (boutons « Toutes » / « Série N »)
 *   5. « Marquer comme joué » change le statut du jeu (et le persiste)
 *   6. Le tri par difficulté fonctionne (ordre croissant)
 *
 * Les données de test sont injectées dans le localStorage par `seedGames()`
 * (clé `sweatbook_games` lue par le hook `useGames`).
 */

test.describe('Catalogue — UnlockTracker', () => {
  /**
   * Vérifie que la page du catalogue se charge correctement.
   *
   * Étapes :
   *   1. On ouvre la page d'accueil (l'onglet « Catalogue » est l'onglet par
   *      défaut de l'application).
   *   2. On vérifie que le titre de la section, la barre de recherche et au
   *      moins une carte de jeu s'affichent.
   *   3. On vérifie qu'aucune erreur console n'est survenue au chargement.
   */
  test('la page catalogue se charge', async ({ page }) => {
    // On collecte les erreurs console pour détecter un crash de rendu.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Le titre de la section catalogue est visible.
    await expect(
      page.getByRole('heading', { name: 'Catalogue' }),
      'le titre « Catalogue » doit être affiché',
    ).toBeVisible();

    // La barre de recherche est présente et vide au chargement.
    await expect(searchInput(page)).toBeVisible();
    await expect(searchInput(page)).toHaveValue('');

    // Au moins une carte de jeu est rendue (données de démonstration).
    await expect(
      gameCards(page).first(),
      'au moins une carte de jeu doit être affichée',
    ).toBeVisible();

    // Aucune erreur console bloquante (les warnings sont tolérés).
    expect(
      consoleErrors,
      `erreurs console détectées : ${consoleErrors.join(' | ')}`,
    ).toEqual([]);
  });

  /**
   * Vérifie que les jeux sont affichés en grille.
   *
   * Étapes :
   *   1. On injecte 4 jeux de test puis on ouvre le catalogue.
   *   2. On vérifie que la liste annonce le bon nombre de jeux.
   *   3. On vérifie que la liste utilise bien une disposition CSS « grid »
   *      et que les cartes voisines sont posées côte à côte.
   *   4. On vérifie qu'une carte affiche toutes les infos attendues
   *      (nom, série, thème, durée, difficulté).
   */
  test('les jeux sont affichés en grille', async ({ page }) => {
    const games = seedGames(page);
    await page.goto('/');

    // Les 4 jeux de test sont affichés et le compteur le reflète.
    await expect(gameCards(page)).toHaveCount(games.length);
    await expect(page.getByText(/4 jeux affichés/)).toBeVisible();

    // Le conteneur des cartes utilise bien une disposition CSS « grid ».
    await expect(gameList(page)).toHaveCSS('display', 'grid');

    // Sur un écran large (Desktop Chrome), les cartes sont posées côte à
    // côte : les 2 premières partagent la même ligne (même hauteur y).
    const boxes = await gameCards(page).evaluateAll((cards) =>
      cards.slice(0, 2).map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      }),
    );
    expect(
      Math.abs(boxes[0].y - boxes[1].y),
      'les 2 premières cartes doivent être sur la même ligne de la grille',
    ).toBeLessThan(5);
    expect(
      boxes[1].x - boxes[0].x,
      'la 2e carte doit être à droite de la 1re',
    ).toBeGreaterThan(5);

    // Une carte affiche toutes les informations du jeu.
    const card = gameCards(page).first();
    await expect(card.getByRole('heading', { level: 3 })).toHaveText('Le Vol du Diamant');
    await expect(card).toContainText('Série :');
    await expect(card).toContainText('Thème :');
    await expect(card).toContainText('Durée :');
    await expect(card.locator('[aria-label^="Difficulté"]')).toHaveAttribute(
      'aria-label',
      /Difficulté : \d sur 3/,
    );
  });

  /**
   * Vérifie que la recherche fonctionne par nom ET par thème.
   *
   * Étapes :
   *   1. On recherche « diamant » : seul le jeu dont le NOM contient ce mot
   *      reste affiché.
   *   2. On recherche « aventure » : les 2 jeux dont le THÈME est « Aventure »
   *      sont affichés, même si leur nom ne contient pas ce mot.
   *   3. On recherche un mot inconnu : aucun jeu, message « Aucun jeu ne
   *      correspond à la recherche ».
   */
  test('la recherche fonctionne (nom et thème)', async ({ page }) => {
    seedGames(page);
    await page.goto('/');

    // 1. Recherche par NOM (« diamant » ne figure que dans « Le Vol du Diamant »).
    await searchGames(page, 'diamant');
    await expect(gameCards(page)).toHaveCount(1);
    await expect(gameCards(page)).toContainText(['Le Vol du Diamant']);

    // 2. Recherche par THÈME (« Aventure » : L'Île du Trésor + Le Mystère de la Momie).
    await searchGames(page, 'aventure');
    await expect(gameCards(page)).toHaveCount(2);
    await expect(gameCards(page)).toContainText([
      "L'Île du Trésor",
      'Le Mystère de la Momie',
    ]);

    // 3. Recherche sans résultat : message d'état vide affiché.
    await searchGames(page, 'zzzzz');
    await expect(gameCards(page)).toHaveCount(0);
    await expect(page.getByText('Aucun jeu ne correspond à la recherche.')).toBeVisible();
  });

  /**
   * Vérifie que le filtre par série fonctionne.
   *
   * Étapes :
   *   1. On clique sur le bouton « Série 2 » : seuls les 2 jeux de la série 2
   *      restent affichés et le bouton devient actif (`aria-pressed="true"`).
   *   2. On reclique sur « Toutes » : les 4 jeux reviennent.
   */
  test('le filtre par série fonctionne', async ({ page }) => {
    seedGames(page);
    await page.goto('/');

    // 1. Filtre « Série 2 » : Le Mystère de la Momie + Mission Apollo.
    await seriesButton(page, '2').click();
    await expect(gameCards(page)).toHaveCount(2);
    await expect(gameCards(page)).toContainText([
      'Le Mystère de la Momie',
      'Mission Apollo',
    ]);
    await expect(seriesButton(page, '2')).toHaveAttribute('aria-pressed', 'true');

    // Retour à « Toutes » : la liste complète revient.
    await seriesButton(page).click();
    await expect(gameCards(page)).toHaveCount(4);
    await expect(seriesButton(page)).toHaveAttribute('aria-pressed', 'true');
  });

  /**
   * Vérifie que le bouton « Marquer comme joué » change le statut du jeu.
   *
   * Étapes :
   *   1. Le jeu « Le Vol du Diamant » est « Non joué » et son bouton est actif.
   *   2. On clique sur « Marquer comme joué » : le badge passe à « Terminé »
   *      et le bouton devient « Joué ✓ » (désactivé, pour ne pas rejouer).
   *   3. On recharge la page : le statut est persisté (localStorage).
   */
  test('le bouton « Marquer comme joué » change le statut', async ({ page }) => {
    seedGames(page);
    await page.goto('/');

    // 1. État initial : non joué, bouton d'action disponible.
    const card = gameCards(page).filter({ hasText: 'Le Vol du Diamant' });
    await expect(card).toContainText('Non joué');
    const playButton = card.getByRole('button', { name: 'Marquer comme joué' });
    await expect(playButton).toBeEnabled();

    // 2. Après clic : statut « Terminé », bouton « Joué ✓ » verrouillé.
    await playButton.click();
    await expect(card).toContainText('Terminé');
    await expect(card.getByRole('button', { name: 'Joué ✓' })).toBeDisabled();

    // Un jeu déjà terminé (« Mission Apollo ») affiche d'emblée « Joué ✓ ».
    await expect(
      gameCards(page).filter({ hasText: 'Mission Apollo' }).getByRole('button', { name: 'Joué ✓' }),
    ).toBeDisabled();

    // 3. Le statut survit à un rechargement de la page (persistance).
    await page.reload();
    await expect(
      gameCards(page).filter({ hasText: 'Le Vol du Diamant' }),
    ).toContainText('Terminé');
  });

  /**
   * Vérifie que le tri par difficulté fonctionne.
   *
   * Étapes :
   *   1. Par défaut, la liste est triée par SÉRIE puis numéro.
   *   2. On choisit « Difficulté » dans le select « Trier par » : les jeux
   *      sont affichés dans l'ordre croissant de difficulté (1 → 2 → 3),
   *      à égalité les noms départagent (ordre alphabétique).
   */
  test('le tri par difficulté fonctionne', async ({ page }) => {
    seedGames(page);
    await page.goto('/');

    // 1. Tri par défaut (série, puis numéro dans la série).
    await expect(gameCards(page)).toContainText([
      'Le Vol du Diamant',
      "L'Île du Trésor",
      'Le Mystère de la Momie',
      'Mission Apollo',
    ]);

    // 2. Tri par difficulté croissante :
    //    difficulté 1 : L'Île du Trésor, puis Mission Apollo (ordre alpha)
    //    difficulté 2 : Le Mystère de la Momie
    //    difficulté 3 : Le Vol du Diamant
    await sortControl(page).selectOption('difficulte');
    await expect(gameCards(page)).toContainText([
      "L'Île du Trésor",
      'Mission Apollo',
      'Le Mystère de la Momie',
      'Le Vol du Diamant',
    ]);

    // Vérification explicite de la difficulté croissante via les aria-labels.
    const difficultes = await gameCards(page).locator('[aria-label^="Difficulté"]').evaluateAll(
      (spans) =>
        spans.map((span) => {
          const match = /Difficulté : (\d) sur 3/.exec(span.getAttribute('aria-label') ?? '');
          return match ? Number(match[1]) : Number.NaN;
        }),
    );
    expect(difficultes, 'les difficultés doivent être croissantes').toEqual([1, 1, 2, 3]);
  });
});
