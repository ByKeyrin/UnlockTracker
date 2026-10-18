/**
 * Types partagés de l'application UnlockTracker.
 * Ce fichier est la source de vérité côté frontend pour la forme des données.
 */

/** Gamme d'appartenance d'une aventure Unlock!. */
export type Gamme = 'originale' | 'star-wars' | 'short';

/** Un jeu de la collection Unlock! */
export interface UnlockGame {
  id: string;
  nom: string;
  /** Titre officiel anglais de l'aventure. */
  nomEn: string;
  serie: string;
  numero: number;
  theme: string;
  difficulte: 1 | 2 | 3;
  duree: number; // minutes
  statut: 'non_joue' | 'en_cours' | 'termine';
  /** Date de fin de partie (ISO `AAAA-MM-JJ`), renseignée quand le statut passe à `termine`. */
  dateFin?: string;
  /** Identifiant de la boîte (ou du paquet) contenant l'aventure. */
  boiteId: string;
  /** Année de sortie de la boîte. */
  annee: number;
  /** Gamme d'appartenance : série originale, Star Wars ou Short Adventures. */
  gamme: Gamme;
}

/** Onglets de navigation de l'application. */
export type Onglet = 'catalogue' | 'suivi' | 'filtres' | 'partage';
