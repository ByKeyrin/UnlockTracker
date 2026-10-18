import { useCallback, useEffect, useMemo, useState } from 'react';
import { PROFILS, seedGamesForProfil } from '../data/profiles';
import type { Profil, ProfilId, UnlockGame } from '../types';

/** Clé du localStorage utilisée pour persister le profil actif. */
const STORAGE_KEY_PROFIL = 'sweatbook_profile';

/** Préfixe des clés de localStorage des collections de jeux par profil. */
const STORAGE_KEY_GAMES_PREFIX = 'sweatbook_profile_games_';

/** Jeux suivis par profil, indexés par identifiant de profil. */
export type GamesByProfil = Record<ProfilId, UnlockGame[]>;

/**
 * Valeur retournée par {@link useProfile}.
 */
export interface UseProfileResult {
  /** Liste des profils disponibles. */
  profils: Profil[];
  /** Profil actuellement sélectionné. */
  profilActif: Profil;
  /** Jeux suivis par le profil actif. */
  games: UnlockGame[];
  /** Jeux suivis par chaque profil (pour les vues comparatives). */
  gamesByProfil: GamesByProfil;
  /** Sélectionne le profil actif (changement instantané, persisté). */
  setProfilActif: (id: ProfilId) => void;
  /** Met à jour un jeu de la collection du profil actif. */
  updateGame: (id: string, patch: Partial<Omit<UnlockGame, 'id'>>) => void;
}

/**
 * Gère le profil actif (Kevin ou sa copine) et les collections de jeux
 * séparées par profil, persistées dans le localStorage.
 *
 * @returns Le profil actif, les collections par profil et leurs opérations
 * @example
 * const { profilActif, setProfilActif, gamesByProfil } = useProfile()
 */
export function useProfile(): UseProfileResult {
  const [profilActifId, setProfilActifId] = useState<ProfilId>(() =>
    loadProfilActif(),
  );
  const [gamesByProfil, setGamesByProfil] = useState<GamesByProfil>(() =>
    loadAllGames(),
  );

  // Persistance du profil actif.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFIL, profilActifId);
  }, [profilActifId]);

  // Persistance : chaque modification est écrite dans le localStorage du profil.
  useEffect(() => {
    for (const profil of PROFILS) {
      localStorage.setItem(
        STORAGE_KEY_GAMES_PREFIX + profil.id,
        JSON.stringify(gamesByProfil[profil.id]),
      );
    }
  }, [gamesByProfil]);

  const setProfilActif = useCallback((id: ProfilId) => {
    setProfilActifId(id);
  }, []);

  const updateGame = useCallback(
    (id: string, patch: Partial<Omit<UnlockGame, 'id'>>) => {
      setGamesByProfil((prev) => ({
        ...prev,
        [profilActifId]: prev[profilActifId].map((game) =>
          game.id === id ? { ...game, ...patch } : game,
        ),
      }));
    },
    [profilActifId],
  );

  const profilActif = useMemo(
    () => PROFILS.find((profil) => profil.id === profilActifId) ?? PROFILS[0],
    [profilActifId],
  );

  return {
    profils: PROFILS,
    profilActif,
    games: gamesByProfil[profilActifId],
    gamesByProfil,
    setProfilActif,
    updateGame,
  };
}

/**
 * Lit le profil actif depuis le localStorage.
 *
 * @returns L'identifiant du profil mémorisé, ou « kevin » si absent ou invalide
 */
function loadProfilActif(): ProfilId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFIL);
    if (raw === 'kevin' || raw === 'copine') {
      return raw;
    }
    return 'kevin';
  } catch {
    // localStorage indisponible : on repart du profil par défaut.
    return 'kevin';
  }
}

/**
 * Lit les collections de chaque profil depuis le localStorage, ou les données
 * de démonstration par profil si le localStorage est vide ou illisible.
 *
 * @returns Les jeux de chaque profil, indexés par identifiant
 */
function loadAllGames(): GamesByProfil {
  const result = {} as GamesByProfil;
  for (const profil of PROFILS) {
    result[profil.id] = loadGames(profil.id);
  }
  return result;
}

/**
 * Lit la collection d'un profil depuis le localStorage, ou sa démonstration
 * si le localStorage est vide ou illisible.
 *
 * @param profilId - Identifiant du profil concerné
 * @returns La liste des jeux du profil
 */
function loadGames(profilId: ProfilId): UnlockGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMES_PREFIX + profilId);
    if (raw === null) {
      return seedGamesForProfil(profilId);
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as UnlockGame[];
    }
    return seedGamesForProfil(profilId);
  } catch {
    // localStorage indisponible ou JSON corrompu : on repart de la démo.
    return seedGamesForProfil(profilId);
  }
}

export default useProfile;
