import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Heart,
  Quote,
} from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export const CommunityPage: React.FC = () => {
  const topContributors = [
    {
      name: 'Elena Rostova',
      role: 'Full-Stack Developer & Python Mentor',
      neighborhood: 'Downtown / Northside',
      hoursTaught: 38,
      rating: 4.9,
      reviews: 14,
      skills: ['Python', 'Django', 'Algorithms'],
      avatar: 'E',
      color: 'bg-emerald-600',
    },
    {
      name: 'Marcus Chen',
      role: 'Native Spanish Speaker & Linguist',
      neighborhood: 'River West',
      hoursTaught: 31,
      rating: 5.0,
      reviews: 11,
      skills: ['Conversational Spanish', 'Grammar'],
      avatar: 'M',
      color: 'bg-teal-600',
    },
    {
      name: 'Sarah Jenkins',
      role: 'Master Baker & Urban Forager',
      neighborhood: 'Oak Park',
      hoursTaught: 27,
      rating: 4.95,
      reviews: 9,
      skills: ['Sourdough', 'Fermentation', 'Pastry'],
      avatar: 'S',
      color: 'bg-amber-600',
    },
    {
      name: 'David Okafor',
      role: 'Jazz Guitarist & Composer',
      neighborhood: 'East Village',
      hoursTaught: 24,
      rating: 4.85,
      reviews: 8,
      skills: ['Acoustic Guitar', 'Music Theory'],
      avatar: 'D',
      color: 'bg-blue-600',
    },
  ];

  const testimonials = [
    {
      quote:
        'I taught 4 hours of basic woodworking and used those credits to learn Python. Now I can build my own automated workshop inventory tool. The barter format completely changes the dynamic!',
      author: 'Carlos G.',
      skill: 'Woodworking ⇄ Python',
    },
    {
      quote:
        'Local Skill Exchange made our neighborhood feel like a genuine village again. I met three neighbors within walking distance who share my love for baking and urban gardening.',
      author: 'Amina K.',
      skill: 'Sourdough ⇄ Urban Gardening',
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Neighbourhood Community
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Meet the Community Leaders
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
            Our neighborhood is full of talented craftspeople, teachers, coders, and makers who share their passions through time banking.
          </p>
        </div>

        {/* Top Contributors Leaderboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900">Community Leaderboard</h2>
            </div>
            <span className="text-xs text-slate-400">Ranked by hours of knowledge shared</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topContributors.map((c, i) => (
              <div
                key={c.name}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${c.color} text-white font-black text-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  {c.avatar}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.hoursTaught}h taught
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.role}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.neighborhood}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {c.rating} ({c.reviews})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {c.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Testimonials */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Neighbor Stories</span>
            <h2 className="text-2xl font-bold">What Neighbours Are Saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-3">
                <Quote className="w-6 h-6 text-emerald-300 opacity-60" />
                <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                  <span className="font-bold text-white">{t.author}</span>
                  <span className="text-emerald-300 text-[11px]">{t.skill}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3 pt-4">
          <h3 className="text-lg font-bold text-slate-900">Ready to share your own passion?</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Join the community today, get 3 welcome credits, and start connecting with neighbors.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Get Started (3 Free Credits)
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              Browse All Skills
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CommunityPage;
