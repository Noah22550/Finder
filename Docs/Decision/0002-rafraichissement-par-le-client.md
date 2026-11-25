# ADR 0002 — Rafraîchissement des données par le client

- **Date :** 2026-11-25
- **Statut :** Acceptée

## Contexte

Dans Finder, la page « Mes réservations » récupère la liste des réservations du voyageur par un appel HTTP `GET /reservations/mine` exécuté au montage du composant. En HTTP classique, **le client tire les données et le serveur ne pousse rien** (*pull* uniquement) : une fois la réponse affichée dans l'état React, le navigateur n'écoute aucune notification de l'API.

Par conséquent, si un hôtelier change le statut d'une réservation (par exemple de `en_attente` à `confirmee` ou `refusee`) pendant que le voyageur laisse la page « Mes réservations » ouverte, l'écran ne change pas parce que **rien n'a redemandé les données au serveur**. En revanche, le test d'acceptation **TA-006** passe dès que le voyageur revient sur la page : la navigation remonte le composant, ce qui relance l'effet `useEffect` et déclenche un nouveau `GET /reservations/mine` ramenant le statut à jour depuis la base de données.

Il faut donc choisir comment garder l'affichage cohérent avec l'état du serveur après une action du client ou une modification externe.

## Décision

Nous retenons la **stratégie 1 : recharger les données depuis l'API après chaque action** (en plus du chargement au montage de la page).

Concrètement, l'appel `GET /reservations/mine` reste écrit à un seul endroit, dans le `useEffect` de la page, qui dépend d'un compteur d'état `version` :

- Après une action réussie (comme `DELETE /reservations/:id`), le client incrémente `version`, ce qui relance automatiquement `GET /reservations/mine` et met à jour le statut à l'écran sans rechargement manuel (F5).
- En cas de refus renvoyé par l'API (par exemple si le statut a changé côté hôtelier avant le clic), le message d'erreur reste affiché et `version` est tout de même incrémenté pour réafficher l'état réel stocké sur le serveur.

## Alternatives écartées

1. **Mise à jour locale du state sans nouvel appel `GET` (mise à jour optimiste ou manuelle en mémoire)** — Écartée car elle oblige à reproduire la logique métier côté front et risque de désynchroniser l'interface avec la base de données si un autre acteur (l'hôtelier) a modifié l'enregistrement entre-temps.
2. **Interrogation périodique (*polling* via `setInterval`)** — Écartée car elle envoie des requêtes HTTP en continu même lorsqu'aucune donnée n'a changé, consommant inutilement du réseau et de la charge serveur pour un besoin qui ne nécessite pas du temps réel.
3. **Push serveur (Server-Sent Events ou WebSockets)** — Écartée car elle introduit une complexité d'architecture importante (connexions persistantes, gestion des déconnexions/reconnexions et sécurisation du flux côté Express comme côté React), disproportionnée pour le périmètre du MVP Finder.

## Conséquences

- **Positives :** le code reste simple et lisible (un seul point de chargement dans `useEffect`), ne nécessite aucune bibliothèque ni protocole supplémentaire, et garantit que le serveur demeure l'unique source de vérité après chaque action ou navigation.
- **Limites acceptées :** une page laissée ouverte sans interaction ne reflète pas instantanément une décision prise par l'hôtelier ; la mise à jour apparaît dès que le voyageur revient sur la page, déclenche une action ou recharge. Chaque action réussie entraîne également un appel `GET` supplémentaire, coût négligeable à l'échelle de l'application.