import request from 'supertest';
import { expect, describe, it, vi, afterEach, afterAll } from 'vitest';
import app, { prisma } from '../app.js';

afterAll(async () => {
    await prisma.$disconnect();
});

describe('hotels', () => {
    afterEach(() => {
        vi.restoreAllMocks(); // Nettoyage des espions Prisma
    });

    // ----------------- 200 -----------------

    it('GET /hotels renvoie 200 et la liste des hôtels', async () => {
        vi.spyOn(prisma.hotels, 'findMany').mockResolvedValue([
            { id: 1, nom: 'Hôtel du Lac' },
            { id: 2, nom: 'Hôtel des Alpes' }
        ]);

        const res = await request(app).get('/hotels');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
    });

    it('GET /hotels/:id renvoie 200 et l\'hôtel demandé', async () => {
        const findSpy = vi.spyOn(prisma.hotels, 'findUnique').mockResolvedValue({
            id: 1,
            nom: 'Hôtel du Lac'
        });

        const res = await request(app).get('/hotels/1');

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
        expect(findSpy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('GET /hotels/:id/chambres renvoie 200 et les chambres de l\'hôtel', async () => {
        vi.spyOn(prisma.chambres, 'findMany').mockResolvedValue([
            { id: 10, hotelId: 1, categorie: 'simple' },
            { id: 11, hotelId: 1, categorie: 'suite' }
        ]);

        const res = await request(app).get('/hotels/1/chambres');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        res.body.forEach(chambre => {
            expect(chambre.hotelId).toBe(1);
        });
    });

    // ----------------- 400 -----------------

    it('GET /hotels/:id/chambres renvoie 400 si l\'ID est invalide', async () => {
        const findSpy = vi.spyOn(prisma.chambres, 'findMany');

        const res = await request(app).get('/hotels/abc/chambres');

        expect(res.status).toBe(400);
        expect(findSpy).not.toHaveBeenCalled(); // la BDD n'est pas interrogée
    });
    
});

