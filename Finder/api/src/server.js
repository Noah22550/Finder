import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/chambres', async (req, res) => {

    res.json(await prisma.chambres.findMany({ orderBy: { id: 'asc' } }));
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