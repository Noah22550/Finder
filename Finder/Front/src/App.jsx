import Recherche from './pages/recherche';
import Inscription from './pages/inscription';
import Connexion from './pages/connexion';
import Reserver from './pages/reserver'
import Mesreservations from './pages/mes-reservations'
import Accueil from './pages/accueil'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
export default function App() {
  return (
    <div>
      <BrowserRouter>
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold text-finder-primary">Finder</h1>
      </div>
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/recherche">Rechercher</Link>
              <Link to="/inscription">s'inscrire</Link>
              <Link to="/connexion">Connexion</Link>
              <Link to="/Reserver">réserver</Link>
              <Link to="/mes-reservations">voir mes réservations</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/recherche" element={<Recherche />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/reserver" element={<Reserver />} />
          <Route path="/mes-reservations" element={<Mesreservations />} />
          <Route path="*" element={<Accueil />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}