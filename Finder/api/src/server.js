import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { schemaInscription, schemaConnexion, schemaModifCompte, schemaChambre, schemaChambreModif, schemaChambreGet } from './schemas.js';

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
function validerQuery(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.query); // On regarde req.query !
        if (!validation.success) {
            return res.status(400).json({ erreurs: validation.error.issues });
        }
        req.query = validation.data; 
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
//app.post('/livres', authentifier, exigeRole('bibliothecaire'), creer);
//app.get('/adherents/me', authentifier, exigeRole('adherent'), monProfil);

// GET //
app.get('/chambres', validerQuery(schemaChambreGet), async (req, res) => {
    const { hotel, capacite, categorie, prixMax, date_debut, date_fin } = req.query;
    const where = {};
    // 2. On écrit dans les colonnes exactes attendues par Prisma
    if (hotel) {where.hotel_Id = Number(hotel); }
    if (capacite) { where.capacite = { gte: Number(capacite) };}
    if (categorie) {where.categorie = categorie;}
    if (prixMax) {where.prix_nuit = { lte: Number(prixMax) }; }
    // Le filtre des dates
    if (date_debut && date_fin) {
        where.Reservation = {
            none: {
                statut: 'confirmee',
                dateArrivee: { lt: new Date(date_fin) },
                dateDepart: { gt: new Date(date_debut) }       
            }
        }   
    }   
    const chambres = await prisma.chambres.findMany({
        where: where,
        orderBy: { id: 'asc' }
    });

    res.json(chambres);
});
app.get('/chambres/:id', async (req, res) => {
        const chambre = await prisma.chambres.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!chambre) {
            return res.status(404).json({ error: 'Chambre non trouvée' });
        }
        res.json(chambre);
});

app.get('/hotels', async (req, res) => {
    res.json(await prisma.hotels.findMany({ orderBy: { id: 'asc' } }));
});

app.get('/hotels/:id', async (req,res) =>{
    const hotel = await prisma.hotels.findUnique({
        where: {id: Number(req.params.id)},
    });
    if(!hotel){
        return res.status(404).json({error: 'Hotel non trouvé'});
    }
    res.json(hotel);
});
app.get('/hotels/:id/chambres', async (req,res) =>{
    const chambres = await prisma.chambres.findMany({
        where: {hotelId: Number(req.params.id)},
        orderBy: {id: 'asc'},
    });
    if(chambres.length === 0){
        return res.status(404).json({error: 'Aucune chambre trouvée pour cet hôtel'});
    }
    res.json(chambres);
});
app.get('/voyageur/me', authentifier,exigeRole('voyageur'), async (req, res) => {
    const moi = await prisma.comptes.findUnique({
        where: { id: req.utilisateur.id},
        select: {id: true, role: true, email: true, nom: true, prenom: true}
    })
    res.json(moi)
})

// POST //

app.post('/auth/register', validerCorps(schemaInscription), async(req, res) =>{
    const { email,motDePasse, nom, prenom, telephone, note} = req.body;
    const compte = await prisma.comptes.create({
        data:{email, motDePasse: await bcrypt.hash(motDePasse, 10), nom, prenom, telephone, note, role: 'voyageur'},
        select: {id: true, email: true, nom: true, prenom: true, telephone: true, note: true }
    })
    res.status(201).json(compte)
}  )

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


app.post('/auth/logout', authentifier, (req, res) => {
    res.status(204).end();
});

app.post('/chambres', authentifier, exigeRole('hotelier'), validerCorps(schemaChambre), async (req, res) => {
    try {
        const newChambre = await prisma.chambres.create({
            data: {...req.body,}
        });
        res.status(201).json(newChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

// Patch //
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

app.patch('/voyageur/me', authentifier, exigeRole('voyageur'), validerCorps(schemaModifCompte), async (req, res) => {
    try {
        const donneesAModifier = { ...req.body };
        if (donneesAModifier.motDePasse) {
            donneesAModifier.motDePasse = await bcrypt.hash(donneesAModifier.motDePasse, 10);
        }

        const upVoyageur = await prisma.comptes.update({
            where: { id: req.utilisateur.id },
            data: donneesAModifier
        });
        res.status(200).json(upVoyageur);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

// DELETE //

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

// ecoute //

app.listen(process.env.PORT, () => {
    console.log("Serveur démarré !");
});

