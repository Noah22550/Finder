# Spec Finder - Sprint 1 [MINIMAL]
Équipe : ... Version : v1 du AAAA-MM-JJ (étape 1)
Règle : relue au début de chaque séance ; chaque amendement est daté dans le journal.

## Étape 1 - en mémoire
[X] `npm run dev` démarre sans erreur -> le terminal affiche l'adresse du serveur
[X] `GET /health` -> 200, `{"ok":true}`
[ ] Kit chargé une seule fois au démarrage -> `readFileSync` hors des routes
[X] `GET /hotels` -> 200, tableau de 3 hôtels
[X] `GET /hotels/:id` -> 200 la fiche, ou 404 avec corps JSON
[X] `GET /chambres` -> 200, tableau de 32 chambres
[X] `GET /chambres/:id` -> 200 la fiche, ou 404 avec corps JSON
[X] `req.params.id` converti avec `Number()` -> `/hotels/1` répond 200, `/hotels/abc` répond 404
[X] `.env` avec PORT et DATABASE_URL -> le fichier existe, il n'est pas commité
[X] `GET /chambres?prix_max=90` -> 200, 12 chambres ; sans critère, 32

## Étapes 2 à 8 - déclarées, non franchies
[X] E2 Base MySQL via Prisma : schéma, migration, seed du kit -> tables visibles dans Adminer
[X] E3 Recherche de chambres disponibles -> `GET /chambres?...` filtre
[X] E4 Inscription, connexion JWT 24 h, écritures protégées -> sans jeton 401, mauvais rôle 403
[ ] E5 Validation Zod [ACCEPTABLE] -> corps invalide 400, jamais 500
[ ] E6 Réservations et statuts -> `en_attente`, `confirmee`, `refusee`, `annulee`
[ ] E7 Documentation Swagger de toutes les routes -> `/docs` les affiche toutes
[ ] E8 Tests et recette -> `npm test` passe, TA-001 à TA-010

## Gardes
[~] Aucun secret dans le dépôt : `.env` est dans `.gitignore`
[~] Aucune route ne répond 500 sur un id inconnu ou mal formé
[~] Toute erreur a un corps JSON de la même forme : `{ "erreur": "..." }`

## Non mesurable
NON MESURABLE Temps de réponse de la recherche : pas de jeu de données assez grand pour trancher

## Journal
AAAA-MM-JJ ... création v1, étape 1

---

# Documentation : Résolution des erreurs npm (ENOENT et Missing script)

Ce document résume les problèmes rencontrés lors du lancement d'une API Node.js/Express et la démarche de résolution.

## Problème 1 : Erreur `ENOENT` (Fichier introuvable)
**Message d'erreur :**
`npm error ENOENT: no such file or directory, open 'C:\Projet\package.json'`

**Cause :**
La commande `npm` (comme `npm install` ou `npm run`) nécessite la présence d'un fichier `package.json` dans le répertoire courant. L'erreur survient lorsque le terminal est ouvert dans le mauvais dossier (par exemple à la racine `C:\Projet\`), alors que le projet se trouve dans un sous-dossier.

**Solution :**
Naviguer vers le dossier exact qui contient le fichier `package.json` du projet.
`cd Finder\api`

## Problème 2 : Erreur `Missing script: "dev"`
**Message d'erreur :**
`npm error Missing script: "dev"`

**Cause :**
La commande `npm run dev` indique à npm d'exécuter le script nommé `"dev"`. Si ce raccourci n'est pas explicitement défini dans la section `"scripts"` du fichier `package.json`, l'exécution échoue.

**Solution :**
Ouvrir le fichier `package.json` du projet et ajouter ou modifier la section `"scripts"` pour inclure `"dev"`. 
*Remarque : Si le fichier principal du serveur se trouve dans un sous-dossier (comme `src/`), son chemin doit être précisé dans le script.*

```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "dev": "node src/server.js"
  }
}
```
*(Astuce : Vous pouvez remplacer `node` par `nodemon` dans le script pour que le serveur redémarre automatiquement à chaque modification du code).*

## Lancement manuel alternatif
Si le raccourci npm n'est pas configuré, il est toujours possible de lancer directement l'application avec Node.js depuis la racine du projet (`api`), en pointant vers le bon sous-dossier :
`node src/server.js`

---

# Documentation : Configuration de l'API, Variables d'Environnement et Tests

Ce document explique comment configurer les variables d'environnement, protéger les fichiers sensibles avec Git, et initialiser une API Node.js/Express.

## 1. Sécurité et Environnement (`.env` et `.gitignore`)

### Le fichier `.env`
*   **Emplacement :** Dans le dossier de l'API (ex: `api/.env`).
*   **Rôle :** Stocker les informations sensibles et spécifiques à l'environnement, comme la chaîne de connexion à la base de données.
*   **Exemple de contenu :**
    `DATABASE_URL="mysql://utilisateur:motdepasse@localhost:3306/finder"`

### Le fichier `.gitignore`
*   **Emplacement :** À la racine globale du projet (ex: `Finder/.gitignore`).
*   **Rôle :** Indiquer à Git quels fichiers ou dossiers ne **doivent jamais** être partagés (pour des raisons de sécurité ou de poids).
*   **Contenu :**
    ```text
    node_modules
    .env
    ```
    *(Astuce : En écrivant ces noms sans barre oblique `/` au début, Git les ignorera partout dans le projet, y compris s'ils sont dans le sous-dossier `api/`).*

*   **Vérification :** En tapant `git status` à la racine, ni `.env` ni `node_modules` ne doivent apparaître dans la liste des fichiers à valider.

---

## 2. Le Serveur Minimal et la Route de Test (`server.js`)

Le fichier `api/src/server.js` doit charger les variables d'environnement, initialiser Express et définir une route de "santé" (health check).

```javascript
// 1. Chargement des variables du fichier .env (Obligatoire en 1ère ligne)
require('dotenv').config(); 
const express = require('express');

