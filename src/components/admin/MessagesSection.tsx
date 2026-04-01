'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Mail, Search, Trash2, Eye, EyeOff, MessageSquare, Inbox } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string | null;
  preferredDate: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const fmtDateTime = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Component ───────────────────────────────────────────────────────────────

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleReadStatus = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: !isRead }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRead ? 'Marked as unread' : 'Marked as read');
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: !isRead });
      }
    } catch {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Message deleted');
      setDeleteId(null);
      setSelectedMessage(null);
      fetchMessages();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'unread' && m.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.eventType || '').toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
          <Input
            placeholder="Search messages..."
            className="pl-10 bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-charcoal-light border border-gold/10 h-9">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark">
              All ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-charcoal border-gold/10"><CardContent className="p-4"><Skeleton className="h-20 w-full bg-charcoal-light" /></CardContent></Card>
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="py-16 text-center">
          <Inbox className="w-12 h-12 text-cream/20 mx-auto mb-3" />
          <p className="text-cream/40 text-sm">{activeTab === 'unread' ? 'No unread messages' : 'No messages found'}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`bg-charcoal border-gold/10 hover:border-gold/20 transition-all cursor-pointer ${
                    !msg.isRead ? 'border-l-2 border-l-gold' : ''
                  }`}
                  onClick={() => { setSelectedMessage(msg); if (!msg.isRead) toggleReadStatus(msg.id, false); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        !msg.isRead ? 'bg-gold/20' : 'bg-charcoal-light'
                      }`}>
                        <Mail className={`w-4 h-4 ${!msg.isRead ? 'text-gold' : 'text-cream/40'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={`text-sm truncate ${!msg.isRead ? 'text-cream font-semibold' : 'text-cream/80'}`}>
                              {msg.name}
                            </p>
                            {!msg.isRead && (
                              <Badge className="bg-gold/20 text-gold text-[10px] border-gold/30 shrink-0">New</Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-cream/40 shrink-0">{fmtDate(msg.createdAt)}</span>
                        </div>
                        <p className="text-xs text-cream/40 mb-1.5">{msg.email}{msg.eventType ? ` · ${msg.eventType}` : ''}</p>
                        <p className="text-sm text-cream/50 line-clamp-2">{msg.message}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cream/40 hover:text-gold"
                          onClick={() => toggleReadStatus(msg.id, msg.isRead)}
                        >
                          {msg.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cream/40 hover:text-red-400"
                          onClick={() => setDeleteId(msg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cream flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold" />
              {selectedMessage?.eventType || selectedMessage?.name || 'Message'}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-cream/40">
                <span>{selectedMessage.name}</span>
                <span>·</span>
                <span>{selectedMessage.email}</span>
                {selectedMessage.phone && (
                  <>
                    <span>·</span>
                    <span>{selectedMessage.phone}</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedMessage.eventType && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-0.5">Event Type</p>
                    <p className="text-sm text-cream">{selectedMessage.eventType}</p>
                  </div>
                )}
                {selectedMessage.preferredDate && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-0.5">Preferred Date</p>
                    <p className="text-sm text-cream">{fmtDate(selectedMessage.preferredDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-0.5">Received</p>
                  <p className="text-sm text-cream">{fmtDateTime(selectedMessage.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-0.5">Status</p>
                  <Badge variant="outline" className={selectedMessage.isRead ? 'bg-charcoal-light text-cream/60 border-charcoal-light' : 'bg-gold/20 text-gold border-gold/30'}>
                    {selectedMessage.isRead ? 'Read' : 'Unread'}
                  </Badge>
                </div>
              </div>

              <div className="luxury-divider" />

              <div>
                <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-2">Message</p>
                <div className="p-4 bg-charcoal-light rounded-lg">
                  <p className="text-sm text-cream/80 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold/10 text-cream/60 hover:text-cream"
                  onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.isRead)}
                >
                  {selectedMessage.isRead ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { setDeleteId(selectedMessage.id); setSelectedMessage(null); }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream">Delete Message</DialogTitle>
            <p className="text-cream/50 text-sm mt-2">Are you sure you want to delete this message? This action cannot be undone.</p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMessage(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}