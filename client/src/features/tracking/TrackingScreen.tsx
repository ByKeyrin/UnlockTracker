import { useCallback } from 'react';
import { useGames } from '../../hooks/useGames';
import { GameHistory } from './GameHistory';
import { PlayedTimeline } from './PlayedTimeline';
import { StatsCards } from './StatsCards';

/**
 * Écran de suivi des jeux joués : statistiques de la collection, chronologie
 * des parties terminées et historique complet avec réinitialisation.
 *
 * @example
 * <TrackingScreen />
 */
export function TrackingScreen() {
  const { allGames, updateGame } = useGames();

  /**
   * Remet un jeu au statut « non joué » et efface sa date de fin.
   *
   * @param gameId - Identifiant du jeu à réinitialiser
   */
  const handleReset = useCallback(
    (gameId: string) => {
      updateGame(gameId, { statut: 'non_joue', dateFin: undefined });
    },
    [updateGame],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Suivi des jeux joués</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Vue d'ensemble de votre progression dans la collection Unlock!.
        </p>
      </section>

      <StatsCards games={allGames} />
      <PlayedTimeline games={allGames} />
      <GameHistory games={allGames} onReset={handleReset} />
    </div>
  );
}

export default TrackingScreen;
