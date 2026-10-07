import request from 'supertest';
import { expect, describe, it, vi, afterEach, afterAll } from 'vitest';
import app, { prisma } from '../app.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// ----------------- OUTILS DU TEST -----------------

process.env.JWT_SECRET = 'secret_de_test';

// Faux token d'un voyageur (id 5) signé avec le secret de test
const fauxTokenVoyageur = jwt.sign({ id: 5, role: 'voyageur' }, process.env.JWT_SECRET);

afterAll(async () => {
    await prisma.$disconnect();
});

describe('auth', () => {
    afterEach(() => {
        vi.restoreAllMocks(); // Nettoyage des espions Prisma
    });

    // ----------------- 200 -----------------

    it('POST /auth/login renvoie 200 et un token si les identifiants sont valides', async () => {
        vi.spyOn(prisma.comptes, 'findUnique').mockResolvedValue({
            id: 5,
            email: 'voyageur@test.fr',
            motDePasse: await bcrypt.hash('123456', 4), // hash du mot de passe envoyé
            role: 'voyageur',
            hotelId: null
        });

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'voyageur@test.fr', motDePasse: '123456' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();

        // Le token contient bien les infos du compte
        const contenu = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(contenu.id).toBe(5);
        expect(contenu.role).toBe('voyageur');
    });

    it('GET /auth/me renvoie 200 et le profil du voyageur connecté', async () => {
        const findSpy = vi.spyOn(prisma.comptes, 'findUnique').mockResolvedValue({
            id: 5,
            role: 'voyageur',
            email: 'voyageur@test.fr',
            nom: 'Morel',
            prenom: 'Alice'
        });

        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${fauxTokenVoyageur}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('voyageur@test.fr');
        expect(res.body.motDePasse).toBeUndefined(); // jamais renvoyé
        expect(findSpy).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 5 } }));
    });

    it('PATCH /auth/me renvoie 200 et le profil modifié', async () => {
        const updateSpy = vi.spyOn(prisma.comptes, 'update').mockResolvedValue({
            id: 5,
            email: 'voyageur@test.fr',
            nom: 'Morel',
            prenom: 'Alice',
            telephone: '0611223344'
        });

        const res = await request(app)
            .patch('/auth/me')
            .set('Authorization', `Bearer ${fauxTokenVoyageur}`)
            .send({ telephone: '0611223344' });

        expect(res.status).toBe(200);
        expect(res.body.telephone).toBe('0611223344');
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 5 },
            data: { telephone: '0611223344' }
        }));
    });

    // ----------------- 400 -----------------

    it('POST /auth/login renvoie 400 si le corps est invalide', async () => {
        const findSpy = vi.spyOn(prisma.comptes, 'findUnique');

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'pas-un-email', motDePasse: '123' }); // email invalide, mot de passe trop court

        expect(res.status).toBe(400);
        expect(res.body.erreurs).toBeDefined();
        expect(findSpy).not.toHaveBeenCalled(); // Zod bloque avant la BDD
    });
});

