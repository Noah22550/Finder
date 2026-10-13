# Guide de test des routes HTTP - API Finder

Ce document regroupe l'ensemble des routes de l'API **Finder**, les requêtes HTTP prêtes à l'emploi (compatibles avec l'extension **REST Client** de VS Code, Postman ou Bruno) et les points de vigilance pour réussir les tests d'acceptation (`TA-001` à `TA-016`).

---

## 1. Tableau récapitulatif des routes actuelles

| Méthode | Route | Accès / Rôle | Corps (JSON) / Query Params | Codes de retour prévus |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Public | `{ email, motDePasse, nom, prenom, telephone?, note? }` | `201`, `400`, `409` |
| **POST** | `/auth/login` | Public | `{ email, motDePasse }` | `200`, `400`, `401` |
| **POST** | `/auth/logout` | Connecté (Tous) | *Aucun* | `204`, `401` |
| **GET** | `/voyageurs/me` | `voyageur` | *Aucun* | `200`, `401`, `403`, `404` |
| **PATCH** | `/voyageurs/me` | `voyageur` | `{ nom?, prenom?, telephone? }` | `200`, `400`, `401`, `403` |
| **GET** | `/hotels` | Public | *Aucun* | `200`, `500` |
| **GET** | `/hotels/:id` | Public | *Aucun* | `200`, `400`, `404` |
| **GET** | `/hotels/:id/chambres` | Public | *Aucun* | `200`, `400`, `404` |
| **GET** | `/chambres` | Public | Query : `hotel`, `capacite`, `prix_max`, `categorie`, `date_debut`, `date_fin` | `200`, `400`, `500` |
| **GET** | `/chambres/:id` | Public | *Aucun* | `200`, `400`, `404` |
| **POST** | `/chambres` | `hotelier` | `{ numero, categorie, capacite, prixNuit, description, disponible }` | `201`, `400`, `401`, `403` |
| **PATCH** | `/chambres/:id` | `hotelier` (Propriétaire) | Champs de chambre partiels (optionnels) | `200`, `400`, `401`, `403`, `404` |
| **DELETE** | `/chambres/:id` | `hotelier` (Propriétaire) | *Aucun* | `204`, `400`, `401`, `403`, `404` |
| **GET** | `/reservations/mine` | `voyageur` | *Aucun* | `200`, `401`, `403`, `404` |
| **GET** | `/reservations/received` | `hotelier` | *Aucun* | `200`, `401`, `403`, `404` |
| **POST** | `/reservations` | `voyageur` | `{ chambreId, dateArrivee, dateDepart, nbPersonnes, demandeSpecial? }` | `201`, `400`, `401`, `403` |
| **PATCH** | `/reservations/:id` | `hotelier` (Propriétaire) | `{ statut }` (`confirmee`, `refusee`) | `200`, `400`, `401`, `403`, `404` |
| **DELETE** | `/reservations/:id` | `voyageur` (Propriétaire) | *Aucun* (passe le statut à `annulee`) | `200`, `400`, `401`, `403`, `404` |
| **GET** | `/docs` | Public | Interface Swagger UI | `200` |

## 2. Requêtes HTTP prêtes à tester

