import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Repeat,
  Coins,
} from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Join & Claim 3 Welcome Credits',
      desc: 'Create your free account. Every new neighbor receives 3 welcome credits immediately—giving you 3 free hours of learning right away without having to teach first.',
      icon: Sparkles,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      num: '02',
      title: 'Post Your Skills & Learning Wishes',
      desc: 'Publish skills you can teach (e.g. conversational Italian, guitar chords, Python basics) or skills you wish to learn. Choose whether you can meet in-person or online.',
      icon: Search,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      num: '03',
      title: 'Get Matched by the Smart Engine',
      desc: 'Our Smart Skill Matching Engine scores compatibility based on shared interests, neighborhood proximity, and mutual barter opportunities where two neighbors teach each other.',
      icon: Repeat,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      num: '04',
      title: 'Book Sessions & Exchange Time Credits',
      desc: 'Coordinate times via direct messaging and book sessions. After completion and dual-party confirmation, 1 hour taught automatically adds 1 credit to your balance.',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            Step-by-Step Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            How Neighbourhood Skill Barter Works
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
            From your very first lesson to earning credits and becoming a community mentor, here is how the Local Skill Exchange operates.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-200">{st.num}</span>
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${st.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{st.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scenario Example */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Real-Life Example</span>
            <h2 className="text-2xl font-bold text-slate-900">How Elena and Marcus Barter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold mx-auto flex items-center justify-center">
                E
              </div>
              <p className="font-bold text-sm text-slate-900">Elena (Teaches Python)</p>
              <p className="text-xs text-slate-500">Wants to learn Conversational Spanish</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <Repeat className="w-6 h-6 text-emerald-600 mb-1 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-bold text-emerald-800">Reciprocal Match!</span>
              <span className="text-[11px] text-emerald-600 mt-0.5">Score: 92/100 (Mutual Barter)</span>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold mx-auto flex items-center justify-center">
                M
              </div>
              <p className="font-bold text-sm text-slate-900">Marcus (Teaches Spanish)</p>
              <p className="text-xs text-slate-500">Wants to learn Python Coding</p>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 max-w-lg mx-auto">
            Elena teaches Marcus Python for 1 hour (+1 credit), then Marcus teaches Elena Spanish for 1 hour (-1 credit). Both learn, both grow, with zero cash exchanged!
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] text-sm"
          >
            <span>Explore Skills in Your Neighbourhood</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default HowItWorksPage;
