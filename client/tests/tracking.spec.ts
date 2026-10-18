import { expect, test, type Page } from '@playwright/test';

/**
 * UnlockTracker — Tests E2E du suivi (Sprint 3)
 * Agent : TEMPER (QA)
 *
 * Objectif : vérifier le parcours « Suivre ses parties » (FUNCTIONAL.md,
 * parcours 4 — Vérifier la progression).
 *   1. La page suivi se charge (onglet « Suivi », aucune erreur console)
 *   2. Les 4 cartes de stats sont visibles (Total / Joués / En cours / Non joués)
 *   3. La progression est affichée en pourcentage (barre + valeur %)
 *   4. L'historique des jeux est affiché (liste complète + statuts + dates)
 *   5. Le filtre par statut fonctionne (Tous / Non joués / En cours / Terminés)
 *   6. Le bouton « Réinitialiser » remet le jeu en `non_joue`
 *
 * Contrat avec le code de l'application (Sprint 3 — Pixel) :
 *   - l'écran `TrackingScreen` est atteint via le bouton d'onglet « Suivi » ;
 *   - `StatsCards` rend une section `aria-label="Statistiques de la collection"`
 *     contenant 4 `<li>` (Total jeux, Joués, En cours, Non joués) et une barre
 *     `role="progressbar"` (« Progression ») avec `aria-valuenow` en % ;
 *   - `PlayedTimeline` rend une section `aria-label="Chronologie des jeux joués"`
 *     listant les jeux terminés du plus récent au plus ancien ;
 *   - `GameHistory` rend une section `aria-label="Historique des jeux"` avec un
 *     `<fieldset>` « Statut » (4 boutons filtres, `aria-pressed`), un compteur
 *     « N jeux dans l'historique » et une ligne `<li>` par jeu (nom, série,
 *     badge de statut, date de fin, bouton « Réinitialiser » désactivé quand le
 *     jeu est déjà `non_joue`) ;
 *   - la collection vit dans `localStorage` (clé `sweatbook_games`, hook
 *     `useGames`) : `seedTrackingGames()` injecte donc les données de test
 *     avant le premier rendu React.
 */

// ───────────────────────── Fixtures & helpers ─────────────────────────

/** Clé `localStorage` utilisée par `useGames` pour persister la collection. */
const STORAGE_KEY = 'sweatbook_games';

/** Jeu de test manipulé par les fixtures du suivi. */
interface TestGame {
  /** Identifiant unique du jeu. */
  id: string;
  /** Nom de la boîte Unlock!. */
  nom: string;
  /** Série d'appartenance (simple chiffre, ex : `'2'`). */
  serie: string;
  /** Numéro du jeu dans sa série. */
  numero: number;
  /** Thème du scénario. */
  theme: string;
  /** Difficulté de 1 à 3. */
  difficulte: 1 | 2 | 3;
  /** Durée estimée en minutes. */
  duree: number;
  /** Statut de la partie. */
  statut: 'non_joue' | 'en_cours' | 'termine';
  /** Date de fin de partie (ISO `AAAA-MM-JJ`), pour les jeux terminés. */
  dateFin?: string;
}

/**
 * Prépare un jeu de données de test couvrant les 3 statuts.
 *
 * Répartition volontairement simple pour pouvoir calculer les attentes à la
 * main (pédagogie) :
 *   - total : 6 jeux ;
 *   - terminés : 2 (« Mission Apollo », « Le Temple Perdu ») → progression
 *     `Math.round(2 / 6 * 100)` = **33 %** ;
 *   - en cours : 1 (« Le Mystère de la Momie ») ;
 *   - non joués : 3 (« Le Vol du Diamant », « L'Île du Trésor »,
 *     « Opération Éclipse »).
 *
 * Les jeux sont injectés dans le `localStorage` AVANT la navigation :
 * `useGames` les chargera au démarrage.
 *
 * @param page - La page Playwright sur laquelle injecter les données
 * @returns La liste des jeux de test injectés, pour calculer les attentes
 * @example
 * const games = seedTrackingGames(page);
 * await openTracking(page);
 * await expect(historyRows(page)).toHaveCount(games.length);
 */
