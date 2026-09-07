// server.js
const express = require('express');
// require charge le module installé dans node_modules ; le nom est celui du paquet npm

const app = express();
// express() fabrique l'application : c'est sur cet objet qu'on accroche routes et middlewares

// Middleware : parse le JSON du corps des requêtes
app.use(express.json());
// sans ce middleware, req.body vaut undefined sur un POST. C'est l'oubli
// le plus fréquent des premières APIs : le corps arrive, personne ne le lit

// Route GET /
app.get('/', (req, res) => {
    // une route = une méthode HTTP + un chemin + une fonction. Rien de plus
    res.json({ message: 'API en ligne' });
    // res.json() sérialise ET pose l'en-tête Content-Type: application/json
});

// Démarrage
const PORT = 3000;
// 3000 par convention en développement. En production le port vient de l'environnement, comme
// tout ce qui change d'une machine à l'autre

app.listen(PORT, () => {
    // listen ouvre le port et rend la main aussitôt. Le programme ne se termine pas pour autant :
    // il attend des requêtes. La fonction fléchée est appelée une fois le port prêt
    console.log(`API écoute sur http://localhost:${PORT}`);
    // le gabarit ${PORT} relit la constante : une seule source de vérité pour le numéro
});