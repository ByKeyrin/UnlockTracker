import { useMemo, useState } from 'react';
import type { UnlockGame } from '../../types';
import { GameCard } from './GameCard';

/** Tri disponibles pour la liste des jeux. */
export type TriJeux = 'serie' | 'difficulte';

/**
 * Props du composant {@link GameList}.
 */
export interface GameListProps {
  /** Jeux à afficher. */
  games: UnlockGame[];
  /** Recherche textuelle sur le nom ou le thème, ou chaîne vide. */
  recherche?: string;
  /** Callback déclenché pour marquer un jeu comme joué. */
  onMarkPlayed?: (gameId: string) => void;
}

/**
 * Affiche la liste des jeux en grille responsive avec tri par série ou
 * difficulté et recherche par nom ou thème.
 *
 * @param props - Props du composant
 * @example
 * <GameList games={games} recherche="pirate" onMarkPlayed={markPlayed} />
 */
export function GameList({ games, recherche = '', onMarkPlayed }: GameListProps) {
  const [tri, setTri] = useState<TriJeux>('serie');

  const visibleGames = useMemo(() => {
    const query = recherche.trim().toLowerCase();
    const filtered = query === ''
      ? games
      : games.filter(
          (game) =>
            game.nom.toLowerCase().includes(query) ||
            game.theme.toLowerCase().includes(query),
        );

    return [...filtered].sort((a, b) => {
      if (tri === 'difficulte') {
        return a.difficulte - b.difficulte || a.nom.localeCompare(b.nom, 'fr');
      }
      return (
        a.serie.localeCompare(b.serie, 'fr', { numeric: true }) ||
        a.numero - b.numero
      );
    });
  }, [games, recherche, tri]);

  return (
    <section aria-label="Liste des jeux" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {visibleGames.length} jeu{visibleGames.length > 1 ? 'x' : ''} affiché
          {visibleGames.length > 1 ? 's' : ''}
        </p>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Trier par
          <select
            value={tri}
            onChange={(event) => setTri(event.target.value as TriJeux)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="serie">Série</option>
            <option value="difficulte">Difficulté</option>
          </select>
        </label>
      </div>

      {visibleGames.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucun jeu ne correspond à la recherche.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGames.map((game) => (
            <li key={game.id}>
              <GameCard game={game} onMarkPlayed={onMarkPlayed} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default GameList;
