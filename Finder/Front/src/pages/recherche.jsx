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
  }, 
  [valides, version]);

  function rechercher(e) {
    e.preventDefault();
    setChargement(true);
    setSelection(null);
    setErreur(null);
    setValides(criteres);
    setVersion(v => v + 1);
  }
const INPUT = 'w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500';
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <form onSubmit={rechercher} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rechercher une chambre</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <label className="text-sm font-medium text-gray-700">Hôtel
            <input name="hotel" value={criteres.hotel} onChange={changer} placeholder="Ex: Amor ou ID" className={INPUT} />
          </label>
          <label className="text-sm font-medium text-gray-700">Arrivée
            <input type="date" name="date_debut" value={criteres.date_debut} onChange={changer} className={INPUT} />
          </label>
          <label className="text-sm font-medium text-gray-700">Départ
            <input type="date" name="date_fin" value={criteres.date_fin} onChange={changer} className={INPUT} />
          </label>
          <label className="text-sm font-medium text-gray-700">Personnes
            <input type="number" name="capacite" value={criteres.capacite} onChange={changer} min="1" placeholder="1" className={INPUT} />
          </label>
          <label className="text-sm font-medium text-gray-700">Prix max (€)
            <input type="number" name="prix_max" value={criteres.prix_max} onChange={changer} placeholder="Ex: 150" className={INPUT} />
          </label>
          <label className="text-sm font-medium text-gray-700">Catégorie
            <select name="categorie" value={criteres.categorie} onChange={changer} className={INPUT}>
              <option value="">Toutes</option>
              <option value="simple">Simple</option>
              <option value="double">Double</option>
              <option value="familiale">Familiale</option>
              <option value="suite">Suite</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-sky-700 hover:bg-sky-800 text-white font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer">
            Rechercher
          </button>
        </div>
      </form>

      {chargement && <p className="text-center text-gray-500 py-8">Chargement...</p>}
      {erreur && <p role="alert" className="mb-6 text-sm text-red-600 text-center bg-red-50 p-4 rounded-xl border border-red-100">{erreur}</p>}

      {!chargement && !erreur && (
        <>
          {hotel && <div className="mb-6"><FicheHotel hotel={hotel} /></div>}
          <p className="text-sm font-semibold text-gray-600 mb-4">
            {chambres.length} chambre{chambres.length > 1 ? 's' : ''}
          </p>
          <ListeChambres chambres={chambres} onChoix={setSelection} />
        </>
      )}

      {selection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelection(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <FicheChambre chambre={selection} hotel={hotel} />
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelection(null)} className="bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}