function seedTrackingGames(page: Page): TestGame[] {
  const games: TestGame[] = [
    {
      id: 'track-1',
      nom: 'Le Vol du Diamant',
      serie: '1',
      numero: 1,
      theme: 'Polar',
      difficulte: 3,
      duree: 60,
      statut: 'non_joue',
    },
    {
      id: 'track-2',
      nom: "L'Île du Trésor",
      serie: '1',
      numero: 2,
      theme: 'Aventure',
      difficulte: 1,
      duree: 45,
      statut: 'non_joue',
    },
    {
      id: 'track-3',
      nom: 'Le Mystère de la Momie',
      serie: '2',
      numero: 1,
      theme: 'Aventure',
      difficulte: 2,
      duree: 90,
      statut: 'en_cours',
    },
    {
      id: 'track-4',
      nom: 'Mission Apollo',
      serie: '2',
      numero: 2,
      theme: 'Science-fiction',
      difficulte: 1,
      duree: 60,
      statut: 'termine',
      dateFin: '2026-03-21',
    },
    {
      id: 'track-5',
      nom: 'Le Temple Perdu',
      serie: '3',
      numero: 1,
      theme: 'Aventure',
      difficulte: 2,
      duree: 75,
      statut: 'termine',
      dateFin: '2026-04-05',
    },
    {
      id: 'track-6',
      nom: 'Opération Éclipse',
      serie: '3',
      numero: 2,
      theme: 'Espionnage',
      difficulte: 3,
      duree: 90,
      statut: 'non_joue',
    },
  ];

  // addInitScript s'exécute avant les scripts de la page à CHAQUE navigation,
  // mais on ne seed QUE si la clé est absente : après un rechargement, la
  // persistance de l'application (useGames) doit être respectée.
  void page.addInitScript(
    (seed: { storageKey: string; value: unknown }) => {
      if (localStorage.getItem(seed.storageKey) === null) {
        localStorage.setItem(seed.storageKey, JSON.stringify(seed.value));
      }
    },
    { storageKey: STORAGE_KEY, value: games },
  );

  return games;
}

/**
 * Ouvre la page de suivi depuis l'écran d'accueil.
 *
 * @param page - La page Playwright courante
 * @returns Une promesse résolue une fois la page de suivi affichée
 * @example
 * await openTracking(page);
 */
async function openTracking(page: Page): Promise<void> {
  await page.goto('/');
  // L'application est une SPA à onglets : on clique sur « Suivi ».
  const tab = page.getByRole('button', { name: 'Suivi', exact: true });
  await tab.click();
  // L'onglet actif est signalé par `aria-current="page"` (accessibilité).
  await expect(tab, "l'onglet « Suivi » doit devenir l'onglet actif").toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page.getByRole('heading', { name: /suivi des jeux joués/i }),
    'le titre de la page de suivi doit être affiché',
  ).toBeVisible();
}

/**
 * Retourne la zone des statistiques (`StatsCards`).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de la section « Statistiques de la collection »
 */
function statsRegion(page: Page) {
  return page.getByRole('region', { name: 'Statistiques de la collection' });
}

/**
 * Retourne les 4 cartes de statistiques (Total jeux, Joués, En cours, Non joués).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de chaque carte de statistique (`<li>` de `StatsCards`)
 */
function statCards(page: Page) {
  return statsRegion(page).getByRole('listitem');
}

/**
 * Retourne la barre de progression globale (« Progression »).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de la barre `role="progressbar"`
 */
function progressBar(page: Page) {
  return page.getByRole('progressbar', { name: /progression/i });
}

/**
 * Retourne la zone de l'historique des jeux (`GameHistory`).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de la section « Historique des jeux »
 */
function historyRegion(page: Page) {
  return page.getByRole('region', { name: 'Historique des jeux' });
}

/**
 * Retourne les lignes visibles de l'historique (une `<li>` par jeu).
 *
 * @param page - La page Playwright courante
 * @returns Le locator de chaque ligne de l'historique
 */
