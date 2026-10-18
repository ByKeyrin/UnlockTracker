import type { UnlockGame } from '../../types';
import { getGameImage, PLACEHOLDER_IMAGE } from '../../data/images';

/** Libellés affichés pour chaque statut de jeu. */
const STATUT_LABELS: Record<UnlockGame['statut'], string> = {
  non_joue: 'Non joué',
  en_cours: 'En cours',
  termine: 'Terminé',
};

/** Classes Tailwind du badge selon le statut. */
const STATUT_CLASSES: Record<UnlockGame['statut'], string> = {
  non_joue: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  en_cours: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  termine: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

/**
 * Props du composant {@link GameCard}.
 */
export interface GameCardProps {
  /** Jeu Unlock! à afficher. */
  game: UnlockGame;
  /** Callback déclenché pour marquer le jeu comme joué. */
  onMarkPlayed?: (gameId: string) => void;
}

/**
 * Affiche la carte d'un jeu Unlock! (nom, série, numéro, thème, difficulté,
 * statut) avec un bouton pour le marquer comme joué.
 *
 * @param props - Props du composant
 * @example
 * <GameCard game={game} onMarkPlayed={markPlayed} />
 */
export function GameCard({ game, onMarkPlayed }: GameCardProps) {
  const badgeClass = STATUT_CLASSES[game.statut];
  const isPlayed = game.statut === 'termine';

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <img
        src={getGameImage(game)}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
        alt={game.nom}
        className="aspect-square w-full rounded-md object-cover"
        loading="lazy"
      />
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {game.nom}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}
        >
          {STATUT_LABELS[game.statut]}
        </span>
      </header>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <dt className="font-medium">Série :</dt>
          <dd>
            {game.serie} · n°{game.numero}
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="font-medium">Thème :</dt>
          <dd>{game.theme}</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="font-medium">Durée :</dt>
          <dd>{game.duree} min</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-2">
        <span
          aria-label={`Difficulté : ${game.difficulte} sur 3`}
          title={`Difficulté : ${game.difficulte} / 3`}
          className="text-sm"
        >
          {'⭐'.repeat(game.difficulte)}
        </span>

        <button
          type="button"
          disabled={isPlayed}
          onClick={() => onMarkPlayed?.(game.id)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {isPlayed ? 'Joué ✓' : 'Marquer comme joué'}
        </button>
      </div>
    </article>
  );
}

export default GameCard;
