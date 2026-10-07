
import { Router } from 'express';
import prisma from '../prisma.js';
import { authentifier, exigeRole, validerCorps } from '../middlewares.js';
import {schemaReservation,schemaStatutReservation } from '../schemas.js';

const router = Router();

const TRANSITIONS_AUTORISEES = {
    en_attente: ['confirmee', 'refusee', 'annulee'],
    confirmee: ['annulee'],
    refusee: [],
    annulee: []
};
function transitionValide(statutActuel, statutVoulu) {
 return (TRANSITIONS_AUTORISEES[statutActuel] || []).includes(statutVoulu);
}

/**
 * @openapi
 * /reservations/mine:
 *   get:
 *     summary: Récupérer les informations d'un réservation du voyageur connecté
 *     tags :
 *      - reservation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 *       401:
 *          description: Non autorisé
 *       404:
 *         description: Voyageur non trouvé
 */
router.get('/mine', authentifier, exigeRole('voyageur'), async (req, res) => {
        const reservations = await prisma.reservations.findMany({
            where: { voyageurId: req.utilisateur.id },
            orderBy: { dateArrivee: 'asc' }
        });
        if(reservations.length === 0){
            return res.status(404).json({error: 'Aucune réservation trouvée pour cet utilisateur'});
        }
        res.json(reservations);
});

/**
 * @openapi
 * /reservations/received:
 *   get:
 *     summary: voir les réservations reçues par l'hôtelier connecté
 *     tags :
 *      - reservation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 *       401:
 *          description: Non autorisé
 *       404:
 *         description: Voyageur non trouvé
 */
router.get('/received', authentifier, exigeRole('hotelier'), async (req, res) => {
    const reservations = await prisma.reservations.findMany({
        where: { Chambres: { hotelId: req.utilisateur.hotelId } },
        orderBy: { dateArrivee: 'asc' }
    });
    if(reservations.length === 0){
        return res.status(404).json({error: 'Aucune réservation trouvée pour cet hôtel'});
    }
    res.json(reservations);
});

/**
 * @openapi
 * /reservation:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     tags:
 *       - reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chambreId:
 *                 type: integer
 *                 description: ID de la chambre réservée
 *               dateArrivee:
 *                 type: string
 *                 format: date
 *                 description: Date d'arrivée (ex YYYY-MM-DD)
 *               dateDepart:
 *                 type: string
 *                 format: date
 *                 description: Date de départ (ex YYYY-MM-DD)
 *               nbPersonnes:
 *                 type: integer
 *                 description: Nombre de voyageurs pour cette réservation
 *               demandeSpecial:
 *                 type: string
 *                 description: Demandes particulières (optionnel)
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 */
router.post('/', authentifier, exigeRole('voyageur'), validerCorps(schemaReservation), async (req, res) => {
    try {
        const { chambreId, dateArrivee, dateDepart, nbPersonnes, demandeSpecial } = req.body;
    
        const nouvelleReservation = await prisma.reservations.create({
            data: {voyageurId: req.utilisateur.id,chambreId,dateArrivee, dateDepart,nbPersonnes,demandeSpecial: demandeSpecial || null, statut: 'en_attente'}
        });
        res.status(201).json(nouvelleReservation);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     summary: Modifier le statut d'une réservation
 *     tags:
 *       - reservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *                 description: Nouveau statut de la réservation
 *     responses:
 *       200:
 *         description: Réservation modifiée avec succès
 *       400:
 *         description: Données invalides ou transition de statut non autorisée
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (cette réservation ne concerne pas votre hôtel)
 *       404:
 *         description: Réservation non trouvée
 */
router.patch('/:id', authentifier, exigeRole('hotelier'), validerCorps(schemaStatutReservation), async (req, res) => {
    try {
        const reservationExistante = await prisma.reservations.findUnique({
            where: { id: Number(req.params.id) },
            include: { Chambres: true }
        });
        if (!reservationExistante) {
            return res.status(404).json({ erreur: 'Réservation non trouvée' });
        }
        if (reservationExistante.Chambres.hotelId !== req.utilisateur.hotelId) {
            return res.status(403).json({ erreur: 'Accès refusé : cette réservation ne vous appartient pas' });
        }
        if (!transitionValide(reservationExistante.statut, req.body.statut)) {
            return res.status(400).json({ erreur: 'Transition non autorisée' });
        }
        res.status(200).json(await prisma.reservations.update({
        where: { id: Number(req.params.id) },
        data: { statut: req.body.statut }
    }));
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }

});

/**
 * @openapi
 * /reservation/{id}:
 *   delete:
 *     summary: Supprimer une réservation en fonction de son ID
 *     tags:
 *       - reservation
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
 *         description: reservation supprimée avec succès (aucun contenu renvoyé)
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (cette reservation ne vous appartient pas)
 *       404:
 *         description: reservaiton non trouvée
 */
router.delete('/:id', authentifier, exigeRole('voyageur'), async (req, res) => {
    try {
        const reservationExistante = await prisma.reservations.findUnique({
            where: { id: Number(req.params.id) }
        });
        if (!reservationExistante) {
            return res.status(404).json({ erreur: 'Réservation non trouvée' });
        }
        if (reservationExistante.voyageurId !== req.utilisateur.id) {
            return res.status(403).json({ erreur: 'Accès refusé : cette réservation ne vous appartient pas' });
        }
        if (!transitionValide(reservationExistante.statut, 'annulee')) {
            return res.status(400).json({ erreur: 'Transition non autorisée : impossible d\'annuler' });
        }
        
        res.status(200).json(await prisma.reservations.update({
            where: { id: Number(req.params.id) },
            data: { statut: "annulee" }
        }));
        
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

export default router;