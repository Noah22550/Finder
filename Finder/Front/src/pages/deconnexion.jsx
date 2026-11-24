import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config';
import { jeton, setJeton } from '../auth';

export default function Deconnexion({ onDeconnexion }) {
  const navigate = useNavigate();

  async function seDeconnecter() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jeton()}` },
      });
    } catch {
      // Même si l'API ne répond pas, on vide le jeton côté front
    }

    startTransition(() => {
      setJeton(null);
      onDeconnexion();
      navigate('/Accueil');
    });
  }

  return (
    <button
      onClick={seDeconnecter}
      className="hover:text-sky-600 transition cursor-pointer"
    >
      Déconnexion
    </button>
  );
}