import request from 'supertest';
import { expect, describe, it, vi, beforeAll } from 'vitest';
import app, { prisma } from '../app.js';
import jwt from 'jsonwebtoken';

let tokenVoyageur;
let tokenHotelier;
let idReservationTest;
// ----------------- OUTILS DU TEST -----------------

beforeAll(() => {
    process.env.JWT_SECRET = 'secret_de_test';
    tokenVoyageur = jwt.sign({ id: 5, role: 'voyageur' }, process.env.JWT_SECRET);
    tokenHotelier = jwt.sign({ id: 1, role: 'hotelier', hotelId: 1 }, process.env.JWT_SECRET);
});
afterAll(async () => {
    await prisma.$disconnect();
});

describe('reservation', () => {

   it('get /reservations/mine doit renvoyer 401 ', async () => {
      const res = await request(app).get('/reservations/mine');
      expect(res.status).toBe(401);
    });

    it('get /reservations/mine', async() =>{
        const res = await request(app)
            .get('/reservations/mine') 
            .set('Authorization', `Bearer ${tokenVoyageur}`)

        //expect(res.status).toBe(200);
        expect([200, 404]).toContain(res.status);
    })
    it('GET /reservations/received' , async() => {
        const res = await request(app)
            .get('/reservations/received')
            .set('Authorization', `Bearer ${tokenHotelier}`)
        expect(res.status).toBe(200);
        //expect([200, 404]).toContain(res.status);
    })
    it('GET /reservations/received doit renvoyer 403 pour un voyageur', async () => {
        const res = await request(app)
            .get('/reservations/received')
            .set('Authorization', `Bearer ${tokenVoyageur}`);

        expect(res.status).toBe(403);
    });
it('doit renvoyer 404 si la réservation existe pas', async () => {
        vi.spyOn(prisma.reservations, 'findUnique').mockResolvedValue(null);
        const res = await request(app)
            .patch('/reservations/999999')
            .set('Authorization', `Bearer ${tokenHotelier}`)
            .send({ statut: 'confirmee' });
        
        expect(res.status).toBe(404);
        vi.restoreAllMocks();
    });

    it('doit modifier le statut avec succès (200)', async () => {
        vi.spyOn(prisma.reservations, 'findUnique').mockResolvedValue({
            id: idReservationTest,
            statut: 'en_attente',
            Chambres: { 
                hotelId: 1 
            } 
        });
        vi.spyOn(prisma.reservations, 'update').mockResolvedValue({
            id: idReservationTest,
            statut: 'confirmee'
        });
        const res = await request(app)
            .patch(`/reservations/${idReservationTest}`)
            .set('Authorization', `Bearer ${tokenHotelier}`)
            .send({ statut: 'confirmee' });
        
        expect(res.status).toBe(200);
        expect(res.body.statut).toBe('confirmee'); 
        vi.restoreAllMocks();
    });

    it('POST /reservations doit renvoyer 400 si le corps est invalide', async () => {
        const createSpy = vi.spyOn(prisma.reservations, 'create');
        const res = await request(app)
            .post('/reservations')
            .set('Authorization', `Bearer ${tokenVoyageur}`)
            .send({ chambreId: 'abc', nbPersonnes: -2 }); // dates manquantes, types invalides

        expect(res.status).toBe(400);
        expect(res.body.erreurs).toBeDefined();
        expect(createSpy).not.toHaveBeenCalled(); // Zod bloque avant la BDD
        vi.restoreAllMocks();
    });

    it('DELETE /reservations/:id doit renvoyer 403 si la réservation appartient à un autre voyageur', async () => {
        vi.spyOn(prisma.reservations, 'findUnique').mockResolvedValue({
            id: 1,
            voyageurId: -1, // n'est pas l'id du voyageur connecté
            statut: 'en_attente'
        });
        const updateSpy = vi.spyOn(prisma.reservations, 'update');
        const res = await request(app)
            .delete('/reservations/1')
            .set('Authorization', `Bearer ${tokenVoyageur}`);

        expect(res.status).toBe(403);
        expect(updateSpy).not.toHaveBeenCalled();
        vi.restoreAllMocks();
    });
})