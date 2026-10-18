import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UnlockGame } from '../types';

/** Clé du localStorage utilisée pour persister les filtres avancés. */
export const FILTRES_STORAGE_KEY = 'sweatbook_filters';

/** Statut de jeu sélectionnable dans les filtres. */
export type FiltreStatut = UnlockGame['statut'];

/** Difficulté sélectionnable dans les filtres (1–3). */
export type FiltreDifficulte = UnlockGame['difficulte'];

/**
 * État des filtres avancés et de la recherche.
 */
export interface FiltresAvances {
  /** Séries cochées (multi-sélection), vide = toutes. */
  series: string[];
  /** Difficultés cochées (1–3, multi-sélection), vide = toutes. */
  difficultes: FiltreDifficulte[];
  /** Statuts cochés (multi-sélection), vide = tous. */
  statuts: FiltreStatut[];
  /** Durée maximale en minutes, ou `null` pour toutes. */
  dureeMax: number | null;
  /** Recherche textuelle sur le nom ou le thème. */
  recherche: string;
}

/** Valeurs par défaut : aucun filtre actif, recherche vide. */
export const FILTRES_INITIAUX: FiltresAvances = {
  series: [],
  difficultes: [],
  statuts: [],
  dureeMax: null,
  recherche: '',
};

/** Valeurs de durée proposées dans le filtre (minutes). */
export const DUREES_FILTRE = [30, 45, 60, 75, 90] as const;

/**
 * Valeur retournée par {@link useFilters}.
 */
export interface UseFiltersResult {
  /** État courant des filtres. */
  filters: FiltresAvances;
  /** Ajoute/retire une série de la sélection. */
  toggleSerie: (serie: string) => void;
  /** Ajoute/retire une difficulté de la sélection. */
  toggleDifficulte: (difficulte: FiltreDifficulte) => void;
  /** Ajoute/retire un statut de la sélection. */
  toggleStatut: (statut: FiltreStatut) => void;
  /** Définit la durée maximale (`null` pour toutes). */
  setDureeMax: (duree: number | null) => void;
  /** Met à jour la recherche textuelle. */
  setRecherche: (recherche: string) => void;
  /** Réinitialise tous les filtres et la recherche. */
  resetFilters: () => void;
  /** Jeux correspondant à la combinaison de filtres. */
  filteredGames: UnlockGame[];
  /** Nombre de jeux correspondant aux filtres. */
  resultCount: number;
}

/**
 * Gère l'état des filtres avancés, leur combinaison et leur persistance.
 *
 * Les filtres sont persistés dans le localStorage (`sweatbook_filters`) et
 * appliqués ensemble : un jeu est affiché s'il correspond à **tous** les
 * filtres actifs (série, difficulté, statut, durée, recherche).
 *
 * @param games - Collection complète de jeux à filtrer
 * @returns L'état des filtres, leurs setters et les résultats filtrés
 * @example
 * const { filters, toggleSerie, filteredGames, resultCount } = useFilters(games)
 */
