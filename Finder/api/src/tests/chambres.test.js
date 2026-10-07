import request from 'supertest';
import { expect, describe, it, vi, afterEach } from 'vitest';
import app, { prisma } from '../app.js';
import jwt from 'jsonwebtoken';

afterAll(async () => {
    await prisma.$disconnect();
});

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
    it('GET /chambre?capcite', async() => {
      const categorie = "suite"
      const res = await request(app).get(`/chambres?categorie=${categorie}`)
      expect(res.status).toBe(200)

      res.body.forEach(chambre => {
        expect(chambre.categorie).toBe(categorie);
      });
    })

    it('GET /chambres renvoie 400 si un filtre est invalide', async () => {
        const res = await request(app).get('/chambres?categorie=chateau');

        expect(res.status).toBe(400);
        expect(res.body.erreurs).toBeDefined();
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
      // id 99 = id du compte de l'hotelier
      process.env.JWT_SECRET
    );
    //SpyOn = when de Java
    vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue({ 
      //id corespondant la chambre
      id: 10, 
      nom: 'Suite',
      hotelId: 42 // Correspond au token !
    });

    const deleteSpy = vi.spyOn(prisma.chambres, 'delete').mockResolvedValue({ 
      //pas hotelId car déjà récup en haut
      id: 10, 
      nom: 'Suite' 
    });
    const res = await request(app).delete('/chambres/10').set('Authorization', `Bearer ${fauxToken}`);

    expect(res.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 10 } });
  });

  it('DELETE /chambres/:id renvoie 404 si la chambre n\'existe pas', async () => {
    process.env.JWT_SECRET = 'secret_de_test';
    const fauxToken = jwt.sign({ id: 99, role: 'hotelier', hotelId: 42 }, process.env.JWT_SECRET);

    vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue(null);
    const deleteSpy = vi.spyOn(prisma.chambres, 'delete');

    const res = await request(app).delete('/chambres/999999').set('Authorization', `Bearer ${fauxToken}`);

    expect(res.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

describe('POST /chambres', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /chambres renvoie 400 si le corps est invalide', async () => {
    process.env.JWT_SECRET = 'secret_de_test';
    const fauxToken = jwt.sign({ id: 99, role: 'hotelier', hotelId: 42 }, process.env.JWT_SECRET);
    const createSpy = vi.spyOn(prisma.chambres, 'create');

    const res = await request(app)
      .post('/chambres')
      .set('Authorization', `Bearer ${fauxToken}`)
      .send({ numero: '12', categorie: 'chateau', capacite: -1 }); // catégorie hors enum, capacité négative, champs manquants

    expect(res.status).toBe(400);
    expect(res.body.erreurs).toBeDefined();
    expect(createSpy).not.toHaveBeenCalled(); // Zod bloque avant la BDD
  });
});

describe('PATCH /chambres/:id', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('PATCH /chambres/:id renvoie 403 si la chambre appartient à un autre hôtel', async () => {
    process.env.JWT_SECRET = 'secret_de_test';
    const fauxToken = jwt.sign({ id: 99, role: 'hotelier', hotelId: 42 }, process.env.JWT_SECRET);

    vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue({
      id: 10,
      hotelId: 7 // différent du hotelId du token (42)
    });
    const updateSpy = vi.spyOn(prisma.chambres, 'update');

    const res = await request(app)
      .patch('/chambres/10')
      .set('Authorization', `Bearer ${fauxToken}`)
      .send({ prixNuit: 120 });

    expect(res.status).toBe(403);
    expect(updateSpy).not.toHaveBeenCalled();
  });
  it('doit filtrer les chambres selon les dates de réservation (TA-004)', async () => {
    // 1. On cherche avec un chevauchement (chambre 4 occupée) -> 31 chambres attendues
    const resOccuped = await request(app)
        .get('/chambres?date_debut=2026-10-10&date_fin=2026-10-12');
    
    expect(resOccuped.status).toBe(200);
    expect(resOccuped.body).toHaveLength(31);

    // 2. On décale d'un jour (chambre 4 libérée) -> 32 chambres attendues
    const resFree = await request(app)
        .get('/chambres?date_debut=2026-10-11&date_fin=2026-10-13');
    
    expect(resFree.status).toBe(200);
    expect(resFree.body).toHaveLength(32);
});
});