import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Gift,
  ShieldAlert,
  Download,
  RefreshCw,
  Award,
  Layers,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TransactionItem {
  _id: string;
  senderId?: {
    _id: string;
    name: string;
    username?: string;
    profilePicture?: string;
  } | null;
  receiverId?: {
    _id: string;
    name: string;
    username?: string;
    profilePicture?: string;
  } | null;
  amount: number;
  type: 'SESSION_EARN' | 'SESSION_SPEND' | 'SESSION_REFUND' | 'WELCOME_BONUS' | 'ADMIN_ADJUSTMENT';
  description?: string;
  createdAt: string;
}

interface BalanceSummary {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  completedSessionsCount: number;
  transactionCount: number;
}

export const LedgerPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<BalanceSummary>({
    currentBalance: user?.creditsBalance ?? 3.0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    completedSessionsCount: user?.completedSessions ?? 0,
    transactionCount: 0,
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'EARNED' | 'SPENT' | 'BONUS'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const [balRes, txRes] = await Promise.all([
        api.get('/credits/balance'),
        api.get('/credits/ledger', { params: { type: filterType, page } }),
      ]);

      if (balRes.data?.data) {
        setSummary(balRes.data.data);
      }
      if (txRes.data?.data) {
        setTransactions(txRes.data.data);
        setTotalPages(txRes.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load credit ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [filterType, page]);

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Amount', 'Description'];
    const rows = transactions.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skill_exchange_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionBadge = (type: TransactionItem['type'], isIncome: boolean) => {
    switch (type) {
      case 'SESSION_EARN':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-emerald-600" />,
          label: 'Taught Session (+)',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'SESSION_SPEND':
        return {
          icon: <ArrowDownLeft className="w-4 h-4 text-amber-600" />,
          label: 'Learned Session (-)',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'WELCOME_BONUS':
        return {
          icon: <Gift className="w-4 h-4 text-purple-600" />,
          label: 'Welcome Bonus (+)',
          className: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'ADMIN_ADJUSTMENT':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-indigo-600" />,
          label: 'Admin Adjustment',
          className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-600" />,
          label: type,
          className: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Economics Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Time-Banking Economics — 1 Hour = 1 Credit
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Your Time Credit Ledger
            </h1>
            <p className="max-w-2xl text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every hour you teach another community member earns you 1.0 Time Credit. You can spend that
              credit to learn any other skill on the platform from any neighbor — true egalitarian exchange.
            </p>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-emerald-500/15 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
                <span className="text-xs text-emerald-300 block font-medium">Available Balance</span>
                <span className="text-3xl font-black text-emerald-400 mt-0.5 block">
                  {summary.currentBalance.toFixed(1)}{' '}
                  <span className="text-base font-semibold">Credits</span>
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-slate-400 block font-medium">Lifetime Earned</span>
                <span className="text-2xl font-bold text-white mt-0.5 block">
                  +{summary.lifetimeEarned.toFixed(1)} hrs
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-slate-400 block font-medium">Lifetime Learned</span>
                <span className="text-2xl font-bold text-slate-300 mt-0.5 block">
                  -{summary.lifetimeSpent.toFixed(1)} hrs
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <span className="text-xs text-slate-400 block font-medium">Completed Sessions</span>
                <span className="text-2xl font-bold text-white mt-0.5 block">
                  {summary.completedSessionsCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Actions Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setFilterType('ALL');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => {
                setFilterType('EARNED');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'EARNED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Credits Earned (+)
            </button>
            <button
              onClick={() => {
                setFilterType('SPENT');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'SPENT'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Credits Spent (-)
            </button>
            <button
              onClick={() => {
                setFilterType('BONUS');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'BONUS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-800 bg-purple-50/70 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              Welcome Bonus
            </button>
          </div>

          {/* Export & Refresh */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={exportCSV}
              disabled={transactions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
              title="Download CSV statement"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchLedgerData}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transactions Table / Cards */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Retrieving ledger entries...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No transactions in this category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete skill exchange sessions to earn or spend credits and grow your community time balance.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const currentUId = user?._id?.toString() || '';
                const isIncome =
                  tx.receiverId?._id?.toString() === currentUId ||
                  tx.type === 'WELCOME_BONUS' ||
                  tx.type === 'SESSION_EARN';
                const badge = getTransactionBadge(tx.type, isIncome);
                const counterparty = isIncome ? tx.senderId : tx.receiverId;

                return (
                  <div
                    key={tx._id}
                    className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        {badge.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800">
                          {tx.description || 'Time-banking credit transaction'}
                        </p>

                        {counterparty && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{isIncome ? 'Received from:' : 'Paid to:'}</span>
                            <span className="font-semibold text-slate-700">
                              {counterparty.name} (@{counterparty.username})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right self-end sm:self-auto pl-14 sm:pl-0">
                      <span
                        className={`text-lg font-black block ${
                          isIncome ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {tx.amount.toFixed(1)} Cr
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {tx.amount * 60} minutes value
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

