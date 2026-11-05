import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AdminRoute } from './components/shared/AdminRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ExplorePage } from './pages/ExplorePage';
import { PostPage } from './pages/PostPage';
import { OfferDetailPage } from './pages/OfferDetailPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { MatchesPage } from './pages/MatchesPage';
import { SessionsPage } from './pages/SessionsPage';
import { LedgerPage } from './pages/LedgerPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SafetyGuidelinesPage } from './pages/SafetyGuidelinesPage';
import { CommunityPage } from './pages/CommunityPage';

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

              {/* Skill Catalog & Offers/Requests Discovery (Phase 3) */}
              <Route path="/explore" element={<ExplorePage />} />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/offers/:id" element={<OfferDetailPage />} />
              <Route path="/requests/:id" element={<RequestDetailPage />} />

              {/* Smart Skill Matching Engine (Phase 4 ⭐) */}
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />

              {/* Availability Management & Session Booking (Phase 5) */}
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <SessionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Time-Banking Credit System & Ledger (Phase 6) */}
              <Route
                path="/ledger"
                element={
                  <ProtectedRoute>
                    <LedgerPage />
                  </ProtectedRoute>
                }
              />

              {/* Communication & Messaging (Phase 7) */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Informational & Community Pages (Phase 8) */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/safety" element={<SafetyGuidelinesPage />} />
              <Route path="/community" element={<CommunityPage />} />

              {/* Administrator Command Center (Phase 8) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
                    <h2 className="text-3xl font-extrabold text-slate-900">Page Not Found</h2>
                    <p className="text-sm text-slate-600">The page you're looking for does not exist.</p>
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
