import { Router } from 'express';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import { authentifier, exigeRole, validerCorps } from '../middlewares.js';
import { schemaModifCompte } from '../schemas.js';

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
router.get('/me', authentifier, exigeRole('voyageur'), async (req, res) => {
    const moi = await prisma.comptes.findUnique({
        where: { id: req.utilisateur.id},
        select: {id: true, role: true, email: true, nom: true, prenom: true}
    })
    res.json(moi)
})

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
 *               motDePasse:
 *                 type: string 
 *             
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
router.patch('/me', authentifier, exigeRole('voyageur'), validerCorps(schemaModifCompte), async (req, res) => {
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