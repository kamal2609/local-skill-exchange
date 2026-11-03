import React, { useEffect, useState } from 'react';
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
  GraduationCap
} from 'lucide-react';
import api from '../services/api';

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
}

const CATEGORIES = [
  { name: 'Technology', icon: '💻', count: 'Python, React, Linux' },
  { name: 'Languages', icon: '🗣️', count: 'Spanish, French, Japanese' },
  { name: 'Music', icon: '🎸', count: 'Acoustic Guitar, Piano' },
  { name: 'Cooking', icon: '🥖', count: 'Sourdough, Artisan Pastry' },
  { name: 'Fitness', icon: '🧘', count: 'Vinyasa Yoga, Calisthenics' },
  { name: 'Arts & Crafts', icon: '🎨', count: 'Oil Painting, Ceramics' },
  { name: 'Gardening', icon: '🌱', count: 'Urban Balcony, Composting' },
  { name: 'Other', icon: '🔧', count: 'Bicycle Maintenance, DIY' },
];

export const HomePage: React.FC = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 5,
    totalSkills: 10,
    hoursExchanged: 12,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/listings/featured');
        if (isMounted && res.data?.success) {
          setFeaturedListings(res.data.listings || []);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
          setApiConnected(true);
        }
      } catch (err) {
        // Fallback for Wave 1 before database seed is fully mounted
        if (isMounted) {
          setApiConnected(false);
          setFeaturedListings([
            {
              _id: 'demo-1',
              type: 'TEACH',
              title: 'Beginner Acoustic Guitar & Chord Fingerpicking',
              description: 'Learn fundamental open chords, strumming rhythms, and basic music theory in a relaxed 1-hour session.',
              category: 'Music',
              format: 'IN_PERSON',
              location: 'Brooklyn, NY',
              durationMinutes: 60,
              user: { name: 'Elena Rostova', location: 'Brooklyn, NY' },
            },
            {
              _id: 'demo-2',
              type: 'TEACH',
              title: 'Modern TypeScript & React Web Architecture',
              description: 'Hands-on debugging and project structure mentoring for aspiring frontend and full-stack developers.',
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
              category: 'Languages',
              format: 'ONLINE',
              location: 'Remote',
              durationMinutes: 60,
              user: { name: 'Sarah Jenkins', location: 'Manhattan, NY' },
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
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
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Neighbor-to-Neighbor Skill Barter</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Learn anything. Share what you love.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                1 Hour = 1 Credit.
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              No money required. Teach your neighbors guitar, sourdough baking, or coding, and earn time credits to learn languages, yoga, or carpentry in return.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#featured"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Explore Skill Offerings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <Link
                to="/post"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Share a Skill (Earn Credits)</span>
              </Link>
            </div>

            {/* Live Stats Pill */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-600">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-base">{stats.totalMembers}+</div>
                  <div className="text-xs text-slate-500">Neighbors Joined</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-base">{stats.totalSkills}+</div>
                  <div className="text-xs text-slate-500">Skills Offered & Sought</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-base">{stats.hoursExchanged}h</div>
                  <div className="text-xs text-slate-500">Time Banked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-100/60 to-teal-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />
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
            Everyone's time is of equal value. An hour of gardening is equal to an hour of software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900">Sign Up & Receive 3 Credits</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every new neighbor receives 3 welcome credits upon registration so you can start learning immediately.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900">Teach & Earn Credits</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Offer a 1-hour session in something you love. When completed, 1 credit is transferred to your balance.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900">Redeem to Learn Anything</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use your banked credits to request lessons from any member—online or in person in your local neighborhood.
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Database
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
            <span>View all listings</span>
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

      {/* Category Pills Exploration */}
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

