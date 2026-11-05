import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  MapPin,
  Globe,
  Star,
  Award,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import api from '../services/api';
import { BookingModal } from '../components/sessions/BookingModal';

interface SkillDetail {
  _id: string;
  name: string;
  category: string;
  difficulty?: string;
  description?: string;
  tags?: string[];
}

interface ProviderDetail {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  city?: string;
  languages?: string[];
  averageRating?: number;
  completedSessions?: number;
  createdAt?: string;
}

interface OfferData {
  _id: string;
  skillId: SkillDetail;
  providerId: ProviderDetail;
  description: string;
  experienceLevel: string;
  teachingLanguage: string;
  learningMode: string;
  sessionDuration: number;
  neighborhood?: string;
  teachingApproach?: string;
  status: string;
  createdAt: string;
}

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/offers/${id}`);
        if (res.data?.success && res.data?.data?.offer) {
          setOffer(res.data.data.offer);
        } else {
          setErrorMessage('Offer not found');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMessage(error.message || 'Could not load offer details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOffer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading teaching offer...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !offer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Offer Not Found</h2>
        <p className="text-sm text-slate-600">
          {errorMessage || 'This skill offer may have been archived or removed by its provider.'}
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const durationHours = (offer.sessionDuration || 60) / 60;

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Main Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {offer.skillId?.category || 'Skill Offer'}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {offer.learningMode?.replace('_', ' ')}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                Level: {offer.experienceLevel}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {offer.skillId?.name}
          </h1>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100/80">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Session Duration</span>
              </div>
              <div className="text-lg font-bold text-emerald-950 mt-0.5">
                {offer.sessionDuration || 60} mins
              </div>
              <div className="text-[10px] text-emerald-700">Cost: {durationHours.toFixed(1)} Credit</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Teaching Language</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {offer.teachingLanguage || 'English'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Neighborhood</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {offer.neighborhood || offer.providerId?.city || 'Local Area'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Reputation</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {(offer.providerId?.averageRating || 5.0).toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Description */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
              <h2 className="text-base font-bold text-slate-900">What You'll Learn</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {offer.description}
              </p>

              {offer.teachingApproach && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">Teaching Style & Methodology</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {offer.teachingApproach}
                  </p>
                </div>
              )}

              {offer.skillId?.tags && offer.skillId.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">Related Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {offer.skillId.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Provider Card Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Offered By
              </span>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  {offer.providerId?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {offer.providerId?.name}
                  </h3>
                  <p className="text-xs text-slate-500">@{offer.providerId?.username}</p>
                </div>
              </div>

              {offer.providerId?.bio && (
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{offer.providerId.bio}"
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Sessions Conducted:</span>
                  <span className="font-semibold text-slate-800">
                    {offer.providerId?.completedSessions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Languages:</span>
                  <span className="font-semibold text-slate-800">
                    {offer.providerId?.languages?.join(', ') || 'English'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>City / Area:</span>
                  <span className="font-semibold text-slate-800">
                    {offer.providerId?.city || 'Local Community'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  to={`/users/${offer.providerId?._id}`}
                  className="w-full py-2 px-3 text-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 block transition-colors"
                >
                  View Full Profile
                </Link>

                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Session Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 5 Interactive Booking Modal */}
        {bookingOpen && offer.providerId && offer.skillId && (
          <BookingModal
            isOpen={true}
            onClose={() => setBookingOpen(false)}
            onSuccess={() => {
              alert('🎉 Session request submitted! You can track status on your Sessions page.');
            }}
            provider={offer.providerId}
            skill={offer.skillId}
            skillOfferId={offer._id}
          />
        )}
      </div>
    </div>
  );
};