function historyRows(page: Page) {
  return historyRegion(page).getByRole('listitem');
}

/**
 * Retourne la ligne de l'historique correspondant à un jeu donné.
 *
 * @param page - La page Playwright courante
 * @param nom - Le nom du jeu (ex : « Mission Apollo »)
 * @returns Le locator de la ligne du jeu
 */
function historyRow(page: Page, nom: string) {
  return historyRows(page).filter({ hasText: nom });
}

/**
 * Retourne un bouton de filtre par statut de l'historique.
 *
 * @param page - La page Playwright courante
 * @param label - Le libellé du filtre (« Tous », « Non joués », « En cours », « Terminés »)
 * @returns Le locator du bouton de filtre demandé
 * @example
 * await statusFilter(page, 'Terminés').click();
 */
function statusFilter(page: Page, label: 'Tous' | 'Non joués' | 'En cours' | 'Terminés') {
  return historyRegion(page).getByRole('button', { name: label, exact: true });
}

/**
 * Retourne le bouton « Réinitialiser » d'une ligne de l'historique.
 *
 * @param row - Le locator de la ligne de jeu (voir {@link historyRow})
 * @returns Le locator du bouton « Réinitialiser » de cette ligne
 */
function resetButton(row: ReturnType<typeof historyRow>) {
  return row.getByRole('button', { name: 'Réinitialiser' });
}

// ───────────────────────── Tests ─────────────────────────

