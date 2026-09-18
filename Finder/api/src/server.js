import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/chambres', async (req, res) => {
    const { hotelId, capacite, categorie, prixMax, dateDebut, dateFin } = req.query;
    // 1. On prépare un filtre vide par défaut
    const where = {};
    // 3. Remplissage du filtre condition par condition
    if (hotelId) {
        where.hotelId = Number(hotelId);
    }
    if (capacite) {
        // "Au moins" = supérieur ou égal (gte)
        where.capacite = {gte: Number(capacite)};
    }
    if (categorie) {
        where.categorie = categorie; // Pas de conversion, c'est du texte
    }
    if (prixMax) {
        // "Maximum" = inférieur ou égal (lte)
         where.prixNuit = {lte: Number(prixMax)};
        }
         // On veut les chambres qui n'ont pas de réservation qui chevauche la période demandée
        if (dateDebut && dateFin) {
           
            where.reservations = {
                none: {
                    OR: [
                        {
                            statut: 'confirmee',
                            dateDebut: { lte: new Date(dateFin) },
                            dateFin: { gte: new Date(dateDebut) }
                        }
                    ]
                }
            }
        }
    // 4. Exécution de la requête Prisma
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