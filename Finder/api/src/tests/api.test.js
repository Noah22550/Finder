import request from 'supertest';
import app from '../app.js';
import { expect, describe, it, vi, afterEach } from 'vitest';
import app, { prisma } from '../app.js';
import jwt from 'jsonwebtoken';

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
     // When
      const capacite = 2;
      const res = await request(app).get(`/chambres?capacite=${capacite}`);

      // Then
      expect(res.status).toBe(200);

      res.body.forEach(chambre => {
        expect(chambre.capacite).toBeGreaterThanOrEqual(capacite);
      });
    });
    it('GET /chambres?prix_max ' , async () => {
      const prixMax = 70;
      const res = await request(app).get(`/chambres?prix_max=${prixMax}`);

      expect(res.status).toBe(200);

      res.body.forEach(chambre => {
        expect(chambre.prixNuit).toBeLessThanOrEqual(prixMax);
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
describe('DELETE /chambres/:id', () => {
  afterEach(() => {
    vi.restoreAllMocks(); // Nettoyage de nos espions Prisma
  });

it('utiliser un mock pour DELETE sans toucher la BDD', async () => {
    process.env.JWT_SECRET = 'secret_de_test';

    const fauxToken = jwt.sign(
      { id: 99, role: 'hotelier', hotelId: 42 },
      process.env.JWT_SECRET
    );
    vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue({ 
      id: 10, 
      nom: 'Suite',
      hotelId: 42 // 👈 Correspond au token !
    });

    const deleteSpy = vi.spyOn(prisma.chambres, 'delete').mockResolvedValue({ 
      id: 10, 
      nom: 'Suite' 
    });

    
    const res = await request(app)
      .delete('/chambres/10')
      .set('Authorization', `Bearer ${fauxToken}`);
    expect(res.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 10 } });
  });
});