import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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


app.listen(3000, () => {
    console.log("Serveur démarré !");
});