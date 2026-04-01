'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  MessageCircle, Send, Search, ArrowLeft,
  CheckCircle, AlertCircle, XCircle, Circle,
} from 'lucide-react';
import { useAuth } from '@/store/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

interface Conversation {
  id: string;
  userId: string;
  user: ChatUser;
  status: 'open' | 'resolved' | 'closed';
  lastMessage: string | null;
  lastMessageAt: string | null;
  userUnreadCount: number;
  adminUnreadCount: number;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: 'user' | 'admin';
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const fmtRelative = (d: string) => {
  const now = Date.now();
  const date = new Date(d).getTime();
  const diff = now - date;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return fmtDate(d);
};

const getInitials = (name: string | null, email: string) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: 'Open', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <Circle className="w-3 h-3" /> },
  resolved: { label: 'Resolved', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  closed: { label: 'Closed', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <Badge variant="outline" className={`${config.color} text-[10px] gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

// ─── API Helper ──────────────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const { getToken } = useAuth.getState();
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminChatSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef(0);

  // ── Fetch Conversations ──────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/chat');
      setConversations(data.conversations || []);
    } catch {
      // Silent fail on polling — only show toast on initial load
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/api/admin/chat');
        setConversations(data.conversations || []);
      } catch {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Poll conversations every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // ── Fetch Messages ───────────────────────────────────────────────────────

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await apiFetch(`/api/admin/chat/${conversationId}`);
      setActiveConversation(data.conversation || null);
      setMessages(data.messages || []);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    fetchMessages(activeId);
  }, [activeId, fetchMessages]);

  // Poll messages every 3 seconds for active conversation
  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => fetchMessages(activeId), 3000);
    return () => clearInterval(interval);
  }, [activeId, fetchMessages]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (messages.length !== prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  // ── Select Conversation ──────────────────────────────────────────────────

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setMobileShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  // ── Send Message ─────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !activeId || sending) return;

    // Optimistic UI
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeId,
      senderType: 'admin',
      senderId: 'admin',
      senderName: 'You',
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputValue('');
    setSending(true);

    try {
      await apiFetch(`/api/admin/chat/${activeId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      // Refresh to get server message (replaces optimistic)
      await fetchMessages(activeId);
      // Also refresh conversations to update lastMessage
      await fetchConversations();
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ── Update Status ────────────────────────────────────────────────────────

  const handleStatusChange = async (status: 'open' | 'resolved' | 'closed') => {
    if (!activeId) return;
    try {
      await apiFetch(`/api/admin/chat/${activeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Conversation marked as ${status}`);
      setActiveConversation((prev) => (prev ? { ...prev, status } : null));
      fetchConversations();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Filtered Conversations ───────────────────────────────────────────────

  const filteredConversations = conversations
    .filter((c) => {
      if (filter === 'open' && c.status !== 'open') return false;
      if (filter === 'unread' && c.adminUnreadCount === 0) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (c.user.name || '').toLowerCase().includes(q) ||
          c.user.email.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
    });

  const totalUnread = conversations.reduce((sum, c) => sum + c.adminUnreadCount, 0);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-[calc(100vh-10rem)] min-h-[500px] border border-gold/10 rounded-xl overflow-hidden bg-charcoal">
        {/* ─── Conversation List ─── */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gold/10 flex flex-col bg-charcoal ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gold/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cream tracking-wide">Conversations</h3>
              {totalUnread > 0 && (
                <Badge className="bg-gold/20 text-gold text-[10px] border-gold/30">
                  {totalUnread} new
                </Badge>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              {([
                { key: 'all', label: 'All' },
                { key: 'open', label: 'Open' },
                { key: 'unread', label: 'Unread' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                    filter === tab.key
                      ? 'bg-gold/20 text-gold font-medium'
                      : 'text-cream/40 hover:text-cream/60 hover:bg-charcoal-light'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full bg-charcoal-light shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-28 bg-charcoal-light" />
                      <Skeleton className="h-3 w-full bg-charcoal-light" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-20 text-center px-4">
                <MessageCircle className="w-10 h-10 text-cream/20 mx-auto mb-3" />
                <p className="text-cream/40 text-sm">No conversations yet</p>
                <p className="text-cream/30 text-xs mt-1">
                  {filter !== 'all' || search ? 'Try adjusting your filters' : 'Conversations will appear when users start chatting'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${
                      activeId === conv.id
                        ? 'bg-gold/10 border border-gold/20'
                        : 'hover:bg-charcoal-light/50 border border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className={`w-10 h-10 ${conv.adminUnreadCount > 0 ? 'ring-2 ring-gold/40' : ''}`}>
                        <AvatarFallback
                          className={`text-xs font-medium ${
                            conv.adminUnreadCount > 0
                              ? 'bg-gold/20 text-gold'
                              : 'bg-charcoal-light text-cream/60'
                          }`}
                        >
                          {getInitials(conv.user.name, conv.user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p
                          className={`text-sm truncate ${
                            conv.adminUnreadCount > 0 ? 'text-cream font-semibold' : 'text-cream/70'
                          }`}
                        >
                          {conv.user.name || conv.user.email}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-cream/40 shrink-0">
                            {fmtRelative(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            conv.adminUnreadCount > 0 ? 'text-cream/60' : 'text-cream/40'
                          }`}
                        >
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={conv.status} />
                          {conv.adminUnreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-gold text-charcoal-dark text-[10px] font-bold flex items-center justify-center">
                              {conv.adminUnreadCount > 9 ? '9+' : conv.adminUnreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Chat Panel ─── */}
        <div
          className={`flex-1 flex flex-col bg-charcoal ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeId && activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gold/10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile back button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-cream/50 hover:text-gold md:hidden shrink-0"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <Avatar className="w-9 h-9 bg-gold/20 shrink-0">
                    <AvatarFallback className="text-xs font-medium text-gold">
                      {getInitials(activeConversation.user.name, activeConversation.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cream truncate">
                      {activeConversation.user.name || activeConversation.user.email}
                    </p>
                    <p className="text-xs text-cream/40 truncate">{activeConversation.user.email}</p>
                  </div>
                </div>

                {/* Status Selector */}
                <Select
                  value={activeConversation.status}
                  onValueChange={(v) => handleStatusChange(v as 'open' | 'resolved' | 'closed')}
                >
                  <SelectTrigger className="w-auto h-8 border-gold/10 bg-charcoal-light text-cream text-xs gap-1.5 pr-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-gold/20">
                    <SelectItem value="open" className="text-cream focus:bg-green-500/10 focus:text-green-400">
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 text-green-400" />
                        Open
                      </div>
                    </SelectItem>
                    <SelectItem value="resolved" className="text-cream focus:bg-blue-500/10 focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                        Resolved
                      </div>
                    </SelectItem>
                    <SelectItem value="closed" className="text-cream focus:bg-red-500/10 focus:text-red-400">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-red-400" />
                        Closed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading && messages.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                      >
                        <Skeleton className="h-16 w-64 bg-charcoal-light rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-10 h-10 text-cream/20 mx-auto mb-3" />
                      <p className="text-cream/40 text-sm">No messages yet</p>
                      <p className="text-cream/30 text-xs mt-1">
                        Send the first message to start the conversation
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Date separator for first message */}
                    <div className="flex items-center justify-center">
                      <span className="text-[10px] text-cream/30 bg-charcoal px-3 py-1 rounded-full">
                        {fmtDate(messages[0].createdAt)}
                      </span>
                    </div>

                    {messages.map((msg, idx) => {
                      const isAdmin = msg.senderType === 'admin';
                      const showDateSep =
                        idx > 0 &&
                        new Date(messages[idx - 1].createdAt).toDateString() !==
                          new Date(msg.createdAt).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDateSep && (
                            <div className="flex items-center justify-center mb-3">
                              <span className="text-[10px] text-cream/30 bg-charcoal px-3 py-1 rounded-full">
                                {fmtDate(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] lg:max-w-[60%] ${
                                isAdmin
                                  ? 'bg-gold/10 border border-gold/20 rounded-2xl rounded-br-md'
                                  : 'bg-charcoal-light border border-gold/5 rounded-2xl rounded-bl-md'
                              }`}
                            >
                              {/* Sender name */}
                              <p
                                className={`px-4 pt-2.5 text-[10px] font-medium uppercase tracking-wider ${
                                  isAdmin ? 'text-gold/70' : 'text-cream/30'
                                }`}
                              >
                                {isAdmin ? 'You' : msg.senderName}
                              </p>

                              {/* Content */}
                              <p className="px-4 pb-1 text-sm text-cream/85 leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>

                              {/* Timestamp */}
                              <p
                                className={`px-4 pb-2.5 text-[10px] ${
                                  isAdmin ? 'text-gold/40 text-right' : 'text-cream/25'
                                }`}
                              >
                                {fmtTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gold/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    className="flex-1 bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 h-10 text-sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || sending}
                    className="h-10 w-10 bg-gold hover:bg-gold/90 text-charcoal-dark shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* ── Empty State: No Conversation Selected ── */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-full bg-charcoal-light flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-cream/20" />
                </div>
                <p className="text-cream/40 text-sm font-medium">
                  Select a conversation to start chatting
                </p>
                <p className="text-cream/30 text-xs mt-1">
                  Choose a conversation from the list to view and reply to messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
