import { useMemo } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { ProfileSelector } from './ProfileSelector';
import { ProfileStats } from './ProfileStats';
import { SharedList } from './SharedList';

/**
 * Écran de partage multi-utilisateurs : sélection du profil actif, vue
 * d'ensemble du partage, statistiques comparées des deux profils et liste
 * partagée des jeux joués.
 *
 * @example
 * <ShareScreen />
 */
export function ShareScreen() {
  const { profils, profilActif, gamesByProfil, setProfilActif } = useProfile();

  // Vue d'ensemble du partage : jeux joués par les deux profils / par un seul.
  const apercu = useMemo(() => {
    const tousIds = profils.map((profil) =>
      new Set(
        (gamesByProfil[profil.id] ?? [])
          .filter((game) => game.statut === 'termine')
          .map((game) => game.id),
      ),
    );
    const idsUniques = new Set<string>();
    for (const ids of tousIds) {
      for (const id of ids) idsUniques.add(id);
    }
    const communs = [...idsUniques].filter((id) =>
      tousIds.every((ids) => ids.has(id)),
    ).length;
    return {
      total: idsUniques.size,
      communs,
      seuls: idsUniques.size - communs,
    };
  }, [profils, gamesByProfil]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">
          Partage {profilActif.avatar} {profilActif.nom}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Kevin et sa copine jouent ensemble aux Unlock! : comparez vos
          progressions et retrouvez vos parties communes.
        </p>
      </section>

      {/* Vue d'ensemble du partage */}
      <ul className="grid grid-cols-3 gap-3">
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Jeux joués au total
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.total}
          </p>
        </li>
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-green-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Joués ensemble
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.communs}
          </p>
        </li>
        <li className="rounded-lg border border-slate-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Joués seul
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {apercu.seuls}
          </p>
        </li>
      </ul>

      <ProfileSelector
        profils={profils}
        profilActifId={profilActif.id}
        onSelectProfil={setProfilActif}
      />
      <ProfileStats
        profils={profils}
        profilActif={profilActif}
        gamesByProfil={gamesByProfil}
      />
      <SharedList profils={profils} gamesByProfil={gamesByProfil} />
    </div>
  );
}

export default ShareScreen;
