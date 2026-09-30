import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { schemaInscription, schemaConnexion, schemaModifCompte, schemaChambre, schemaChambreModif, schemaChambreGet, schemaReservation,schemaStatutReservation } from './schemas.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// MIDDLEWARE & zod //
function validerCorps(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ erreurs: validation.error.issues });
        }
        req.body = validation.data; 
        next();
    };
}
// pour validerQuery, on va regarder req.query au lieu de req.body donc pour les GET
function validerQuery(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.query); // On regarde req.query !
        if (!validation.success) {
            return res.status(400).json({ erreurs: validation.error.issues });
        }
            req.queryValide = validation.data; 
        next();
    };
}

function authentifier(req, res, next) {
    const entete = req.headers.authorization || '';
    const token = entete.replace('Bearer ', '');
    try {
        req.utilisateur = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erreur: 'jeton absent ou invalide' });
    }
}
function exigeRole(...roles) {
    return (req, res, next) =>
    roles.includes(req.utilisateur.role) ? next() : res.status(403).json({
    erreur: 'acces refuse' });
}

// GET //
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
app.get('/chambres', validerQuery(schemaChambreGet), async (req, res) => {
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
app.get('/chambres/:id', async (req, res) => {
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
app.get('/hotels', async (req, res) => {
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
app.get('/hotels/:id', async (req,res) =>{
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
app.get('/hotels/:id/chambres', async (req,res) =>{
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
app.get('/voyageur/me', authentifier,exigeRole('voyageur'), async (req, res) => {
    const moi = await prisma.comptes.findUnique({
        where: { id: req.utilisateur.id},
        select: {id: true, role: true, email: true, nom: true, prenom: true}
    })
    res.json(moi)
})
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
app.get('/reservations/mine', authentifier, exigeRole('voyageur'), async (req, res) => {
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
app.get('/reservations/received', authentifier, exigeRole('hotelier'), async (req, res) => {
    const reservations = await prisma.reservations.findMany({
        where: { Chambres: { hotelId: req.utilisateur.hotelId } },
        orderBy: { dateArrivee: 'asc' }
    });
    if(reservations.length === 0){
        return res.status(404).json({error: 'Aucune réservation trouvée pour cet hôtel'});
    }
    res.json(reservations);
});
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
app.post('/auth/register', validerCorps(schemaInscription), async (req, res) => {
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
app.post('/auth/login',validerCorps(schemaConnexion), async (req, res) => {
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
app.post('/auth/logout', authentifier, (req, res) => {
    res.status(204).end();
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
app.post('/chambres', authentifier, exigeRole('hotelier'), validerCorps(schemaChambre), async (req, res) => {
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
app.post('/reservation', authentifier, exigeRole('voyageur'), validerCorps(schemaReservation), async (req, res) => {
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

// Patch //
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
app.patch('/chambres/:id', authentifier, exigeRole('hotelier'), validerCorps(schemaChambreModif), async (req, res) => {
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
app.patch('/voyageur/me', authentifier, exigeRole('voyageur'), validerCorps(schemaModifCompte), async (req, res) => {
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
app.patch('/reservations/:id', authentifier, exigeRole('hotelier'), validerCorps(schemaStatutReservation), async (req, res) => {
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


// DELETE //
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
app.delete('/chambres/:id', authentifier,exigeRole( 'hotelier'), async (req, res) => {
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
app.delete('/reservations/:id', authentifier, exigeRole('voyageur'), async (req, res) => {
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

const spec = swaggerJsdoc({
 definition: {
 openapi: '3.0.0',
 info: { title: 'API Finder', version: '1.0.0' },
 components: { securitySchemes: { bearerAuth: { type: 'http', scheme:
'bearer', bearerFormat: 'JWT' } } },
 },
    apis: ['./src/**/*.js', './src/server.js', './server.js'],
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));


app.listen(process.env.PORT, () => {
    console.log("Serveur démarré !");
});

