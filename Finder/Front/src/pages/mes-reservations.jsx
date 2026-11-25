import { useEffect, useState } from 'react';
import { API } from '../config';
import { jeton } from '../auth';

export default function Mesreservations() {
  const [reservations, setReservations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let annule = false;

    fetch(`${API}/reservations/mine`, {
      headers: { Authorization: `Bearer ${jeton()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erreur lors de la récupération des réservations");
        return r.json();
      })
      .then((data) => { if (!annule) {
        setReservations(data);
        setChargement(false);
      }

      })
      .catch(() => { if (!annule) {
        setErreur("Impossible de charger vos réservations.");
        setChargement(false);
      }

      });
    return () => { annule = true; };
  }, [version]);
  const recharger = () => { setChargement(true); setErreur(null); setVersion(v => v + 1); };

  async function annuler(id) {
    try {
    const reponse = await fetch(`${API}/reservations/${id}`, { method: 'DELETE',
    headers: { Authorization: `Bearer ${jeton()}` } });
    if (!reponse.ok) {
      setErreur('Annulation refusée.');
      setVersion(v => v + 1);
        return;
    }
    recharger();
    } catch {
    setErreur('Service indisponible, réessayez plus tard.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes réservations</h2>

      {chargement && <p className="text-gray-600">Chargement de vos réservations...</p>}
      {erreur && <p className="text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{erreur}</p>}

      {!chargement && !erreur && reservations.length === 0 && (
        <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
          Vous n'avez effectuée aucune réservation pour le moment.
        </p>
        
      )}

      {!chargement && reservations.length > 0 && (
        <div className="space-y-4">
          {reservations.map((resa) => (
            <div 
              key={resa.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-sky-800">
                  Chambre n° {resa.chambre?.numero || resa.chambreId}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Du <span className="font-medium text-gray-800">{new Date(resa.dateArrivee).toLocaleDateString('fr-FR')}</span> au <span className="font-medium text-gray-800">{new Date(resa.dateDepart).toLocaleDateString('fr-FR')}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-sky-50 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full mb-1">
                  {resa.statut || 'Confirmée'}
                </span>
              </div>
              {(resa.statut === 'en_attente' || resa.statut === 'confirmee') && (
                <button type="button" onClick={() => annuler(resa.id)} className="bg-sky-700 hover:bg-sky-800 text-white font-semibold px-6 py-2.5 rounded-lg transition cursor-pointer">
                  Annuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}