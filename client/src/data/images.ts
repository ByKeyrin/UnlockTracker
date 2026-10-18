import type { UnlockGame } from '../types';

/**
 * Visuels des boîtes Unlock! (CDN officiel Space Cowboys / Asmodee).
 *
 * Chaque entrée correspond à un `boiteId` du catalogue : les 15 coffrets de la
 * série originale, le coffret Star Wars et les 14 paquets Short Adventures.
 */
export const BOX_IMAGES: Record<string, string> = {
  'escape-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-6-1-1024x1024.png',
  'mystery-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-5-2-1024x1024.png',
  'secret-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-4-2.png',
  'exotic-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-3-1-1024x1024.png',
  'heroic-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-1-1024x1024.png',
  'timeless-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-2-1-1024x1024.png',
  'epic-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-4-1-1024x1024.png',
  'mythic-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-2-1024x1024.png',
  'legendary-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-3-1024x1024.png',
  'game-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-1024x1024.png',
  'extraordinary-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-10-1024x1024.png',
  'supernatural-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-9-1024x1024.png',
  'risky-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/12/Design-sans-titre-8-1024x1024.png',
  'enchanted-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SPACE_COWBOYS_UNLOCK14_TOPBOX_RIGHT-1024x1024.webp',
  'new-game-adventures':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2026/04/UNLOCK15_LEFT.webp',
  'star-wars':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/11/Box_USW_US.webp',
  'short-01':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SH_Secret_Recipes_Left.webp',
  'short-02':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SH_The_Secret_Of_Left.webp',
  'short-03':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SH_The_Flight_Left.webp',
  'short-04':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SH_The_Awakening_Left.webp',
  'short-05':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SH_DOO_ARAANS_Left.webp',
  'short-06':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SH_IN_Poursuit_Left.webp',
  'short-07':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/MicrosoftTeams-image-2.webp',
  'short-08':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/PNG-72-DPI-SCUNLSH08EN_LEFT.webp',
  'short-09':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SCUNLSH09EN_LEFT.webp',
  'short-10':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SPACE_COWBOYS_UNLOSHSHORT10_EN-TOP_BOX_LEFT.webp',
  'short-11':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/PNG-300-DPI-SCUNLSH11_3D_BOX_EN-RIGHT.webp',
  'short-12':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2025/10/SPACE_COWBOYS_3D_BOX_UNLSH12-TOP_BOX_RIGHT_EN.webp',
  'short-13':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2026/02/SH_ASCENSION_LEFT_EN-1.webp',
  'short-14':
    'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/image-converter/2026/06/UNLOCK_SHORT14_LEFTVIEW_EN.webp',
};

/**
 * Image de repli (data URI SVG) utilisée quand une boîte n'a pas de visuel
 * ou quand le chargement de l'image échoue (cf. `onError` de `GameCard`).
 */
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
      '<rect width="240" height="240" rx="16" fill="#e2e8f0"/>' +
      '<rect x="40" y="60" width="160" height="120" rx="10" fill="#cbd5e1"/>' +
      '<text x="120" y="135" font-family="sans-serif" font-size="48" text-anchor="middle" fill="#64748b">🎲</text>' +
      '</svg>',
  );

/**
 * Retourne l'URL du visuel de la boîte contenant un jeu.
 *
 * @param game - Jeu du catalogue
 * @returns L'URL de l'image de sa boîte, ou {@link PLACEHOLDER_IMAGE} si inconnue
 * @example
 * const src = getGameImage(game)
 */
export function getGameImage(game: UnlockGame): string {
  return BOX_IMAGES[game.boiteId] ?? PLACEHOLDER_IMAGE;
}

/**
 * Retourne l'URL du visuel d'une boîte à partir de son identifiant.
 *
 * @param boiteId - Identifiant de la boîte (ex. `'escape-adventures'`)
 * @returns L'URL de l'image de la boîte, ou {@link PLACEHOLDER_IMAGE} si inconnue
 * @example
 * const src = getBoxImage('star-wars')
 */
export function getBoxImage(boiteId: string): string {
  return BOX_IMAGES[boiteId] ?? PLACEHOLDER_IMAGE;
}
