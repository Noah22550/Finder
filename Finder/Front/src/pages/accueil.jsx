import { Link } from 'react-router-dom';

export default function Accueil() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Bloc de bienvenue assorti à la barre blanche */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Bienvenue sur Finder
        </h2>
        <p className="text-gray-600 mb-6">
          Réservez votre chambre en direct auprès de nos trois hôtels indépendants, sans intermédiaire.
        </p>
        <Link
          to="/recherche"
          className="inline-block bg-sky-700 hover:bg-sky-800 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Rechercher une chambre
        </Link>
      </div>

      {/* Aperçu rapide des 3 hôtels du groupement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h3 className="text-xl font-bold text-sky-700 mb-1">Amor</h3>
          <p className="text-sm text-gray-500 mb-3">La Rochelle • ★★★</p>
          <p className="text-gray-600 text-sm">
            Hôtel de charme sur le vieux port avec petit-déjeuner maison et prêt de vélos.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h3 className="text-xl font-bold text-sky-700 mb-1">Byzance</h3>
          <p className="text-sm text-gray-500 mb-3">Strasbourg • ★★★★</p>
          <p className="text-gray-600 text-sm">
            Établissement élégant au cœur de la ville, rue de la Coupole.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h3 className="text-xl font-bold text-sky-700 mb-1">Caraïbes</h3>
          <p className="text-sm text-gray-500 mb-3">Palavas-les-Flots • ★★</p>
          <p className="text-gray-600 text-sm">
            Séjour détente route de la plage, à deux pas de la mer.
          </p>
        </div>
      </div>
    </div>
  );
}