import FicheHotel from './composants/FicheHotel';
import FicheChambre from './composants/FicheChambre';
import ListeChambres from './composants/ListeChambres';
import { useState } from 'react'; 

const hotel = {
  id: 1,
  nom: "Amor",
  adresse: "14 quai des Pêcheurs",
  codePostal: "17000",
  ville: "La Rochelle",
  description: "Hôtel de charme sur le vieux port offrant une vue imprenable sur les tours."
};

const listeChambres = [
  { id: 1, hotelId: 1, numero: "101", categorie: "simple", capacite: 1, prixNuit: 69 },
  { id: 2, hotelId: 1, numero: "102", categorie: "simple", capacite: 1, prixNuit: 69 },
  { id: 3, hotelId: 1, numero: "103", categorie: "simple", capacite: 1, prixNuit: 69 },
  { id: 4, hotelId: 1, numero: "104", categorie: "double", capacite: 2, prixNuit: 95 },
  { id: 5, hotelId: 1, numero: "105", categorie: "double", capacite: 2, prixNuit: 95 },
  { id: 6, hotelId: 1, numero: "206", categorie: "double", capacite: 2, prixNuit: 95 },
  { id: 7, hotelId: 1, numero: "207", categorie: "double", capacite: 2, prixNuit: 95 },
  { id: 8, hotelId: 1, numero: "208", categorie: "double", capacite: 2, prixNuit: 95 },
  { id: 9, hotelId: 1, numero: "209", categorie: "double", capacite: 2, prixNuit: 95 },
  { id: 10, hotelId: 1, numero: "210", categorie: "familiale", capacite: 4, prixNuit: 149 },
  { id: 11, hotelId: 1, numero: "211", categorie: "familiale", capacite: 4, prixNuit: 149 },
  { id: 12, hotelId: 1, numero: "212", categorie: "suite", capacite: 2, prixNuit: 189 }
];

export default function App() {
  const [selection, setSelection] = useState(null); 
  const [chambres] = useState(listeChambres); 
  return (
    <div>
      <center>
      <h1 className="text-6xl font-bold text-finder-primary">Finder</h1>
      {chambres.length > 0 && (

        <p className="text-lg text-finder-primary underline" > {chambres.length} chambres disponibles</p>
      )}
      <ListeChambres chambres={chambres} onChoix={setSelection} /> 
      {selection && (
        <div>
          <FicheChambre chambre={selection} hotel={hotel} />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setSelection(null)}>Fermer</button> 
        </div>
      )} 
    </center>
    </div>
  );
}