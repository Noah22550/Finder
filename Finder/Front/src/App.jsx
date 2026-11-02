import FicheHotel from './composants/FicheHotel';
import FicheChambre from './composants/FicheChambre';
import ListeChambres from './composants/ListeChambres';

const hotel = {
  id: 1,
  nom: "Amor",
  adresse: "14 quai des Pêcheurs",
  codePostal: "17000",
  ville: "La Rochelle",
  description: "Hôtel de charme sur le vieux port offrant une vue imprenable sur les tours."
};

// Données corrigées pour correspondre exactement à l'API (GET /chambres/1)
const listeChambres = [
  {
    id: 1,
    nom: "Chambre 101",
    numero: "101",
    categorie: "simple",
    prixNuit: 69
  },
  {
    id: 2,
    nom: "Chambre 102",
    numero: "102",
    categorie: "double",
    prixNuit: 99
  }
];



const chambres = [...listeChambres];

export default function App() {
  return (
    <div>
      <h1>FINDER</h1>
      <FicheHotel Hotel={hotel} />
      <FicheChambre chambre={listeChambres[0]} hotel={hotel} />
      <FicheChambre chambre={listeChambres[1]} hotel={hotel} />
      <ListeChambres chambres={chambres} />
    </div>
  
  );
}