import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config';
import { setJeton } from '../auth';

export default function Connexion() {
  // 1. Il faut déclarer les variables d'état ici !
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  
  const navigate = useNavigate();

  async function seConnecter(e) {
    e.preventDefault();
    setErreur(null);

    try {
      // 2. Maintenant, email et motDePasse existent quand fetch les appelle
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
      navigate('/recherche'); // Redirection vers la recherche en cas de succès
      
    } catch {
      setErreur('Email ou mot de passe incorrect.');
    }
  }

  return (
    <div className="formulaire-connexion">
      <h2>Connexion</h2>
      <form onSubmit={seConnecter}>
        <div>
          <label>Email</label>
          {/* 3. On relie le champ à la variable email */}
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Mot de passe</label>
          {/* 4. On relie le champ à la variable motDePasse */}
          <input 
            type="password" 
            value={motDePasse} 
            onChange={(e) => setMotDePasse(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Se connecter</button>
      </form>
      {erreur && <p role="alert" style={{color: 'red'}}>{erreur}</p>}
    </div>
  );
}