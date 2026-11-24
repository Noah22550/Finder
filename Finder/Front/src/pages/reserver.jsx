import { useState, useEffect } from 'react';
import './recherche.css';
import { useNavigate, useParams } from 'react-router-dom';
import FicheChambre from '../composants/FicheChambre';
import { API } from '../config';
import { jeton } from '../auth';

export default function Reserver() {
const { id } = useParams();
const navigate = useNavigate();

const [chambre, setChambre] = useState(null);
const [chargement, setChargement] = useState(true);
const [criteres, setCriteres] = useState({
  dateArrivee: '',
  dateDepart: '',
  nbPersonnes: '1',
  demandeSpeciale: '',
});
const [erreur, setErreur] = useState(null);
const [envoi, setEnvoi] = useState(false);

useEffect(() => {
  fetch(`${API}/chambres/${id}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => setChambre(data))
    .catch(() => setErreur('Impossible de charger la chambre.'))
    .finally(() => setChargement(false));
}, [id]);

  function changer(e) {
    setCriteres({ ...criteres, [e.target.name]: e.target.value });
  }
  

  // 2. La fonction async est ICI (pas sur le composant lui-même)
  async function reserver(e) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);

    try {
      const reponse = await fetch(`${API}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jeton()}`,
        },
        body: JSON.stringify({
          chambreId: Number(id),
          dateArrivee: criteres.dateArrivee,
          dateDepart: criteres.dateDepart,
          nbPersonnes: Number(criteres.nbPersonnes),
          demandeSpeciale: criteres.demandeSpeciale || undefined,
        }),
      });

      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      navigate('/mes-reservations');
    } catch {
      setErreur('Réservation refusée.');
    } finally {
      setEnvoi(false);
    }
  }

  // 3. Le JSX est dans le return
const INPUT =
  'w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500';

return (
  <div className="max-w-4xl mx-auto px-4 py-8">
    {/* Fiche de la chambre chargée */}
    {chargement && <p className="text-gray-500 mb-4">Chargement de la chambre...</p>}
    {chambre && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <FicheChambre chambre={chambre} hotel={chambre.hotel} />
      </div>
    )}

    {/* Un seul <form>, avec onSubmit={reserver} */}
    <form
      onSubmit={reserver}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Réserver</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <label className="text-sm font-medium text-gray-700">
          Arrivée
          <input
            type="date"
            name="dateArrivee"
            value={criteres.dateArrivee}
            onChange={changer}
            required
            className={INPUT}
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Départ
          <input
            type="date"
            name="dateDepart"
            value={criteres.dateDepart}
            onChange={changer}
            required
            className={INPUT}
          />
        </label>

        <label className="text-sm font-medium text-gray-700">
          Personnes
          <input
            type="number"
            name="nbPersonnes"
            value={criteres.nbPersonnes}
            onChange={changer}
            min="1"
            required
            className={INPUT}
          />
        </label>
      </div>

      <div className="mb-5">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Demande spéciale (optionnel)
        </label>
        <textarea
          id="message"
          name="demandeSpeciale"
          value={criteres.demandeSpeciale}
          onChange={changer}
          rows="2"
          placeholder="Ex: Arrivée tardive, lit bébé..."
          className={INPUT}
        />
      </div>

      {erreur && (
        <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {erreur}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={envoi}
          className="bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer"
        >
          {envoi ? 'Envoi...' : 'Réserver'}
        </button>
      </div>
    </form>
  </div>
);
}