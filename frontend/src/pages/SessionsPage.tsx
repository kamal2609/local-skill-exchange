import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  RefreshCw,
  Sliders,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvailabilityScheduler } from '../components/availability/AvailabilityScheduler';

interface SessionData {
  _id: string;
  learnerId: {
    _id: string;
    name: string;
    username?: string;
    profilePicture?: string;
    city?: string;
  };
  providerId: {
    _id: string;
    name: string;
    username?: string;
    profilePicture?: string;
    city?: string;
    averageRating?: number;
  };
  skillId: {
    _id: string;
    name: string;
    category?: string;
  };
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  creditValue: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  learnerConfirmed?: boolean;
  providerConfirmed?: boolean;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export const SessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'REQUESTED' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [roleFilter, setRoleFilter] = useState<'all' | 'asLearner' | 'asProvider'>('all');
  const [showAvailabilityEditor, setShowAvailabilityEditor] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/sessions', {
        params: {
          status: activeTab,
          role: roleFilter,
        },
      });
      if (res.data && res.data.data) {
        setSessions(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [activeTab, roleFilter]);

  const handleUpdateStatus = async (sessionId: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => {
    try {
      setActionLoadingId(sessionId);
      const res = await api.put(`/sessions/${sessionId}/status`, { status });
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update session status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCompletion = async (sessionId: string) => {
    if (!window.confirm('Confirm that this skill exchange session was completed successfully? This will credit the provider 1 hour.')) {
      return;
    }
    try {
      setActionLoadingId(sessionId);
      const res = await api.post(`/sessions/${sessionId}/confirm`);
      if (res.data.success) {
        alert('🎉 Session successfully confirmed! Credit transfer recorded.');
        fetchSessions();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to confirm session.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: SessionData['status']) => {
    switch (status) {
      case 'SCHEDULED':
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REQUESTED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'COMPLETED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Phase 5: Availability & Booking
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Skill Exchange Sessions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Track your upcoming 1-on-1 sessions, review incoming learner requests, join meeting rooms,
              and confirm hours taught to earn time credits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAvailabilityEditor(!showAvailabilityEditor)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{showAvailabilityEditor ? 'Hide Availability' : 'My Weekly Hours'}</span>
              {showAvailabilityEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={fetchSessions}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh sessions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Availability Scheduler */}
        {showAvailabilityEditor && (
          <div className="animate-in fade-in duration-200">
            <AvailabilityScheduler onSaveComplete={() => setShowAvailabilityEditor(false)} />
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'UPCOMING'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Upcoming & Scheduled
            </button>
            <button
              onClick={() => setActiveTab('REQUESTED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'REQUESTED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'COMPLETED'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed History
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'CANCELLED'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-auto">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="roleFilterSelect" className="text-slate-600">Filter Role:</label>
            <select
              id="roleFilterSelect"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
            >
              <option value="all">All Roles</option>
              <option value="asLearner">I am Learning</option>
              <option value="asProvider">I am Teaching</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Retrieving exchange sessions...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-xs font-semibold">
            {error}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No sessions in this category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore available skill offers or check your smart matches to request your next peer session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {sessions.map((session) => {
              const currentUserId = user?._id?.toString() || '';
              const isProvider = session.providerId?._id?.toString() === currentUserId;
              const isLearner = session.learnerId?._id?.toString() === currentUserId;
              const counterparty = isProvider ? session.learnerId : session.providerId;
              const roleTitle = isProvider ? 'Student / Learner' : 'Instructor / Provider';

              return (
                <div
                  key={session._id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Counterparty & Skill */}
                    <div className="flex items-start gap-4">
                      {counterparty?.profilePicture ? (
                        <img
                          src={counterparty.profilePicture}
                          alt={counterparty.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-2xs">
                          {counterparty?.name?.charAt(0) || 'U'}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-slate-900">
                            {session.skillId?.name || 'Skill Exchange'}
                          </h3>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {session.skillId?.category || 'General'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <span>With {counterparty?.name}</span>
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {roleTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Credits Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {session.creditValue.toFixed(1)} Credits ({session.duration} min)
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-600">Date:</span>
                      <strong className="text-slate-900">
                        {new Date(session.bookingDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-600">Time:</span>
                      <strong className="text-slate-900">
                        {session.startTime} - {session.endTime}
                      </strong>
                    </div>

                    {session.meetingLink && (
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Video className="w-4 h-4 text-teal-600" />
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                        >
                          Join Meeting
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Session Goals:</span>
                      {session.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                    {/* Provider: Accept / Decline Requested Session */}
                    {isProvider && session.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(session._id, 'REJECTED')}
                          disabled={actionLoadingId === session._id}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(session._id, 'ACCEPTED')}
                          disabled={actionLoadingId === session._id}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-500/20"
                        >
                          Accept & Schedule
                        </button>
                      </>
                    )}

                    {/* Scheduled: Confirm completion or cancel */}
                    {(session.status === 'SCHEDULED' || session.status === 'ACCEPTED') && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(session._id, 'CANCELLED')}
                          disabled={actionLoadingId === session._id}
                          className="px-3.5 py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Cancel Session
                        </button>

                        <button
                          onClick={() => handleConfirmCompletion(session._id)}
                          disabled={actionLoadingId === session._id}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs shadow-teal-500/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirm Session Completion</span>
                        </button>
                      </>
                    )}

                    {session.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                        <Award className="w-4 h-4 text-teal-600" />
                        Completed & Confirmed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

