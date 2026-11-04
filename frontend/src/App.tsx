import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Core Landing */}
              <Route path="/" element={<HomePage />} />

              {/* Authentication Routes (Phase 2) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* User Profile Routes (Phase 2) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/users/:id" element={<PublicProfilePage />} />

              {/* Future Phase 3 & 4 routes placeholders */}
              <Route
                path="/explore"
                element={
                  <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Explore Catalog</h2>
                    <p className="text-sm text-slate-600">
                      The full interactive catalog with filters arrives in Phase 3.
                    </p>
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
                    <p className="text-sm text-slate-600">
                      Skill listing form with validation arrives in Phase 3.
                    </p>
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
    </AuthProvider>
  );
};

export default App;
