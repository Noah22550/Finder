import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config';
import { setJeton } from '../auth';

export default function Connexion({ onConnexion }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  
  const navigate = useNavigate();

  async function seConnecter(e) {
    e.preventDefault();
    setErreur(null);

    try {
      const reponse = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      });

      if (!reponse.ok) {
        throw new Error('Identifiants invalides');
      }

    const { token } = await reponse.json();
    setJeton(token);
    onConnexion();
    navigate('/recherche');
      
    } catch {
      setErreur('Email ou mot de passe incorrect.');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Connexion</h2>
        
        <form onSubmit={seConnecter} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={motDePasse} 
              onChange={(e) => setMotDePasse(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm transition duration-200"
          >
            Se connecter
          </button>
        </form>

        {erreur && (
          <p role="alert" className="mt-4 text-sm text-red-600 text-center font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            {erreur}
          </p>
        )}
      </div>
    </div>
  );
}