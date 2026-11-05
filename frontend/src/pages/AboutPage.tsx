import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  Compass,
} from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is Time Banking and why 1 Hour = 1 Credit?',
      a: 'Time banking is an egalitarian economic model where every person’s time is valued equally. One hour spent teaching acoustic guitar is worth exactly the same as one hour of Python tutoring or sourdough bread baking: exactly 1 credit. There is no fiat currency involved—only mutual knowledge sharing.',
    },
    {
      q: 'Do I have to teach the same person who teaches me?',
      a: 'No! While our Smart Skill Matching Engine detects reciprocal barter opportunities (where two neighbors want each other’s skills), credits earned from teaching anyone in your neighborhood can be redeemed with any other provider across the community.',
    },
    {
      q: 'How do I start if I don’t have credits yet?',
      a: 'Every new neighbor automatically receives 3 free welcome credits upon registration so you can immediately book sessions and experience community learning without having to teach first.',
    },
    {
      q: 'What happens if a session is cancelled or someone is a no-show?',
      a: 'Credits are only deducted after mutual dual-confirmation or after a session is completed. If a session is cancelled or a no-show occurs, your credits remain in your balance, and you can submit a safety report if needed.',
    },
    {
      q: 'Can sessions happen online or in-person?',
      a: 'Both! Skill listings specify whether the provider is available in-person (with neighbourhood/city context) or remotely via video conferencing.',
    },
  ];

  return (
    <PageTransition className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Neighbourhood Skill Sharing
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Valuing Community Knowledge,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              One Hour at a Time.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
            Local Skill Exchange connects neighbours to trade skills, passions, and life wisdom directly. No money, no price tags—just human connection powered by time-banking credits.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Egalitarian Time Banking</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every person’s time is valued identically. 1 hour of teaching equals 1 credit earned, regardless of the skill subject or expertise level.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Barter Matching</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our explainable matching engine identifies reciprocal barter pairs in your neighborhood—allowing direct two-way exchanges with zero net credit spend.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Trust & Accountability</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Double-entry credit ledgers, dual-party session confirmations, genuine peer reviews, and human moderation ensure safe neighborhood interactions.
            </p>
          </div>
        </div>

        {/* The 1 Hour = 1 Credit Manifesto */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Our Philosophy</span>
            <h2 className="text-3xl font-extrabold tracking-tight">The 1 Hour = 1 Credit Rule</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              In modern economies, financial barriers often prevent people from learning piano, coding, or gardening. Time banking dismantles this barrier by treating everyone’s sixty minutes as equally valuable. When a retired botanist teaches gardening and learns smartphone photography from a teenager, both participants grow and the neighbourhood strengthens.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
              >
                Join with 3 Free Credits
              </Link>
              <Link
                to="/how-it-works"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about time credits and skill exchanges</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AboutPage;

