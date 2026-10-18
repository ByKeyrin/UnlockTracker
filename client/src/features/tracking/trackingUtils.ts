import type { UnlockGame } from '../../types';

/** Icône affichée pour chaque statut de jeu. */
export const STATUT_ICONS: Record<UnlockGame['statut'], string> = {
  non_joue: '⬜',
  en_cours: '⏳',
  termine: '✅',
};

/** Libellés affichés pour chaque statut de jeu. */
export const STATUT_LABELS: Record<UnlockGame['statut'], string> = {
  non_joue: 'Non joué',
  en_cours: 'En cours',
  termine: 'Terminé',
};

/**
 * Formate une date ISO `AAAA-MM-JJ` en français long (« 14 février 2026 »).
 *
 * La date est lue en heure locale (sans décalage UTC) pour rester fidèle au
 * jour saisi par l'utilisateur.
 *
 * @param isoDate - Date au format ISO `AAAA-MM-JJ`, ou `undefined`
 * @returns La date lisible en français, ou « Date inconnue » si absente
 * @example
 * formatDate('2026-02-14') // '14 février 2026'
 */
export function formatDate(isoDate: string | undefined): string {
  if (isoDate === undefined || isoDate === '') {
    return 'Date inconnue';
  }
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return 'Date inconnue';
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
