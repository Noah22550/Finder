# Recette Client - Finder

Déroulé des tests d'acceptation par Noah le 2026-10-06.

| ID | Description | Résultat | Date | Déroulé par |
| --- | --- | --- | --- | --- |
| TA-001 | Un voyageur s'inscrit avec un email valide et est connecté dans la foulée (inscription directe, aucune étape de validation externe) | OK | 2026-10-06 | Noah |
| TA-002 | Un voyageur ne peut pas s'inscrire 2 fois avec le même email (409) | OK | 2026-10-06 | Noah |
| TA-003 | Un voyageur se connecte et reçoit un JWT valide ; un mot de passe < 8 caractères est refusé à l'inscription avec un message clair | OK | 2026-10-06 | Noah |
| TA-004 | La recherche par dates renvoie uniquement les chambres libres sur la période demandée | OK | 2026-10-06 | Noah |
| TA-005 | Un voyageur réserve une chambre : la réservation apparaît en_attente côté hôtelier | OK | 2026-10-06 | Noah |
| TA-006 | 2026-11-25 | Passé | Changement de statut non visible tant que la page reste ouverte ; dès le retour sur `/mes-reservations`, `GET /reservations/mine` est relancé et affiche le nouveau statut (et l'annulation déclenche `DELETE` puis `GET /reservations/mine` sans F5). |
| TA-007 | Le voyageur annule sa réservation : statut annulee, la chambre redevient réservable sur la période | OK | 2026-10-06 | Noah |
| TA-008 | Un voyageur ne peut PAS modifier la chambre d'un hôtelier (403 Forbidden) | OK | 2026-10-06 | Noah |
| TA-009 | Un hôtelier ne voit que les réservations de SON hôtel (jamais celles de l'Amor s'il gère le Byzance) | OK | 2026-10-06 | Noah |
| TA-010 |  | OK | 2026-10-06 | Noah |
