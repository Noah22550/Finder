import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';


const hotels = JSON.parse(readFileSync(path.join((import.meta.dirname), '..', 'finder-data', 'hotels.json'), 'utf8'));
const chambres = JSON.parse(readFileSync(path.join((import.meta.dirname), '..', 'finder-data', 'chambres.json'), 'utf8'));

const app = express();
app.use(express.json());
app.get('/chambres', (req, res)=> {   
                                const prix = Number(req.query.prix_max);
                                const chambre = chambres.filter(c => c.prix_nuit <= prix);
        if(isNaN(prix)){
           return res.json(chambres);
        }
        res.json(chambre)
})
app.get('/chambres/:id', (req, res)=> {const id = Number(req.params.id);
                                      const chambre = chambres.find(c => c.id === id); 
    if(!chambre) return res.status(404).json(
        {
            erreur:"chambre introuvable"
        });
    res.json(chambre);
})

app.get('/hotels', (req, res) => res.json(hotels));
app.get('/hotels/:id', (req, res) => {
 const id = Number(req.params.id);
 const hotel = hotels.find(h => h.id === id);

 if (!hotel) return res.status(404).json(
    { 
        erreur: 'hotel introuvable'
    });
    res.json(hotel);
});


app.listen(process.env.PORT ?? 3000 );