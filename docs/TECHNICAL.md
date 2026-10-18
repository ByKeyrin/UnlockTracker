# UnlockTracker — Documentation technique

Ce document décrit l'architecture, la source de données, le schéma de base de données, l'API REST et les composants React de l'application **UnlockTracker**.

## 1. Architecture de l'application

Architecture **client-serveur** classique, en trois couches :

```
┌─────────────────────────────┐
│   Frontend (React + Vite)   │  Presentation
│   TypeScript + Tailwind     │
└──────────────┬──────────────┘
               │ HTTPS / JSON (REST)
┌──────────────▼──────────────┐
│   API REST (Node/Express)   │  Logique métier
└──────────────┬──────────────┘
               │ SQL
┌──────────────▼──────────────┐
│   Base de données (SQLite)  │  Persistance
└─────────────────────────────┘
```

- **Frontend** : SPA React compilée par Vite. Aucune logique métier côté client : l'UI consomme l'API.
- **API REST** : endpoints CRUD pour les jeux, les séries et les statuts de partie.
- **Base de données** : SQLite pour démarrer simplement (fichier unique, pas de serveur à installer). Migration possible vers PostgreSQL ultérieurement sans changer l'API.

## 2. Source de données

Deux options ont été étudiées pour alimenter le catalogue des jeux *Unlock!* :

| Option | Description | Verdict |
|---|---|---|
| **API BGG** (BoardGameGeek XML API) | Récupération automatique des titres, thèmes, durées et notes de la communauté | Complémentaire |
| **Base manuelle** | Jeux saisis à la main dans un fichier de seed (`src/data/games.json`) | ✅ Source principale retenue |

**Choix retenu : base manuelle + enrichissement BGG optionnel.**

L'API BGG (`https://boardgamegeek.com/xmlapi2`) est publique mais :
- lente et parfois indisponible,
- les données *Unlock!* y sont incomplètes (numéros de série non normalisés),
- la licence des données impose des contraintes d'attribution.

La base manuelle garantit donc un catalogue fiable et maîtrisé (séries, numéros, thèmes). Un script `npm run sync:bgg` pourra à terme compléter les données (durée, note BGG) sans être critique.

## 3. Base de données — schéma

```sql
-- Séries Unlock (ex : Série 1, Série 2, Escape Adventures…)
CREATE TABLE series (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,      -- ex : « Série 2 »
    slug        TEXT NOT NULL UNIQUE       -- ex : « serie-2 »
);

-- Jeux Unlock
CREATE TABLE games (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,            -- ex : « Le Vol du Diamant »
    series_id    INTEGER NOT NULL REFERENCES series(id),
    number       INTEGER NOT NULL,         -- numéro dans la série (1, 2, 3…)
    theme        TEXT NOT NULL,            -- ex : « Polar », « Aventure »
    difficulty   INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    duration_min INTEGER NOT NULL,         -- durée en minutes (ex : 60)
    bgg_id       INTEGER,                  -- id BoardGameGeek (optionnel)
    UNIQUE (series_id, number)
);

-- Statut de jeu partagé (une ligne par jeu joué)
CREATE TABLE plays (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    played_at  DATE NOT NULL,              -- date de la partie
    players    TEXT NOT NULL,              -- ex : « Kevin, Copine »
    success    BOOLEAN NOT NULL DEFAULT 0, -- échappé à temps ?
    notes      TEXT,
    UNIQUE (game_id)                       -- un jeu marqué « joué » une seule fois
);
```

## 4. API REST

Base URL : `/api`. Toutes les réponses sont en JSON.

### Jeux

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/games` | Liste tous les jeux (filtres : `?series=&difficulty=&duration=&status=`) |
| `GET` | `/api/games/:id` | Détail d'un jeu |
| `POST` | `/api/games` | Ajoute un jeu au catalogue |
| `PUT` | `/api/games/:id` | Met à jour un jeu |
| `DELETE` | `/api/games/:id` | Supprime un jeu |

### Statut de jeu (« joué »)

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/games/:id/play` | Marque un jeu comme joué |
| `DELETE` | `/api/games/:id/play` | Remet un jeu à « à faire » |

**Exemple de réponse** — `GET /api/games/12` :

```json
{
  "id": 12,
  "title": "Le Vol du Diamant",
  "series": { "id": 1, "name": "Série 1" },
  "number": 2,
  "theme": "Polar",
  "difficulty": 2,
  "durationMin": 60,
  "status": "played",
  "playedAt": "2026-03-14",
  "players": ["Kevin", "Copine"]
}
```

### Séries

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/series` | Liste des séries |

**Codes d'erreur** : `400` requête invalide · `404` ressource introuvable · `500` erreur serveur.

## 5. Composants React

```
src/
├── components/
│   ├── GameCard.tsx        # Carte d'un jeu (titre, série, difficulté, statut)
│   ├── GameList.tsx        # Liste de GameCard avec pagination
│   ├── FilterBar.tsx       # Barre de filtres (série, difficulté, durée, statut)
│   ├── DifficultyStars.tsx # Affichage 1–5 étoiles
│   ├── StatusBadge.tsx     # Badge « À faire » / « Joué »
│   └── Header.tsx          # En-tête de l'application
├── hooks/
│   ├── useGames.ts         # Chargement + filtres des jeux (appel API)
│   └── usePlayStatus.ts    # Marquer / démarquer un jeu comme joué
├── pages/
│   ├── CatalogPage.tsx     # Page principale : catalogue + filtres
│   ├── GameDetailPage.tsx  # Détail d'un jeu + bouton « Marquer comme joué »
│   └── StatsPage.tsx       # Statistiques (nb joués / restants, par série)
├── services/
│   └── api.ts              # Client fetch typé pour l'API REST
└── types/
    └── index.ts            # Interfaces Game, Series, Play, GameStatus…
```

**Conventions :**
- Composants **fonctionnels** avec hooks uniquement (pas de classes).
- Un composant = un fichier, export par défaut.
- Les types API sont partagés avec le frontend via `src/types/index.ts`.
- Le state local utilise `useState` / `useReducer` ; pas de Redux pour l'instant (l'état global est minimal).
