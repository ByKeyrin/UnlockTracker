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
export type Onglet = 'catalogue' | 'suivi' | 'filtres' | 'partage';

/** Identifiant d'un profil utilisateur (partage multi-utilisateurs). */
export type ProfilId = 'kevin' | 'copine';

/** Profil utilisateur partageant la collection Unlock!. */
export interface Profil {
  /** Identifiant unique du profil. */
  id: ProfilId;
  /** Nom affiché du joueur. */
  nom: string;
  /** Emoji représentant l'avatar du profil. */
  avatar: string;
}
