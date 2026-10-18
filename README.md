# 🔓 UnlockTracker

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
[![Deploy to GitHub Pages](https://github.com/ByKeyrin/UnlockTracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/ByKeyrin/UnlockTracker/actions/workflows/deploy.yml)

> Application web pour recenser les jeux de société **Unlock** (Space Cowboys) et suivre ceux auxquels vous avez déjà joué.

🌐 **Démo en ligne :** [https://bykeyrin.github.io/UnlockTracker/](https://bykeyrin.github.io/UnlockTracker/)

Kevin et sa copine collectionnent les jeux *Unlock!*. Entre les séries, les numéros et les thèmes, il devient vite difficile de s'y retrouver : qu'avons-nous déjà joué ? Que nous reste-t-il à découvrir ? **UnlockTracker** répond à cette question en un clin d'œil.

## ✨ Fonctionnalités

- 📚 **Catalogue des jeux Unlock** — tous les jeux référencés par série, numéro et thème (escape game, aventure, fantastique, etc.).
- ✅ **Marquer les jeux joués** — un clic suffit pour passer un jeu de « à faire » à « joué », avec la date de la partie.
- 🔍 **Filtres** — affinez la liste par série, difficulté (1 à 5 étoiles), durée de jeu et statut (joué / à faire).
- 👥 **Liste partagée** — une seule liste commune à Kevin et sa copine pour ne jamais rejouer un jeu par erreur.

## 🛠 Stack technique

| Technologie | Rôle |
|---|---|
| [React 18](https://react.dev/) | Interface utilisateur |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Vite](https://vitejs.dev/) | Build & serveur de développement |
| [Tailwind CSS](https://tailwindcss.com/) | Styles utilitaires |
| Node.js 20+ | Environnement d'exécution |

## 🚀 Installation

Prérequis : **Node.js ≥ 20** et **npm ≥ 10**.

```bash
# 1. Cloner le dépôt
git clone https://github.com/ByKeyrin/UnlockTracker.git
cd UnlockTracker

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Vérifier le code avec ESLint |

## 📁 Structure du projet

```
UnlockTracker/
├── docs/
│   ├── TECHNICAL.md      # Architecture, schéma de données, API
│   └── FUNCTIONAL.md     # Description métier et règles de gestion
├── public/               # Fichiers statiques
├── src/
│   ├── assets/           # Images, icônes
│   ├── components/       # Composants React réutilisables
│   ├── hooks/            # Hooks personnalisés (useGames, useFilters…)
│   ├── pages/            # Pages de l'application
│   ├── services/         # Appels API / accès aux données
│   ├── types/            # Types TypeScript (Game, Serie, Player…)
│   ├── App.tsx           # Composant racine
│   └── main.tsx          | Point d'entrée
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 📄 Licence

Distribué sous licence [MIT](LICENSE).

---

Fait avec ❤️ pour ne plus jamais rejouer un Unlock par erreur.
