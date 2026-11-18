# Documentation React : Gestion de la recherche et du rafraîchissement (`valides` et `version`)

Cette fiche explique l'architecture utilisée dans le composant `Recherche` pour interroger une API REST avec `useEffect` et `fetch`, tout en maîtrisant le déclenchement des requêtes réseau.

---

## 1. Vue d'ensemble des états du formulaire

Pour gérer proprement une recherche multicritère et l'affichage des résultats, le composant s'appuie sur deux mécanismes complémentaires dans le tableau de dépendances de `useEffect` :

```jsx
useEffect(() => {
  // Construction de l'URL et appels fetch(...)
}, [valides, version]);
```

| État | Rôle principal | Quand est-il modifié ? | Déclenche `useEffect` ? |
| :--- | :--- | :--- | :--- |
| **`criteres`** | Stocke la saisie en cours dans les champs (`<input>`, `<select>`). | À chaque frappe clavier ou changement de sélection (`onChange`). | **Non** |
| **`valides`** | Stocke la copie des critères confirmés par l'utilisateur. | Uniquement à la soumission du formulaire (`onSubmit`). | **Oui** |
| **`version`** | Compteur invisible permettant de forcer un rechargement. | À chaque soumission (`onSubmit`) ou action nécessitant un rafraîchissement. | **Oui** |

---

## 2. L'état `valides` : séparer la saisie de la validation

### Le problème sans `valides`
En React, un composant est réexécuté à chaque modification d'état. Si l'effet dépendait directement de l'état `criteres` (`useEffect(..., [criteres])`), chaque caractère tapé dans un champ déclencherait immédiatement un appel `fetch` vers le serveur :
* Surcharge inutile de l'API (multiplication des requêtes).
* Risque d'affichage incohérent si les réponses arrivent dans le désordre.

### La solution : le double état
On sépare **ce que l'utilisateur est en train de taper** (`criteres`) de **ce qu'il a officiellement validé** (`valides`) :

1. **Pendant la saisie (`changer`) :** Seul l'objet `criteres` est mis à jour. `valides` reste intact, donc `useEffect` ne fait rien.
   ```jsx
   function changer(e) {
     setCriteres({ ...criteres, [e.target.name]: e.target.value });
   }
   ```
2. **À la soumission (`rechercher`) :** On transfère les valeurs de `criteres` dans `valides` via `setValides(criteres)`. Ce changement déclenche l'exécution du `useEffect`, qui construit la *query string* (`URLSearchParams`) à partir de `valides`.

---

## 3. L'état `version` : le compteur invisible pour forcer le rechargement

`version` est un entier initialisé à `0` (`const [version, setVersion] = useState(0);`) qui n'est jamais affiché dans le JSX. Son unique fonction est de figurer dans les dépendances de `useEffect` et d'être incrémenté (`setVersion(v => v + 1)`) pour provoquer un nouvel appel réseau.

Il répond à **deux besoins précis** :

### A. Éviter le blocage sur « Chargement... » lors d'une recherche identique
Dans le gestionnaire de soumission `rechercher(e)`, on passe l'interface en attente avant de lancer la recherche :
```jsx
setChargement(true);
setSelection(null);
setErreur(null);
setValides(criteres);
setVersion(v => v + 1);
```
Si l'utilisateur clique deux fois de suite sur **« Rechercher »** sans modifier aucun champ du formulaire :
* `criteres` contient exactement le même objet en mémoire que `valides`.
* React compare l'ancienne et la nouvelle valeur de `valides` : comme elles sont identiques, **React ne relancerait pas le `useEffect`** s'il n'y avait que `[valides]`.
* Comme `setChargement(true)` a déjà été exécuté mais que le `fetch` (et donc son `.finally(() => setChargement(false))`) ne part pas, l'écran resterait bloqué indéfiniment sur `Chargement...`.

En incrémentant `version` (`v => v + 1`), React détecte qu'au moins une dépendance du tableau `[valides, version]` a changé et exécute l'effet à coup sûr.

### B. Garantir la fraîcheur des données serveur (*Pull* vs *Push*)
React n'écoute pas les modifications de la base de données en temps réel : le serveur ne pousse pas les mises à jour (*push*), c'est le client qui doit les redemander (*pull*).

Si une chambre vient d'être réservée ou modifiée en base de données, l'utilisateur peut cliquer de nouveau sur **« Rechercher »** avec les mêmes filtres : l'incrémentation de `version` force un nouveau `GET` vers l'API pour récupérer l'état à jour du serveur.

---

## 4. Chronologie complète d'une recherche

1. **Montage initial du composant :**
   * `valides` vaut `{}` et `version` vaut `0`.
   * Le premier rendu s'affiche avec `Chargement...` (`chargement` initialisé à `true`).
   * `useEffect` s'exécute une première fois et charge toutes les chambres (`GET /chambres`).
2. **L'utilisateur remplit le formulaire :**
   * `changer()` met à jour `criteres` à chaque frappe.
   * `valides` et `version` ne bougent pas : aucune requête réseau n'est envoyée.
3. **L'utilisateur clique sur « Rechercher » :**
   * `e.preventDefault()` empêche le rechargement complet de la page par le navigateur.
   * `setChargement(true)` et `setErreur(null)` préparent l'interface.
   * `setValides(criteres)` enregistre les nouveaux filtres et `setVersion(v => v + 1)` incrémente le compteur.
4. **Nouveau rendu et exécution de l'effet :**
   * React constate que `[valides, version]` a changé.
   * `useEffect` construit la chaîne de paramètres (`q`) depuis `valides` et lance les appels `fetch` (`/chambres` et, si renseigné, `/hotels/:hotel`).
   * À la réception des données, `.then()` met à jour `chambres` (et `hotel`), puis `.finally()` repasse `chargement` à `false`.