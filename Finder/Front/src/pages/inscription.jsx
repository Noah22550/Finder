import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config';;

export default function Inscription() {
  const [criteres, setCriteres] = useState({ email: '', motDePasse: '', nom: '', prenom: '' });
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(false);

  function changer(e) {
    setCriteres({ ...criteres, [e.target.name]: e.target.value });
  }

  async function inscription(e) {
    e.preventDefault();
    setErreur(null);
    if (criteres.motDePasse.length < 6) {
        setErreur('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }
    try {
      const reponse = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteres),
      });

      if (!reponse.ok) {
        throw new Error("Erreur lors de l'inscription");
      }

      setSucces(true);
    } catch {
      setErreur("Impossible de créer le compte. Cet email est peut-être déjà utilisé.");
    }
  }
  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Inscription</h2>

        {succes ? (
          <p className="text-green-600 font-medium bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            Compte créé avec succès ! Redirection vers la connexion...
          </p>
        ) : (
          <form onSubmit={inscription} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                type="text" 
                name="nom"
                value={criteres.nom} 
                onChange={changer} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input 
                type="text" 
                name="prenom"
                value={criteres.prenom} 
                onChange={changer} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={criteres.email} 
                onChange={changer} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input 
                type="password" 
                name="motDePasse"
                value={criteres.motDePasse} 
                onChange={changer} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm transition duration-200 mt-2"
            >
              S'inscrire
            </button>
          </form>
        )}

        {erreur && (
          <p role="alert" className="mt-4 text-sm text-red-600 text-center font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            {erreur}
          </p>
        )}
      </div>
    </div>
  );

}