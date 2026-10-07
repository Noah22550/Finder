
import { Router } from 'express';
import prisma from '../prisma.js'; // Le point d'exclamation sur le chemin (../)
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authentifier, exigeRole, validerCorps } from '../middlewares.js';
import { schemaInscription, schemaConnexion, schemaModifCompte } from '../schemas.js';

const router = Router();

/**
 * @openapi
 * /voyageurs/me:
 *   get:
 *     summary: Profil du voyageur connecté
 *     tags:
 *       - Voyageurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil (id, role, email, nom, prenom, telephone)
 *       401:
 *         description: Jeton absent ou invalide
 *       403:
 *         description: Accès refusé (réservé au rôle voyageur)
 *       404:
 *         description: Compte non trouvé
 */
router.get('/me', authentifier,exigeRole('voyageur'), async (req, res) => {
    const moi = await prisma.comptes.findUnique({
        where: { id: req.utilisateur.id},
        select: {id: true, role: true, email: true, nom: true, prenom: true}
    })
    res.json(moi)
})


// POST //
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
 *                 example: a.morel@mail.example
 *               motDePasse:
 *                 type: string
 *                 minLength: 6
 *                 example: motdepasse123
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
router.post('/auth/logout', authentifier, (req, res) => {
    res.status(204).end();
});




// Patch //

/**
 * @openapi
 * /voyageurs/me:
 *   patch:
 *     summary: Modifier le profil du voyageur connecté
 *     tags:
 *       - Voyageurs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Morel
 *               prenom:
 *                 type: string
 *                 example: Alice
 *               telephone:
 *                 type: string
 *                 example: "0611223344"
 *     responses:
 *       200:
 *         description: Profil modifié (id, email, nom, prenom, telephone)
 *       400:
 *         description: Corps invalide (tableau erreurs)
 *       401:
 *         description: Jeton absent ou invalide
 *       403:
 *         description: Accès refusé (réservé au rôle voyageur)
 */
router.patch('/voyageur/me', authentifier, exigeRole('voyageur'), validerCorps(schemaModifCompte), async (req, res) => {
    try {
        const donneesAModifier = { ...req.body };
        if (donneesAModifier.motDePasse) {
            donneesAModifier.motDePasse = await bcrypt.hash(donneesAModifier.motDePasse, 10);
        }

        const upVoyageur = await prisma.comptes.update({
            where: { id: req.utilisateur.id },
            data: donneesAModifier,
            select: { id: true, email: true, nom: true, prenom: true, telephone: true }
        });
        res.status(200).json(upVoyageur);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});
export default router;