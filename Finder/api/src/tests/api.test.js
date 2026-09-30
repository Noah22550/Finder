import request from 'supertest';
import app from '../app.js';
import { expect } from 'vitest';

describe('GET /chambre', () => {

   it('GET /chambres', async () => {
      // When
      const totalChambres = await request(app).get('/chambres');
      // Then
      expect(totalChambres.status).toBe(200);

    });
    it('GET /chambres?hotelId', async() =>{
        //when
        const hotelId = 1;
        const hotelChambres = await request(app).get(`/chambres?hotel=${hotelId}`);
        //then
        expect(hotelChambres.status).toBe(200);
        hotelChambres.body.forEach(chambre => {
          expect(chambre.hotelId).toBe(hotelId);
        });
    })
    it('GET /chambres?capacite', async () => {
      const capacite = 2;

      const res = await request(app).get(`/chambres?capacite=${capacite}`);

      expect(res.status).toBe(200);

      res.body.forEach(chambre => {
        expect(chambre.capacite).toBeGreaterThanOrEqual(capacite);
      });
    });
    it('GET /chambres/:id renvoie 400 si l\'ID est invalide', async () => {
        const id = 'abc';

        const res = await request(app).get(`/chambres/${id}`);

        expect(res.status).toBe(400);
    });

    it('GET /chambres/:id renvoie 404 si la chambre n\'existe pas', async () => {
        const id = 999999;

        const res = await request(app).get(`/chambres/${id}`);

        expect(res.status).toBe(404);
    });
});