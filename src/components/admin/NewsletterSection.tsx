'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Users, Trash2, Download, MailCheck, MailX } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewsletterSection() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubscribers(data.subscribers);
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(isActive ? 'Subscriber deactivated' : 'Subscriber activated');
      fetchSubscribers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteSubscriber = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Subscriber removed');
      setDeleteId(null);
      fetchSubscribers();
    } catch {
      toast.error('Failed to remove subscriber');
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Status', 'Subscribed Date'];
    const rows = subscribers.map(s => [
      s.email,
      s.isActive ? 'Active' : 'Inactive',
      fmtDate(s.createdAt),
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const activeCount = subscribers.filter(s => s.isActive).length;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Stats + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-gold-gradient">{subscribers.length}</p>
            <p className="text-xs text-cream/40">Total Subscribers</p>
          </div>
          <div className="h-8 w-px bg-gold/10" />
          <div>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-xs text-cream/40">Active</p>
          </div>
          <div className="h-8 w-px bg-gold/10" />
          <div>
            <p className="text-2xl font-bold text-cream/50">{subscribers.length - activeCount}</p>
            <p className="text-xs text-cream/40">Inactive</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-gold/20 text-gold hover:text-gold-light hover:bg-gold/5"
          onClick={exportCSV}
          disabled={subscribers.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-charcoal border-gold/10 overflow-hidden">
        <div className="max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-charcoal-light" />)}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-cream/20 mx-auto mb-3" />
              <p className="text-cream/40 text-sm">No subscribers yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-cream/40 text-xs">#</TableHead>
                  <TableHead className="text-cream/40 text-xs">Email</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden sm:table-cell">Subscribed Date</TableHead>
                  <TableHead className="text-cream/40 text-xs">Status</TableHead>
                  <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub, i) => (
                  <TableRow key={sub.id} className="border-gold/5 hover:bg-charcoal-light/30">
                    <TableCell className="text-cream/40 text-xs">{i + 1}</TableCell>
                    <TableCell className="text-cream text-sm font-medium">{sub.email}</TableCell>
                    <TableCell className="text-cream/50 text-sm hidden sm:table-cell">{fmtDate(sub.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          sub.isActive
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-charcoal-light text-cream/50 border-charcoal-light'
                        }
                      >
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${sub.isActive ? 'text-cream/50 hover:text-cream' : 'text-gold hover:text-gold-light'}`}
                          onClick={() => toggleStatus(sub.id, sub.isActive)}
                          title={sub.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {sub.isActive ? <MailX className="w-4 h-4" /> : <MailCheck className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => setDeleteId(sub.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream">Remove Subscriber</DialogTitle>
            <p className="text-cream/50 text-sm mt-2">Are you sure you want to remove this subscriber? This action cannot be undone.</p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deleteSubscriber(deleteId)}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
