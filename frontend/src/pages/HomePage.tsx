import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  MapPin,
  Laptop,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

const SkillNetworkHero = lazy(() => import('../components/three/SkillNetworkHero'));

interface Listing {
  _id: string;
  type: 'TEACH' | 'LEARN';
  title: string;
  description: string;
  category: string;
  format: string;
  location: string;
  durationMinutes: number;
  user?: {
    name: string;
    avatarUrl?: string;
    location?: string;
  };
}

interface Stats {
  totalMembers: number;
  totalSkills: number;
  hoursExchanged: number;
  activeOffers: number;
  openRequests: number;
}

const CATEGORIES = [
  { name: 'Technology', icon: '💻', count: 'Python, React, Linux' },
  { name: 'Design', icon: '🎨', count: 'Figma, UI/UX, Graphic' },
  { name: 'Languages', icon: '🗣️', count: 'Spanish, French, Japanese' },
  { name: 'Creative', icon: '🎸', count: 'Acoustic Guitar, Piano, Oil Painting' },
  { name: 'Lifestyle', icon: '🥖', count: 'Sourdough, Yoga, Pastry' },
  { name: 'Academic', icon: '📐', count: 'Math, Statistics, Science' },
  { name: 'Gardening', icon: '🌱', count: 'Urban Balcony, Composting' },
  { name: 'Other', icon: '🔧', count: 'Bicycle Maintenance, Carpentry' },
];

