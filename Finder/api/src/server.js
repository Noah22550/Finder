import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// MIDDLEWARE //

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

// GET //
app.get('/chambres', async (req, res) => {
    const { hotel, capacite, categorie, prixMax, date_debut, date_fin } = req.query;
    const where = {};
    // 2. On écrit dans les colonnes exactes attendues par Prisma
    if (hotel) {
        where.hotel_Id = Number(hotel); 
    }
    if (capacite) {
        where.capacite = { gte: Number(capacite) };
    }
    if (categorie) {
        where.categorie = categorie;
    }
    if (prixMax) {
        where.prix_nuit = { lte: Number(prixMax) }; 
    }
    // Le filtre des dates
    if (date_debut && date_fin) {
        where.Reservation = {
            none: {
                statut: 'confirmee',
                date_arrivee: { lt: new Date(date_fin) },
                date_depart: { gt: new Date(date_debut) }       
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
app.get('/voyageur/me', authentifier, async (req, res) => {
    const moi = await prisma.comptes.findUnique({
        where: { id: req.utilisateur.id},
        select: {id: true, role: true, email: true, nom: true, prenom: true}
    })
    res.json(moi)
})

// POST //

app.post('/auth/register', async(req, res) =>{
    const { email,motDePasse, nom, prenom, telephone, note} = req.body;
    const compte = await prisma.comptes.create({
        data:{email, motDePasse: await bcrypt.hash(motDePasse, 10), nom, prenom, telephone, note, role: 'voyageur'},
        select: {id: true, email: true, nom: true, prenom: true, telephone: true, note: true }
    })
    res.status(201).json(compte)
}  )

app.post('/auth/login', async (req, res) => {
    const { email, motDePasse } = req.body;
  

    const compte = await prisma.comptes.findUnique({ where: { email } });
    if (!compte || !(await bcrypt.compare(motDePasse, compte.motDePasse))) {
        return res.status(401).json({ erreur: 'identifiants invalides' });
    }

    const token = jwt.sign(
        { id: compte.id, role: compte.role },
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    res.json({ token });
});

app.post('/chambres', authentifier, async (req, res) => {
    res.status(201).json({ message: "Route protégée atteinte" });
});

app.post('/auth/logout', authentifier, (req, res) => {
    res.status(204).end();
});

app.post('/chambres', authentifier, async (req, res) => {
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
app.patch('/chambres', authentifier, async (req, res) => {
    try {
        const upChambre = await prisma.chambres.update({
            where: { id: Number(req.params.id) },
            data: {...req.body}
        });
        res.status(201).json(upChambre);
    } catch (erreur) {
        res.status(400).json({ erreur: erreur.message });
    }
});

app.patch('/voyageur/me', authentifier, async (req, res)=>{
    try{
        const upVoyageur = await prisma.comptes.update({
            where: {id: req.utilisateur.id},
            data: {...req.body}
        })
        res.status(201).json(upVoyageur)
    } catch (erreur){
        res.status(400).json({erreur: erreur.message})
    }

})

// DELETE //

app.delete('/chambres', authentifier, async (req, res) => {
    try {
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

