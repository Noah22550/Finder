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


    it('PATCH /voyageurs/me renvoie 200 et le profil modifié', async () => {
        const updateSpy = vi.spyOn(prisma.comptes, 'update').mockResolvedValue({
            id: 5,
            email: 'voyageur@test.fr',
            nom: 'Morel',
            prenom: 'Alice',
            telephone: '0611223344'
        });

        const res = await request(app)
            .patch('/voyageurs/me')
            .set('Authorization', `Bearer ${fauxTokenVoyageur}`)
            .send({ telephone: '0611223344' });

        expect(res.status).toBe(200);
        expect(res.body.telephone).toBe('0611223344');
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 5 },
            data: { telephone: '0611223344' }
        }));
    });

});

