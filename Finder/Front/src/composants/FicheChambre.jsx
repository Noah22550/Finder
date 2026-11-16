export default function FicheChambre({ chambre, hotel }) {
  return (
    <article>
      <h2>Chambre {chambre.numero}</h2>
      <p>{chambre.categorie}, {chambre.capacite} personnes</p>
      <p>{chambre.prixNuit} € la nuit</p>
      <p>{chambre.description}</p>
      {hotel && <p>{hotel.nom}</p>}
    </article>
  );
}