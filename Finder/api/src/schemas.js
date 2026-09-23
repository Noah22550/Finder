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
export const schemaModifCompte = schemaInscription.partial();
export const schemaChambre = z.object({
    numero: z.string(),
    categorie: z.string(),
    capacite: z.number().int().positive(),
    prixNuit: z.number().positive(),
    description: z.string().optional(),
    disponible: z.boolean(),
    hotelId: z.number().int().positive()
});
export const schemaChambreModif = schemaChambre.partial();