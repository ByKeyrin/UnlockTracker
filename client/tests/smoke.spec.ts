import { expect, test } from '@playwright/test'

/**
 * UnlockTracker — Smoke test E2E (Sprint 1)
 * Agent : TEMPER (QA)
 *
 * Objectif : vérifier que l'application se charge correctement.
 *   1. La page se charge (HTTP 200, root monté, aucune erreur console fatale)
 *   2. Le titre est visible (titre de la page + titre principal de la page)
 *   3. La navigation est présente (liens de navigation accessibles)
 */

test.describe('Smoke — UnlockTracker', () => {
  test('la page se charge', async ({ page }) => {
    // On collecte les erreurs console pour détecter un crash de rendu
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })

    // La réponse HTTP est bien un succès
    expect(response, 'la navigation doit renvoyer une réponse').not.toBeNull()
    expect(response!.status(), 'statut HTTP attendu : 200').toBe(200)

    // Le point de montage React est présent et rendu
    const root = page.locator('#root')
    await expect(root).toBeAttached()
    await expect(root).not.toBeEmpty()

    // Aucune erreur console bloquante (les warnings sont tolérés)
    expect(consoleErrors, `erreurs console détectées : ${consoleErrors.join(' | ')}`).toEqual([])
  })

  test('le titre est visible', async ({ page }) => {
    await page.goto('/')

    // Titre du document (balise <title>)
    await expect(page).toHaveTitle(/unlocktracker/i)

    // Titre principal de la page (heading niveau 1) visible
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/unlocktracker/i)
  })

  test('la navigation est présente', async ({ page }) => {
    await page.goto('/')

    // Une zone de navigation doit exister : <nav> / [role="navigation"]
    // (ou, à défaut, la section de liens principale du template Vite).
    const nav = page
      .getByRole('navigation')
      .or(page.locator('#next-steps'))
      .first()
    await expect(nav).toBeVisible()

    // Elle contient au moins un élément de navigation interactif
    // (liens <a href> ou boutons de navigation SPA, ex. « Catalogue »)
    const navItems = nav.locator('a[href], button')
    await expect(navItems.first()).toBeVisible()
    expect(
      await navItems.count(),
      'la navigation doit contenir au moins un élément interactif'
    ).toBeGreaterThan(0)
  })
})