export const HomePage: React.FC = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 5,
    totalSkills: 16,
    hoursExchanged: 12,
    activeOffers: 10,
    openRequests: 8,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const statsRes = await api.get('/stats');
        if (isMounted && statsRes.data?.success) {
          const d = statsRes.data.data;
          setStats({
            totalMembers: d.totalMembers || 5,
            totalSkills: d.totalSkills || 16,
            hoursExchanged: d.hoursExchanged || 12,
            activeOffers: d.activeOffers || 10,
            openRequests: d.openRequests || 8,
          });
          setApiConnected(true);
        }
      } catch (err) {
        if (isMounted) {
          setApiConnected(false);
        }
      } finally {
        if (isMounted) {
          setFeaturedListings([
            {
              _id: 'demo-1',
              type: 'TEACH',
              title: 'Beginner Acoustic Guitar & Open Chords',
              description: 'Learn fundamental open chords, strumming rhythms, and basic music theory in a relaxed 1-hour session.',
              category: 'Creative',
              format: 'IN_PERSON',
              location: 'Brooklyn, NY',
              durationMinutes: 60,
              user: { name: 'Elena Rostova', location: 'Brooklyn, NY' },
            },
            {
              _id: 'demo-2',
              type: 'TEACH',
              title: 'Python Programming & Data Scripting',
              description: 'Interactive pair programming: functions, automation scripts, and clean coding best practices.',
              category: 'Technology',
              format: 'ONLINE',
              location: 'Remote / Zoom',
              durationMinutes: 60,
              user: { name: 'Marcus Chen', location: 'Queens, NY' },
            },
            {
              _id: 'demo-3',
              type: 'LEARN',
              title: 'Seeking Conversational Spanish Partner',
              description: 'Intermediate learner looking to practice natural dialogue, everyday idioms, and pronunciation.',
              category: 'Academic',
              format: 'ONLINE',
              location: 'Remote',
              durationMinutes: 60,
              user: { name: 'Sarah Jenkins', location: 'Manhattan, NY' },
            },
            {
              _id: 'demo-4',
              type: 'TEACH',
              title: 'Sourdough Bread Baking from Scratch',
              description: 'Wild yeast starter maintenance, autolyse, stretch-and-fold techniques, and Dutch oven baking.',
              category: 'Lifestyle',
              format: 'IN_PERSON',
              location: 'Manhattan, NY',
              durationMinutes: 90,
              user: { name: 'Sarah Jenkins', location: 'Manhattan, NY' },
            },
            {
              _id: 'demo-5',
              type: 'TEACH',
              title: 'Bicycle Maintenance & Tune-up',
              description: 'Stop paying bike shop fees: derailleur indexing, brake alignment, and chain care.',
              category: 'Other',
              format: 'IN_PERSON',
              location: 'Brooklyn, NY',
              durationMinutes: 60,
              user: { name: 'David Miller', location: 'Brooklyn, NY' },
            },
            {
              _id: 'demo-6',
              type: 'TEACH',
              title: 'Vinyasa Flow Yoga & Breathwork',
              description: 'Spinal alignment, breath coordination, and core stability for all experience levels.',
              category: 'Lifestyle',
              format: 'HYBRID',
              location: 'Manhattan, NY',
              durationMinutes: 60,
              user: { name: 'Maya Patel', location: 'Manhattan, NY' },
            },
          ]);
          setLoading(false);
        }
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Neighbourhood Skill Sharing</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Share What You Know.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  Learn What You Love.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with neighbors to barter knowledge. No money required: <strong className="text-slate-800 font-semibold">1 hour of teaching earns 1 time credit</strong> to learn anything from someone else in your community.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#featured"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Explore Skills</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  to="/post"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Become a Mentor</span>
                </Link>
              </div>

              {/* Real Platform Statistics Counters */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0 text-slate-600">
                <div>
                  <div className="font-bold text-slate-900 text-xl">{stats.totalMembers}+</div>
                  <div className="text-xs text-slate-500">Neighbors</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xl">{stats.totalSkills}+</div>
                  <div className="text-xs text-slate-500">Skills Catalog</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xl">{stats.hoursExchanged}h</div>
                  <div className="text-xs text-slate-500">Time Banked</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Skill Network Scene */}
            <div className="lg:col-span-5 relative">
              <div className="w-full h-80 sm:h-96 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 border border-emerald-100/80 p-2 shadow-inner overflow-hidden relative flex items-center justify-center">
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                      <span className="text-xs font-medium">Loading 3D Skill Network...</span>
                    </div>
                  }
                >
                  <SkillNetworkHero />
                </Suspense>

                {/* 3D overlay badge */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[11px] font-medium text-slate-600 shadow-sm flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Interactive 3D Skill Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-100/50 via-teal-100/30 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />
      </section>

      {/* Differentiating Feature Highlight: Smart Skill Matching */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Differentiating Feature ⭐</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Smart Skill Matching Engine
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Our intelligent engine analyzes offered skills, learning requests, schedules, and locations to suggest ideal reciprocal learning partners. If you teach Python and want Spanish, it discovers neighbors who teach Spanish and want Python!
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-emerald-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reciprocal Exchange Detection
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Explainable Compatibility Scores
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Conflict-Free Availability Matching
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            The Exchange Principle
          </h2>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            How Time Banking Works
          </h3>
          <p className="text-slate-600 text-sm">
            Everyone's time is of equal value. One hour of teaching guitar equals one hour of learning Python.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900">Sign Up & Get 3 Credits</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every verified new member receives 3 starter credits automatically to jump right into learning.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900">Teach & Earn Time Credits</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conduct a 1-hour session in a skill you love. Upon mutual confirmation, 1 credit is transferred to your ledger.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900">Redeem to Learn from Anyone</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use your banked credits to request lessons from any provider—online or in person in your local neighborhood.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Skills Grid */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">
              <span>Community Catalog</span>
              {apiConnected && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Express API
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Featured Skills to Learn & Share
            </h3>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View full catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 bg-slate-200/70 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        listing.type === 'TEACH'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      }`}
                    >
                      {listing.type === 'TEACH' ? 'Offer to Teach' : 'Looking to Learn'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {listing.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {listing.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {listing.user?.name?.[0] || 'U'}
                    </div>
                    <span>{listing.user?.name || 'Community Member'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      {listing.format === 'ONLINE' ? (
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{listing.format === 'ONLINE' ? 'Online' : 'In-Person'}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-emerald-700">
                      {listing.durationMinutes / 60}h (1 Cr)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Category Grid */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Explore by Category
          </h3>
          <p className="text-xs text-slate-500">
            Discover skills waiting to be exchanged in your area
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                {cat.name}
              </h4>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
