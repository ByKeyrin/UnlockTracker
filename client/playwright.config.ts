import { defineConfig, devices } from '@playwright/test'

/**
 * UnlockTracker — Configuration Playwright (Sprint 1)
 * Agent : TEMPER (QA)
 *
 * Les tests E2E démarrent automatiquement le serveur Vite de dev
 * (`npm run dev`) sur le port 5173 avant la campagne.
 *
 * Lancer les tests :
 *   npx playwright test                 # toute la suite
 *   npx playwright test tests/smoke.spec.ts
 *   npx playwright test --ui            # mode interactif
 *   npx playwright show-report          # rapport HTML
 */
export default defineConfig({
  testDir: './tests',
  // Timeout par test (30s par défaut, largement suffisant pour un smoke test)
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  // Échec de la campagne dès le 1er test en échec sur CI
  maxFailures: process.env.CI ? 1 : 0,
  // Exécution parallèle des fichiers de test
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    // URL de base de l'application Vite.
    // Port DÉDIÉ aux tests (5299) pour ne JAMAIS empiéter sur le serveur
    // de dev d'un autre projet qui occuperait le port 5173.
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5299',
    // Traces + screenshots uniquement en cas d'échec (légèreté en dev)
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Démarre le serveur de dev Vite avant la campagne de tests
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5299 --strictPort',
    url: 'http://127.0.0.1:5299',
    // Ne JAMAIS réutiliser un serveur existant : on doit tester
    // l'app UnlockTracker, pas celle d'un autre projet sur le même port.
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
