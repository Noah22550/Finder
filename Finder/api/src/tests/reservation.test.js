import request from 'supertest';
import { expect, describe, it, vi, afterEach, beforeAll } from 'vitest';
import app, { prisma } from '../app.js';
import jwt from 'jsonwebtoken';

let tokenVoyageur;
let tokenHotelier;
let idReservationTest;
// ----------------- OUTILS COMMUNS -----------------

beforeAll(async () => {
    // Connexion d'un compte voyageur
    const resVoyageur = await request(app)
      .post('/auth/login')
      .send({ email: 'voyageur@test.fr', motDePasse: '123456' });
     tokenVoyageur = resVoyageur.body.token;

    // Connexion d'un compte hôtelier
    const resHotelier = await request(app)
      .post('/auth/login')
      .send({ email: 'hotelier@test.fr', motDePasse: '123456' });
    tokenHotelier = resHotelier.body.token;
  });
afterAll(async () => {
    await prisma.$disconnect();
});


// Corps valide pour POST /reservation
const corpsReservationValide = {
  chambreId: 10,
  dateArrivee: '2026-11-01',
  dateDepart: '2026-11-05',
  nbPersonnes: 3,
  demandeSpecial: 'Lit bébé'
};

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
})