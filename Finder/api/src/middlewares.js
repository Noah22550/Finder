import jwt from 'jsonwebtoken';

// MIDDLEWARE & zod //
export function validerCorps(schema) {
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
export function validerQuery(schema) {
    return (req, res, next) => {
        const validation = schema.safeParse(req.query); // On regarde req.query !
        if (!validation.success) {
            return res.status(400).json({ erreurs: validation.error.issues });
        }
            req.queryValide = validation.data; 
        next();
    };
}

export function authentifier(req, res, next) {
    const entete = req.headers.authorization || '';
    const token = entete.replace('Bearer ', '');
    try {
        req.utilisateur = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erreur: 'jeton absent ou invalide' });
    }
}
export function exigeRole(...roles) {
    return (req, res, next) =>
    roles.includes(req.utilisateur.role) ? next() : res.status(403).json({
    erreur: 'acces refuse' });
}
