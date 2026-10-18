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
    await expect(page).toHaveTitle(/.+/)

    // Titre principal de la page (heading niveau 1) visible
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).not.toBeEmpty()
  })

  test('la navigation est présente', async ({ page }) => {
    await page.goto('/')

    // Une zone de navigation doit exister : <nav> (ou [role="navigation"])
    // ou, à défaut (template Vite de Sprint 1), la section de liens principale.
    // On ne cible que les éléments qui contiennent réellement des liens,
    // pour éviter de matcher un <header> sans lien placé avant la nav.
    const nav = page
      .locator(
        'nav:has(a[href]), [role="navigation"]:has(a[href]), #next-steps:has(a[href])'
      )
      .first()
    await expect(nav).toBeVisible()

    // Elle contient au moins un lien cliquable
    const navLinks = nav.locator('a[href]')
    await expect(navLinks.first()).toBeVisible()
    expect(
      await navLinks.count(),
      'la navigation doit contenir au moins un lien'
    ).toBeGreaterThan(0)
  })
})
