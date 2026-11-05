import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Heart, Shield, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Ethos */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Local Skill Exchange
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              An egalitarian neighborhood time-banking network. We believe everyone has something to teach and something to learn. One hour of your time equals one credit to learn anything from your community.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> 1 Hour = 1 Credit
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" /> Non-Monetary Barter
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-emerald-400 transition-colors">
                  Explore Skills Catalog
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How Barter Matching Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  Our Time-Banking Ethos
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-emerald-400 transition-colors">
                  Smart Matches ⭐
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Safety */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Community & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/community" className="hover:text-emerald-400 transition-colors">
                  Community Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-emerald-400 transition-colors">
                  Trust & Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/post" className="hover:text-emerald-400 transition-colors">
                  Post a Skill to Teach
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500 font-mono">Open Source MERN Monorepo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Local Skill Exchange. Built for neighbourhood empowerment.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> using MongoDB, Express, React & Node.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
