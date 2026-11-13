import { useState } from 'react';

export default function Recherche() {
  const [criteres, setCriteres] = useState({ hotel: '', date_debut: '', date_fin: '', capacite: '', prix_max: '', categorie: '' });

  function changer(e) {
    setCriteres({ ...criteres, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <h3><strong>Rechercher une chambre</strong></h3>
      <form onSubmit={e => { e.preventDefault(); /* question 2 */ }}>
        Hôtel <input name="hotel" value={criteres.hotel} onChange={changer} />
        Arrivée <input type="date" name="date_debut" value={criteres.date_debut} onChange={changer} />
        Départ <input type="date" name="date_fin" value={criteres.date_fin} onChange={changer} />
        Personnes <input type="number" name="capacite" value={criteres.capacite} onChange={changer} />
        Prix max <input type="number" name="prix_max" value={criteres.prix_max} onChange={changer} />
        
        Catégorie <select name="categorie" value={criteres.categorie} onChange={changer}>
          <option value="">toutes</option>
          <option value="simple">simple</option>
          <option value="double">double</option>
          <option value="familiale">familiale</option>
          <option value="suite">suite</option>
        </select>
        
        <button type="submit">Rechercher</button>
      </form>
    </div>
  );
}