
import { Router } from 'express';
import prisma from '../prisma.js'; // Le point d'exclamation sur le chemin (../)
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authentifier,validerCorps } from '../middlewares.js';
import { schemaInscription, schemaConnexion} from '../schemas.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Créer un compte voyageur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasse, nom, prenom]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: a.morel@mail.example
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *                 example: motdepasse123
 *               nom:
 *                 type: string
 *                 example: Morel
 *               prenom:
 *                 type: string
 *                 example: Alice
 *               telephone:
 *                 type: string
 *                 example: "0611223344"
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compte créé (le mot de passe n'est jamais renvoyé)
 *       400:
 *         description: Corps invalide (tableau erreurs)
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', validerCorps(schemaInscription), async (req, res) => {
    try {
        const { email, motDePasse, nom, prenom, telephone, note } = req.body;
        const compte = await prisma.comptes.create({
            data: { email, motDePasse: await bcrypt.hash(motDePasse, 10), nom, prenom, telephone, note, role: 'voyageur' },
            select: { id: true, email: true, nom: true, prenom: true, telephone: true, note: true }
        });
        res.status(201).json(compte);
    } catch (erreur) {
            return res.status(409).json({ erreur: 'email déjà utilisé' });
    }
});
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Se connecter et obtenir un jeton JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasse]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testVOYAGEUR@Test.test
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *                 example: testTaMere
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie { token }
 *       400:
 *         description: Corps invalide (tableau erreurs)
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login',validerCorps(schemaConnexion), async (req, res) => {
    const { email, motDePasse } = req.body;
    const compte = await prisma.comptes.findUnique({ where: { email } });
    if (!compte || !(await bcrypt.compare(motDePasse, compte.motDePasse))) {
        return res.status(401).json({ erreur: 'identifiants invalides' });
    }

    const token = jwt.sign(
        { id: compte.id, role: compte.role, hotelId: compte.hotelId },
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    res.json({ token });
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Se déconnecter
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Déconnexion réussie (aucun contenu)
 *       401:
 *         description: Jeton absent ou invalide
 */
router.post('/logout', authentifier, (req, res) => {
    res.status(204).end();
});

export default router;