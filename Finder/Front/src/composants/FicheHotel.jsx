export default function FicheHotel({ Hotel }) {
  return (
    <article>
      <h2>{Hotel.nom}</h2>
      <p>{Hotel.adresse}</p>
      <p>{Hotel.codePostal} {Hotel.ville}</p>
      <p>{Hotel.description}</p>
    </article>
  );
}