test.describe('Suivi — UnlockTracker', () => {
  /**
   * Vérifie que la page de suivi se charge correctement.
   *
   * Étapes :
   *   1. On ouvre l'application puis l'onglet « Suivi ».
   *   2. On vérifie que le titre de la page et les 3 zones principales
   *      (statistiques, chronologie, historique) sont affichées.
   *   3. On vérifie qu'aucune erreur console n'est survenue au chargement.
   */
  test('la page suivi se charge', async ({ page }) => {
    // On collecte les erreurs console pour détecter un crash de rendu.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    seedTrackingGames(page);
    await openTracking(page);

    // Les trois zones de l'écran de suivi sont rendues.
    await expect(
      statsRegion(page),
      'la zone des statistiques doit être affichée',
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Chronologie des jeux joués' }),
      'la chronologie des parties doit être affichée',
    ).toBeVisible();
    await expect(
      historyRegion(page),
      "la zone de l'historique doit être affichée",
    ).toBeVisible();

    // Aucune erreur console bloquante (les warnings sont tolérés).
    expect(
      consoleErrors,
      `erreurs console détectées : ${consoleErrors.join(' | ')}`,
    ).toEqual([]);
  });

  /**
   * Vérifie que les 4 cartes de statistiques sont visibles.
   *
   * Étapes :
   *   1. On injecte 6 jeux (2 terminés, 1 en cours, 3 non joués).
   *   2. On vérifie qu'il y a bien 4 cartes, avec les libellés attendus.
   *   3. On vérifie que chaque carte affiche le bon compte (6 / 2 / 1 / 3).
   */
  test('les 4 cartes de stats sont visibles', async ({ page }) => {
    seedTrackingGames(page);
    await openTracking(page);

    // 1. Exactement 4 cartes de statistiques.
    await expect(
      statCards(page),
      'les 4 cartes de stats doivent être affichées',
    ).toHaveCount(4);

    // 2. Chaque carte a son libellé (Total jeux / Joués / En cours / Non joués).
    await expect(statsRegion(page)).toContainText('Total jeux');
    await expect(statsRegion(page)).toContainText('Joués');
    await expect(statsRegion(page)).toContainText('En cours');
    await expect(statsRegion(page)).toContainText('Non joués');

    // 3. Les compteurs reflètent les données injectées :
    //    6 jeux au total, 2 terminés, 1 en cours, 3 non joués.
    await expect(
      statCards(page).filter({ hasText: 'Total jeux' }),
      'la carte « Total jeux » doit afficher 6',
    ).toContainText('6');
    await expect(
      statCards(page).filter({ hasText: 'Joués' }).first(),
      'la carte « Joués » doit afficher 2',
    ).toContainText('2');
    await expect(
      statCards(page).filter({ hasText: 'En cours' }),
      'la carte « En cours » doit afficher 1',
    ).toContainText('1');
    await expect(
      statCards(page).filter({ hasText: 'Non joués' }),
      'la carte « Non joués » doit afficher 3',
    ).toContainText('3');
  });

  /**
   * Vérifie que la progression est affichée en pourcentage.
   *
   * Étapes :
   *   1. Avec 2 jeux terminés sur 6, la progression vaut
   *      `Math.round(2 / 6 * 100)` = 33 %.
   *   2. Le pourcentage est affiché en toutes lettres (« 33 % »).
   *   3. La barre de progression expose la valeur à l'accessibilité
   *      (`role="progressbar"`, `aria-valuenow="33"`).
   */
  test('la progression est affichée en pourcentage', async ({ page }) => {
    seedTrackingGames(page);
    await openTracking(page);

    // 1. Le pourcentage calculé est affiché à côté du libellé « Progression ».
    await expect(statsRegion(page)).toContainText('Progression');
    await expect(
      statsRegion(page),
      'la progression doit être affichée en pourcentage (33 %)',
    ).toContainText('33 %');

    // 2. La barre de progression expose la valeur aux technologies d'assistance.
    const bar = progressBar(page);
    await expect(bar, 'la barre de progression doit être visible').toBeVisible();
    await expect(bar).toHaveAttribute('aria-valuenow', '33');
    await expect(bar).toHaveAttribute('aria-valuemin', '0');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');

    // 3. Le détail chiffré est cohérent : « 2 jeux terminés sur 6 ».
    await expect(statsRegion(page)).toContainText(/2\s+jeux?\s+terminé/);
    await expect(statsRegion(page)).toContainText(/sur\s+6/);
  });

  /**
   * Vérifie que l'historique des jeux est affiché.
   *
   * Étapes :
   *   1. La section « Historique » affiche le compteur « 6 jeux dans
   *      l'historique » et une ligne par jeu.
   *   2. Une ligne affiche les infos attendues : nom, série/numéro et badge
   *      de statut (« Non joué » pour un jeu à faire).
   *   3. Une ligne de jeu terminé affiche sa date de fin (« Terminé le
   *      21 mars 2026 »).
   */
  test("l'historique des jeux est affiché", async ({ page }) => {
    const games = seedTrackingGames(page);
    await openTracking(page);

    // 1. Le compteur et la liste complète sont affichés.
    await expect(historyRegion(page)).toContainText('Historique');
    await expect(
      historyRegion(page),
      'le compteur doit annoncer les 6 jeux',
    ).toContainText(/6\s+jeux?\s+dans l'historique/);
    await expect(historyRows(page)).toHaveCount(games.length);

    // 2. Une ligne affiche le nom, la série/numéro et le badge de statut.
    const row = historyRow(page, 'Le Vol du Diamant');
    await expect(row).toContainText('Le Vol du Diamant');
    await expect(row).toContainText('Série 1 · n°1');
    await expect(row).toContainText('Non joué');

    // 3. Un jeu terminé affiche sa date de fin formatée en français.
    await expect(
      historyRow(page, 'Mission Apollo'),
      'la date de fin doit être affichée en français',
    ).toContainText('Terminé le 21 mars 2026');
  });

  /**
   * Vérifie que le filtre par statut fonctionne.
   *
   * Étapes :
   *   1. Par défaut (« Tous »), les 6 jeux sont affichés.
   *   2. « Terminés » → 2 jeux, « En cours » → 1 jeu, « Non joués » → 3 jeux ;
   *      le bouton actif porte `aria-pressed="true"`.
   *   3. Retour à « Tous » : la liste complète revient.
   */
  test('le filtre par statut fonctionne', async ({ page }) => {
    seedTrackingGames(page);
    await openTracking(page);

    // 1. État initial : « Tous » est actif et les 6 jeux sont listés.
    await expect(statusFilter(page, 'Tous')).toHaveAttribute('aria-pressed', 'true');
    await expect(historyRows(page)).toHaveCount(6);

    // 2. Filtre « Terminés » : Mission Apollo + Le Temple Perdu.
    await statusFilter(page, 'Terminés').click();
    await expect(statusFilter(page, 'Terminés')).toHaveAttribute('aria-pressed', 'true');
    await expect(historyRows(page)).toHaveCount(2);
    await expect(historyRows(page)).toContainText([
      'Mission Apollo',
      'Le Temple Perdu',
    ]);

    // Filtre « En cours » : seul Le Mystère de la Momie.
    await statusFilter(page, 'En cours').click();
    await expect(historyRows(page)).toHaveCount(1);
    await expect(historyRows(page)).toContainText(['Le Mystère de la Momie']);

    // Filtre « Non joués » : les 3 jeux à faire.
    await statusFilter(page, 'Non joués').click();
    await expect(historyRows(page)).toHaveCount(3);
    await expect(historyRows(page)).toContainText([
      'Le Vol du Diamant',
      "L'Île du Trésor",
      'Opération Éclipse',
    ]);

    // 3. Retour à « Tous » : la liste complète revient.
    await statusFilter(page, 'Tous').click();
    await expect(statusFilter(page, 'Tous')).toHaveAttribute('aria-pressed', 'true');
    await expect(historyRows(page)).toHaveCount(6);
  });

  /**
   * Vérifie que le bouton « Réinitialiser » remet un jeu en `non_joue`.
   *
   * Étapes :
   *   1. Un jeu non joué a son bouton « Réinitialiser » désactivé (rien à
   *      réinitialiser), un jeu terminé a le sien activé.
   *   2. On réinitialise « Mission Apollo » : son badge passe à « Non joué »
   *      et son bouton devient désactivé.
   *   3. Les stats se recalculent (1 jeu terminé sur 6 → 17 %) et la
   *      chronologie se met à jour (1 seule partie terminée).
   *   4. Le changement est persisté : après rechargement, le jeu reste
   *      « Non joué ».
   */
  test('le bouton « Réinitialiser » remet le jeu en non joué', async ({ page }) => {
    seedTrackingGames(page);
    await openTracking(page);

    // 1. État initial : désactivé pour un jeu non joué, activé pour un terminé.
    await expect(
      resetButton(historyRow(page, 'Le Vol du Diamant')),
      'un jeu non joué ne peut pas être réinitialisé',
    ).toBeDisabled();
    const playedRow = historyRow(page, 'Mission Apollo');
    await expect(playedRow).toContainText('Terminé');
    await expect(
      resetButton(playedRow),
      'un jeu terminé peut être réinitialisé',
    ).toBeEnabled();

    // 2. Après clic : le jeu redevient « Non joué », bouton verrouillé.
    await resetButton(playedRow).click();
    await expect(playedRow).toContainText('Non joué');
    await expect(playedRow).not.toContainText('Terminé');
    await expect(resetButton(playedRow)).toBeDisabled();

    // 3. Les stats et la chronologie se recalculent en temps réel (R9) :
    //    il ne reste que « Le Temple Perdu » comme partie terminée (1/6 ≈ 17 %).
    await expect(
      statCards(page).filter({ hasText: 'Joués' }).first(),
      'le compteur « Joués » doit passer à 1',
    ).toContainText('1');
    await expect(
      statsRegion(page),
      'la progression doit passer à 17 %',
    ).toContainText('17 %');
    await expect(
      page.getByRole('region', { name: 'Chronologie des jeux joués' }),
      "la chronologie ne doit plus lister « Mission Apollo »",
    ).not.toContainText('Mission Apollo');

    // 4. La réinitialisation survit à un rechargement (persistance).
    await page.reload();
    await openTracking(page);
    await expect(
      historyRow(page, 'Mission Apollo'),
      'le statut « Non joué » doit être persisté',
    ).toContainText('Non joué');
  });
});
