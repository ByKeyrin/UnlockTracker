import type { Profil, ProfilId, UnlockGame } from '../types';
import { DEMO_GAMES } from './games';

/** Profils utilisateurs de l'application (Kevin et sa copine). */
export const PROFILS: Profil[] = [
  { id: 'kevin', nom: 'Kevin', avatar: '😎' },
  { id: 'copine', nom: 'Copine', avatar: '🥰' },
];

/**
 * Ajustements de la démonstration pour le profil « copine », afin que les
 * statistiques comparées des deux profils soient parlantes au premier
 * lancement (Kevin : 3 jeux joués, la copine : 2 jeux joués).
 */
const COPIE_OVERRIDES: Record<string, Partial<UnlockGame>> = {
  // Jeu terminé par Kevin seul.
  'unlock-2-1': { statut: 'non_joue', dateFin: undefined },
  // Jeux terminés par la copine seule.
  'unlock-2-2': { statut: 'termine', dateFin: '2026-05-10' },
};

/**
 * Génère la collection de démonstration propre à un profil.
 *
 * Kevin reçoit la collection de démonstration telle quelle ; la copine reçoit
 * une variante pour que les vues « ensemble » et « par profil » soient
 * différenciées au premier lancement.
 *
 * @param profilId - Identifiant du profil concerné
 * @returns La liste des jeux à charger pour ce profil
 * @example
 * const games = seedGamesForProfil('copine')
 */
export function seedGamesForProfil(profilId: ProfilId): UnlockGame[] {
  return DEMO_GAMES.map((game) => {
    const override =
      profilId === 'copine' ? COPIE_OVERRIDES[game.id] : undefined;
    return { ...game, ...override };
  });
}
