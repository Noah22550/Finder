# Recette Client - Finder

Déroulé des tests d'acceptation par Léa Bertrand le 2026-10-06.

| ID | Description | Résultat | Date | Déroulé par |
| --- | --- | --- | --- | --- |
| TA-001 | Un voyageur s'inscrit avec un email valide et est connecté dans la foulée (inscription directe, aucune étape de validation externe) | OK | 2026-10-06 | Léa Bertrand |
| TA-002 | Un voyageur ne peut pas s'inscrire 2 fois avec le même email (409) | OK | 2026-10-06 | Léa Bertrand |
| TA-003 | Un voyageur se connecte et reçoit un JWT valide ; un mot de passe < 8 caractères est refusé à l'inscription avec un message clair | OK | 2026-10-06 | Léa Bertrand |
| TA-004 | La recherche par dates renvoie uniquement les chambres libres sur la période demandée | OK | 2026-10-06 | Léa Bertrand |
| TA-005 | Un voyageur réserve une chambre : la réservation apparaît en_attente côté hôtelier | OK | 2026-10-06 | Léa Bertrand |
| TA-006 | L'  hôtelier confirme (ou refuse) : le voyageur lit le nouveau statut dans « Mes réservations » | OK | 2026-10-06 | Léa Bertrand |
| TA-007 | Le voyageur annule sa réservation : statut annulee, la chambre redevient réservable sur la période | OK | 2026-10-06 | Léa Bertrand |
| TA-008 | Un voyageur ne peut PAS modifier la chambre d'un hôtelier (403 Forbidden) | OK | 2026-10-06 | Léa Bertrand |
| TA-009 | Un hôtelier ne voit que les réservations de SON hôtel (jamais celles de l'Amor s'il gère le Byzance) | OK | 2026-10-06 | Léa Bertrand |
| TA-010 | L'endpoint /health renvoie 200 quand tout va bien | OK | 2026-10-06 | Léa Bertrand |
