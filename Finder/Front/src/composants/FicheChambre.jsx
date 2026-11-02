export default function FicheChambre({ chambre, hotel }) {
  return (
    <article>
      <h2>{chambre.nom}</h2>
      <p>{hotel.nom}</p>
      <p>{chambre.numero}</p>
      <p>{chambre.categorie}</p>
      <p>{chambre.prixNuit} €</p>
    </article>
  );
}