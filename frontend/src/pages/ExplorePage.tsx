import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  User,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Globe,
  Award,
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Academic',
  'Creative',
  'Lifestyle',
  'Other',
];

const LEARNING_MODES = ['ALL', 'ONLINE', 'IN_PERSON', 'HYBRID'];

interface SkillInfo {
  _id: string;
  name: string;
  category: string;
  difficulty?: string;
  icon?: string;
  tags?: string[];
}

interface ProviderInfo {
  _id: string;
  name: string;
  username: string;
  city?: string;
  averageRating?: number;
  completedSessions?: number;
}

interface Offer {
  _id: string;
  skillId: SkillInfo;
  providerId: ProviderInfo;
  description: string;
  experienceLevel: string;
  teachingLanguage: string;
  learningMode: string;
  sessionDuration: number;
  neighborhood?: string;
  createdAt: string;
}

interface RequestItem {
  _id: string;
  skillId: SkillInfo;
  learnerId: ProviderInfo;
  title: string;
  description: string;
  preferredDifficulty: string;
  preferredDuration: number;
  preferredMode: string;
  preferredSchedule: string;
  neighborhood?: string;
  status: string;
  createdAt: string;
}

export const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
  const [category, setCategory] = useState('All');
  const [learningMode, setLearningMode] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data whenever filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: 9,
        };

        if (category !== 'All') params.category = category;
        if (learningMode !== 'ALL') {
          if (activeTab === 'offers') params.learningMode = learningMode;
          else params.preferredMode = learningMode;
        }
        if (search.trim()) params.search = search.trim();

        if (activeTab === 'offers') {
          const res = await api.get('/offers', { params });
          if (!isCancelled && res.data?.success) {
            setOffers(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.total || 0);
          }
        } else {
          const res = await api.get('/requests', { params });
          if (!isCancelled && res.data?.success) {
            setRequests(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.total || 0);
          }
        }
      } catch (err) {
        console.warn('Could not fetch catalog listings:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 250);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [activeTab, category, learningMode, search, page]);

  // Reset page when filters change
  const handleTabChange = (tab: 'offers' | 'requests') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleModeChange = (mode: string) => {
    setLearningMode(mode);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Neighbourhood Skill Catalog</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Community Skills
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Discover teaching offers from verified neighbors or see what your community wants to learn.
            </p>
          </div>

          <Link
            to="/post"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-sm hover:bg-emerald-700 transition-all hover:scale-[1.02] w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post an Offer or Request</span>
          </Link>
        </div>

        {/* Dual Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => handleTabChange('offers')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'offers'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Skills to Learn (Teaching Offers)</span>
            {activeTab === 'offers' && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('requests')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Community Learning Requests</span>
            {activeTab === 'requests' && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={
                activeTab === 'offers'
                  ? 'Search by skill, topic, approach, or neighborhood...'
                  : 'Search by learning goal, skill, or neighborhood...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 pr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex-shrink-0 ${
                  category === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Format Mode Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
            <span className="font-semibold text-slate-500 pr-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Format:
            </span>
            {LEARNING_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  learningMode === mode
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode === 'ALL' ? 'All Formats' : mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading catalog listings...</p>
          </div>
        ) : activeTab === 'offers' ? (
          offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Card Header: Category & Mode Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        {offer.skillId?.category || 'Skill'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {offer.learningMode?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Skill Name */}
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {offer.skillId?.name || 'Skill Offer'}
                    </h2>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {offer.description}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {offer.sessionDuration || 60} mins
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        {offer.experienceLevel}
                      </span>
                      {offer.neighborhood && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {offer.neighborhood}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Provider & CTA */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/users/${offer.providerId?._id || ''}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {offer.providerId?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {offer.providerId?.name || 'Neighbor'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{(offer.providerId?.averageRating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to={`/offers/${offer._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-lg font-bold text-slate-800">No Skill Offers Found</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active teaching listings matched your search criteria. Try removing filters or share your own skill!
              </p>
              <Link
                to="/post"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish the First Offer</span>
              </Link>
            </div>
          )
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Mode Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                      {req.skillId?.category || 'Goal'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {req.preferredMode?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Target Skill */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {req.title}
                    </h2>
                    <span className="text-xs font-semibold text-emerald-700 mt-0.5 block">
                      Target: {req.skillId?.name || 'Skill'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      Level: {req.preferredDifficulty?.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span>{req.preferredSchedule}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/users/${req.learnerId?._id || ''}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      {req.learnerId?.name?.charAt(0) || 'L'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {req.learnerId?.name || 'Learner'}
                    </div>
                  </Link>

                  <Link
                    to={`/requests/${req._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">No Learning Requests Found</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No one has posted a request matching this search yet. Create your request to get matched!
            </p>
            <Link
              to="/post"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Learning Goal</span>
            </Link>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

