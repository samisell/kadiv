'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/currency';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CalendarDays, Search, Eye, Trash2, ChevronLeft, ChevronRight, CreditCard, Download,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  userId: string;
  eventType: string;
  eventName: string;
  guestCount: number;
  eventDate: string;
  location: string | null;
  venueType: string | null;
  cateringPackage: string | null;
  services: string;
  totalCost: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  payments: { id: string; amount: number; status: string; method: string; createdAt: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status] || 'bg-charcoal-light text-cream border-charcoal-light'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookingsSection() {
  const { format } = useCurrency();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data.bookings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Booking deleted');
      setDeleteId(null);
      fetchBookings();
    } catch {
      toast.error('Failed to delete booking');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export/bookings', '_blank');
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Filters + Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
          <Input
            placeholder="Search events or clients..."
            className="pl-10 bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44 bg-charcoal-light border-gold/10 text-cream h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-charcoal border-gold/20">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
              <SelectItem key={s} value={s} className="text-cream focus:bg-gold/10 focus:text-gold">
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="border-gold/20 text-gold hover:bg-gold/10 hover:text-gold h-9 px-3"
          onClick={handleExportCSV}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <p className="text-xs text-cream/40">{total} booking{total !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <Card className="bg-charcoal border-gold/10 overflow-hidden">
        <ScrollArea className="max-h-[520px]">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-charcoal-light" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays className="w-12 h-12 text-cream/20 mx-auto mb-3" />
              <p className="text-cream/40 text-sm">No bookings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-cream/40 text-xs">Event</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden md:table-cell">Client</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-cream/40 text-xs hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-cream/40 text-xs">Status</TableHead>
                  <TableHead className="text-cream/40 text-xs text-right">Total</TableHead>
                  <TableHead className="text-cream/40 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="border-gold/5 hover:bg-charcoal-light/30">
                    <TableCell>
                      <div className="text-cream text-sm font-medium">{b.eventName}</div>
                      <div className="text-cream/40 text-xs">{b.guestCount} guests</div>
                    </TableCell>
                    <TableCell className="text-cream/60 text-sm hidden md:table-cell">{b.user.name || b.user.email}</TableCell>
                    <TableCell className="text-cream/60 text-sm hidden sm:table-cell">{b.eventType}</TableCell>
                    <TableCell className="text-cream/50 text-sm hidden lg:table-cell">{b.eventDate ? fmtDate(b.eventDate) : '-'}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="text-cream text-sm font-medium text-right">{format(b.totalCost)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-gold" onClick={() => setDetailBooking(b)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(s) => updateStatus(b.id, s)}>
                          <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent [&>span]:hidden">
                            <Badge className="bg-charcoal-light text-cream/50 border-gold/10 hover:bg-charcoal-light/80 text-[10px] cursor-pointer h-7 px-2">⋯</Badge>
                          </SelectTrigger>
                          <SelectContent className="bg-charcoal border-gold/20">
                            <SelectItem value="pending" className="text-cream focus:bg-gold/10">Pending</SelectItem>
                            <SelectItem value="confirmed" className="text-cream focus:bg-gold/10">Confirmed</SelectItem>
                            <SelectItem value="completed" className="text-cream focus:bg-gold/10">Completed</SelectItem>
                            <SelectItem value="cancelled" className="text-red-400 focus:bg-red-500/10">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-cream/50 hover:text-red-400" onClick={() => setDeleteId(b.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="border-gold/10 text-cream/60 hover:text-gold h-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 ${pageNum === page ? 'bg-gold text-charcoal-dark' : 'border-gold/10 text-cream/60 hover:text-gold'}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" className="border-gold/10 text-cream/60 hover:text-gold h-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailBooking} onOpenChange={() => setDetailBooking(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gold font-display text-xl">{detailBooking?.eventName}</DialogTitle>
            <DialogDescription className="text-cream/50">
              Booking ID: {detailBooking?.id.substring(0, 12)}...
            </DialogDescription>
          </DialogHeader>
          {detailBooking && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={detailBooking.status} />
                <span className="text-cream/40 text-xs">{fmtDate(detailBooking.createdAt)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Event Type', detailBooking.eventType],
                  ['Guests', String(detailBooking.guestCount)],
                  ['Event Date', detailBooking.eventDate ? fmtDate(detailBooking.eventDate) : '-'],
                  ['Venue Type', detailBooking.venueType || '-'],
                  ['Catering', detailBooking.cateringPackage || '-'],
                  ['Location', detailBooking.location || '-'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-0.5">{label}</p>
                    <p className="text-sm text-cream">{value}</p>
                  </div>
                ))}
              </div>

              {detailBooking.notes && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-0.5">Notes</p>
                  <p className="text-sm text-cream/70">{detailBooking.notes}</p>
                </div>
              )}

              <div className="luxury-divider" />

              <div>
                <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-2">Client Info</p>
                <div className="flex items-center gap-3 p-3 bg-charcoal-light rounded-lg">
                  <Avatar className="w-10 h-10 bg-gold/20">
                    <AvatarFallback className="text-gold">{(detailBooking.user.name || 'C').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-cream font-medium">{detailBooking.user.name || '-'}</p>
                    <p className="text-xs text-cream/50">{detailBooking.user.email}</p>
                    {detailBooking.user.phone && <p className="text-xs text-cream/50">{detailBooking.user.phone}</p>}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-cream/40 mb-2">Payments ({detailBooking.payments.length})</p>
                {detailBooking.payments.length > 0 ? (
                  <div className="space-y-2">
                    {detailBooking.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-gold" />
                          <div>
                            <p className="text-sm text-cream">{p.method.replace('_', ' ')}</p>
                            <p className="text-xs text-cream/40">{fmtDate(p.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-cream font-medium">{format(p.amount)}</p>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-cream/30">No payments recorded</p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/20 rounded-lg">
                <span className="text-sm text-cream/60">Total Cost</span>
                <span className="text-xl font-bold text-gold">{format(detailBooking.totalCost)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-charcoal border-gold/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream">Delete Booking</DialogTitle>
            <DialogDescription className="text-cream/50">
              Are you sure? This action cannot be undone. All associated payments will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gold/10 text-cream/60 hover:text-cream" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deleteBooking(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
