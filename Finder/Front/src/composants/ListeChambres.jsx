export default function ListeChambres({ chambres }) {
if (chambres.length === 0) {
return <p>Aucune chambre à afficher.</p>;
}
return (
  <ul className="liste-chambres">
  {chambres.map(chambre => (
    <li key={chambre.id}>
    <strong>{chambre.nom}</strong> ({chambre.numero})
    </li>
  ))}
  </ul>
  );
}