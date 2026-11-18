export default function ListeChambres({ chambres, onChoix }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
      {chambres.map((c) => (
        <div
          key={c.id}
          onClick={() => onChoix(c)}
          className="p-3 bg-white border rounded-lg cursor-pointer hover:border-sky-600"
        >
          <p className="font-bold">Chambre {c.numero}</p>
          <p className="text-sm text-gray-600">
            {c.categorie} · {c.capacite} pers.
          </p>
          <p className="font-semibold text-sky-700 mt-1">
            {c.prix_nuit } €
          </p>
        </div>
      ))}
    </div>
  );
}