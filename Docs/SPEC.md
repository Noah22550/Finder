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