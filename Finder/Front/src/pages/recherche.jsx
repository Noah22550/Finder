import { useState } from 'react';
import './recherche.css';

export default function Recherche() {
  const [criteres, setCriteres] = useState({ hotel: '', date_debut: '', date_fin: '', capacite: '', prix_max: '', categorie: '' });

  function changer(e) {
    setCriteres({ ...criteres, [e.target.name]: e.target.value });
  }

  return (
    <div className="formulaire-recherche">
      <h3>Rechercher une chambre</h3>
      <form onSubmit={e => { e.preventDefault(); /* question 2 */ }}>
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
    </div>
  );
}