
---

# 📝 Guide Pratique : Tests Unitaires avec Vitest, Prisma et Supertest

L'objectif d'un test unitaire est de vérifier que la logique de notre code (Express) fonctionne, **sans jamais toucher à la vraie base de données**. Pour y arriver, nous allons "mocker" (simuler) les appels à la base de données.

---

## 1. 🛠️ La boîte à outils : L'objet `vi`

Dans Vitest, l'objet global **`vi`** est l'équivalent de `jest` ou de `Mockito` (en Java). C'est lui qui nous permet d'intercepter les appels vers Prisma.

La méthode reine est **`vi.spyOn()`**. Elle agit comme un espion qui intercepte un appel de fonction avant qu'il n'atteigne la base de données.

**Syntaxe de base :**

```javascript
// On dit à Prisma : "Si on t'appelle pour faire un findUnique, 
// ne cherche pas en base, renvoie directement cet objet direct."
vi.spyOn(prisma.table, 'methode').mockResolvedValue({ id: 1, nom: 'Faux objet' });

```

---

## 2. 🧹 Garder un terrain propre : `afterEach`

Quand on utilise des mocks, ils restent en mémoire. Si le *Test 1* modifie le comportement de Prisma, le *Test 2* risque d'utiliser cette version modifiée et de planter.

Pour éviter cela, on utilise **`afterEach`** (l'équivalent de `@AfterEach` en Java). C'est le "coup de balai" qui s'exécute automatiquement après chaque test pour remettre Prisma à zéro.

```javascript
import { afterEach, vi } from 'vitest';

describe('Mes tests', () => {
  afterEach(() => {
    vi.restoreAllMocks(); // 🧹 Efface toutes les triches, remet Prisma à son état normal !
  });
});

```

---

## 3. 🔐 Passer la douane : Le faux Token JWT

Si une route est protégée par des middlewares (`authentifier`, `exigeRole`), une simple requête Supertest se fera rejeter (Erreur 401 ou 403).

**La solution :** Fabriquer un "vrai-faux" token directement dans le test en utilisant la librairie `jsonwebtoken`, puis l'injecter dans le header HTTP `Authorization`.

**Attention à la cohérence des données :** Si ton token dit que l'utilisateur est propriétaire de l'hôtel `42`, le mock de Prisma doit renvoyer une chambre qui appartient bien à l'hôtel `42` pour passer les conditions (les `if`) de ton code.

---

## 4. 🚀 L'exemple complet (La route DELETE)

Voici comment toutes ces notions s'assemblent pour tester une route complexe qui vérifie un token, cherche une chambre en base, vérifie son propriétaire, puis la supprime.

```javascript
import request from 'supertest';
import { expect, describe, it, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import app, { prisma } from '../app.js'; 

describe('DELETE /chambres/:id', () => {

  // 1. LE MÉNAGE : Obligatoire entre chaque test
  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  it('doit supprimer la chambre avec les bons droits d\'accès (MOCK)', async () => {
    
    // ----------------- ARRANGE (Préparation) -----------------
    
    // A. Génération du faux Token pour un "hotelier" de l'hôtel n°42
    process.env.JWT_SECRET = 'secret_test';
    const fauxToken = jwt.sign(
      { id: 99, role: 'hotelier', hotelId: 42 },
      process.env.JWT_SECRET
    );

    // B. Mock de la lecture : on simule que la chambre existe ET appartient à l'hôtel 42
    vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue({ 
      id: 10, 
      nom: 'Suite',
      hotelId: 42 // 👈 Crucial : doit matcher avec le token !
    });

    // C. Mock de la suppression : on simule l'action finale (sans toucher la BDD)
    const deleteSpy = vi.spyOn(prisma.chambres, 'delete').mockResolvedValue({ 
      id: 10, 
      nom: 'Suite' 
    });

    // ----------------- ACT (Exécution) -----------------
    
    // On lance la requête Express via Supertest en attachant notre faux Token
    const res = await request(app)
      .delete('/chambres/10')
      .set('Authorization', `Bearer ${fauxToken}`);

    // ----------------- ASSERT (Vérifications) -----------------
    
    // 1. Vérification HTTP : la route doit avoir accepté et répondu 204 (No Content)
    expect(res.status).toBe(204);
    
    // 2. Vérification métier : Prisma a-t-il bien reçu le bon ordre final ?
    expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 10 } });
  });

});

```

---

## 📌 Mémo des commandes utiles

| Besoin | Commande Vitest |
| --- | --- |
| **Simuler un succès de la BDD** | `vi.spyOn(objet, 'methode').mockResolvedValue(donnee)` |
| **Simuler un plantage de la BDD** | `vi.spyOn(objet, 'methode').mockRejectedValue(new Error('...'))` |
| **Vérifier qu'une méthode a été appelée** | `expect(espion).toHaveBeenCalled()` |
| **Vérifier les paramètres de l'appel** | `expect(espion).toHaveBeenCalledWith({ where: { id: 1 } })` |
| **Nettoyer tous les espions** | `vi.restoreAllMocks()` |