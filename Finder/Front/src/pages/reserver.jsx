import { useState, useEffect } from 'react';
import './recherche.css';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../config';
import { jeton } from '../auth';

export default function Reserver() {
    useEffect(() => {
    fetch(`${API}/chambres/${id}`, {
        headers: { Authorization: `Bearer ${jeton()}` },
    })
        .then((r) => {
        if (!r.ok) throw new Error("Erreur lors de la récupération de votre chambre");
        return r.json();
        })
        .then((data) => {
            setReservations(data);
            setChargement(false);
        })
            .catch(() => {
                setErreur("Impossible de charger vos réservations.");
                setChargement(false);
            });
    }, []);
  // 1. Les hooks TOUJOURS à l'intérieur du composant
  const { id } = useParams();
  const navigate = useNavigate();

  const [criteres, setCriteres] = useState({
    dateArrivee: '',
    dateDepart: '',
    nbPersonnes: '',
    demandeSpeciale: '',
  });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

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
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <form className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Réserver</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

          <label className="text-sm font-medium text-gray-700">Arrivée
            <input type="date" name="date_debut" />
          </label>
          <label className="text-sm font-medium text-gray-700">Départ
            <input type="date" name="date_fin"  />
          </label>
          <label className="text-sm font-medium text-gray-700">Personnes
            <input type="number" name="capacite" />
          </label>
          <div>
            <label for="message">Message :</label>
            <textarea id="message" name="message" rows="1"></textarea>
          </div>
        </div>
        <div onSubmit={reserver}>
            {/* Tes champs contrôlés (dateArrivee, dateDepart, nbPersonnes, demandeSpeciale) */}
            {erreur && <p role="alert">{erreur}</p>}
            <button type="submit" disabled={envoi}>
            {envoi ? 'Envoi...' : 'Réserver'}
            </button>
        </div>
        </form>
    </div>
  );
}