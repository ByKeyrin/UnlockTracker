import type { UnlockGame } from '../types';

/**
 * Catalogue complet des aventures Unlock! de Space Cowboys (62 aventures).
 *
 * Données officielles (titres FR/EN, boîtes, années) vérifiées sur le site
 * Space Cowboys (unlock-solutions / unlock-english) et Wikipédia :
 * - Série originale : 15 coffrets × 3 aventures = 45 aventures ;
 * - Unlock! Star Wars (hors-série) : 3 aventures ;
 * - Unlock! Short Adventures : 14 aventures (1 paquet = 1 aventure).
 *
 * Toutes les aventures sont chargées « non jouées » au premier lancement,
 * puis suivies via le localStorage.
 */
export const ALL_GAMES: UnlockGame[] = [
  // ── Série originale ─────────────────────────────────────────────────────
  // 1. Escape Adventures (2017)
  { id: 'unlock-escape-adventures-1', nom: 'La Formule', nomEn: 'The Formula', serie: '1', numero: 1, theme: 'Thriller', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'escape-adventures', annee: 2017, gamme: 'originale' },
  { id: 'unlock-escape-adventures-2', nom: 'Squeek & Sausage', nomEn: 'Squeek & Sausage', serie: '1', numero: 2, theme: 'Comédie', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'escape-adventures', annee: 2017, gamme: 'originale' },
  { id: 'unlock-escape-adventures-3', nom: "L'île du Doctor Goorse", nomEn: 'The Island of Doctor Goorse', serie: '1', numero: 3, theme: 'Aventure', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'escape-adventures', annee: 2017, gamme: 'originale' },
  // 2. Mystery Adventures (2017)
  { id: 'unlock-mystery-adventures-1', nom: 'Les Pièges du Nautilus', nomEn: "The Nautilus' Trap", serie: '2', numero: 1, theme: 'Steampunk', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'mystery-adventures', annee: 2017, gamme: 'originale' },
  { id: 'unlock-mystery-adventures-2', nom: 'La Maison sur la Colline', nomEn: 'The House of the Hill', serie: '2', numero: 2, theme: 'Horreur', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'mystery-adventures', annee: 2017, gamme: 'originale' },
  { id: 'unlock-mystery-adventures-3', nom: 'Le Trésor de Tonipal', nomEn: "The Tonipal's Treasure", serie: '2', numero: 3, theme: 'Pirates', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'mystery-adventures', annee: 2017, gamme: 'originale' },
  // 3. Secret Adventures (2017)
  { id: 'unlock-secret-adventures-1', nom: 'Noside Story', nomEn: 'Noside Story', serie: '3', numero: 1, theme: 'Polar', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'secret-adventures', annee: 2017, gamme: 'originale' },
  { id: 'unlock-secret-adventures-2', nom: 'Tombstone Express', nomEn: 'Tombstone Express', serie: '3', numero: 2, theme: 'Western', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'secret-adventures', annee: 2017, gamme: 'originale' },
  { id: 'unlock-secret-adventures-3', nom: "Les Aventuriers du pays d'Oz", nomEn: 'The Adventurers of Oz', serie: '3', numero: 3, theme: 'Fantaisie', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'secret-adventures', annee: 2017, gamme: 'originale' },
  // 4. Exotic Adventures (2018)
  { id: 'unlock-exotic-adventures-1', nom: 'La Nuit des Croquemitaines', nomEn: 'The Night of the Boogeymen', serie: '4', numero: 1, theme: 'Horreur', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'exotic-adventures', annee: 2018, gamme: 'originale' },
  { id: 'unlock-exotic-adventures-2', nom: 'Le dernier conte de Shéhérazade', nomEn: "Scheherazade's Last Tale", serie: '4', numero: 2, theme: 'Conte oriental', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'exotic-adventures', annee: 2018, gamme: 'originale' },
  { id: 'unlock-exotic-adventures-3', nom: 'Expédition Challenger', nomEn: 'Expedition: Challenger', serie: '4', numero: 3, theme: 'Exploration', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'exotic-adventures', annee: 2018, gamme: 'originale' },
  // 5. Heroic Adventures (2019)
  { id: 'unlock-heroic-adventures-1', nom: 'Insert Coin', nomEn: 'Insert Coin', serie: '5', numero: 1, theme: 'Jeu vidéo', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'heroic-adventures', annee: 2019, gamme: 'originale' },
  { id: 'unlock-heroic-adventures-2', nom: 'Sherlock Holmes sur le Fil', nomEn: 'Sherlock Holmes: The Scarlet Thread of Murder', serie: '5', numero: 2, theme: 'Enquête', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'heroic-adventures', annee: 2019, gamme: 'originale' },
  { id: 'unlock-heroic-adventures-3', nom: 'À la Poursuite du lapin blanc', nomEn: 'In Pursuit of the White Rabbit', serie: '5', numero: 3, theme: 'Fantaisie', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'heroic-adventures', annee: 2019, gamme: 'originale' },
  // 6. Timeless Adventures (2019)
  { id: 'unlock-timeless-adventures-1', nom: 'The Noside Show', nomEn: 'The Noside Show', serie: '6', numero: 1, theme: 'Cirque', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'timeless-adventures', annee: 2019, gamme: 'originale' },
  { id: 'unlock-timeless-adventures-2', nom: 'Arsène Lupin', nomEn: 'Arsène Lupin', serie: '6', numero: 2, theme: 'Cambriolage', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'timeless-adventures', annee: 2019, gamme: 'originale' },
  { id: 'unlock-timeless-adventures-3', nom: 'Perdus dans ChronoWarp', nomEn: 'Lost in the TimeWarp', serie: '6', numero: 3, theme: 'Science-fiction', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'timeless-adventures', annee: 2019, gamme: 'originale' },
  // 7. Epic Adventures (2019)
  { id: 'unlock-epic-adventures-1', nom: '7ème Art et Décès', nomEn: 'The Seventh Screening', serie: '7', numero: 1, theme: 'Cinéma', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'epic-adventures', annee: 2019, gamme: 'originale' },
  { id: 'unlock-epic-adventures-2', nom: 'Les 7 épreuves du dragon', nomEn: "The Dragon's Seven Tests", serie: '7', numero: 2, theme: 'Fantastique', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'epic-adventures', annee: 2019, gamme: 'originale' },
  { id: 'unlock-epic-adventures-3', nom: 'Mission #07', nomEn: 'Mission #07', serie: '7', numero: 3, theme: 'Espionnage', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'epic-adventures', annee: 2019, gamme: 'originale' },
  // 8. Mythic Adventures (2020)
  { id: 'unlock-mythic-adventures-1', nom: 'Le Tour du Monde en 80 minutes', nomEn: 'Around the World in 80 Minutes', serie: '8', numero: 1, theme: 'Voyage', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'mythic-adventures', annee: 2020, gamme: 'originale' },
  { id: 'unlock-mythic-adventures-2', nom: "Dans les Griffes d'Hadès", nomEn: 'In the Clutches of Hades', serie: '8', numero: 2, theme: 'Mythologie', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'mythic-adventures', annee: 2020, gamme: 'originale' },
  { id: 'unlock-mythic-adventures-3', nom: 'Animal-O-Matic', nomEn: 'Animal-O-Matic', serie: '8', numero: 3, theme: 'Humour', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'mythic-adventures', annee: 2020, gamme: 'originale' },
  // 9. Legendary Adventures (2021)
  { id: 'unlock-legendary-adventures-1', nom: 'Action Story', nomEn: 'Action Story', serie: '9', numero: 1, theme: 'Action', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'legendary-adventures', annee: 2021, gamme: 'originale' },
  { id: 'unlock-legendary-adventures-2', nom: 'Robin des Bois', nomEn: 'Robin Hood', serie: '9', numero: 2, theme: 'Médiéval', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'legendary-adventures', annee: 2021, gamme: 'originale' },
  { id: 'unlock-legendary-adventures-3', nom: "Sherlock Holmes : l'Affaire des Anges Brûlés", nomEn: 'Sherlock Holmes: The Case of the Burnt Angels', serie: '9', numero: 3, theme: 'Enquête', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'legendary-adventures', annee: 2021, gamme: 'originale' },
  // 10. Game Adventures (2021)
  { id: 'unlock-game-adventures-1', nom: 'Mysterium', nomEn: 'Mysterium', serie: '10', numero: 1, theme: 'Déduction', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'game-adventures', annee: 2021, gamme: 'originale' },
  { id: 'unlock-game-adventures-2', nom: 'Pandemic', nomEn: 'Pandemic', serie: '10', numero: 2, theme: 'Coopération', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'game-adventures', annee: 2021, gamme: 'originale' },
  { id: 'unlock-game-adventures-3', nom: 'Les Aventuriers du Rail', nomEn: 'Ticket to Ride', serie: '10', numero: 3, theme: 'Voyage', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'game-adventures', annee: 2021, gamme: 'originale' },
  // 11. Extraordinary Adventures (2022)
  { id: 'unlock-extraordinary-adventures-1', nom: 'Restart', nomEn: 'Restart', serie: '11', numero: 1, theme: 'Science-fiction', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'extraordinary-adventures', annee: 2022, gamme: 'originale' },
  { id: 'unlock-extraordinary-adventures-2', nom: 'Hollywood Confidential', nomEn: 'Hollywood Confidential', serie: '11', numero: 2, theme: 'Polar', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'extraordinary-adventures', annee: 2022, gamme: 'originale' },
  { id: 'unlock-extraordinary-adventures-3', nom: "L'Odyssée de W.A.F.F", nomEn: "W.A.F.F.'s Odyssey", serie: '11', numero: 3, theme: 'Science-fiction', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'extraordinary-adventures', annee: 2022, gamme: 'originale' },
  // 12. Supernatural Adventures (2023)
  { id: 'unlock-supernatural-adventures-1', nom: 'Menace sur Nova City', nomEn: 'Nova City Under Threat', serie: '12', numero: 1, theme: 'Super-héros', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'supernatural-adventures', annee: 2023, gamme: 'originale' },
  { id: 'unlock-supernatural-adventures-2', nom: 'Día de los Muertos', nomEn: 'Día de los Muertos', serie: '12', numero: 2, theme: 'Folklore mexicain', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'supernatural-adventures', annee: 2023, gamme: 'originale' },
  { id: 'unlock-supernatural-adventures-3', nom: 'Ragnarok', nomEn: 'Ragnarok', serie: '12', numero: 3, theme: 'Mythologie nordique', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'supernatural-adventures', annee: 2023, gamme: 'originale' },
  // 13. Risky Adventures (2024)
  { id: 'unlock-risky-adventures-1', nom: "La Couronne d'Altipia", nomEn: "Queen Altipia's Crown", serie: '13', numero: 1, theme: 'Fantastique', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'risky-adventures', annee: 2024, gamme: 'originale' },
  { id: 'unlock-risky-adventures-2', nom: 'Rendez-vous Surprise', nomEn: 'A Memorable Date', serie: '13', numero: 2, theme: 'Comédie', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'risky-adventures', annee: 2024, gamme: 'originale' },
  { id: 'unlock-risky-adventures-3', nom: "L'Infiltré de Little Italy", nomEn: 'Covert Operation in Little Italy', serie: '13', numero: 3, theme: 'Polar', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'risky-adventures', annee: 2024, gamme: 'originale' },
  // 14. Enchanted Adventures (2025)
  { id: 'unlock-enchanted-adventures-1', nom: 'La Colère de Kilea', nomEn: "Kilea's Wrath", serie: '14', numero: 1, theme: 'Fantaisie', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'enchanted-adventures', annee: 2025, gamme: 'originale' },
  { id: 'unlock-enchanted-adventures-2', nom: 'La Course au Jouet', nomEn: 'Frenzy at the Amusement Park', serie: '14', numero: 2, theme: 'Noël', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'enchanted-adventures', annee: 2025, gamme: 'originale' },
  { id: 'unlock-enchanted-adventures-3', nom: 'La Malédiction de Camelot', nomEn: 'The Curse on Camelot', serie: '14', numero: 3, theme: 'Médiéval', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'enchanted-adventures', annee: 2025, gamme: 'originale' },
  // 15. New Game Adventures (2026)
  { id: 'unlock-new-game-adventures-1', nom: 'Carcassonne', nomEn: 'Carcassonne', serie: '15', numero: 1, theme: 'Médiéval', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'new-game-adventures', annee: 2026, gamme: 'originale' },
  { id: 'unlock-new-game-adventures-2', nom: '7 Wonders', nomEn: '7 Wonders', serie: '15', numero: 2, theme: 'Antiquité', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'new-game-adventures', annee: 2026, gamme: 'originale' },
  { id: 'unlock-new-game-adventures-3', nom: 'Heat', nomEn: 'Heat', serie: '15', numero: 3, theme: 'Course automobile', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'new-game-adventures', annee: 2026, gamme: 'originale' },

  // ── Hors-série : Unlock! Star Wars (2020) ───────────────────────────────
  { id: 'unlock-star-wars-1', nom: 'An Unforeseen Delay', nomEn: 'An Unforeseen Delay', serie: 'HS', numero: 1, theme: 'Space Opera', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'star-wars', annee: 2020, gamme: 'star-wars' },
  { id: 'unlock-star-wars-2', nom: 'Escape from Hoth', nomEn: 'Escape from Hoth', serie: 'HS', numero: 2, theme: 'Space Opera', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'star-wars', annee: 2020, gamme: 'star-wars' },
  { id: 'unlock-star-wars-3', nom: 'Secret Mission on Jedha', nomEn: 'Secret Mission on Jedha', serie: 'HS', numero: 3, theme: 'Space Opera', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'star-wars', annee: 2020, gamme: 'star-wars' },

  // ── Unlock! Short Adventures (1 paquet = 1 aventure) ────────────────────
  { id: 'unlock-short-01-1', nom: 'Panique en cuisine', nomEn: 'The Secret Recipes of Yore', serie: 'Short', numero: 1, theme: 'Cuisine', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'short-01', annee: 2022, gamme: 'short' },
  { id: 'unlock-short-02-1', nom: 'Les Secrets de la Pieuvre', nomEn: 'The Secrets of the Octopus', serie: 'Short', numero: 2, theme: 'Mystère marin', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-02', annee: 2022, gamme: 'short' },
  { id: 'unlock-short-03-1', nom: "Le Vol de l'Ange", nomEn: 'The Flight of the Angel', serie: 'Short', numero: 3, theme: 'Cambriolage', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'short-03', annee: 2022, gamme: 'short' },
  { id: 'unlock-short-04-1', nom: 'Le Réveil de la Momie', nomEn: 'The Awakening of the Mummy', serie: 'Short', numero: 4, theme: 'Égypte antique', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-04', annee: 2022, gamme: 'short' },
  { id: 'unlock-short-05-1', nom: 'Le Donjon de Doo-Arann', nomEn: "Doo-Arann's Dungeon", serie: 'Short', numero: 5, theme: 'Heroic fantasy', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-05', annee: 2022, gamme: 'short' },
  { id: 'unlock-short-06-1', nom: 'À la Poursuite de Cabrakan', nomEn: 'In Pursuit of Cabrakan', serie: 'Short', numero: 6, theme: 'Mythologie maya', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-06', annee: 2022, gamme: 'short' },
  { id: 'unlock-short-07-1', nom: 'Red Mask', nomEn: 'Red Mask', serie: 'Short', numero: 7, theme: 'Super-héros', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'short-07', annee: 2023, gamme: 'short' },
  { id: 'unlock-short-08-1', nom: 'Le Chat de Schrödinger', nomEn: "Schrödinger's Cat", serie: 'Short', numero: 8, theme: 'Science', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-08', annee: 2023, gamme: 'short' },
  { id: 'unlock-short-09-1', nom: 'Meurtre à Birmingham', nomEn: 'The Birmingham Murder', serie: 'Short', numero: 9, theme: 'Polar', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-09', annee: 2023, gamme: 'short' },
  { id: 'unlock-short-10-1', nom: 'Dans la Tête de Sherlock Holmes', nomEn: 'Inside the Mind of Sherlock Holmes', serie: 'Short', numero: 10, theme: 'Enquête', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-10', annee: 2024, gamme: 'short' },
  { id: 'unlock-short-11-1', nom: 'Le Chant des Embruns', nomEn: 'The Song of the Sea Spray', serie: 'Short', numero: 11, theme: 'Maritime', difficulte: 1, duree: 60, statut: 'non_joue', boiteId: 'short-11', annee: 2025, gamme: 'short' },
  { id: 'unlock-short-12-1', nom: "Le Cœur de l'Océan", nomEn: "The Ocean's Heart", serie: 'Short', numero: 12, theme: 'Maritime', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-12', annee: 2025, gamme: 'short' },
  { id: 'unlock-short-13-1', nom: "L'Ascension", nomEn: 'The Ascent', serie: 'Short', numero: 13, theme: 'Alpinisme', difficulte: 3, duree: 60, statut: 'non_joue', boiteId: 'short-13', annee: 2026, gamme: 'short' },
  { id: 'unlock-short-14-1', nom: 'La Voie du Sabre', nomEn: 'The Path of Katana', serie: 'Short', numero: 14, theme: 'Samouraï', difficulte: 2, duree: 60, statut: 'non_joue', boiteId: 'short-14', annee: 2026, gamme: 'short' },
];
