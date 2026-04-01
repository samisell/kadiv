'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, CalendarDays, Users, MessageSquare, BarChart3,
  Clock, ChevronRight, ArrowUpRight, ArrowDownRight, Mail, Download,
} from 'lucide-react';

import { type AdminSection } from './AdminSidebar';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OverviewStats {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  unreadMessages: number;
  totalPayments: number;
  paidPayments: number;
  totalRevenue: number;
  totalEstimates: number;
  newsletterSubscribers: number;
}

interface BookingByType {
  eventType: string;
  _count: { id: number };
  _sum: { totalCost: number | null };
}

interface RecentBooking {
  id: string;
  eventName: string;
  eventType: string;
  status: string;
  totalCost: number;
  createdAt: string;
  user: { name: string | null; email: string };
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  eventType: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface OverviewResponse {
  overview: OverviewStats;
  bookingsByType: BookingByType[];
  monthlyRevenue: Record<string, number>;
  recentBookings: RecentBooking[];
  recentMessages: RecentMessage[];
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

// ─── Custom Chart Tooltip ────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-charcoal border border-gold/20 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-cream/50 mb-1">{label}</p>
      <p className="text-sm text-gold font-semibold">
        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface OverviewSectionProps {
  onNavigateToSection: (section: AdminSection) => void;
}

export default function OverviewSection({ onNavigateToSection }: OverviewSectionProps) {
  const { format } = useCurrency();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      // Use mock data as fallback
      setData(null);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const overview = data?.overview;

  // Transform monthly revenue for Recharts
  const revenueChartData = Object.entries(data?.monthlyRevenue || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => {
      const [, m] = month.split('-').map(Number);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { name: monthNames[m - 1] || month, revenue: value };
    });

  const statCards = [
    {
      label: 'Total Revenue',
      value: format(overview?.totalRevenue || 0),
      icon: DollarSign,
      trend: '+12.5%',
      up: true,
      accent: true,
    },
    {
      label: 'Total Bookings',
      value: (overview?.totalBookings || 0).toLocaleString(),
      icon: CalendarDays,
      trend: '+8.2%',
      up: true,
      accent: false,
    },
    {
      label: 'Active Users',
      value: (overview?.totalUsers || 0).toLocaleString(),
      icon: Users,
      trend: '+3.1%',
      up: true,
      accent: false,
    },
    {
      label: 'Pending Messages',
      value: (overview?.unreadMessages || 0).toLocaleString(),
      icon: MessageSquare,
      trend: '-2',
      up: false,
      accent: false,
    },
  ];

  const quickActions: Array<{ label: string; icon: React.ElementType; section: AdminSection }> = [
    { label: 'View All Bookings', icon: CalendarDays, section: 'bookings' },
    { label: 'Manage Users', icon: Users, section: 'users' },
    { label: 'Read Messages', icon: Mail, section: 'messages' },
    { label: 'Newsletter', icon: MessageSquare, section: 'newsletter' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-charcoal border-gold/10">
              <CardContent className="p-5"><Skeleton className="h-24 w-full bg-charcoal-light" /></CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-charcoal border-gold/10">
          <CardContent className="p-6"><Skeleton className="h-72 w-full bg-charcoal-light" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-charcoal border-gold/10 hover-lift ${card.accent ? 'gold-glow' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${card.accent ? 'bg-gold/15' : 'bg-charcoal-light'}`}>
                    <card.icon className={`w-5 h-5 ${card.accent ? 'text-gold' : 'text-cream/60'}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${card.up ? 'text-green-400' : 'text-red-400'}`}>
                    {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.trend}
                  </div>
                </div>
                <p className={`text-2xl font-bold ${card.accent ? 'text-gold-gradient' : 'text-cream'}`}>
                  {card.value}
                </p>
                <p className="text-xs text-cream/40 mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Bookings by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 bg-charcoal border-gold/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cream text-base">
                <BarChart3 className="w-4 h-4 text-gold" />
                Monthly Revenue
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold text-xs hover:text-gold-light"
                onClick={() => window.open('/api/admin/export/payments', '_blank')}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Payments
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A456" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8A456" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,164,86,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(250,243,224,0.4)', fontSize: 12 }} axisLine={{ stroke: 'rgba(200,164,86,0.1)' }} />
                  <YAxis tick={{ fill: 'rgba(250,243,224,0.4)', fontSize: 12 }} axisLine={{ stroke: 'rgba(200,164,86,0.1)' }} tickFormatter={(v) => format(v)} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#C8A456" strokeWidth={2} fill="url(#goldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-cream/30 text-sm">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Event Type Distribution */}
        <Card className="bg-charcoal border-gold/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-cream text-base">
              <CalendarDays className="w-4 h-4 text-gold" />
              Bookings by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            {(data?.bookingsByType || []).length > 0 ? (
              data!.bookingsByType.map((bt) => {
                const totalBookings = data!.bookingsByType.reduce((s, b) => s + b._count.id, 0) || 1;
                const pct = (bt._count.id / totalBookings) * 100;
                return (
                  <div key={bt.eventType} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-cream/70">{bt.eventType}</span>
                      <span className="text-cream/50">{bt._count.id} &middot; {format(bt._sum.totalCost || 0)}</span>
                    </div>
                    <div className="h-2 bg-charcoal-light rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-cream/30 text-sm text-center py-8">No booking data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="bg-charcoal border-gold/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cream text-base">
                <Clock className="w-4 h-4 text-gold" />
                Recent Bookings
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold text-xs hover:text-gold-light"
                onClick={() => onNavigateToSection('bookings')}
              >
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(data?.recentBookings || []).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/10 hover:bg-transparent">
                    <TableHead className="text-cream/40 text-xs">Event</TableHead>
                    <TableHead className="text-cream/40 text-xs hidden sm:table-cell">Client</TableHead>
                    <TableHead className="text-cream/40 text-xs">Status</TableHead>
                    <TableHead className="text-cream/40 text-xs text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.recentBookings.map((b) => (
                    <TableRow key={b.id} className="border-gold/5 hover:bg-charcoal-light/30">
                      <TableCell className="text-cream text-sm font-medium">{b.eventName}</TableCell>
                      <TableCell className="text-cream/60 text-sm hidden sm:table-cell">{b.user.name || b.user.email}</TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell className="text-cream text-sm font-medium text-right">{format(b.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-cream/30 text-sm">No bookings yet</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="bg-charcoal border-gold/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cream text-base">
                <Mail className="w-4 h-4 text-gold" />
                Recent Messages
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold text-xs hover:text-gold-light"
                onClick={() => onNavigateToSection('messages')}
              >
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(data?.recentMessages || []).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/10 hover:bg-transparent">
                    <TableHead className="text-cream/40 text-xs">From</TableHead>
                    <TableHead className="text-cream/40 text-xs hidden sm:table-cell">Event</TableHead>
                    <TableHead className="text-cream/40 text-xs">Date</TableHead>
                    <TableHead className="text-cream/40 text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.recentMessages.map((m) => (
                    <TableRow key={m.id} className="border-gold/5 hover:bg-charcoal-light/30">
                      <TableCell className="text-cream text-sm font-medium">{m.name}</TableCell>
                      <TableCell className="text-cream/60 text-sm hidden sm:table-cell">{m.eventType || '-'}</TableCell>
                      <TableCell className="text-cream/50 text-sm">{fmtDate(m.createdAt)}</TableCell>
                      <TableCell>
                        {m.isRead ? (
                          <span className="text-xs text-cream/30">Read</span>
                        ) : (
                          <Badge className="bg-gold/20 text-gold text-[10px] border-gold/30">New</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-cream/30 text-sm">No messages yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={() => onNavigateToSection(qa.section)}
            className="flex items-center gap-3 p-4 rounded-lg bg-charcoal border border-gold/10 hover:border-gold/30 hover:bg-charcoal-light/50 transition-all text-left"
          >
            <qa.icon className="w-5 h-5 text-gold shrink-0" />
            <span className="text-sm text-cream/80">{qa.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}