Tu peux copier ce bloc dans un fichier `requetes.http` sur VS Code (avec l'extension *REST Client*) ou utiliser ces exemples dans Postman :

```http
@baseUrl = http://localhost:3000
@tokenVoyageur = REMPLACER_PAR_TOKEN_VOYAGEUR
@tokenHotelier = REMPLACER_PAR_TOKEN_HOTELIER
@tokenAdmin = REMPLACER_PAR_TOKEN_ADMIN

### ==========================================
### 0. SANTÉ DE L'API (/health)
### ==========================================

### Vérifier l'état du serveur (200 - TA-010)
GET {{baseUrl}}/health


### ==========================================
### 1. AUTHENTIFICATION (/auth)
### ==========================================

### Inscription d'un nouveau voyageur (201) - (409 si email déjà pris : TA-001, TA-002)
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "nouveau.voyageur@mail.example",
  "motDePasse": "Voyage-2026!",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "0601020304"
}

### Inscription invalide - email mal formé ou mot de passe trop court (400 : TA-003)
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "pas-un-mail",
  "motDePasse": "123"
}

### Connexion Voyageur - Anaïs Morel du kit (200 : TA-003)
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "a.morel@mail.example",
  "motDePasse": "Voyage-2026!"
}

### Connexion Hôtelier - Jean Ravel, Hôtel 1 Amor du kit (200)
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "ravel@amor.example",
  "motDePasse": "Amor-2026!"
}

### Connexion Hôtelier - Lucia Bianchi, Hôtel 2 Byzance du kit (200)
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "bianchi@byzance.example",
  "motDePasse": "Byzance-2026!"
}

### Déconnexion (204)
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{tokenVoyageur}}


### ==========================================
### 2. PROFIL VOYAGEUR (/voyageurs)
### ==========================================

### Lire mon profil voyageur (200)
GET {{baseUrl}}/voyageurs/me
Authorization: Bearer {{tokenVoyageur}}

### Modifier mon profil voyageur - Rectification RGPD (200)
PATCH {{baseUrl}}/voyageurs/me
Authorization: Bearer {{tokenVoyageur}}
Content-Type: application/json

{
  "nom": "Morel",
  "prenom": "Anaïs",
  "telephone": "0699887766"
}


### ==========================================
### 3. HÔTELS (/hotels)
### ==========================================

### Liste des 3 hôtels (200)
GET {{baseUrl}}/hotels

### Détail d'un hôtel existant (200)
GET {{baseUrl}}/hotels/1

### Détail d'un hôtel inexistant (404)
GET {{baseUrl}}/hotels/999

### Chambres d'un hôtel existant (200 -> 12 chambres pour l'hôtel 1)
GET {{baseUrl}}/hotels/1/chambres

### Chambres avec ID d'hôtel invalide (400)
GET {{baseUrl}}/hotels/abc/chambres

### Chambres d'un hôtel inexistant (404)
GET {{baseUrl}}/hotels/999/chambres


### ==========================================
### 4. CHAMBRES (/chambres)
### ==========================================

### Toutes les chambres sans filtre (200 -> 32 chambres)
GET {{baseUrl}}/chambres

### Recherche combinée avec filtres (200)
GET {{baseUrl}}/chambres?hotel=1&capacite=2&prix_max=100&categorie=double

### Recherche par dates avec chevauchement (200 -> 31 chambres, la chambre 4 est exclue : TA-004)
GET {{baseUrl}}/chambres?date_debut=2026-10-10&date_fin=2026-10-12

### Recherche par dates sans chevauchement (200 -> 32 chambres, le jour du départ est libre : TA-004)
GET {{baseUrl}}/chambres?date_debut=2026-10-11&date_fin=2026-10-13

### Recherche avec filtre invalide (400)
GET {{baseUrl}}/chambres?categorie=chateau

### Détail d'une chambre existante (200)
GET {{baseUrl}}/chambres/1

### Détail d'une chambre avec ID invalide (400)
GET {{baseUrl}}/chambres/abc

### Détail d'une chambre inexistante (404)
GET {{baseUrl}}/chambres/999999

### Créer une chambre en tant qu'hôtelier (201)
POST {{baseUrl}}/chambres
Authorization: Bearer {{tokenHotelier}}
Content-Type: application/json

{
  "numero": "808",
  "categorie": "simple",
  "capacite": 2,
  "prixNuit": 69,
  "description": "Lit simple avec vue sur le port",
  "disponible": true
}

### Créer une chambre en tant que voyageur (403 : TA-008)
POST {{baseUrl}}/chambres
Authorization: Bearer {{tokenVoyageur}}
Content-Type: application/json

{
  "numero": "809",
  "categorie": "simple",
  "capacite": 1,
  "prixNuit": 50,
  "description": "Test",
  "disponible": true
}

### Modifier une chambre de son propre hôtel (200)
PATCH {{baseUrl}}/chambres/1
Authorization: Bearer {{tokenHotelier}}
Content-Type: application/json

{
  "prixNuit": 75,
  "disponible": true
}

### Modifier une chambre d'un hôtel concurrent (403 - ex: chambre 13 du Byzance avec token de l'Amor)
PATCH {{baseUrl}}/chambres/13
Authorization: Bearer {{tokenHotelier}}
Content-Type: application/json

{
  "prixNuit": 75
}

### Supprimer une chambre de son hôtel (204)
DELETE {{baseUrl}}/chambres/33
Authorization: Bearer {{tokenHotelier}}


### ==========================================
### 5. RÉSERVATIONS (/reservations)
### ==========================================

### Voir mes réservations - Côté Voyageur (200)
GET {{baseUrl}}/reservations/mine
Authorization: Bearer {{tokenVoyageur}}

### Voir les réservations reçues pour mon hôtel - Côté Hôtelier (200 : TA-009)
GET {{baseUrl}}/reservations/received
Authorization: Bearer {{tokenHotelier}}

### Créer une réservation - Côté Voyageur (201, statut 'en_attente' : TA-005)
POST {{baseUrl}}/reservations
Authorization: Bearer {{tokenVoyageur}}
Content-Type: application/json

{
  "chambreId": 9,
  "dateArrivee": "2026-11-10",
  "dateDepart": "2026-11-12",
  "nbPersonnes": 2,
  "demandeSpecial": "Arrivée tardive vers 22h"
}

### Confirmer ou refuser une réservation - Côté Hôtelier (200 : TA-006)
PATCH {{baseUrl}}/reservations/6
Authorization: Bearer {{tokenHotelier}}
Content-Type: application/json

{
  "statut": "confirmee"
}

### Annuler sa réservation - Côté Voyageur (200, passe le statut à 'annulee' : TA-007)
DELETE {{baseUrl}}/reservations/1
Authorization: Bearer {{tokenVoyageur}}
```

---

## 3. Points d'attention et correctifs conseillés dans ton code

En comparant ton code actuel avec le sujet officiel du projet, voici les petits ajustements à vérifier pour que toutes les étapes et recettes passent sans accroc :

1. **Route `GET /health` manquante dans `app.js` (`TA-010`) :**
   * Le cahier des charges demande une route publique `GET /health` qui renvoie `200` avec `{"ok": true}`.
   * *Correctif dans `app.js` :*
     ```javascript
     app.get('/health', (req, res) => res.json({ ok: true }));
     ```

2. **Longueur du mot de passe à l'inscription (`TA-003`) :**
   * Dans `schemas.js`, `schemaInscription` vérifie actuellement `.min(6)`. Or, la recette `TA-003` indique : *"un mot de passe de moins de 8 caractères est refusé à l'inscription"*.
   * *Correctif dans `schemas.js` :* Passer à `.min(8)` sur `schemaInscription` (attention : garde bien `.min(6)` sur `schemaConnexion` si tes tests unitaires utilisent `'123456'`).

3. **Champ `telephone` manquant dans `GET /voyageurs/me` :**
   * Dans `voyageur.js`, ton `select` Prisma contient `{ id: true, role: true, email: true, nom: true, prenom: true }` et oublie `telephone: true`.

4. **Protection contre un ID non numérique dans `GET /hotels/:id` :**
   * Si on appelle `GET /hotels/abc`, `Number('abc')` donne `NaN` et Prisma plante en erreur `500`.
   * *Correctif dans `hotel.js` :* Ajouter la même vérification que dans `chambres.js` :
     ```javascript
     const id = Number(req.params.id);
     if (isNaN(id)) {
         return res.status(400).json({ erreur: "L'ID fourni est invalide" });
     }
     ```

5. **Statut autorisé pour l'hôtelier sur `PATCH /reservations/:id` :**
   * Dans `schemas.js`, `schemaStatutReservation` contient `z.enum(['confirmee', 'refusee', 'annulee'])`. Or, l'étape 7 du Sprint 1 stipule que l'hôtelier peut uniquement confirmer ou refuser (jamais annuler), et que envoyer `{"statut": "annulee"}` sur le `PATCH` doit renvoyer `400`.
   * *Correctif dans `schemas.js` :* Restreindre l'enum à `z.enum(['confirmee', 'refusee'])`.