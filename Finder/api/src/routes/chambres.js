import { Router } from 'express';
import prisma from '../prisma.js'; 
import { authentifier, exigeRole, validerCorps, validerQuery } from '../middlewares.js'; // <-- Ajout de validerQuery
import { schemaChambre, schemaChambreModif, schemaChambreGet } from '../schemas.js'; // <-- ../ ici aussi

const router = Router();

/**
 * @openapi
 * /chambres:
 *   get:
 *     summary: Récupérer les chambres
 *     tags:
 *       - Chambres
 *     parameters:
 *       - in: query
 *         name: hotel
 *         schema:
 *           type: integer
 *         description: ID de l'hôtel
 *       - in: query
 *         name: capacite
 *         schema:
 *           type: integer
 *         description: Capacité minimale de la chambre
 *       - in: query
 *         name: categorie
 *         schema:
 *           type: string
 *         description: Catégorie de la chambre
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *         description: Prix maximum par nuit
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de la réservation
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de la réservation
 *     responses:
 *       200:
 *         description: Succès
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Ressource non trouvée
 */
router.get('/', validerQuery(schemaChambreGet), async (req, res) => {
    const { hotel, capacite, prix_max, categorie, date_debut, date_fin } = req.queryValide;
    const where = {};
    if (hotel) where.hotelId = hotel;
    if (capacite) where.capacite = { gte: capacite };
    if (prix_max) where.prixNuit = { lte: prix_max };
    if (categorie) where.categorie = categorie;
    if (date_debut && date_fin) {
        where.Reservation = {
            none: {
                statut: 'confirmee',
                dateArrivee: { lt: date_fin },
                dateDepart: { gt: date_debut }
            }
        };
    }
    res.json(await prisma.chambres.findMany({ where, orderBy: { id: 'asc' } }));
});

/**
 * @openapi
 * /chambres/{id}:
 *   get:
 *     summary: Récupérer une chambre en fonction de son ID
 *     tags:
 *       - Chambres
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la chambre
 *     responses:
 *       200:
 *         description: Succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Chambre non trouvée
 */
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "L'ID fourni est invalide" });
    }
    const chambre = await prisma.chambres.findUnique({
        where: { id: id },
    });

    if (!chambre) {
        return res.status(404).json({ error: 'Chambre non trouvée' });
    }
    res.json(chambre);
});

/**
 * @openapi
 * /chambres:
 *   post:
 *     summary: Créer une nouvelle chambre
 *     tags:
 *       - Chambres
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelId:
 *                 type: integer
 *                 description: ID de l'hôtel concerné
 *               numero:
 *                 type: integer
 *                 description: Numéro de la chambre
 *               categorie:
 *                 type: string
 *                 description: Catégorie de la chambre (simple, double, familiale, suite)
 *               capacite:
 *                 type: integer
 *                 description: Quantité maximale de voyageurs dans la chambre
 *               prixNuit:
 *                 type: integer
 *                 description: Prix de la nuit
 *               description:
 *                 type: string
 *                 description: Description détaillée de la chambre
 *               disponible:
 *                 type: integer
 *                 description: 1 si disponible, 0 sinon
 *     responses:
 *       201:
 *         description: Chambre créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 */
router.post('/', authentifier, exigeRole('hotelier'), validerCorps(schemaChambre), async (req, res) => {
    try {
        const newChambre = await prisma.chambres.create({
            data: { ...req.body, hotelId: req.utilisateur.hotelId }
        });
        res.status(201).json(newChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

/**
 * @openapi
 * /chambres/{id}:
 *   patch:
 *     summary: Modifier partiellement une chambre existante
 *     tags:
 *       - Chambres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la chambre à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotelId:
 *                 type: integer
 *                 description: ID de l'hôtel (optionnel)
 *               numero:
 *                 type: integer
 *                 description: Numéro de la chambre (optionnel)
 *               categorie:
 *                 type: string
 *                 description: Catégorie de la chambre (optionnel)
 *               capacite:
 *                 type: integer
 *                 description: Capacité maximale (optionnel)
 *               prixNuit:
 *                 type: integer
 *                 description: Prix de la nuit (optionnel)
 *               description:
 *                 type: string
 *                 description: Description détaillée (optionnel)
 *               disponible:
 *                 type: integer
 *                 description: 1 si disponible, 0 sinon (optionnel)
 *     responses:
 *       200:
 *         description: Chambre modifiée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (la chambre ne vous appartient pas)
 *       404:
 *         description: Chambre non trouvée
 */
router.patch('/:id', authentifier, exigeRole('hotelier'), validerCorps(schemaChambreModif), async (req, res) => {
    try {
        // 1. P4a : Vérifier si la chambre existe (404 en premier)
        const chambreExistante = await prisma.chambres.findUnique({
            where: { id: Number(req.params.id) }
        });
        if (!chambreExistante) {
            return res.status(404).json({ erreur: 'Chambre non trouvée' });
        }

        // 2. P4b : Vérifier que l'hôtelier possède bien cet hôtel (403 sinon)
        if (chambreExistante.hotelId !== req.utilisateur.hotelId) {
            return res.status(403).json({ erreur: 'Accès refusé : cette chambre ne vous appartient pas' });
        }

        const upChambre = await prisma.chambres.update({
            where: { id: Number(req.params.id) },
            data: { ...req.body }
        });
        res.status(200).json(upChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});
/**
 * @openapi
 * /chambres/{id}:
 *   delete:
 *     summary: Supprimer une chambre en fonction de son ID
 *     tags:
 *       - Chambres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la chambre
 *     responses:
 *       204:
 *         description: Chambre supprimée avec succès (aucun contenu renvoyé)
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (cette chambre ne vous appartient pas)
 *       404:
 *         description: Chambre non trouvée
 */
router.delete('/:id', authentifier,exigeRole( 'hotelier'), async (req, res) => {
    try {
        // 1. P4a : Vérifier si la chambre existe (404 en premier)
        const chambreExistante = await prisma.chambres.findUnique({
            where: { id: Number(req.params.id) }
        });
        // 2. P4b : Vérifier l'appartenance (403 sinon)
        if (!chambreExistante) {
            return res.status(404).json({ erreur: 'Chambre non trouvée' });
        }
        if (chambreExistante.hotelId !== req.utilisateur.hotelId) {
            return res.status(403).json({ erreur: 'Accès non autorisé' });
        }
        await prisma.chambres.delete({
            where: { id: Number(req.params.id) }
        });
        res.status(204).end();
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

export default router;