import { z } from 'zod';
export const schemaInscription = z.object({
  email: z.string().email({ message: 'email invalide' }),
  motDePasse: z.string().min(6, { message: 'mot de passe trop court' }),
  nom: z.string(),
  prenom: z.string(),
  telephone: z.string().optional(),
  note: z.string().optional()
});
export const schemaConnexion = z.object({
  email: z.string().email({ message: 'email invalide' }),
  motDePasse: z.string().min(6, { message: 'mot de passe trop court' })
});
export const schemaModifCompte = z.object({
    nom: z.string(),
    prenom: z.string(),
    telephone: z.string()
}).partial();
   export const schemaChambre = z.object({
       numero: z.string(),
       categorie: z.enum(['simple', 'double', 'familiale', 'suite']),
       capacite: z.number().int().positive(),
       prixNuit: z.number().positive(),   // Prisma : Int, donc .int()
       description: z.string(),
       disponible: z.boolean()
   })

export const schemaChambreGet = z.object({
    hotel: z.coerce.number().int().positive().optional(),
    capacite: z.coerce.number().int().positive().optional(),
    prix_max: z.coerce.number().positive().optional(),
    categorie: z.enum(['simple', 'double', 'familiale', 'suite']).optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional()
});
export const schemaChambreModif = schemaChambre.partial();

export const schemaReservation = z.object({
    chambreId: z.number().int().positive(),
    dateArrivee: z.coerce.date(),
    dateDepart: z.coerce.date(),
    nbPersonnes: z.number().int().positive(),
    demandeSpecial: z.string().optional()
});
export const schemaStatutReservation = z.object({
    statut: z.enum(['confirmee', 'refusee'])
});