import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { jeton } from './auth';
import Recherche from './pages/recherche';
import Inscription from './pages/inscription';
import Connexion from './pages/connexion';
import Reserver from './pages/reserver';
import Mesreservations from './pages/mes-reservations';
import Accueil from './pages/accueil';
import RouteProtegee from './RouteProtegee';
import Deconnexion from './pages/deconnexion';

export default function App() {
  const [connecte, setConnecte] = useState(Boolean(jeton()));

  return (
    <div>
      <BrowserRouter>
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-bold text-finder-primary">Finder</h1>
        </div>

        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/accueil">Accueil</Link>
              <Link to="/recherche">Rechercher</Link>
              <Link to="/inscription">S'inscrire</Link>
              <Link to="/reserver">Réserver</Link>
              <Link to="/mes-reservations">Voir mes réservations</Link>

              {connecte ? (
                <Deconnexion onDeconnexion={() => setConnecte(false)} />
              ) : (
                <Link to="/connexion" className="hover:text-sky-600 transition">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/recherche" element={<Recherche />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route
            path="/connexion"
            element={<Connexion onConnexion={() => setConnecte(true)} />}
          />
          <Route
            path="/reserver"
            element={<RouteProtegee><Reserver /></RouteProtegee>}
          />
          <Route
            path="/mes-reservations"
            element={<RouteProtegee><Mesreservations /></RouteProtegee>}
          />
          <Route path="*" element={<Accueil />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}