import { readFileSync, stat } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
const DATA_DIR = path.join(import.meta.dirname, '..', 'finder-data');
const lire = (fichier) => JSON.parse(readFileSync(path.join(DATA_DIR,fichier), 'utf8'));

async function main() {
    const chambres = lire('chambres.json');
    const comptes = lire('comptes.json');
    const hotels = lire('hotels.json');
    const reservations = lire('reservations.json')

    await prisma.reservations.deleteMany();
    await prisma.comptes.deleteMany();
    await prisma.chambres.deleteMany();
    await prisma.hotels.deleteMany();

    await prisma.hotels.createMany({
        data: hotels.map((h)=>({
            id: h.id,
            nom: h.nom,
            etoiles: h.etoiles,
            adresse: h.adresse,
            codePostal: h.code_postal,
            ville: h.ville,
            telephone: h.telephone,
            email: h.email,
            gerant: h.gerant,
            description: h.description
        })
    )
    })

    await prisma.chambres.createMany({
        data: chambres.map((l) => ({
            id: l.id,
            hotelId: l.hotel_id,
            numero: l.numero,
            categorie: l.categorie,
            capacite: l.capacite,
            prixNuit: l.prix_nuit,
            description:l.description,
            disponible: l.disponible
        })),
    });
    const comptesHaches = await Promise.all(
        comptes.map(async(c) => ({
                id: c.id,
                role: c.role,
                email: c.email,
                motDePasse: await bcrypt.hash(c.mot_de_passe_clair, 10),
                nom: c.nom,
                prenom: c.prenom,
                hotelId: c.hotel_id ?? null,
                telephone: c.telephone ?? null,
                note: c.note ?? null

            }))
    );
    await prisma.comptes.createMany({data: comptesHaches})
    
    await prisma.reservations.createMany({
        data: reservations.map((r)=>({
            id: r.id,
            voyageurId: r.voyageur_id,
            chambreId: r.chambre_id,
            dateArrivee: new Date(r.date_arrivee),
            dateDepart: new Date(r.date_depart),
            nbPersonnes: r.nb_personnes,
            statut: r.statut,
            demandeSpecial: r.demande_special ?? null
        }))
    })
    console.log(`${chambres.length} chambres, ${comptes.length} comptes,
${hotels.length} hoptels, ${reservations.length} reservations`);
}


main()
    .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
 })

 .finally(() => prisma.$disconnect())