# 0001 - Séparation du frontend et de l'API en deux projets distincts
Date : 2026-11-02 Statut : acceptée

## Contexte
L'application Finder nécessite une interface utilisateur réactive (React) et une API REST (Node.js/Express). Il faut définir l'architecture globale du dépôt pour héberger ces deux parties.

## Décision
Nous créons un dossier `Front/` dédié pour le client React, séparé de l'API. Cette séparation physique est visible à la racine du dépôt.

## Alternatives écartées
- Monolithe (fichiers mélangés) : écarté car difficile à maintenir et complexifie le déploiement sur les serveurs.
- Moteur de template (comme EJS/Pug ou Blade) : écarté car l'expérience utilisateur est moins fluide qu'avec une vraie SPA (Single Page Application) en React.

## Conséquences
Il faudra lancer deux serveurs de développement en parallèle (un pour l'API, un pour le front) et gérer les requêtes inter-domaines (CORS) entre le port du front et celui de l'API.