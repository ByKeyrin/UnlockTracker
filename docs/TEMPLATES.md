# UnlockTracker — Templates de code

Modèles à copier pour tout nouveau composant, hook ou type. Ils appliquent les règles de
`docs/CONVENTIONS.md` (nommage, JSDoc, structure, Tailwind).

---

## 1. Template composant React

Fichier : `client/src/components/<NomComposant>.tsx`

```tsx
import type { ReactNode } from 'react'

/**
 * Props du composant {@link GameCard}.
 */
export interface GameCardProps {
  /** Titre du jeu. */
  title: string
  /** Difficulté de 1 à 5. */
  difficulty: number
  /** Statut de la partie. */
  isPlayed?: boolean
  /** Contenu rendu sous le titre. */
  children?: ReactNode
  /** Callback déclenché au clic sur la carte. */
  onClick?: (gameId: number) => void
}

/**
 * Affiche la carte d'un jeu du catalogue (titre, difficulté, statut).
 *
 * @param props - Props du composant
 * @returns La carte du jeu sous forme d'élément JSX
 * @example
 * <GameCard title="Le Vol du Diamant" difficulty={2} isPlayed onClick={handleClick} />
 */
function GameCard({ title, difficulty, isPlayed = false, children, onClick }: GameCardProps) {
  const badgeClass = isPlayed
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-600'

  return (
    <article
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md focus-visible:ring-2"
      onClick={() => onClick?.(1)}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
          {isPlayed ? 'Joué' : 'À faire'}
        </span>
      </header>

      <p className="text-sm text-gray-600">Difficulté : {difficulty} / 5</p>

      {children}
    </article>
  )
}

export default GameCard
```

Variantes :
- **Composant de page** : mettre le fichier dans `client/src/pages/`, même structure, sans props si possible.
- **Composant purement décoratif** : ne pas oublier `aria-hidden="true"` sur les SVG/images décoratifs.

---

## 2. Template hook

Fichier : `client/src/hooks/use<Nom>.ts`

```ts
import { useCallback, useEffect, useState } from 'react'
import { fetchGames } from '../services/api'
import type { Game } from '../types'

/** Filtres supportés par {@link useGames}. */
export interface UseGamesFilters {
  /** Identifiant de série, ou `undefined` pour toutes. */
  seriesId?: number
  /** Difficulté exacte (1–5), ou `undefined` pour toutes. */
  difficulty?: number
}

/** Valeur retournée par {@link useGames}. */
export interface UseGamesResult {
  /** Liste des jeux correspondant aux filtres. */
  games: Game[]
  /** `true` pendant le chargement. */
  isLoading: boolean
  /** Erreur éventuelle du dernier appel API. */
  error: Error | null
}

/**
 * Charge les jeux du catalogue depuis l'API et applique les filtres.
 *
 * Se recharge automatiquement quand `filters` change.
 *
 * @param filters - Filtres optionnels (série, difficulté)
 * @returns Les jeux, l'état de chargement et l'erreur éventuelle
 * @example
 * const { games, isLoading, error } = useGames({ difficulty: 2 })
 */
export function useGames(filters: UseGamesFilters = {}): UseGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setGames(await fetchGames(filters))
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void load()
  }, [load])

  return { games, isLoading, error }
}

export default useGames
```

Règles hooks :
- Préfixe `use` obligatoire, un hook par fichier.
- Ne jamais appeler un hook conditionnellement.
- La logique d'appel API reste dans `services/api.ts` : le hook orchestre, il ne fetch pas lui-même.
- Retourner un objet nommé (pas de tableau positionnel) dès qu'il y a plus de deux valeurs.

---

## 3. Template type

Fichier : `client/src/types/index.ts` (ou module dédié)

```ts
/** Statut de jeu partagé (table `plays`). */
export type GameStatus = 'todo' | 'played'

/** Niveau de difficulté d'un jeu (1 = facile, 5 = expert). */
export type Difficulty = 1 | 2 | 3 | 4 | 5

/**
 * Série de jeux Unlock! (ex : « Série 2 », « Escape Adventures »).
 */
export interface Series {
  /** Identifiant unique (SQL : `series.id`). */
  id: number
  /** Nom affiché de la série. */
  name: string
  /** Identifiant URL (SQL : `series.slug`), ex : `serie-2`. */
  slug: string
}

/**
 * Jeu du catalogue Unlock! (table `games` enrichie du statut de jeu).
 */
export interface Game {
  /** Identifiant unique (SQL : `games.id`). */
  id: number
  /** Titre français du jeu. */
  title: string
  /** Série d'appartenance. */
  series: Series
  /** Numéro dans la série (1, 2, 3…). */
  number: number
  /** Thème narratif (ex : « Polar », « Aventure »). */
  theme: string
  /** Difficulté de 1 à 5. */
  difficulty: Difficulty
  /** Durée estimée en minutes (ex : 60). */
  durationMin: number
  /** Statut de la partie. */
  status: GameStatus
  /** Date de la partie (ISO `YYYY-MM-DD`), si `status === 'played'`. */
  playedAt?: string
}

/**
 * Corps de requête pour marquer un jeu comme joué.
 */
export interface PlayRequest {
  /** Date de la partie (ISO `YYYY-MM-DD`). */
  playedAt: string
  /** Noms des joueurs. */
  players: string[]
  /** Échappé à temps ? */
  success: boolean
  /** Notes libres. */
  notes?: string
}
```

Règles types :
- `interface` pour les objets, `type` pour unions/littéraux.
- JSDoc sur la déclaration **et** sur chaque champ.
- Les champs optionnels documentent leur valeur par défaut ou leur condition d'existence.
- Un seul point d'export (`types/index.ts`) importé par composants, hooks et services.
