import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Clock, PlusCircle, Search, Menu, X, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // In Phase 1, demo state reflects the 3.0 welcome credits grant
  const credits = 3.0;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Local Skill Exchange
              </span>
              <span className="hidden sm:block text-[11px] text-slate-700 font-medium tracking-wider uppercase">
                1 Hour = 1 Credit
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-slate-100 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/explore')
                  ? 'bg-slate-100 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Explore Skills
            </Link>
            <Link
              to="/post"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/post')
                  ? 'bg-slate-100 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Post a Skill
            </Link>
          </nav>

          {/* Right Actions: Credit Balance & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Time Credit Badge (REQ-AUTH-05) */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm hover:bg-emerald-100 transition-colors cursor-default"
              title="Your Time Banking Balance: 1 hour taught = 1 credit earned"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{credits.toFixed(1)} Credits</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-200/60 px-1.5 py-0.5 rounded-full">
                Welcome Bonus
              </span>
            </div>

            {/* Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Elena Rostova</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{credits.toFixed(1)} Cr</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore Skills
          </Link>
          <Link
            to="/post"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Post a Skill
          </Link>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Active Profile: Elena Rostova</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              3.0 Credits Available
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

