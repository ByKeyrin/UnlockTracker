import type { UnlockGame } from '../types';

/**
 * Données de démonstration du catalogue Unlock!.
 *
 * Jeu de données fictif mais réaliste (séries 1 à 7, thèmes et difficultés
 * conformes aux boîtes Unlock! de Space Cowboys), chargé au premier lancement
 * de l'application pour peupler le localStorage.
 */
export const DEMO_GAMES: UnlockGame[] = [
  { id: 'unlock-1-1', nom: 'La Formule', serie: '1', numero: 1, theme: 'Polar', difficulte: 2, duree: 60, statut: 'termine', dateFin: '2026-02-14' },
  { id: 'unlock-1-2', nom: 'Le Manoir Hanté', serie: '1', numero: 2, theme: 'Horreur', difficulte: 2, duree: 60, statut: 'en_cours' },
  { id: 'unlock-1-3', nom: "L'Île du Dr. Goorse", serie: '1', numero: 3, theme: 'Aventure', difficulte: 3, duree: 60, statut: 'non_joue' },
  { id: 'unlock-2-1', nom: 'Le Trésor de Tonipal', serie: '2', numero: 1, theme: 'Pirates', difficulte: 2, duree: 60, statut: 'termine', dateFin: '2026-03-21' },
  { id: 'unlock-2-2', nom: 'La Malédiction du Pharaon', serie: '2', numero: 2, theme: 'Égypte antique', difficulte: 3, duree: 60, statut: 'non_joue' },
  { id: 'unlock-2-3', nom: 'Le Fantôme de l’Opéra', serie: '2', numero: 3, theme: 'Mystère', difficulte: 1, duree: 60, statut: 'non_joue' },
  { id: 'unlock-3-1', nom: 'Le Palais des Mille et Une Nuits', serie: '3', numero: 1, theme: 'Conte oriental', difficulte: 2, duree: 60, statut: 'non_joue' },
  { id: 'unlock-3-2', nom: 'Le Septième Sceau', serie: '3', numero: 2, theme: 'Médiéval', difficulte: 3, duree: 60, statut: 'en_cours' },
  { id: 'unlock-3-3', nom: 'Le Projet Cyborg', serie: '3', numero: 3, theme: 'Science-fiction', difficulte: 2, duree: 60, statut: 'non_joue' },
  { id: 'unlock-4-1', nom: 'Le Spectacle de Noside', serie: '4', numero: 1, theme: 'Cirque', difficulte: 1, duree: 60, statut: 'termine', dateFin: '2026-04-05' },
  { id: 'unlock-4-2', nom: 'L’Évasion', serie: '4', numero: 2, theme: 'Prison', difficulte: 2, duree: 60, statut: 'non_joue' },
  { id: 'unlock-4-3', nom: 'Le Dernier Cas de Sherlock Holmes', serie: '4', numero: 3, theme: 'Enquête', difficulte: 3, duree: 60, statut: 'non_joue' },
  { id: 'unlock-5-1', nom: 'L’Express de Tombstone', serie: '5', numero: 1, theme: 'Western', difficulte: 2, duree: 60, statut: 'non_joue' },
  { id: 'unlock-5-2', nom: 'Les Aventures d’Oz', serie: '5', numero: 2, theme: 'Fantaisie', difficulte: 1, duree: 60, statut: 'non_joue' },
  { id: 'unlock-5-3', nom: 'Expédition Challenger', serie: '5', numero: 3, theme: 'Exploration', difficulte: 3, duree: 60, statut: 'en_cours' },
  { id: 'unlock-6-1', nom: 'La Nuit du Croque-mitaine', serie: '6', numero: 1, theme: 'Horreur', difficulte: 2, duree: 60, statut: 'non_joue' },
  { id: 'unlock-6-2', nom: 'Le Vol du Dirigeable', serie: '6', numero: 2, theme: 'Steampunk', difficulte: 2, duree: 60, statut: 'non_joue' },
  { id: 'unlock-7-1', nom: 'Mission Apollo', serie: '7', numero: 1, theme: 'Espace', difficulte: 3, duree: 60, statut: 'non_joue' },
  { id: 'unlock-7-2', nom: 'Le Mystère de la Momie', serie: '7', numero: 2, theme: 'Égypte antique', difficulte: 1, duree: 60, statut: 'non_joue' },
];
