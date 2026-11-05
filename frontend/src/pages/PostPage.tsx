import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  MapPin,
  Globe,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SkillOption {
  _id: string;
  name: string;
  category: string;
  difficulty?: string;
}

export const PostPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'offer' | 'request'>('offer');
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Teach Offer Form state
  const [offerForm, setOfferForm] = useState({
    skillId: '',
    description: '',
    experienceLevel: 'INTERMEDIATE',
    teachingLanguage: 'English',
    learningMode: 'ONLINE',
    sessionDuration: 60,
    neighborhood: user?.city || '',
    teachingApproach: '',
  });

  // Learn Request Form state
  const [requestForm, setRequestForm] = useState({
    skillId: '',
    title: '',
    description: '',
    learningObjectives: '',
    preferredDifficulty: 'ALL_LEVELS',
    preferredDuration: 60,
    preferredMode: 'ONLINE',
    preferredSchedule: 'Flexible',
    neighborhood: user?.city || '',
  });

  // Inline "New Skill" form
  const [showNewSkillModal, setShowNewSkillModal] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState({
    name: '',
    category: 'Technology',
    description: '',
  });
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load skills list
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/skills?limit=100&sort=name');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSkills(res.data.data);
          if (res.data.data.length > 0) {
            setOfferForm((prev) => ({ ...prev, skillId: res.data.data[0]._id }));
            setRequestForm((prev) => ({ ...prev, skillId: res.data.data[0]._id }));
          }
        }
      } catch (err) {
        console.warn('Could not load skills list:', err);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const handleCreateNewSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillForm.name.trim() || !newSkillForm.description.trim()) {
      return;
    }

    try {
      setIsCreatingSkill(true);
      const res = await api.post('/skills', {
        name: newSkillForm.name.trim(),
        category: newSkillForm.category,
        description: newSkillForm.description.trim(),
      });

      if (res.data?.success && res.data?.data?.skill) {
        const created = res.data.data.skill;
        setSkills((prev) => [created, ...prev]);
        if (mode === 'offer') {
          setOfferForm((prev) => ({ ...prev, skillId: created._id }));
        } else {
          setRequestForm((prev) => ({ ...prev, skillId: created._id }));
        }
        setShowNewSkillModal(false);
        setNewSkillForm({ name: '', category: 'Technology', description: '' });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Could not create skill');
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!offerForm.skillId) {
      setErrorMessage('Please select a skill');
      return;
    }
    if (offerForm.description.trim().length < 10) {
      setErrorMessage('Please write a description of at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/offers', offerForm);
      if (res.data?.success) {
        navigate('/explore');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to publish teaching offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!requestForm.skillId) {
      setErrorMessage('Please select a target skill');
      return;
    }
    if (requestForm.title.trim().length < 3) {
      setErrorMessage('Please enter a clear title (min 3 chars)');
      return;
    }
    if (requestForm.description.trim().length < 10) {
      setErrorMessage('Please write a description of at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/requests', requestForm);
      if (res.data?.success) {
        navigate('/explore');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to publish learning request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Share Your Knowledge
          </h1>
          <p className="text-sm text-slate-600">
            Publish a teaching offer to earn time credits, or create a request to learn from neighbors.
          </p>
        </div>

        {/* Dual Mode Selector */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60">
          <button
            type="button"
            onClick={() => {
              setMode('offer');
              setErrorMessage('');
            }}
            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'offer'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>I Want to Teach (Offer)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('request');
              setErrorMessage('');
            }}
            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'request'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-teal-600" />
            <span>I Want to Learn (Request)</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {mode === 'offer' ? (
            /* TEACH FORM */
            <form onSubmit={handleOfferSubmit} className="space-y-5">
              {/* Skill Selection + Propose New Skill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Select Skill to Teach
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewSkillModal(!showNewSkillModal)}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Can't find it? Propose a new skill</span>
                  </button>
                </div>

                {isLoadingSkills ? (
                  <div className="text-xs text-slate-500 py-2">Loading skills...</div>
                ) : (
                  <select
                    value={offerForm.skillId}
                    onChange={(e) => setOfferForm({ ...offerForm, skillId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    required
                  >
                    {skills.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Inline New Skill Form */}
              {showNewSkillModal && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Add New Skill to Catalog
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Skill name (e.g. Sourdough Baking)"
                      value={newSkillForm.name}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white"
                    />
                    <select
                      value={newSkillForm.category}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Design">Design</option>
                      <option value="Academic">Academic</option>
                      <option value="Creative">Creative</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Short description of this skill"
                    value={newSkillForm.description}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewSkillModal(false)}
                      className="px-3 py-1 text-xs text-slate-600 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isCreatingSkill}
                      onClick={handleCreateNewSkill}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      {isCreatingSkill ? 'Saving...' : 'Add Skill'}
                    </button>
                  </div>
                </div>
              )}

              {/* Experience Level & Learning Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Experience Level
                  </label>
                  <select
                    value={offerForm.experienceLevel}
                    onChange={(e) => setOfferForm({ ...offerForm, experienceLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="BEGINNER">Beginner (Basic Knowledge)</option>
                    <option value="INTERMEDIATE">Intermediate (Competent)</option>
                    <option value="ADVANCED">Advanced (Skilled)</option>
                    <option value="EXPERT">Expert (Mastery / Professional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teaching Format
                  </label>
                  <select
                    value={offerForm.learningMode}
                    onChange={(e) => setOfferForm({ ...offerForm, learningMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="ONLINE">Online (Video Call)</option>
                    <option value="IN_PERSON">In-Person (Local Neighborhood)</option>
                    <option value="HYBRID">Hybrid (Flexible)</option>
                  </select>
                </div>
              </div>

              {/* Duration & Neighborhood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Session Duration (Minutes)
                  </label>
                  <select
                    value={offerForm.sessionDuration}
                    onChange={(e) => setOfferForm({ ...offerForm, sessionDuration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value={30}>30 Minutes (0.5 Credits)</option>
                    <option value={60}>60 Minutes (1.0 Credit)</option>
                    <option value={90}>90 Minutes (1.5 Credits)</option>
                    <option value={120}>120 Minutes (2.0 Credits)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Neighborhood / Area
                  </label>
                  <input
                    type="text"
                    value={offerForm.neighborhood}
                    onChange={(e) => setOfferForm({ ...offerForm, neighborhood: e.target.value })}
                    placeholder="e.g. Downtown, West End"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  What Will You Teach? (Description)
                </label>
                <textarea
                  rows={3}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="Outline what learners will discover during a session with you..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Teaching Approach */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teaching Style & Approach (Optional)
                </label>
                <textarea
                  rows={2}
                  value={offerForm.teachingApproach}
                  onChange={(e) => setOfferForm({ ...offerForm, teachingApproach: e.target.value })}
                  placeholder="Hands-on practice, conversational, step-by-step guidance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Teaching Offer (1 Hr = 1 Credit)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* LEARN REQUEST FORM */
            <form onSubmit={handleRequestSubmit} className="space-y-5">
              {/* Skill Selection + Propose New Skill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Select Skill You Want to Learn
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewSkillModal(!showNewSkillModal)}
                    className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Can't find it? Propose a new skill</span>
                  </button>
                </div>

                {isLoadingSkills ? (
                  <div className="text-xs text-slate-500 py-2">Loading skills...</div>
                ) : (
                  <select
                    value={requestForm.skillId}
                    onChange={(e) => setRequestForm({ ...requestForm, skillId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    required
                  >
                    {skills.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Inline New Skill Form */}
              {showNewSkillModal && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <div className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Add New Skill to Catalog
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Skill name"
                      value={newSkillForm.name}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-teal-300 bg-white"
                    />
                    <select
                      value={newSkillForm.category}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-teal-300 bg-white"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Design">Design</option>
                      <option value="Academic">Academic</option>
                      <option value="Creative">Creative</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={newSkillForm.description}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-teal-300 bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewSkillModal(false)}
                      className="px-3 py-1 text-xs text-slate-600 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isCreatingSkill}
                      onClick={handleCreateNewSkill}
                      className="px-3 py-1 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      {isCreatingSkill ? 'Saving...' : 'Add Skill'}
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Request Headline
                </label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  placeholder="e.g. Seeking beginner Python coaching for college project"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Format & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Difficulty
                  </label>
                  <select
                    value={requestForm.preferredDifficulty}
                    onChange={(e) => setRequestForm({ ...requestForm, preferredDifficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="BEGINNER">Beginner (Start from Scratch)</option>
                    <option value="INTERMEDIATE">Intermediate (Build Confidence)</option>
                    <option value="ADVANCED">Advanced (Deep Dive)</option>
                    <option value="ALL_LEVELS">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Mode
                  </label>
                  <select
                    value={requestForm.preferredMode}
                    onChange={(e) => setRequestForm({ ...requestForm, preferredMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="ONLINE">Online (Video Call)</option>
                    <option value="IN_PERSON">In-Person (Local Neighborhood)</option>
                    <option value="HYBRID">Hybrid (Flexible)</option>
                  </select>
                </div>
              </div>

              {/* Schedule & Neighborhood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Schedule
                  </label>
                  <input
                    type="text"
                    value={requestForm.preferredSchedule}
                    onChange={(e) => setRequestForm({ ...requestForm, preferredSchedule: e.target.value })}
                    placeholder="e.g. Weekday evenings, Saturday mornings"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Neighborhood / Area
                  </label>
                  <input
                    type="text"
                    value={requestForm.neighborhood}
                    onChange={(e) => setRequestForm({ ...requestForm, neighborhood: e.target.value })}
                    placeholder="e.g. North End, Campus"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Description & Objectives */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Learning Goals
                </label>
                <textarea
                  rows={3}
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Explain what specific challenges you're trying to solve or what project you want to build..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 text-white font-semibold text-sm shadow-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing Goal...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Learning Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

