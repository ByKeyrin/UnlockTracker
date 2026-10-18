# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke — UnlockTracker >> la navigation est présente
- Location: tests/smoke.spec.ts:48:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav, [role="navigation"], #next-steps, header').first().locator('a[href]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('nav, [role="navigation"], #next-steps, header').first().locator('a[href]').first() with timeout 10000ms
  - waiting for locator('nav, [role="navigation"], #next-steps, header').first().locator('a[href]').first()

```

```yaml
- banner:
  - button "Activer le mode sombre"
  - heading "💦 SweatBook" [level=1]
  - paragraph: Ton carnet d'entraînement running
- navigation:
  - list:
    - listitem:
      - link "Journal":
        - /url: "#journal"
    - listitem:
      - link "Progression — Graphiques":
        - /url: "#progression"
        - text: Progression
    - listitem:
      - link "Planning":
        - /url: "#planning"
- main:
  - heading "📓 Journal des séances" [level=2]
  - heading "Mes séances" [level=2]
  - heading "Aucune séance pour l'instant" [level=3]
  - paragraph: Ajoute ta première sortie pour commencer à suivre tes progrès !
  - button "+ Nouvelle séance"
- contentinfo: SweatBook — Sprint 3 · Fait avec React + Vite + Tailwind 💪
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * UnlockTracker — Smoke test E2E (Sprint 1)
  5  |  * Agent : TEMPER (QA)
  6  |  *
  7  |  * Objectif : vérifier que l'application se charge correctement.
  8  |  *   1. La page se charge (HTTP 200, root monté, aucune erreur console fatale)
  9  |  *   2. Le titre est visible (titre de la page + titre principal de la page)
  10 |  *   3. La navigation est présente (liens de navigation accessibles)
  11 |  */
  12 | 
  13 | test.describe('Smoke — UnlockTracker', () => {
  14 |   test('la page se charge', async ({ page }) => {
  15 |     // On collecte les erreurs console pour détecter un crash de rendu
  16 |     const consoleErrors: string[] = []
  17 |     page.on('console', (msg) => {
  18 |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  19 |     })
  20 | 
  21 |     const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
  22 | 
  23 |     // La réponse HTTP est bien un succès
  24 |     expect(response, 'la navigation doit renvoyer une réponse').not.toBeNull()
  25 |     expect(response!.status(), 'statut HTTP attendu : 200').toBe(200)
  26 | 
  27 |     // Le point de montage React est présent et rendu
  28 |     const root = page.locator('#root')
  29 |     await expect(root).toBeAttached()
  30 |     await expect(root).not.toBeEmpty()
  31 | 
  32 |     // Aucune erreur console bloquante (les warnings sont tolérés)
  33 |     expect(consoleErrors, `erreurs console détectées : ${consoleErrors.join(' | ')}`).toEqual([])
  34 |   })
  35 | 
  36 |   test('le titre est visible', async ({ page }) => {
  37 |     await page.goto('/')
  38 | 
  39 |     // Titre du document (balise <title>)
  40 |     await expect(page).toHaveTitle(/.+/)
  41 | 
  42 |     // Titre principal de la page (heading niveau 1) visible
  43 |     const heading = page.getByRole('heading', { level: 1 })
  44 |     await expect(heading).toBeVisible()
  45 |     await expect(heading).not.toBeEmpty()
  46 |   })
  47 | 
  48 |   test('la navigation est présente', async ({ page }) => {
  49 |     await page.goto('/')
  50 | 
  51 |     // Une zone de navigation doit exister : <nav> (ou [role="navigation"])
  52 |     // ou, à défaut (template Vite de Sprint 1), la section de liens principale.
  53 |     const nav = page
  54 |       .locator('nav, [role="navigation"], #next-steps, header')
  55 |       .first()
  56 |     await expect(nav).toBeVisible()
  57 | 
  58 |     // Elle contient au moins un lien cliquable
  59 |     const navLinks = nav.locator('a[href]')
> 60 |     await expect(navLinks.first()).toBeVisible()
     |                                    ^ Error: expect(locator).toBeVisible() failed
  61 |     expect(
  62 |       await navLinks.count(),
  63 |       'la navigation doit contenir au moins un lien'
  64 |     ).toBeGreaterThan(0)
  65 |   })
  66 | })
  67 | 
```