import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Future Phase 2, 3, 4 routes placeholders */}
            <Route
              path="/explore"
              element={
                <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">Explore Catalog</h2>
                  <p className="text-sm text-slate-600">The full interactive catalog with filters arrives in Phase 3.</p>
                  <Link to="/" className="inline-block text-emerald-700 font-semibold hover:underline text-sm">
                    ← Return to Home
                  </Link>
                </div>
              }
            />
            <Route
              path="/post"
              element={
                <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">Post a Skill</h2>
                  <p className="text-sm text-slate-600">Skill listing form with validation arrives in Phase 3.</p>
                  <Link to="/" className="inline-block text-emerald-700 font-semibold hover:underline text-sm">
                    ← Return to Home
                  </Link>
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">User Profile & Credits</h2>
                  <p className="text-sm text-slate-600">Full profile management and credit ledger arrive in Phase 2.</p>
                  <Link to="/" className="inline-block text-emerald-700 font-semibold hover:underline text-sm">
                    ← Return to Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

