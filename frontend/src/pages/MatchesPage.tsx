import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Repeat,
  CheckCircle2,
  Sliders,
  Star,
  MapPin,
  Globe,
  Calendar,
  Award,
  ArrowRight,
  BookOpen,
  UserCheck,
  RefreshCw,
  Info,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ScoreBreakdown {
  skill: number;
  reciprocal: number;
  availability: number;
  experience: number;
  location: number;
  language: number;
}

interface MatchingPartner {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  city?: string;
  neighborhood?: string;
  role?: string;
  averageRating: number;
  completedSessions: number;
  preferredLearningMode: string;
  languages: string[];
}

interface MatchItem {
  score: number;
  breakdown: ScoreBreakdown;
  isReciprocal: boolean;
  matchingSkills: {
    theyTeachYou: string[];
    youTeachThem: string[];
  };
  explanations: string[];
  partner: MatchingPartner;
}

export const MatchesPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reciprocalOnly, setReciprocalOnly] = useState(false);
  const [minScore, setMinScore] = useState(20);
  const [activePartnerDetail, setActivePartnerDetail] = useState<MatchItem | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = reciprocalOnly ? '/matches/reciprocal' : '/matches';
      const response = await api.get(endpoint, {
        params: { minScore },
      });

      if (response.data && response.data.data) {
        setMatches(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load matches:', err);
      setError(err.message || 'Could not load compatible matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [reciprocalOnly, minScore]);

  // Color helper for overall compatibility score
  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
        ring: 'border-emerald-500 text-emerald-700',
        label: 'Excellent Match',
      };
    }
    if (score >= 50) {
      return {
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        bar: 'bg-teal-500',
        ring: 'border-teal-500 text-teal-700',
        label: 'Good Match',
      };
    }
    return {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
      ring: 'border-amber-500 text-amber-700',
      label: 'Moderate Match',
    };
  };

  const reciprocalCount = matches.filter((m) => m.isReciprocal).length;
  const topScore = matches.length > 0 ? Math.max(...matches.map((m) => m.score)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Feature Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Core Academic Differentiator ⭐
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Smart Skill Matching Engine
            </h1>
            <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
              Transparent, explainable mathematical pairing. We analyze 6 weighted dimensions
              to find ideal partners and pinpoint <strong>Reciprocal Barters</strong> where you can
              exchange skills directly without spending time credits.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-xs text-slate-400 block">Total Compatible</span>
                <span className="text-2xl font-bold text-white">{matches.length}</span>
              </div>
              <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20">
                <span className="text-xs text-amber-300 block flex items-center gap-1">
                  <Repeat className="w-3 h-3" /> Reciprocal Swaps
                </span>
                <span className="text-2xl font-bold text-amber-400">{reciprocalCount}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-xs text-slate-400 block">Top Match Score</span>
                <span className="text-2xl font-bold text-emerald-400">{topScore}%</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-xs text-slate-400 block">Formula Weights</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">
                  Skill(40) + Swap(25) + Time(15)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Reciprocal toggle pills */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setReciprocalOnly(false)}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !reciprocalOnly
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Matches ({matches.length})
            </button>
            <button
              onClick={() => setReciprocalOnly(true)}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                reciprocalOnly
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              ⭐ Reciprocal Only ({reciprocalCount})
            </button>
          </div>

          {/* Score Slider & Refresh */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-end">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Sliders className="w-4 h-4 text-slate-400" />
              <label htmlFor="minScoreRange" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Min Compatibility: <span className="text-slate-900 font-bold">{minScore}%</span>
              </label>
              <input
                id="minScoreRange"
                type="range"
                min="20"
                max="80"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <button
              onClick={fetchMatches}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh compatibility calculation"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              Evaluating pairwise skill vectors and availability schedules...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={fetchMatches}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
            >
              Retry Analysis
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matches found at this threshold</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try lowering the minimum score slider or post more skills you want to learn or teach
              in your profile to unlock higher compatibility matches.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setMinScore(20)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Reset Filter to 20%
              </button>
              <Link
                to="/post"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                Post New Skill
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.map((item) => {
              const theme = getScoreTheme(item.score);

              return (
                <div
                  key={item.partner._id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 hover:shadow-lg ${
                    item.isReciprocal
                      ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Partner info & Avatar */}
                    <div className="flex items-start gap-4">
                      {item.partner.profilePicture ? (
                        <img
                          src={item.partner.profilePicture}
                          alt={item.partner.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                          {item.partner.name.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                            <Link to={`/users/${item.partner._id}`}>{item.partner.name}</Link>
                          </h3>
                          <span className="text-xs text-slate-600">@{item.partner.username}</span>

                          {item.isReciprocal && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold shadow-xs">
                              <Repeat className="w-3 h-3" /> Mutual Swap
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <strong className="text-slate-800">{item.partner.averageRating.toFixed(1)}</strong>
                            <span>({item.partner.completedSessions} sessions)</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.partner.city || 'Remote'}
                            {item.partner.neighborhood ? ` (${item.partner.neighborhood})` : ''}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {item.partner.languages?.join(', ') || 'English'}
                          </span>
                        </div>

                        {item.partner.bio && (
                          <p className="text-xs text-slate-600 line-clamp-2 pt-1 max-w-xl">
                            {item.partner.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Score Visual Display */}
                    <div className="flex items-center gap-4 lg:self-start self-start bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-right">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block">
                          Compatibility
                        </span>
                        <span className={`text-2xl font-black ${theme.ring}`}>
                          {item.score}%
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium block">
                          {theme.label}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-base shadow-xs">
                        🎯
                      </div>
                    </div>
                  </div>

                  {/* Skill Exchange Bilateral Summary */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        They can teach you:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matchingSkills.theyTeachYou.length > 0 ? (
                          item.matchingSkills.theyTeachYou.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-600 italic">
                            Related skills aligned with your learning goals
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl p-3.5 space-y-1.5 border ${
                        item.isReciprocal
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          item.isReciprocal ? 'text-amber-800' : 'text-slate-600'
                        }`}
                      >
                        <UserCheck
                          className={`w-3.5 h-3.5 ${
                            item.isReciprocal ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        />
                        You can teach them:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matchingSkills.youTeachThem.length > 0 ? (
                          item.matchingSkills.youTeachThem.map((skill, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                item.isReciprocal
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              ⭐ {skill} (Mutual Match)
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600 italic">
                            Standard session booking (1 Credit / hr)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6-Factor Mathematical Breakdown Bar */}
                  <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        6-Factor Compatibility Breakdown:
                      </span>
                      <span>{item.score} / 100 Points</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-600 block">Skill Match</span>
                        <span className="text-xs font-bold text-emerald-700">
                          {item.breakdown.skill} / 40
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-600 block">Reciprocal Swap</span>
                        <span className="text-xs font-bold text-amber-600">
                          {item.breakdown.reciprocal} / 25
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-600 block">Availability</span>
                        <span className="text-xs font-bold text-teal-700">
                          {item.breakdown.availability} / 15
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-600 block">Experience</span>
                        <span className="text-xs font-bold text-indigo-700">
                          {item.breakdown.experience} / 10
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-600 block">Location</span>
                        <span className="text-xs font-bold text-sky-700">
                          {item.breakdown.location} / 5
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-600 block">Languages</span>
                        <span className="text-xs font-bold text-violet-700">
                          {item.breakdown.language} / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Why You Match Explanations (REQ-MATCH-03) */}
                  {item.explanations && item.explanations.length > 0 && (
                    <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Why You Match (Explainable Algorithm Rationale):
                      </span>
                      <ul className="space-y-1">
                        {item.explanations.map((exp, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    <Link
                      to={`/users/${item.partner._id}`}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      View Partner Profile
                    </Link>

                    <button
                      onClick={() => {
                        alert(
                          `Requesting exchange with ${item.partner.name}!\n\n${
                            item.isReciprocal
                              ? '⭐ Reciprocal Match: 0 net credits will be deducted for mutual swap.'
                              : 'Standard exchange: 1 credit per 1 hour session.'
                          }\n\n(Session booking flow activates in Phase 5)`
                        );
                      }}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] ${
                        item.isReciprocal
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      }`}
                    >
                      <span>{item.isReciprocal ? 'Initiate Mutual Swap' : 'Request Session'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

