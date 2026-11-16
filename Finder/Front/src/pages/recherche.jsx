import './recherche.css';
import ListeChambres from '../composants/ListeChambres';
import FicheHotel from '../composants/FicheHotel';
import FicheChambre from '../composants/FicheChambre';
import { useEffect, useState } from 'react';
import { API } from '../config';

export default function Recherche() {
  const [criteres, setCriteres] = useState({ hotel: '', date_debut: '', date_fin: '', capacite: '', prix_max: '', categorie: '' });
  const [chambres, setChambres] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [valides, setValides] = useState({});
  const [version, setVersion] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [selection, setSelection] = useState(null);

  // Fonction indispensable pour que tes inputs fonctionnent
  function changer(e) {
    setCriteres({ ...criteres, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    let annule = false;

    // Construction de q comme à la question 2
    const params = new URLSearchParams();
    for (const [cle, valeur] of Object.entries(valides)) {
      if (valeur !== '') params.set(cle, valeur);
    }
    const q = params.toString();

    // Appel 
    fetch(`${API}/chambres${q ? '?' + q : ''}`)
      .then(r => {if (!r.ok) throw new Error(`HTTP ${r.status}`);return r.json();})
      .then(data => { if (!annule) setChambres(data); })
      .catch(() => { 
        if (!annule) setErreur('Service indisponible, réessayez plus tard.'); 
      })
      .finally(() => { 
        if (!annule) setChargement(false); 
      });

   if (valides.hotel){
      fetch(`${API}/hotels/${valides.hotel}`)
      .then(request => {if (!request.ok) throw new Error(`HTTP ${request.status}`);return request.json();})
      .then(data => {if (!annule) setHotel(data); } )
      .catch(() => { 
        if (!annule) setErreur('Service indisponible, réessayez plus tard.'); 
      })
      .finally(() => { 
        if (!annule) setChargement(false); 
      });
    } else {
      setHotel(null); // On efface la fiche si aucun hôtel n'est cherché
    }
  return () => { annule = true; };
  }, [valides, version]);

  function rechercher(e) {
    e.preventDefault();
    setChargement(true);
    setSelection(null);
    setErreur(null);
    setValides(criteres);
    setVersion(v => v + 1);
  }

  return (
    <div className="formulaire-recherche">
      <h3>Rechercher une chambre</h3>
      <form onSubmit={rechercher}>
        <div className="grille-champs">
          <div className="champ-groupe">
            <label>Hôtel</label>
            <input name="hotel" value={criteres.hotel} onChange={changer} placeholder="Ex: Amor" />
          </div>
          <div className="champ-groupe">
            <label>Arrivée</label>
            <input type="date" name="date_debut" value={criteres.date_debut} onChange={changer} />
          </div>
          <div className="champ-groupe">
            <label>Départ</label>
            <input type="date" name="date_fin" value={criteres.date_fin} onChange={changer} />
          </div>
          <div className="champ-groupe">
            <label>Personnes</label>
            <input type="number" name="capacite" value={criteres.capacite} onChange={changer} min="1" />
          </div>
          <div className="champ-groupe">
            <label>Prix max (€)</label>
            <input type="number" name="prix_max" value={criteres.prix_max} onChange={changer} />
          </div>
          <div className="champ-groupe">
            <label>Catégorie</label>
            <select name="categorie" value={criteres.categorie} onChange={changer}>
              <option value="">Toutes</option>
              <option value="simple">Simple</option>
              <option value="double">Double</option>
              <option value="familiale">Familiale</option>
              <option value="suite">Suite</option>
            </select>
          </div>
        </div>
        <button type="submit" className="bouton-rechercher">Rechercher</button>
      </form>
      {chargement && <p>Chargement...</p>}
      {erreur && <p role="alert">{erreur}</p>}
      {!chargement && !erreur && hotel && <FicheHotel hotel={hotel}/>}
      {chambres.length > 0 && <p>{chambres.length} chambres</p>}
      {!chargement && !erreur && <ListeChambres chambres={chambres} onChoix={setSelection} />}
      {selection && (
        <div>
          <FicheChambre chambre={selection} hotel={hotel} />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold" onClick={() => setSelection(null)}>Fermer</button> 
        </div>
      )}
    </div>
  );
}