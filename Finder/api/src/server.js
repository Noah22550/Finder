require('dotenv').config(); // Doit être en première ligne
const express = require('express');

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Route GET /health
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API écoute sur http://localhost:${PORT}`);
});