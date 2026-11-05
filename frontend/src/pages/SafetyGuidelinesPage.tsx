import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lock,
  UserCheck,
  Flag,
  Coffee,
} from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export const SafetyGuidelinesPage: React.FC = () => {
  return (
    <PageTransition className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Trust & Community Safety
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Neighbourhood Safety Guidelines
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Our community thrives on respect, trust, and mutual accountability. Please review our safety recommendations and community code of conduct.
          </p>
        </div>

        {/* 4 Key Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Meet in Public Spaces</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              For initial in-person skill exchanges, meet in bustling public areas such as local libraries, community centers, coffee shops, or university study lounges.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Keep Communications In-App</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use our direct in-app messaging system to discuss agendas and scheduling without handing out personal phone numbers or home addresses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Check Peer Reviews & Ratings</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review public feedback from past exchange partners before booking a session. Check badges, ratings, and past completed sessions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Confidential Reporting</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If someone behaves inappropriately, requests fiat payments, or misses a session, report them immediately. Administrators review reports within 24 hours.
            </p>
          </div>
        </div>

        {/* Zero Tolerance Policy */}
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">Zero Tolerance Community Standards</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The following actions result in immediate, permanent suspension from the Local Skill Exchange network:
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Demanding fiat currency or tips:</strong> 100% of exchanges must be powered purely by time-banking credits. Asking for money is strictly prohibited.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Harassment or discrimination:</strong> Discrimination based on race, gender, religion, background, or ability will result in immediate bans.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Repeated no-shows:</strong> Consistently missing scheduled sessions without timely notice harms community trust and will restrict booking privileges.</span>
            </li>
          </ul>
        </div>

        {/* Support CTA */}
        <div className="text-center space-y-2 bg-slate-100 p-6 rounded-2xl">
          <p className="text-xs text-slate-600 font-medium">Have questions or need assistance from our moderation team?</p>
          <p className="text-xs text-slate-400">
            Submit a report directly from any user's profile, or message an administrator through your in-app chat.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default SafetyGuidelinesPage;

