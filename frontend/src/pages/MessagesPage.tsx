import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, Search, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Participant {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

interface LastMessage {
  text: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCounts?: Record<string, number>;
  updatedAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: string | { _id: string };
  text: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getOtherParticipant(conv: Conversation, userId: string): Participant {
  return (
    conv.participants.find((p) => p._id !== userId) ||
    conv.participants[0]
  );
}

function getSenderId(msg: Message): string {
  if (typeof msg.senderId === 'string') return msg.senderId;
  return msg.senderId._id;
}

function avatarFallback(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center flex-shrink-0`}
    >
      {avatarFallback(name)}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const userId = (user as { _id?: string; id?: string })?._id || (user as { _id?: string; id?: string })?.id || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draftText, setDraftText] = useState('');
  const [convsLoading, setConvsLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch conversations ───────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      setConvsLoading(true);
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch {
      // silently ignore — demo fallback will render
    } finally {
      setConvsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch messages ────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      setMsgsLoading(true);
      const res = await api.get(`/conversations/${convId}/messages`);
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
    } catch {
      setMessages([]);
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      setMobileView('chat');
    }
  }, [activeConv, fetchMessages]);

  // ── Scroll to bottom when messages update ─────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = async () => {
    const text = draftText.trim();
    if (!text || !activeConv || sending) return;

    // Optimistic UI
    const optimistic: Message = {
      _id: `opt_${Date.now()}`,
      conversationId: activeConv._id,
      senderId: userId,
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraftText('');

    try {
      setSending(true);
      const res = await api.post(`/conversations/${activeConv._id}/messages`, { text });
      if (res.data.success) {
        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) => (m._id === optimistic._id ? res.data.data : m))
        );
        // Refresh conversation list to update lastMessage
        fetchConversations();
      }
    } catch {
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Filtered conversations ─────────────────────────────────────────────────

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const other = getOtherParticipant(c, userId);
    return other.name.toLowerCase().includes(search.toLowerCase());
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const otherUser = activeConv ? getOtherParticipant(activeConv, userId) : null;

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50">

      {/* ── Sidebar: Conversation list ────────────────────────────────────── */}
      <aside
        className={`${
          mobileView === 'list' ? 'flex' : 'hidden md:flex'
        } w-full md:w-80 flex-col bg-white border-r border-slate-200 flex-shrink-0`}
      >
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-800 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
              <Users className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-500 text-sm">No conversations yet</p>
              <p className="text-slate-400 text-xs mt-1">Start chatting from someone&apos;s profile</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const other = getOtherParticipant(conv, userId);
              const isActive = activeConv?._id === conv._id;
              const unread = conv.unreadCounts
                ? (conv.unreadCounts as Record<string, number>)[userId] ?? 0
                : 0;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-50 border-r-2 border-emerald-500'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Avatar name={other.name} src={other.profilePicture} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${unread > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {other.name}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {timeAgo(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-slate-400 truncate">
                        {conv.lastMessage?.text || 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold px-1 flex-shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main: Message thread ──────────────────────────────────────────── */}
      <main className={`${mobileView === 'chat' || !activeConv ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {!activeConv ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Your Messages</h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Select a conversation to start chatting, or visit someone's profile to begin a new one.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
              <button
                className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700"
                onClick={() => { setMobileView('list'); setActiveConv(null); }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {otherUser && <Avatar name={otherUser.name} src={otherUser.profilePicture} />}
              <div>
                <p className="font-semibold text-slate-800 text-sm">{otherUser?.name}</p>
                <p className="text-xs text-slate-400">@{otherUser?.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-slate-400 text-sm">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = getSenderId(msg) === userId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMine
                            ? 'bg-emerald-500 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="flex items-end gap-3 px-4 py-3 bg-white border-t border-slate-200 flex-shrink-0">
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={2000}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-h-40 overflow-y-auto"
                style={{ lineHeight: '1.5' }}
              />
              <button
                onClick={sendMessage}
                disabled={!draftText.trim() || sending}
                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;

