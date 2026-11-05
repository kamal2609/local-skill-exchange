import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Repeat,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Video,
  FileText,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdSession: any) => void;
  provider: {
    _id: string;
    name: string;
    username?: string;
    profilePicture?: string;
    city?: string;
  };
  skill: {
    _id: string;
    name: string;
    category?: string;
  };
  skillOfferId?: string;
  learningRequestId?: string;
  isReciprocal?: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  provider,
  skill,
  skillOfferId,
  learningRequestId,
  isReciprocal = false,
}) => {
  const { user } = useAuth();

  // Tomorrow formatted as YYYY-MM-DD for default
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [providerSlots, setProviderSlots] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute end time based on start time + duration
  const computeEndTime = (start: string, durationMinutes: number) => {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const endTime = computeEndTime(startTime, duration);
  const creditValue = (duration / 60);

  // Fetch provider's active weekly slots to show available days
  useEffect(() => {
    if (isOpen && provider?._id) {
      const fetchSlots = async () => {
        try {
          setLoadingAvailability(true);
          const res = await api.get(`/availability/user/${provider._id}`);
          if (res.data && res.data.data) {
            setProviderSlots(res.data.data);
          }
        } catch (err) {
          console.warn('Could not fetch provider availability schedule:', err);
        } finally {
          setLoadingAvailability(false);
        }
      };
      fetchSlots();
    }
  }, [isOpen, provider?._id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        providerId: provider._id,
        skillId: skill._id,
        skillOfferId: skillOfferId || null,
        learningRequestId: learningRequestId || null,
        bookingDate,
        startTime,
        endTime,
        duration,
        notes,
        meetingLink: meetingLink || `https://meet.jit.si/skill-exchange-${Date.now()}`,
        isReciprocal,
      };

      const res = await api.post('/sessions', payload);

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request session. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  const userBalance = user?.creditsBalance ?? 3.0;
  const hasSufficientCredits = isReciprocal || userBalance >= creditValue;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Book Skill Exchange
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Request Session with {provider.name}
          </h2>
          <p className="text-xs text-slate-500">
            Topic: <span className="font-semibold text-slate-800">{skill.name}</span>
            {skill.category && ` (${skill.category})`}
          </p>
        </div>

        {/* Reciprocal Banner */}
        {isReciprocal ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
            <Repeat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">⭐ Mutual Skill Swap (0 Net Credits): </span>
              You teach what {provider.name} wants and they teach what you want!
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Time Credit Exchange Rate:
            </span>
            <span className="font-bold text-emerald-700">
              1 Hour = 1.0 Credit ({creditValue.toFixed(1)} Cr for this session)
            </span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Select Date:
            </label>
            <input
              type="date"
              required
              min={tomorrowStr}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Start Time:
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Duration:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value={30}>30 min (0.5 Credits)</option>
                <option value={60}>60 min (1.0 Credit)</option>
                <option value={90}>90 min (1.5 Credits)</option>
                <option value={120}>120 min (2.0 Credits)</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 font-medium pl-1">
            Session Window: <strong className="text-slate-800">{startTime}</strong> to{' '}
            <strong className="text-slate-800">{endTime}</strong> ({duration} min)
          </div>

          {/* Notes / Agenda */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes / Learning Goals:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What specific topics or problems would you like to focus on?"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-slate-400" />
              Custom Online Meeting Link (Optional):
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/xyz or Zoom link (auto-generated if empty)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Insufficient Credit Warning */}
          {!hasSufficientCredits && (
            <p className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
              You currently have {userBalance.toFixed(1)} credits, but this session requires{' '}
              {creditValue.toFixed(1)} credits. Teach a skill or earn credits first.
            </p>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !hasSufficientCredits}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Send Booking Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

