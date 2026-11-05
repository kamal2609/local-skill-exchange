import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  Globe,
  Star,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

interface SkillDetail {
  _id: string;
  name: string;
  category: string;
  difficulty?: string;
  description?: string;
}

interface LearnerDetail {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  city?: string;
  languages?: string[];
  averageRating?: number;
  completedSessions?: number;
}

interface RequestData {
  _id: string;
  skillId: SkillDetail;
  learnerId: LearnerDetail;
  title: string;
  description: string;
  learningObjectives?: string;
  preferredDifficulty: string;
  preferredDuration: number;
  preferredMode: string;
  preferredSchedule: string;
  neighborhood?: string;
  status: string;
  createdAt: string;
}

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/requests/${id}`);
        if (res.data?.success && res.data?.data?.request) {
          setRequest(res.data.data.request);
        } else {
          setErrorMessage('Request not found');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMessage(error.message || 'Could not load request details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading learning request...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Request Not Found</h2>
        <p className="text-sm text-slate-600">
          {errorMessage || 'This learning request is no longer active or has been matched.'}
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Target Skill: {request.skillId?.name}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {request.preferredMode?.replace('_', ' ')}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                Status: {request.status}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {request.title}
          </h1>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100/80">
              <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Target Duration</span>
              </div>
              <div className="text-lg font-bold text-teal-950 mt-0.5">
                {request.preferredDuration || 60} mins
              </div>
              <div className="text-[10px] text-teal-700">1 credit per hr</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Schedule</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {request.preferredSchedule || 'Flexible'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                <span>Target Level</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {request.preferredDifficulty?.replace('_', ' ')}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Location</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {request.neighborhood || request.learnerId?.city || 'Local Area'}
              </div>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Learning Goals & Details</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {request.description}
              </p>

              {request.learningObjectives && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">Specific Objectives</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {request.learningObjectives}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Learner Card Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Requested By
              </span>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  {request.learnerId?.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {request.learnerId?.name}
                  </h3>
                  <p className="text-xs text-slate-500">@{request.learnerId?.username}</p>
                </div>
              </div>

              {request.learnerId?.bio && (
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{request.learnerId.bio}"
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Sessions Completed:</span>
                  <span className="font-semibold text-slate-800">
                    {request.learnerId?.completedSessions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Languages:</span>
                  <span className="font-semibold text-slate-800">
                    {request.learnerId?.languages?.join(', ') || 'English'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  to={`/users/${request.learnerId?._id}`}
                  className="w-full py-2 px-3 text-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 block transition-colors"
                >
                  View Member Profile
                </Link>

                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Offer to Teach (Phase 5)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
