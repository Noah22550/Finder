# Spec Finder - Sprint 1 [MINIMAL]
Équipe : ... Version : v1 du AAAA-MM-JJ (étape 1)
Règle : relue au début de chaque séance ; chaque amendement est daté dans le
journal.
## Étape 1 - en mémoire
[X] npm run dev démarre sans erreur -> le terminal affiche
l'adresse du serveur
[X] GET /health -> 200, {"ok":true}
[ ] Kit chargé une seule fois au démarrage -> readFileSync hors des
routes
[ ] GET /hotels -> 200, tableau de 3 hôtels
[ ] GET /hotels/:id -> 200 la fiche, ou 404 avec
corps JSON
[ ] GET /chambres -> 200, tableau de 32
chambres
[ ] GET /chambres/:id -> 200 la fiche, ou 404 avec
corps JSON
[ ] req.params.id converti avec Number() -> /hotels/1 répond 200,
/hotels/abc répond 404
[ ] .env avec PORT et DATABASE_URL -> le fichier existe, il
n'est pas commité
[ ] GET /chambres?prix_max=90 -> 200, 12 chambres ; sans
critère, 32
## Étapes 2 à 8 - déclarées, non franchies
[ ] E2 Base MySQL via Prisma : schéma, migration, seed du kit -> tables
visibles dans Adminer
[ ] E3 Recherche de chambres disponibles -> GET
/chambres?... filtre
[ ] E4 Inscription, connexion JWT 24 h, écritures protégées -> sans
jeton 401, mauvais rôle 403
[ ] E5 Validation Zod [ACCEPTABLE] -> corps
invalide 400, jamais 500
[ ] E6 Réservations et statuts ->
en_attente, confirmee, refusee, annulee
[ ] E7 Documentation Swagger de toutes les routes -> /docs
les affiche toutes
[ ] E8 Tests et recette -> npm test
passe, TA-001 à TA-010
## Gardes
[~] Aucun secret dans le dépôt : .env est dans .gitignore
[~] Aucune route ne répond 500 sur un id inconnu ou mal formé
[~] Toute erreur a un corps JSON de la même forme : { "erreur": "..." }
## Non mesurable
NON MESURABLE Temps de réponse de la recherche : pas de jeu de données
assez grand pour trancher
## Journal
AAAA-MM-JJ ... création v1, étape 1

# Documentation : Résolution des erreurs npm (ENOENT et Missing script)

Ce document résume les problèmes rencontrés lors du lancement d'une API Node.js/Express et la démarche de résolution.

## Problème 1 : Erreur `ENOENT` (Fichier introuvable)
**Message d'erreur :**
```text
npm error ENOENT: no such file or directory, open 'C:\Projet\package.json'
```

**Cause :**
La commande `npm` (comme `npm install` ou `npm run`) nécessite la présence d'un fichier `package.json` dans le répertoire courant. L'erreur survient lorsque le terminal est ouvert dans le mauvais dossier (par exemple à la racine `C:\Projet\`), alors que le projet se trouve dans un sous-dossier.

**Solution :**
Naviguer vers le dossier exact qui contient le fichier `package.json` du projet.
```bash
cd Finder\Finder\api
```

## Problème 2 : Erreur `Missing script: "dev"`
**Message d'erreur :**
```text
npm error Missing script: "dev"
```

**Cause :**
La commande `npm run dev` indique à npm d'exécuter le raccourci nommé `"dev"`. Si ce raccourci n'est pas explicitement défini dans la section `"scripts"` du fichier `package.json`, l'exécution échoue.

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
```bash
node src/server.js
```

# Documentation : Configuration de l'API, Variables d'Environnement et Tests avec cURL

Ce document explique comment configurer les variables d'environnement, protéger les fichiers sensibles avec Git, et tester une API Node.js/Express sous Windows.

## 1. Sécurité et Environnement (`.env` et `.gitignore`)

### Le fichier `.env`
*   **Emplacement :** Dans le dossier de l'API (ex: `api/.env`).
*   **Rôle :** Stocker les informations sensibles et spécifiques à l'environnement, comme la chaîne de connexion à la base de données.
*   **Exemple de contenu :**
    ```env
    DATABASE_URL="postgres://utilisateur:motdepasse@localhost:5432/finder"
    ```

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
    console.log(`API écoute sur http://localhost:${PORT}`);
});