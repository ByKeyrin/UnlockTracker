import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEMO_GAMES } from '../data/games';
import type { UnlockGame } from '../types';

/** Clé du localStorage utilisée pour persister la collection. */
const STORAGE_KEY = 'sweatbook_games';

/** Statuts de jeu disponibles pour le filtrage. */
export type FiltreStatut = UnlockGame['statut'] | 'tous';

/**
 * Filtres supportés par {@link useGames}.
 */
export interface UseGamesFilters {
  /** Série à afficher, ou `undefined` pour toutes. */
  serie?: string;
  /** Difficulté exacte (1–3), ou `undefined` pour toutes. */
  difficulte?: UnlockGame['difficulte'];
  /** Statut à afficher, ou `'tous'` / `undefined` pour tous. */
  statut?: FiltreStatut;
}

/**
 * Valeur retournée par {@link useGames}.
 */
export interface UseGamesResult {
  /** Liste des jeux correspondant aux filtres. */
  games: UnlockGame[];
  /** Liste complète des jeux enregistrés (sans filtre). */
  allGames: UnlockGame[];
  /** Ajoute un nouveau jeu à la collection. */
  addGame: (game: UnlockGame) => void;
  /** Met à jour un jeu existant (identifié par son `id`). */
  updateGame: (id: string, patch: Partial<Omit<UnlockGame, 'id'>>) => void;
  /** Supprime un jeu de la collection. */
  deleteGame: (id: string) => void;
  /** Passe un jeu au statut `termine`. */
  markPlayed: (id: string) => void;
  /** Réinitialise la collection avec les données de démonstration. */
  resetDemo: () => void;
}

/**
 * Charge les jeux depuis le localStorage (ou les données de démo au premier
 * lancement) et fournit les opérations CRUD ainsi que le filtrage.
 *
 * @param filters - Filtres optionnels (série, difficulté, statut)
 * @returns Les jeux filtrés, la collection complète et les opérations CRUD
 * @example
 * const { games, markPlayed } = useGames({ serie: '2', statut: 'non_joue' })
 */
export function useGames(filters: UseGamesFilters = {}): UseGamesResult {
  const [games, setGames] = useState<UnlockGame[]>(() => loadGames());

  // Persistance : chaque modification de la collection est écrite dans le localStorage.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }, [games]);

  const addGame = useCallback((game: UnlockGame) => {
    setGames((prev) => [...prev, game]);
  }, []);

  const updateGame = useCallback(
    (id: string, patch: Partial<Omit<UnlockGame, 'id'>>) => {
      setGames((prev) =>
        prev.map((game) => (game.id === id ? { ...game, ...patch } : game)),
      );
    },
    [],
  );

  const deleteGame = useCallback((id: string) => {
    setGames((prev) => prev.filter((game) => game.id !== id));
  }, []);

  const markPlayed = useCallback(
    (id: string) => {
      setGames((prev) =>
        prev.map((game) =>
          game.id === id
            ? {
                ...game,
                statut: 'termine' as const,
                dateFin: game.dateFin ?? todayIso(),
              }
            : game,
        ),
      );
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setGames(DEMO_GAMES.map((game) => ({ ...game })));
  }, []);

  const filteredGames = useMemo(
    () => filterGames(games, filters),
    [games, filters],
  );

  return {
    games: filteredGames,
    allGames: games,
    addGame,
    updateGame,
    deleteGame,
    markPlayed,
    resetDemo,
  };
}

/**
 * Lit la collection depuis le localStorage, ou les données de démonstration
 * si le localStorage est vide ou illisible.
 *
 * @returns La liste des jeux à afficher
 */
function loadGames(): UnlockGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return DEMO_GAMES.map((game) => ({ ...game }));
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as UnlockGame[];
    }
    return DEMO_GAMES.map((game) => ({ ...game }));
  } catch {
    // localStorage indisponible ou JSON corrompu : on repart des données de démo.
    return DEMO_GAMES.map((game) => ({ ...game }));
  }
}

/**
 * Retourne la date du jour au format ISO `AAAA-MM-JJ`.
 *
 * @returns La date du jour formatée
 */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Applique les filtres de série, difficulté et statut à une liste de jeux.
 *
 * @param games - Collection complète
 * @param filters - Filtres à appliquer
 * @returns La liste des jeux correspondant aux filtres
 */
function filterGames(
  games: UnlockGame[],
  filters: UseGamesFilters,
): UnlockGame[] {
  return games.filter((game) => {
    if (filters.serie !== undefined && game.serie !== filters.serie) return false;
    if (filters.difficulte !== undefined && game.difficulte !== filters.difficulte)
      return false;
    if (
      filters.statut !== undefined &&
      filters.statut !== 'tous' &&
      game.statut !== filters.statut
    )
      return false;
    return true;
  });
}

export default useGames;
