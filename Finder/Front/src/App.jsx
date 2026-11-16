
import Recherche from './pages/recherche';
import FicheChambre from './composants/FicheChambre';
import ListeChambres from './composants/ListeChambres';
//import '@picocss/pico/css/pico.min.css';
import { useState } from 'react'; 

const hotel = {
  id: 1,
  nom: "Amor",
  adresse: "14 quai des Pêcheurs",
  codePostal: "17000",
  ville: "La Rochelle",
  description: "Hôtel de charme sur le vieux port offrant une vue imprenable sur les tours."
};
export default function App() {
  return (
    <div>
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold text-finder-primary">Finder</h1>
        <Recherche />
      </div>
    </div>
  );
}