export function useFilters(games: UnlockGame[]): UseFiltersResult {
  const [filters, setFilters] = useState<FiltresAvances>(() => loadFilters());

  // Persistance : chaque modification des filtres est écrite dans le localStorage.
  useEffect(() => {
    localStorage.setItem(FILTRES_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const toggleSerie = useCallback((serie: string) => {
    setFilters((prev) => ({
      ...prev,
      series: prev.series.includes(serie)
        ? prev.series.filter((s) => s !== serie)
        : [...prev.series, serie],
    }));
  }, []);

  const toggleDifficulte = useCallback((difficulte: FiltreDifficulte) => {
    setFilters((prev) => ({
      ...prev,
      difficultes: prev.difficultes.includes(difficulte)
        ? prev.difficultes.filter((d) => d !== difficulte)
        : [...prev.difficultes, difficulte],
    }));
  }, []);

  const toggleStatut = useCallback((statut: FiltreStatut) => {
    setFilters((prev) => ({
      ...prev,
      statuts: prev.statuts.includes(statut)
        ? prev.statuts.filter((s) => s !== statut)
        : [...prev.statuts, statut],
    }));
  }, []);

  const setDureeMax = useCallback((duree: number | null) => {
    setFilters((prev) => ({ ...prev, dureeMax: duree }));
  }, []);

  const setRecherche = useCallback((recherche: string) => {
    setFilters((prev) => ({ ...prev, recherche }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...FILTRES_INITIAUX, series: [], difficultes: [], statuts: [] });
  }, []);

  const filteredGames = useMemo(
    () => applyFilters(games, filters),
    [games, filters],
  );

  return {
    filters,
    toggleSerie,
    toggleDifficulte,
    toggleStatut,
    setDureeMax,
    setRecherche,
    resetFilters,
    filteredGames,
    resultCount: filteredGames.length,
  };
}

/**
 * Applique la combinaison de tous les filtres avancés à une liste de jeux.
 *
 * Un jeu est retenu s'il correspond à tous les filtres actifs :
 * - série : dans la sélection (ou sélection vide = toutes) ;
 * - difficulté : dans la sélection (ou sélection vide = toutes) ;
 * - statut : dans la sélection (ou sélection vide = tous) ;
 * - durée : inférieure ou égale à `dureeMax` (ou `null` = toutes) ;
 * - recherche : le nom ou le thème contient le texte (insensible casse/accents).
 *
 * @param games - Collection complète
 * @param filters - Filtres à combiner
 * @returns La liste des jeux correspondant à tous les filtres
 * @example
 * applyFilters(games, { series: ['2'], difficultes: [], statuts: [], dureeMax: 60, recherche: 'pharaon' })
 */
export function applyFilters(
  games: UnlockGame[],
  filters: FiltresAvances,
): UnlockGame[] {
  const query = normaliser(filters.recherche);

  return games.filter((game) => {
    if (filters.series.length > 0 && !filters.series.includes(game.serie)) {
      return false;
    }
    if (
      filters.difficultes.length > 0 &&
      !filters.difficultes.includes(game.difficulte)
    ) {
      return false;
    }
    if (
      filters.statuts.length > 0 &&
      !filters.statuts.includes(game.statut)
    ) {
      return false;
    }
    if (filters.dureeMax !== null && game.duree > filters.dureeMax) {
      return false;
    }
    if (
      query !== '' &&
      !normaliser(game.nom).includes(query) &&
      !normaliser(game.theme).includes(query)
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Lit les filtres depuis le localStorage, ou les valeurs par défaut si le
 * localStorage est vide, illisible ou contient un objet invalide.
 *
 * @returns L'état des filtres à afficher
 */
function loadFilters(): FiltresAvances {
  try {
    const raw = localStorage.getItem(FILTRES_STORAGE_KEY);
    if (raw === null) {
      return { ...FILTRES_INITIAUX };
    }
    const parsed: unknown = JSON.parse(raw);
    if (isFiltresAvances(parsed)) {
      return parsed;
    }
    return { ...FILTRES_INITIAUX };
  } catch {
    // localStorage indisponible ou JSON corrompu : on repart des valeurs par défaut.
    return { ...FILTRES_INITIAUX };
  }
}

/**
 * Vérifie qu'une valeur inconnue est un objet {@link FiltresAvances} valide.
 *
 * @param value - Valeur à vérifier
 * @returns `true` si la valeur a la forme attendue
 */
function isFiltresAvances(value: unknown): value is FiltresAvances {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.series) &&
    v.series.every((s) => typeof s === 'string') &&
    Array.isArray(v.difficultes) &&
    v.difficultes.every((d) => d === 1 || d === 2 || d === 3) &&
    Array.isArray(v.statuts) &&
    v.statuts.every(
      (s) => s === 'non_joue' || s === 'en_cours' || s === 'termine',
    ) &&
    (v.dureeMax === null || typeof v.dureeMax === 'number') &&
    typeof v.recherche === 'string'
  );
}

/**
 * Normalise un texte pour une comparaison insensible à la casse et aux accents.
 *
 * @param texte - Texte à normaliser
 * @returns Le texte en minuscules sans accents
 */
function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export default useFilters;
