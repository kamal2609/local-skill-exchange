import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Star,
  BookOpen,
  Award,
  Languages,
  ShieldCheck,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { User, UserSkill } from '../context/AuthContext';

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/users/${id}`);
        if (res.data?.success && res.data?.data?.user) {
          setUser(res.data.data.user);
        } else {
          setErrorMessage('User profile not found');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMessage(error.message || 'Could not load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Member Not Found</h2>
        <p className="text-sm text-slate-600">
          {errorMessage || 'The member profile you requested does not exist or has been deactivated.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-700" />
          <div className="px-6 sm:px-8 pb-8 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-10 gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white text-3xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {user.role}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/explore"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Session (Phase 5)</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Rating</span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {(user.averageRating || 5.0).toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 font-medium">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>Completed</span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {user.completedSessions || 0} <span className="text-xs font-normal text-slate-500">sessions</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {user.city || 'Local Community'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-3">
              <h2 className="text-base font-bold text-slate-900">About {user.name}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {user.bio || 'This member has not written a public bio yet.'}
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <Languages className="w-4 h-4 text-slate-400" />
                <span>Speaks: {user.languages?.join(', ') || 'English'}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Skills Offered to Teach</span>
                </h3>
                {user.skillsOffered && user.skillsOffered.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill, index) => {
                      const skillObj = typeof skill === 'object' ? (skill as UserSkill) : null;
                      return (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5"
                        >
                          <span>{skillObj ? skillObj.name : 'Skill'}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No public skills listed.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-brand-600" />
                  <span>Learning Interests</span>
                </h3>
                {user.skillsWanted && user.skillsWanted.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill, index) => {
                      const skillObj = typeof skill === 'object' ? (skill as UserSkill) : null;
                      return (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 flex items-center gap-1.5"
                        >
                          <span>{skillObj ? skillObj.name : 'Goal'}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No learning goals listed.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 text-xs text-emerald-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Time-Banking Principle</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                When you book a session with {user.name}, 1 hour of learning equals 1 credit transferred upon mutual completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