const app = express();

// 2. Middleware pour lire le corps des requêtes en JSON
app.use(express.json()); 

// 3. Route de vérification de l'état de l'API
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
});

// 4. Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API sur écoute sur http://localhost:${PORT}`);
});
```

---

# Le fonctionnement de `server.js` (Analogie du Restaurant)

Imaginez cette API comme le fonctionnement d'un **restaurant**. L'API est le serveur en salle qui fait le lien entre les clients (les navigateurs ou applications) et la cuisine (vos données/base de données).

### 1. L'Équipement
Avant d'ouvrir, on s'équipe avec les bons outils :
*   `dotenv` : Ouvre le coffre-fort (`.env`) qui contient les données secrètes (mots de passe, ports).
*   `express` : Le costume du serveur. C'est le framework qui va tout gérer.

### 2. La Préparation en Cuisine
Avant l'arrivée des clients, le serveur se connecte à la base de données via `PrismaClient()`. Ainsi, quand un client posera une question, il saura exactement où aller chercher les informations.

### 3. L'Accueil
```javascript
const app = express();
app.use(express.json());
```
On enfile le costume (`app = express()`) et on s'assure de parler la même langue que les clients : le format de données JSON.

### 4. Les Commandes Simples
```javascript
app.get('/hotels', async (req, res) => res.json(await prisma.hotels.findMany()));
```
Si un client demande "Quelle est la carte des hôtels ?" (l'adresse `/hotels`), le serveur va chercher toute la liste en base de données et la lui sert.

### 5. Les Commandes Spécifiques (Fiches détaillées)
```javascript
app.get('/hotels/:id', async (req, res) => { ... })
```
Ici, le client demande un élément très précis (ex: l'hôtel n°1 avec `/hotels/1`). 
1.  **La prise de commande :** On lit le numéro demandé dans l'adresse URL (`req.params.id`).
2.  **La recherche :** Le serveur cherche ce numéro exact (`findUnique`).
3.  **Le service :** S'il le trouve, il l'apporte. S'il ne le trouve pas, il s'excuse avec une erreur 404 "Introuvable".

### 6. L'Ouverture du Restaurant
```javascript
app.listen(3000, () => { console.log("Serveur démarré !"); });
```
On allume l'enseigne lumineuse. L'application se met sur écoute (sur le port 3000) et attend patiemment l'arrivée des requêtes.

---

# Spécifications et Apprentissages Prisma - Projet Finder

Ce document recense les règles d'architecture, la modélisation et le peuplement de la base de données avec Prisma.

## 1. Architecture et Modélisation (Schéma)

### A. La règle de la Double Déclaration (Relations)
Dans Prisma, une relation (clé étrangère) s'écrit toujours sur deux lignes du côté de la table "enfant" :
1.  **La vraie colonne MySQL :** `hotel_Id Int` (Stocke l'ID physique).
2.  **Le champ virtuel Prisma :** `hotel Hotels @relation(...)` (N'existe qu'en JavaScript pour faciliter les requêtes croisées).

### B. Gestion des valeurs optionnelles (Le Paradoxe du Voyageur)
Certains utilisateurs (les voyageurs) n'appartiennent à aucun hôtel, contrairement aux hôteliers. Si une clé étrangère peut être vide, il faut impérativement rendre **la colonne ID ET la relation Prisma virtuellement optionnelles** en ajoutant un `?`.

```prisma
// Exemple dans le modèle Comptes
hotel    Hotels? @relation(fields: [hotel_Id], references: [id])
hotel_Id Int?
```

---

## 2. Seed de la Base de Données (`prisma/seed.js`)

### A. L'Ordre des Clés Étrangères
Une base de données relationnelle impose un respect strict des dépendances.
*   **Ordre de suppression (`deleteMany`) :** Des enfants vers les parents (Réservations ➔ Comptes ➔ Chambres ➔ Hôtels).
*   **Ordre d'insertion (`createMany`) :** Des parents vers les enfants (Inverse strict de la suppression).

### B. Les Points Techniques Cruciaux
*   **Hachage des Mots de Passe (`bcrypt`) :** Obligatoire pour la sécurité. Utiliser `Promise.all` avec un `.map()` pour attendre le hachage asynchrone avant l'insertion en base.
*   **Format des Dates :** Prisma refuse les chaînes de caractères brutes (ex: `"2026-10-09"`) pour les types `DateTime`. Il faut les convertir via `new Date()`.
*   **Différence Source vs Schéma :** Lors de l'insertion, les clés de l'objet (à gauche) DOIVENT correspondre au `schema.prisma` (ex: `hotel_Id`), tandis que les valeurs (à droite) proviennent du fichier source (ex: `c.hotel_id`).

### C. Le Workflow Prisma (Commandes Utiles)
À chaque modification du fichier `schema.prisma`, exécuter dans l'ordre :
1.  Générer le client : `npx prisma generate`
2.  Synchroniser MySQL (Force) : `npx prisma db push --force-reset`
3.  Exécuter la Seed : `node --env-file=.env prisma/seed.js`

---

# Documentation : Recherche Avancée et Filtres de Dates (Prisma)

Cette section documente la logique algorithmique mise en place sur la route `GET /chambres` pour filtrer les chambres indisponibles lors d'une recherche par dates.

## 1. La Frontière entre l'URL et la Base de Données
Il est crucial de séparer ce que le client demande (l'URL) et ce que Prisma attend (le schéma).
*   **L'URL (req.query) :** Les variables dépendent du cahier des charges de l'API (ex: `?hotel=1&date_debut=...`). Le serveur récupère ces données via `const { hotel, date_debut } = req.query;`.
*   **La Base de Données (Prisma) :** Les critères de recherche dans l'objet `where` DOIVENT utiliser la syntaxe stricte du `schema.prisma` (ex: `where.hotel_Id = Number(hotel);`).

## 2. L'Algorithme de Chevauchement des Dates
Pour savoir si une chambre est occupée sur la période demandée par le client, on vérifie si les dates se **chevauchent** (overlap).
La règle mathématique stipule que deux séjours se croisent SI ET SEULEMENT SI :
1.  Le départ du client précédent est **après** l'arrivée demandée.
2.  L'arrivée du client précédent est **avant** le départ demandé.

**La règle des bornes strictes (`lt` / `gt`) :**
Le jour de départ est considéré comme "libre" (un client peut arriver l'après-midi du jour où le précédent part le matin). Par conséquent, les opérateurs utilisés doivent être stricts (`lt` pour `<` et `gt` pour `>`). On n'utilise jamais `<=` ou `>=`.

## 3. Le Filtre de Relation `none` (NOT EXISTS)
Pour traduire cette exclusion en base de données, on utilise le mot-clé `none` de Prisma. Il est l'équivalent direct du `NOT EXISTS` en SQL. 

Il permet de dire : *"Renvoie-moi cette chambre uniquement si le nombre de réservations qui correspondent aux critères ci-dessous est égal à ZÉRO"*.

**Implémentation dans Express / Prisma :**
```javascript
// Si le client a renseigné les deux dates dans sa recherche
if (date_debut && date_fin) {
    where.Reservation = {
        none: {
            // Règle 1 : On ne bloque la chambre que si la réservation est validée
            statut: 'confirmee', 
            
            // Règle 2 : L'arrivée en base est AVANT ma date de fin demandée
            date_arrivee: { lt: new Date(date_fin) },
            
            // Règle 3 : Le départ en base est APRÈS ma date de début demandée
            date_depart: { gt: new Date(date_debut) }       
        }
    }   
}
```
*Note : Si une réservation en base se chevauche mais possède le statut `refusee` ou `annulee`, la condition `statut: 'confirmee'` n'est pas remplie, le `none` considère qu'il n'y a pas de conflit, et la chambre remonte dans les résultats comme étant libre.*
# Guide d'implémentation : Sécurisation et Routes Protégées (Projet Finder)

Ce document récapitule l'ensemble des concepts, des codes et des bonnes pratiques mis en place pour sécuriser l'API Express avec des jetons JWT et structurer les opérations CRUD (Création, Lecture, Modification, Suppression) associées aux utilisateurs et aux chambres.

---

## 1. Le Middleware d'Authentification (`authentifier`)

Le middleware agit comme un vigile à l'entrée des routes protégées. Il intercepte l'en-tête `Authorization`, extrait le jeton JWT, le vérifie à l'aide de la clé secrète, et injecte le payload décodé dans `req.utilisateur`.

```javascript
import jwt from 'jsonwebtoken';

