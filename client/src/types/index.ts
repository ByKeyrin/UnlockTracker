/**
 * Types partagés de l'application UnlockTracker.
 * Ce fichier est la source de vérité côté frontend pour la forme des données.
 */

/** Un jeu de la collection Unlock! */
export interface UnlockGame {
  id: string;
  nom: string;
  serie: string;
  numero: number;
  theme: string;
  difficulte: 1 | 2 | 3;
  duree: number; // minutes
  statut: 'non_joue' | 'en_cours' | 'termine';
  /** Date de fin de partie (ISO `AAAA-MM-JJ`), renseignée quand le statut passe à `termine`. */
  dateFin?: string;
}

/** Onglets de navigation de l'application. */
export type Onglet = 'catalogue' | 'suivi' | 'filtres';
