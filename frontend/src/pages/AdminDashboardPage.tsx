import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldAlert,
  Coins,
  Layers,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck,
  UserX,
  PlusCircle,
  Sliders,
} from 'lucide-react';
import api from '../services/api';
import PageTransition from '../components/shared/PageTransition';

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  totalSkills: number;
  activeOffers: number;
  openRequests: number;
  completedSessions: number;
  totalCreditsExchanged: number;
  pendingReportsCount: number;
  creditsInCirculation: number;
  databaseConnected?: boolean;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'LEARNER' | 'PROVIDER' | 'ADMIN';
  isActive: boolean;
  creditsBalance: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

interface SafetyReport {
  _id: string;
  reporterId: { _id: string; name: string; email: string };
  reportedUserId: { _id: string; name: string; email: string; isActive?: boolean };
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  createdAt: string;
}

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'reports' | 'skills' | 'credits'>('metrics');

  // Metrics state
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Reports state
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionLoading, setResolutionLoading] = useState(false);

  // Credit Adjustment state
  const [adjUserId, setAdjUserId] = useState('');
  const [adjAmount, setAdjAmount] = useState('1.0');
  const [adjReason, setAdjReason] = useState('');
  const [adjLoading, setAdjLoading] = useState(false);
  const [adjFeedback, setAdjFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Skill Category state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technology');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillLoading, setNewSkillLoading] = useState(false);
  const [newSkillFeedback, setNewSkillFeedback] = useState<string | null>(null);

  // ── Fetch Metrics ──────────────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const res = await api.get('/admin/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch {
      // fallback
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // ── Fetch Users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (roleFilter) params.append('role', roleFilter);
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch {
      // fallback
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, roleFilter]);

  // ── Fetch Reports ──────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const params = new URLSearchParams();
      if (reportStatusFilter) params.append('status', reportStatusFilter);
      const res = await api.get(`/admin/reports?${params.toString()}`);
      if (res.data.success) {
        setReports(res.data.data || []);
      }
    } catch {
      // fallback
    } finally {
      setReportsLoading(false);
    }
  }, [reportStatusFilter]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab, fetchUsers, fetchReports]);

  // ── Toggle User Status ─────────────────────────────────────────────────────
  const toggleUserStatus = async (user: AdminUser) => {
    try {
      const nextStatus = !user.isActive;
      const res = await api.put(`/admin/users/${user._id}/status`, { isActive: nextStatus });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: nextStatus } : u))
        );
      }
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update user status');
    }
  };

  // ── Change User Role ───────────────────────────────────────────────────────
  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole as 'LEARNER' | 'PROVIDER' | 'ADMIN' } : u))
        );
      }
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update user role');
    }
  };

  // ── Submit Report Resolution ───────────────────────────────────────────────
  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      setResolutionLoading(true);
      const res = await api.put(`/admin/reports/${selectedReport._id}`, {
        status: resolutionStatus,
        adminNotes: resolutionNotes,
      });
      if (res.data.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === selectedReport._id ? { ...r, status: resolutionStatus, adminNotes: resolutionNotes } : r))
        );
        setSelectedReport(null);
        setResolutionNotes('');
        fetchMetrics();
      }
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update report');
    } finally {
      setResolutionLoading(false);
    }
  };

  // ── Submit Credit Adjustment ───────────────────────────────────────────────
  const handleCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjFeedback(null);
    try {
      setAdjLoading(true);
      const res = await api.post('/credits/admin-adjust', {
        userId: adjUserId.trim(),
        amount: parseFloat(adjAmount),
        reason: adjReason.trim(),
      });
      if (res.data.success) {
        setAdjFeedback({
          type: 'success',
          message: `Successfully adjusted balance by ${parseFloat(adjAmount) > 0 ? '+' : ''}${adjAmount} credits!`,
        });
        setAdjReason('');
        fetchMetrics();
      }
    } catch (err: unknown) {
      setAdjFeedback({
        type: 'error',
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Adjustment failed',
      });
    } finally {
      setAdjLoading(false);
    }
  };

  // ── Add Skill Taxonomy ─────────────────────────────────────────────────────
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewSkillFeedback(null);
    try {
      setNewSkillLoading(true);
      const res = await api.post('/admin/categories', {
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDesc.trim() || `Skill in ${newSkillCategory}`,
      });
      if (res.data.success) {
        setNewSkillFeedback(`Skill "${newSkillName}" created successfully!`);
        setNewSkillName('');
        setNewSkillDesc('');
        fetchMetrics();
      }
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create skill');
    } finally {
      setNewSkillLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase tracking-wider">
                Admin Center
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">Platform Command Center</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Platform health metrics, community moderation, user directory, and time-banking credit controls.
            </p>
          </div>
          <button
            onClick={() => {
              fetchMetrics();
              if (activeTab === 'users') fetchUsers();
              if (activeTab === 'reports') fetchReports();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          {[
            { id: 'metrics', label: 'Platform KPIs', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'reports', label: 'Safety & Moderation', icon: ShieldAlert, badge: metrics?.pendingReportsCount },
            { id: 'skills', label: 'Skill Taxonomy', icon: Layers },
            { id: 'credits', label: 'Credit Controls', icon: Coins },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: METRICS ──────────────────────────────────────────────── */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {metricsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Total Registered Members</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.totalUsers}</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">{metrics.activeUsers} Active Accounts</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Skills in Taxonomy</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.totalSkills}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{metrics.activeOffers} Active Offers</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Completed Sessions</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-2">{metrics.completedSessions}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{metrics.openRequests} Open Requests</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Total Hours / Credits Exchanged</p>
                  <p className="text-2xl font-extrabold text-amber-500 mt-2">{metrics.totalCreditsExchanged.toFixed(1)} Cr</p>
                  <p className="text-[11px] text-slate-400 mt-1">{metrics.creditsInCirculation.toFixed(1)} Cr in circulation</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Pending Safety Reports</p>
                  <p className={`text-2xl font-extrabold mt-2 ${metrics.pendingReportsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {metrics.pendingReportsCount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Requires review</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Time-Banking Standard</p>
                  <p className="text-2xl font-extrabold text-teal-600 mt-2">1 Hr = 1 Cr</p>
                  <p className="text-[11px] text-slate-400 mt-1">Egalitarian currency</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Smart Matching</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-2">Active ⭐</p>
                  <p className="text-[11px] text-slate-400 mt-1">Reciprocal barter engine</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Database Status</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Live
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">MongoDB Atlas</p>
                </div>
              </div>
            ) : null}

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Community Health Summary</h3>
                <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                  Skill exchange velocity is stable. Every hour taught directly earns 1 community credit redeemable with any other neighbor.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-50 transition-colors"
                >
                  Review Reports
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-4 py-2 bg-emerald-800/60 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
                >
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: USERS ────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or username…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Roles</option>
                  <option value="LEARNER">Learner</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Apply
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Reputation</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Loading user directory…
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => changeUserRole(u._id, e.target.value)}
                              className="text-[11px] font-bold bg-slate-100 text-slate-700 rounded px-2 py-1 border border-slate-200"
                            >
                              <option value="LEARNER">LEARNER</option>
                              <option value="PROVIDER">PROVIDER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.isActive ? (
                                <>
                                  <UserCheck className="w-3 h-3" /> Active
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3 h-3" /> Suspended
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {(u.creditsBalance || 0).toFixed(1)} Cr
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-amber-600">★ {(u.averageRating || 5.0).toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({u.totalReviews || 0})</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => toggleUserStatus(u)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                                u.isActive
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive ? 'Suspend' : 'Reinstate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: REPORTS ──────────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              {['', 'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReportStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    reportStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st || 'All Reports'}
                </button>
              ))}
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              {reportsLoading ? (
                <div className="py-8 text-center text-slate-400">Loading moderation reports…</div>
              ) : reports.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <ShieldAlert className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-slate-800">Moderation Queue is Clean</p>
                  <p className="text-xs text-slate-400 mt-1">No outstanding user reports in this filter category.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                          {report.reason}
                        </span>
                        <span className="text-xs text-slate-400">
                          Reported by <span className="font-medium text-slate-700">{report.reporterId?.name || 'Anonymous'}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          report.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'DISMISSED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium">{report.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Reported User: <strong className="text-slate-800">{report.reportedUserId?.name}</strong></span>
                        <span>•</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.adminNotes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 italic">Notes: {report.adminNotes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
                    >
                      Take Action
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Resolution Modal */}
            {selectedReport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-900">Resolve Safety Report</h3>
                    <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    Violating user: <strong>{selectedReport.reportedUserId?.name}</strong> ({selectedReport.reason})
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Action</label>
                    <select
                      value={resolutionStatus}
                      onChange={(e) => setResolutionStatus(e.target.value as 'RESOLVED' | 'DISMISSED')}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="RESOLVED">RESOLVED (Action taken / Warned)</option>
                      <option value="DISMISSED">DISMISSED (Invalid or insufficient info)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Audit Notes</label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={3}
                      placeholder="Detail the outcome or conversation with user…"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResolveReport}
                      disabled={resolutionLoading}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {resolutionLoading ? 'Saving…' : 'Save Resolution'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SKILL TAXONOMY ────────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Skill Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Register Skill in Taxonomy</h3>
              <p className="text-xs text-slate-500">
                Adding skills to the catalog standardizes search, auto-matching, and skill categories across the neighbourhood.
              </p>

              {newSkillFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                  {newSkillFeedback}
                </div>
              )}

              <form onSubmit={handleAddSkill} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sourdough Bread Baking, Rust Programming…"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Academic">Academic</option>
                    <option value="Creative">Creative</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the skill and common barter topics…"
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={newSkillLoading || !newSkillName.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  {newSkillLoading ? 'Adding Skill…' : 'Add to Taxonomy'}
                </button>
              </form>
            </div>

            {/* Standard Category Pillars */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Active Category Taxonomies</h3>
              <p className="text-xs text-slate-500">
                Primary skill categories configured in the platform schema.
              </p>

              <div className="space-y-2.5">
                {[
                  { name: 'Technology', desc: 'Coding, Web Dev, Python, Cybersecurity, Mobile Apps', count: '6 skills' },
                  { name: 'Design', desc: 'UI/UX, Graphic Design, Figma, 3D Modeling, Illustration', count: '4 skills' },
                  { name: 'Creative', desc: 'Music, Guitar, Photography, Creative Writing, Video', count: '5 skills' },
                  { name: 'Academic', desc: 'Mathematics, Languages, Physics, History, Chemistry', count: '4 skills' },
                  { name: 'Lifestyle', desc: 'Gardening, Cooking, Yoga, DIY Repairs, Fitness', count: '5 skills' },
                ].map((cat) => (
                  <div key={cat.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-800">{cat.name}</p>
                      <p className="text-[11px] text-slate-500">{cat.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border text-slate-600">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: CREDITS ──────────────────────────────────────────────── */}
        {activeTab === 'credits' && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Direct Credit Ledger Adjustment</h3>
            </div>
            <p className="text-xs text-slate-500">
              Administrators can manually credit or debit accounts with an audited reason. This operation records an immutable <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700">ADMIN_ADJUSTMENT</code> transaction in the double-entry ledger.
            </p>

            {adjFeedback && (
              <div
                className={`p-3 text-xs rounded-lg ${
                  adjFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {adjFeedback.message}
              </div>
            )}

            <form onSubmit={handleCreditAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target User ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 507f1f77bcf86cd799439011"
                  value={adjUserId}
                  onChange={(e) => setAdjUserId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Adjustment Amount *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="Positive to add, negative to deduct (e.g. 2.0 or -1.0)"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">1 Credit = 1 Hour of skill sharing</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mandatory Audit Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State reason (e.g. Community dispute refund, volunteer bonus, compensation for technical glitch)…"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={adjLoading || !adjUserId.trim() || !adjReason.trim()}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Coins className="w-4 h-4" />
                {adjLoading ? 'Executing Transfer…' : 'Record Ledger Adjustment'}
              </button>
            </form>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminDashboardPage;
