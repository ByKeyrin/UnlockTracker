# UnlockTracker — Description métier

Ce document décrit les besoins fonctionnels de l'application **UnlockTracker**.

## 1. Utilisateur cible

**Kevin et sa copine**, joueurs de jeux de société de la série *Unlock!* (Space Cowboys).

Ce sont des **joueurs occasionnels à réguliers** qui :
- possèdent (ou empruntent) plusieurs boîtes *Unlock!*,
- jouent généralement à deux,
- veulent savoir quels jeux ils ont déjà joués et lesquels il leur reste à découvrir,
- ne veulent pas d'un outil complexe : l'application doit être **simple et rapide à prendre en main** (Kevin est débutant en développement et l'interface doit rester accessible).

Cas d'usage principal : *« On hésite sur la boîte à jouer ce soir — qu'est-ce qu'on n'a pas encore fait ? »*

## 2. Parcours utilisateur

### Parcours 1 — Consulter le catalogue
1. Kevin ouvre l'application, atterrit sur la page **Catalogue**.
2. Il voit la liste de tous les jeux *Unlock!* avec leur série, numéro, thème, difficulté et durée.
3. Chaque carte affiche un statut : **✅ Joué** ou **⬜ À faire**.

### Parcours 2 — Filtrer pour choisir un jeu
1. Dans la **barre de filtres**, il sélectionne :
   - la série (ex : Série 2),
   - la difficulté (ex : 2 à 3 étoiles),
   - la durée (ex : ≤ 60 min),
   - le statut : **« À faire »**.
2. La liste se met à jour instantanément.
3. Il choisit un jeu → page de détail.

### Parcours 3 — Marquer un jeu comme joué
1. Après la partie, il ouvre la fiche du jeu.
2. Il clique sur **« Marquer comme joué »**.
3. Il saisit la date de la partie et les joueurs (pré-remplis : *Kevin, Copine*).
4. Le statut passe à **✅ Joué** — visible par sa copine sur la liste partagée.

### Parcours 4 — Vérifier la progression
1. Depuis la page **Statistiques**, il consulte : nombre de jeux joués / restants, progression par série.
2. Objectif : **tout jouer** 🎯.

## 3. Données d'un jeu Unlock

| Champ | Type | Description | Exemple |
|---|---|---|---|
| **Nom** | texte | Titre de la boîte | *Le Vol du Diamant* |
| **Série** | texte | Série d'appartenance | *Série 1* |
| **Numéro** | entier | Position dans la série | *2* |
| **Thème** | texte | Univers du scénario | *Polar* |
| **Difficulty** | 1–5 | Difficulté de l'énigme (⚠️ icône du livret) | *2* |
| **Durée** | entier (min) | Durée annoncée de la partie | *60* |
| **Statut** | énumération | `played` (joué) / `todo` (à faire) | *played* |
| Date de partie | date | Quand le jeu a été joué | *2026-03-14* |
| Joueurs | liste | Qui a participé | *Kevin, Copine* |

## 4. Règles métier

1. **R1 — Unicité du catalogue** : un jeu est identifié par le couple *(série, numéro)*. Deux jeux ne peuvent avoir la même série et le même numéro.
2. **R2 — Statut unique** : un jeu est soit `played`, soit `todo`. Pas de statut intermédiaire.
3. **R3 — Marquage** : marquer un jeu comme joué exige une **date de partie** (obligatoire) ; les joueurs sont pré-remplis avec *Kevin* et sa copine mais modifiables.
4. **R4 — Annulation** : il est possible de remettre un jeu joué à « à faire » (erreur de saisie ou partie avortée).
5. **R5 — Listes partagées** : tous les statuts sont **communs aux deux joueurs**. Un jeu marqué joué par l'un apparaît joué pour l'autre. Il n'y a pas de comptes utilisateurs séparés dans la V1.
6. **R6 — Filtres combinables** : les filtres série / difficulté / durée / statut se combinent par **ET logique**. La durée se filtre par intervalles (≤ 45 min, 45–60 min, 60–90 min, > 90 min).
7. **R7 — Difficulté** : valeur entière entre 1 et 5, alignée sur l'échelle imprimée sur les boîtes *Unlock!*.
8. **R8 — Jeu non catalogue** : on ne peut pas marquer « joué » un jeu absent du catalogue ; il faut d'abord l'ajouter (titre, série, numéro obligatoires).
9. **R9 — Progression** : les statistiques de progression sont calculées en temps réel à partir des statuts (nb joués / total, par série).