function authentifier(req, res, next) {
    const entete = req.headers.authorization || '';
    const token = entete.replace('Bearer ', '');
    try {
        // Décode le jeton et stocke { id, role } dans req.utilisateur
        req.utilisateur = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erreur: 'jeton absent ou invalide' });
    }
}

```

* **Sécurité couverte :** Gère l'absence de jeton, un jeton invalide ou un jeton expiré en renvoyant systématiquement un code HTTP `401 Unauthorized`.

---

## 2. La Déconnexion Stateless (`POST /auth/logout`)

Puisque les JWT sont sans état (*stateless*), le serveur ne conserve pas de session active. La déconnexion consiste simplement à valider que l'utilisateur possède un jeton valide avant de répondre, laissant le soin au client (front-end) d'effacer le jeton de sa mémoire.

```javascript
app.post('/auth/logout', authentifier, (req, res) => {
    res.status(204).end(); // 204 No Content
});

```

---

## 3. Gestion des Chambres (Routes Protégées)

Les routes d'écriture (`POST`, `PATCH`, `DELETE`) nécessitent d'être protégées par le middleware `authentifier` et de cibler rigoureusement les identifiants en base de données.

### A. Création d'une chambre (`POST`)

```javascript
app.post('/chambres', authentifier, async (req, res) => {
    try {
        const newChambre = await prisma.chambres.create({
            data: { ...req.body }
        });
        res.status(201).json(newChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

```

### B. Modification d'une chambre (`PATCH`)

On cible spécifiquement la ressource via l'identifiant passé dans l'URL (`req.params.id`).

```javascript
app.patch('/chambres/:id', authentifier, async (req, res) => {
    try {
        const upChambre = await prisma.chambres.update({
            where: { id: Number(req.params.id) },
            data: { ...req.body }
        });
        res.json(upChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

```

### C. Suppression d'une chambre (`DELETE`)

```javascript
app.delete('/chambres/:id', authentifier, async (req, res) => {
    try {
        await prisma.chambres.delete({
            where: { id: Number(req.params.id) }
        });
        res.status(204).end();
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

```

---

## 4. Gestion du Profil Utilisateur (`/voyageurs/me`)

Pour éviter toute usurpation d'identité, les routes personnelles n'utilisent **jamais** d'ID dans l'URL ou dans le corps de la requête. Elles s'appuient exclusivement sur l'ID présent dans le jeton (`req.utilisateur.id`).

### A. Consultation du profil (`GET`)

Le filtre `select` permet d'exclure les données sensibles comme le mot de passe hashé.

```javascript
app.get('/voyageurs/me', authentifier, async (req, res) => {
    const moi = await prisma.comptes.findUnique({
        where: { id: req.utilisateur.id },
        select: { id: true, role: true, email: true, nom: true, prenom: true }
    });
    res.json(moi);
});

```

### B. Modification du profil (`PATCH`)

```javascript
app.patch('/voyageurs/me', authentifier, async (req, res) => {
    try {
        const upVoyageur = await prisma.comptes.update({
            where: { id: req.utilisateur.id },
            data: { ...req.body }
        });
        res.json(upVoyageur);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

```

---

## 5. Astuces pour les tests avec `curl` (PowerShell)

Sous PowerShell, l'utilisation de guillemets échappés directement dans la ligne de commande `-d` pose souvent des problèmes de syntaxe JSON. La meilleure pratique consiste à utiliser des fichiers JSON temporaires.

1. **Créer un fichier de données (ex: `profil.json`) :**
```json
{
  "telephone": "06 99 88 77 66"
}

```


2. **Exécuter la requête `curl` en pointant vers le fichier :**
```cmd
curl.exe -i -X PATCH http://localhost:3000/voyageurs/me -H "Authorization: Bearer VOTRE_JETON" -H "Content-Type: application/json" -d "@profil.json"

```
Voici le contenu complet formaté dans un bloc Markdown prêt à être copié et enregistré dans un fichier nommé `documentation-securite.md` à la racine de votre projet :

```markdown
# Documentation Technique : Sécurité, Validation et Middlewares — API Finder

Cette documentation présente l'architecture complète de sécurité, de validation et d'autorisation mise en place dans l'API **Finder** (Node.js, Express, Prisma, Zod et JWT).

---

## 1. Vue d'ensemble de l'architecture de sécurité

Le pipeline de sécurité s'articule autour de plusieurs couches successives :
* **Authentification (`authentifier`)** : Vérifie l'identité de l'utilisateur à l'aide d'un jeton JWT.
* **Autorisation (`exigeRole`)** : Restreint l'accès aux routes selon le rôle de l'utilisateur.
* **Validation (`validerCorps` / `validerQuery`)** : Valide, nettoie et type les données entrantes via des schémas Zod.
* **Contrôle granulaire (P4a / P4b)** : Gère l'existence des ressources (404) et l'appartenance organisationnelle (403).

---

## 2. Middlewares d'Authentification et d'Autorisation

### A. L'Authentification (`authentifier`)
Intercepte l'en-tête HTTP `Authorization`, extrait le jeton de type `Bearer` et valide sa signature cryptographique.

```javascript
function authentifier(req, res, next) {
    const entete = req.headers.authorization || '';
    const token = entete.replace('Bearer ', '');
    try {
        req.utilisateur = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erreur: 'jeton absent ou invalide' });
    }
}

```

### B. L'Autorisation par Rôle (`exigeRole`)

Vérifie si le rôle porté par l'utilisateur connecté fait partie des rôles autorisés pour accéder à la ressource.

```javascript
function exigeRole(...roles) {
    return (req, res, next) =>
        roles.includes(req.utilisateur.role) 
            ? next() 
            : res.status(403).json({ erreur: 'acces refuse' });
}

```

---

## 3. Validation et Filtrage des Données avec Zod

### A. Validation des corps de requête (`validerCorps`)

Utilisé pour les méthodes `POST` et `PATCH` (`req.body`). Valide les données, renvoie un statut `400 Bad Request` avec un tableau d'erreurs détaillé (`validation.error.issues`) en cas d'échec, ou nettoie la charge utile en cas de succès.

```javascript
function validerCorps(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ erreurs: validation.error.issues });
        }
        req.body = validation.data;
        next();
    };
}

```

### B. Validation des paramètres d'URL (`validerQuery`)

Utilisé pour les requêtes `GET` (`req.query`). Utilise `z.coerce` pour convertir automatiquement les types transmis dans l'URL avant d'appliquer les contraintes du schéma.

```javascript
function validerQuery(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({ erreurs: validation.error.issues });
        }
        req.query = validation.data;
        next();
    };
}

```

---

## 4. Gestion de l'Existence (P4a) et de l'Appartenance (P4b)

Pour les opérations sensibles (`PATCH` et `DELETE`), un contrôle direct est opéré dans le corps de la route, après la lecture en base de données.

* **P4a (Existence - 404) :** Vérifie que la ressource existe. Si elle est introuvable, l'API renvoie immédiatement un statut `404 Not Found` (testé en priorité avant tout autre contrôle).
* **P4b (Appartenance - 403) :** Compare l'attribut organisationnel (`hotelId`) de la ressource lue avec celui porté par le jeton de l'utilisateur (`req.utilisateur.hotelId`). En cas de non-concordance, un statut `403 Forbidden` est retourné.

### Exemple d'implémentation (`PATCH /chambres/:id`) :

```javascript
app.patch('/chambres/:id', authentifier, exigeRole('hotelier'), validerCorps(schemaChambreModif), async (req, res) => {
    try {
        // 1. P4a : Vérification de l'existence (404 en premier)
        const chambreExistante = await prisma.chambres.findUnique({
            where: { id: Number(req.params.id) }
        });
        if (!chambreExistante) {
            return res.status(404).json({ erreur: 'Chambre non trouvée' });
        }

        // 2. P4b : Vérification de l'appartenance (403 si l'hôtel ne correspond pas)
        if (chambreExistante.hotelId !== req.utilisateur.hotelId) {
            return res.status(403).json({ erreur: 'Accès refusé' });
        }

        // 3. Mise à jour effective
        const upChambre = await prisma.chambres.update({
            where: { id: Number(req.params.id) },
            data: { ...req.body }
        });
        res.status(200).json(upChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

```

```

```