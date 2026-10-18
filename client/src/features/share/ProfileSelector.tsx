import type { Profil, ProfilId } from '../../types';

/** Couleurs d'accent par profil (avatar et anneau de sélection). */
const PROFIL_ACCENTS: Record<ProfilId, { actif: string; inactif: string }> = {
  kevin: {
    actif:
      'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    inactif:
      'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  },
  copine: {
    actif:
      'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    inactif:
      'border-slate-200 bg-white text-slate-600 hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  },
};

/**
 * Props du composant {@link ProfileSelector}.
 */
export interface ProfileSelectorProps {
  /** Liste des profils à afficher. */
  profils: Profil[];
  /** Identifiant du profil actuellement sélectionné. */
  profilActifId: ProfilId;
  /** Callback appelé lors du changement de profil. */
  onSelectProfil: (id: ProfilId) => void;
}

/**
 * Affiche le sélecteur de profil (avatar + nom) et permet de changer de profil
 * de façon instantanée, la sélection étant persistée par le hook useProfile.
 *
 * @param props - Props du composant
 * @example
 * <ProfileSelector profils={profils} profilActifId={profilActif.id} onSelectProfil={setProfilActif} />
 */
export function ProfileSelector({
  profils,
  profilActifId,
  onSelectProfil,
}: ProfileSelectorProps) {
  return (
    <section
      aria-label="Choix du profil"
      data-testid="profile-selector"
      className="flex flex-col gap-2"
    >
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Qui joue ?
      </h2>
      <ul className="flex flex-wrap gap-3">
        {profils.map((profil) => {
          const estActif = profil.id === profilActifId;
          const accents = PROFIL_ACCENTS[profil.id];
          return (
            <li key={profil.id}>
              <button
                type="button"
                aria-pressed={estActif}
                onClick={() => onSelectProfil(profil.id)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  estActif ? accents.actif : accents.inactif
                }`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800"
                >
                  {profil.avatar}
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-base font-semibold">{profil.nom}</span>
                  <span className="text-xs opacity-70">
                    {estActif ? 'Profil actif' : 'Changer de profil'}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ProfileSelector;
