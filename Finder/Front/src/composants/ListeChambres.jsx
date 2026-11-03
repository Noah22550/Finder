export default function ListeChambres({ chambres, onChoix }) {
  if (chambres.length === 0) {
    return <p>Aucune chambre</p>;
  }

  return (
    <ul>
      {chambres.map(chambre => (
        <li key={chambre.id} onClick={() => onChoix(chambre)}>
          {chambre.numero} - {chambre.categorie}, {chambre.capacite} pers, {chambre.prixNuit} €
        </li>
      ))}
    </ul>
  );
}