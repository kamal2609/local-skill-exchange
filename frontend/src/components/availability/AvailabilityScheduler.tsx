import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Globe,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export interface AvailabilitySlot {
  _id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  preferredDuration?: number;
  learningMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  timezone?: string;
  isActive?: boolean;
}

interface AvailabilitySchedulerProps {
  onSaveComplete?: () => void;
}

export const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({
  onSaveComplete,
}) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current user's availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await api.get('/availability/my');
        if (res.data && Array.isArray(res.data.data)) {
          setSlots(res.data.data);
        }
      } catch (err: any) {
        console.error('Failed to load availability:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleAddSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek,
      startTime: '09:00',
      endTime: '12:00',
      preferredDuration: 60,
      learningMode: 'ONLINE',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      isActive: true,
    };
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, idx) => idx !== index));
  };

  const handleUpdateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Validate that start < end for all slots
      for (const s of slots) {
        if (s.startTime >= s.endTime) {
          setMessage({
            type: 'error',
            text: `Slot on ${DAYS[s.dayOfWeek]}: Start time (${s.startTime}) must be earlier than end time (${s.endTime}).`,
          });
          setSaving(false);
          return;
        }
      }

      const res = await api.put('/availability/my', { slots });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Weekly availability schedule saved successfully!' });
        if (onSaveComplete) onSaveComplete();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update schedule.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-sm font-semibold">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Recurring Weekly Availability
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Set your recurring available hours. Peers can only book sessions during these active windows.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Schedule</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 7 Days List */}
      <div className="space-y-4">
        {DAYS.map((dayName, dayIndex) => {
          const daySlots = slots
            .map((s, idx) => ({ ...s, originalIndex: idx }))
            .filter((s) => s.dayOfWeek === dayIndex);

          return (
            <div
              key={dayIndex}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {dayName.slice(0, 2)}
                  </span>
                  <span className="font-bold text-sm text-slate-800">{dayName}</span>
                  <span className="text-xs text-slate-600 font-medium">
                    ({daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddSlot(dayIndex)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slot</span>
                </button>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-xs text-slate-600 italic pl-9">
                  Unavailable on this day.
                </p>
              ) : (
                <div className="space-y-2 pl-0 sm:pl-9">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.originalIndex}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <label htmlFor={`start-${slot.originalIndex}`} className="sr-only">Start time</label>
                        <input
                          id={`start-${slot.originalIndex}`}
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            handleUpdateSlot(slot.originalIndex, 'startTime', e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                        />
                        <span className="text-slate-400 font-medium">to</span>
                        <label htmlFor={`end-${slot.originalIndex}`} className="sr-only">End time</label>
                        <input
                          id={`end-${slot.originalIndex}`}
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            handleUpdateSlot(slot.originalIndex, 'endTime', e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label htmlFor={`mode-${slot.originalIndex}`} className="sr-only">Learning mode</label>
                        <select
                          id={`mode-${slot.originalIndex}`}
                          value={slot.learningMode || 'ONLINE'}
                          onChange={(e) =>
                            handleUpdateSlot(slot.originalIndex, 'learningMode', e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                        >
                          <option value="ONLINE">Online</option>
                          <option value="IN_PERSON">In Person</option>
                          <option value="HYBRID">Hybrid</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.originalIndex)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

