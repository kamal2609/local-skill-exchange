import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Clock,
  Star,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { useAuth, UserSkill } from '../context/AuthContext';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    city: user?.city || '',
    preferredLearningMode: user?.preferredLearningMode || 'ONLINE',
    languages: user?.languages?.join(', ') || 'English',
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        city: user.city || '',
        preferredLearningMode: user.preferredLearningMode || 'ONLINE',
        languages: user.languages?.join(', ') || 'English',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const languagesArray = formData.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await api.put('/users/profile', {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        city: formData.city.trim(),
        preferredLearningMode: formData.preferredLearningMode,
        languages: languagesArray,
      });

      if (res.data?.success && res.data?.data?.user) {
        updateUser(res.data.data.user);
        setStatusMessage({ type: 'success', text: 'Profile details successfully updated!' });
        setIsEditing(false);
        await refreshUser();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const credits = user.creditsBalance ?? 3.0;

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Subtle Banner */}
          <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-700 relative" />

          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-12 gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Avatar */}
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
                    <span title="Verified Community Member">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isEditing
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100/80">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Time Credits</span>
                </div>
                <div className="text-xl font-bold text-emerald-950 mt-1">
                  {credits.toFixed(1)} <span className="text-xs font-semibold text-emerald-700">Cr</span>
                </div>
                <div className="text-[10px] text-emerald-700/80">1 hr taught = 1 credit</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sessions Completed</span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {user.completedSessions || 0}
                </div>
                <div className="text-[10px] text-slate-500">Mutual confirmation verified</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Reputation Rating</span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {(user.averageRating || 5.0).toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
                </div>
                <div className="text-[10px] text-slate-500">From peer reviews</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {user.city || 'Local Community'}
                </div>
                <div className="text-[10px] text-slate-500">{user.preferredLearningMode} mode</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Edit Form or Information Card */}
        {isEditing ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Profile Information</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Learning Format
                  </label>
                  <select
                    name="preferredLearningMode"
                    value={formData.preferredLearningMode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="ONLINE">Online (Video Call)</option>
                    <option value="IN_PERSON">In-Person (Local neighborhood)</option>
                    <option value="HYBRID">Hybrid (Flexible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Languages (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="English, Spanish, Mandarin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  About Me / Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share a bit about your experience, what you love teaching, or what you hope to discover."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bio & Details Left Column */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                <h2 className="text-base font-bold text-slate-900">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {user.bio || 'No personal bio added yet. Click "Edit Profile" to share your background!'}
                </p>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Languages className="w-4 h-4 text-slate-400" />
                    <span>{user.languages?.join(', ') || 'English'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Skills Offered (Teaching)</span>
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
                            {skillObj?.category && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-200/50 px-1.5 py-0.5 rounded">
                                {skillObj.category}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No teaching skills listed yet. Offer listings can be published in Phase 3.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-brand-600" />
                    <span>Skills Wanted (Learning Goals)</span>
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
                    <p className="text-xs text-slate-500 italic">
                      No learning requests listed yet. Learning requests can be published in Phase 3.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Time Bank Status Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Time Bank Balance
                  </span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">
                    {credits.toFixed(1)} <span className="text-sm font-normal text-emerald-300">Credits</span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Equivalent to {credits.toFixed(1)} hours of free learning from any verified member.
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-800/80 space-y-2 text-xs text-emerald-100">
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-semibold text-emerald-300">1 Hour = 1 Credit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <span className="font-semibold text-emerald-300">Time-Banking (No fiat)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Community Trust
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Welcome Bonus Credited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Atomic Ledger Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
