import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

interface ReportedUser {
  _id: string;
  name: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reportedUser: ReportedUser;
}

const REASONS = [
  { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate behavior' },
  { value: 'SPAM', label: 'Spam or self-promotion' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'FAKE_PROFILE', label: 'Fake or misleading profile' },
  { value: 'NO_SHOW', label: 'No-show or cancellation abuse' },
  { value: 'OTHER', label: 'Other' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSuccess, reportedUser }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide at least 10 characters in the description.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/reports', {
        reportedUserId: reportedUser._id,
        reason,
        description: description.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit report. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-slate-800">Report User</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-slate-600 text-sm">
            You are reporting <span className="font-semibold text-slate-800">{reportedUser.name}</span>.
            Our moderation team will review this report within 24 hours.
          </p>

          {/* Reason select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
            >
              <option value="" disabled>Select a reason…</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              required
              placeholder="Please describe the issue in detail…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{description.length}/1000</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Info note */}
          <p className="text-xs text-slate-400">
            Reports are confidential. False reports may result in account restrictions.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors"
            >
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;

