import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

/**
 * @openapi
 * /hotels:
 *   get:
 *     summary: Récupérer la liste des hôtels
 *     tags:
 *       - Hôtels
 *     responses:
 *       200:
 *         description: Succès - Renvoie la liste des hôtels
 *       500:
 *         description: Erreur serveur
 */
router.get('/', async (req, res) => {
    try {
        const hotels = await prisma.hotels.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des hôtels" });
    }
});
/**
 * @openapi
 * /hotels/{id}:
 *   get:
 *     summary: Récupérer un hôtel en fonction de son ID
 *     tags:
 *       - Hôtels
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'hôtel
 *     responses:
 *       200:
 *         description: Succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Hotel non trouvé
 */
router.get('/:id', async (req,res) =>{
    const hotel = await prisma.hotels.findUnique({
        where: {id: Number(req.params.id)},
    });
    if(!hotel){
        return res.status(404).json({error: 'Hotel non trouvé'});
    }
    res.json(hotel);
});
/**
 * @openapi
 * /hotels/{id}/chambres:
 *   get:
 *     summary: Récupérer les chambres d'un hôtel en fonction de son ID
 *     tags:
 *       - Hôtels
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'hôtel
 *     responses:
 *       200:
 *         description: Succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: chambre par rapport à l'hôtel non trouvée
 */
router.get('/:id/chambres', async (req,res) =>{
    if(isNaN(Number(req.params.id))){
        return res.status(400).json({error: "L'ID fourni est invalide"});
    }
    const chambres = await prisma.chambres.findMany({
        where: {hotelId: Number(req.params.id)},
        orderBy: {id: 'asc'},
    });
    if(chambres.length === 0){
        return res.status(404).json({error: 'Aucune chambre trouvée pour cet hôtel'});
    }
    res.json(chambres);
});
export default router;