import { useMemo, useState } from 'react';
import type { GamesByProfil } from '../../hooks/useProfile';
import type { Profil, UnlockGame } from '../../types';

/** Filtres disponibles sur la liste partagée. */
export type FiltrePartage = 'tous' | 'ensemble' | Profil['id'];

/** Jeu joué par au moins un profil, avec le statut de chaque profil. */
interface LignePartagee {
  /** Jeu du catalogue commun. */
  game: UnlockGame;
  /** Statut du jeu pour chaque profil. */
  statuts: Record<string, UnlockGame['statut']>;
  /** Identifiants des profils ayant terminé ce jeu. */
  jouePar: Profil['id'][];
}

/**
 * Props du composant {@link SharedList}.
 */
export interface SharedListProps {
  /** Liste des profils à représenter. */
  profils: Profil[];
  /** Jeux suivis par chaque profil. */
  gamesByProfil: GamesByProfil;
}

/**
 * Affiche la liste partagée des jeux joués par les deux profils, avec un
 * filtre par profil et une vue « Joués ensemble » restreinte aux jeux
 * terminés par les deux.
 *
 * @param props - Props du composant
 * @example
 * <SharedList profils={profils} gamesByProfil={gamesByProfil} />
 */
export function SharedList({ profils, gamesByProfil }: SharedListProps) {
  const [filtre, setFiltre] = useState<FiltrePartage>('tous');

  // Jeux joués par au moins un profil, sans doublon entre les collections.
  const lignes = useMemo(() => {
    const premierJeux = gamesByProfil[profils[0].id] ?? [];
    return premierJeux
      .map((game): LignePartagee => {
        const statuts: Record<string, UnlockGame['statut']> = {};
        const jouePar: Profil['id'][] = [];
        for (const profil of profils) {
          const candidat = (gamesByProfil[profil.id] ?? []).find(
            (item) => item.id === game.id,
          );
          statuts[profil.id] = candidat?.statut ?? 'non_joue';
          if (candidat?.statut === 'termine') {
            jouePar.push(profil.id);
          }
        }
        return { game, statuts, jouePar };
      })
      .filter((ligne) => ligne.jouePar.length > 0);
  }, [profils, gamesByProfil]);

  const lignesFiltrees = useMemo(() => {
    if (filtre === 'tous') return lignes;
    if (filtre === 'ensemble') {
      return lignes.filter((ligne) => ligne.jouePar.length === profils.length);
    }
    return lignes.filter((ligne) => ligne.jouePar.includes(filtre));
  }, [lignes, filtre, profils.length]);

  const nbCommuns = lignes.filter(
    (ligne) => ligne.jouePar.length === profils.length,
  ).length;

  return (
    <section
      aria-label="Jeux joués par les profils"
      data-testid="shared-list"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Liste partagée
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {lignes.length} jeu{lignes.length > 1 ? 'x' : ''} joué
          {lignes.length > 1 ? 's' : ''} par au moins un profil, dont{' '}
          {nbCommuns} terminé{nbCommuns > 1 ? 's' : ''} par les deux.
        </p>
      </div>

      {/* Filtres par profil */}
      <ul
        aria-label="Filtres de la liste partagée"
        className="flex flex-wrap gap-2"
      >
        <li>
          <button
            type="button"
            aria-pressed={filtre === 'tous'}
            onClick={() => setFiltre('tous')}
            className={
              filtre === 'tous'
                ? 'rounded-full border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }
          >
            Tous les joués
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-pressed={filtre === 'ensemble'}
            onClick={() => setFiltre('ensemble')}
            className={
              filtre === 'ensemble'
                ? 'rounded-full border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }
          >
            Joués ensemble
          </button>
        </li>
        {profils.map((profil) => (
          <li key={profil.id}>
            <button
              type="button"
              aria-pressed={filtre === profil.id}
              onClick={() => setFiltre(profil.id)}
              className={
                filtre === profil.id
                  ? 'rounded-full border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }
            >
              {profil.nom}
            </button>
          </li>
        ))}
      </ul>

      {/* Liste des jeux joués */}
      {lignesFiltrees.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Aucun jeu ne correspond à ce filtre pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lignesFiltrees.map((ligne) => (
            <li
              key={ligne.game.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {ligne.game.nom}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Série {ligne.game.serie} · {ligne.game.theme}
                </span>
              </div>

              {/* Badges de statut par joueur */}
              <ul className="flex items-center gap-2">
                {profils.map((profil) => {
                  const aJoue = ligne.jouePar.includes(profil.id);
                  return (
                    <li
                      key={profil.id}
                      title={`${profil.nom} : ${
                        aJoue ? 'joué' : 'pas encore joué'
                      }`}
                      className={
                        aJoue
                          ? 'flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300'
                          : 'flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }
                    >
                      <span aria-hidden="true">{profil.avatar}</span>
                      <span>{aJoue ? '✅' : '—'}</span>
                      <span className="sr-only">
                        {aJoue
                          ? `${profil.nom} a joué à ce jeu`
                          : `${profil.nom} n'a pas joué à ce jeu`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SharedList;
