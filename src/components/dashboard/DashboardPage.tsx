'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Calendar,
  CreditCard,
  Download,
  Settings,
  User,
  Bell,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  FileText,
  Shield,
  Calculator,
  Headphones,
  Trash2,
  Eye,
  Check,
  Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrency } from '@/lib/currency';
import { DashboardSkeleton } from '@/components/ui/page-skeleton';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';

/* ─── Animation Variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const tabContentVariant: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
};

/* ─── Stats Cards Data ─── */
const STATS_CARDS = [
  {
    icon: Calendar,
    label: 'Active Bookings',
    value: '3',
    trend: '+1 this month',
    trendUp: true,
    color: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/20',
  },
  {
    icon: Bell,
    label: 'Upcoming Events',
    value: '2',
    trend: 'Next in 30 days',
    trendUp: true,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: DollarSign,
    label: 'Total Spent',
    value: '₦19,375,000',
    trend: '+18% vs last quarter',
    trendUp: true,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    icon: FileText,
    label: 'Saved Estimates',
    value: '5',
    trend: '2 updated recently',
    trendUp: false,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
] as const;

/* ─── Raw booking/estimate/payment types (from API) ─── */
interface RawBooking {
  id: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  status: string;
  totalCost: number;
}

interface RawEstimate {
  id: string;
  eventType: string;
  guestCount: number;
  totalCost: number;
  createdAt: string;
}

interface BookingRow {
  id: string;
  event: string;
  type: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  cost: string;
  _rawId?: string;
}
type EstimateRow = (typeof ESTIMATES_DATA)[number] & { _rawId?: string };
type PaymentRow = (typeof PAYMENTS_DATA)[number];

/* ─── Mock Bookings Data ─── */
const BOOKINGS_DATA = [
  {
    id: 'BK-001',
    event: 'Harrison Wedding Reception',
    type: 'Wedding',
    date: '2025-03-15',
    status: 'Confirmed' as const,
    cost: '₦13,175,000',
  },
  {
    id: 'BK-002',
    event: 'Aqua Corp Annual Gala',
    type: 'Corporate',
    date: '2025-04-22',
    status: 'Pending' as const,
    cost: '₦4,960,000',
  },
  {
    id: 'BK-003',
    event: 'Sophia\'s 30th Birthday',
    type: 'Private Party',
    date: '2025-02-08',
    status: 'Completed' as const,
    cost: '₦3,255,000',
  },
  {
    id: 'BK-004',
    event: 'Laurent Charity Concert',
    type: 'Concert',
    date: '2025-05-10',
    status: 'Confirmed' as const,
    cost: '₦10,540,000',
  },
] as const;

/* ─── Mock Estimates Data ─── */
const ESTIMATES_DATA = [
  {
    id: 'EST-001',
    eventType: 'Wedding',
    guestCount: 250,
    estimatedCost: '₦23,560,000',
    dateCreated: '2025-01-10',
  },
  {
    id: 'EST-002',
    eventType: 'Corporate Gala',
    guestCount: 150,
    estimatedCost: '₦15,190,000',
    dateCreated: '2025-01-15',
  },
  {
    id: 'EST-003',
    eventType: 'Private Party',
    guestCount: 80,
    estimatedCost: '₦6,975,000',
    dateCreated: '2025-01-20',
  },
  {
    id: 'EST-004',
    eventType: 'Concert',
    guestCount: 500,
    estimatedCost: '₦34,100,000',
    dateCreated: '2025-02-01',
  },
  {
    id: 'EST-005',
    eventType: 'Birthday Celebration',
    guestCount: 60,
    estimatedCost: '₦4,960,000',
    dateCreated: '2025-02-05',
  },
] as const;

/* ─── Mock Payment History Data ─── */
const PAYMENTS_DATA = [
  {
    id: 'PAY-001',
    date: '2025-02-01',
    event: 'Harrison Wedding',
    amount: '₦6,587,500',
    method: 'Visa •••• 4532',
    status: 'Paid' as const,
  },
  {
    id: 'PAY-002',
    date: '2025-01-28',
    event: 'Sophia\'s Birthday',
    amount: '₦3,255,000',
    method: 'Mastercard •••• 8901',
    status: 'Paid' as const,
  },
  {
    id: 'PAY-003',
    date: '2025-01-20',
    event: 'Aqua Corp Gala',
    amount: '₦2,480,000',
    method: 'Bank Transfer',
    status: 'Pending' as const,
  },
  {
    id: 'PAY-004',
    date: '2025-01-10',
    event: 'Cancelled Event',
    amount: '₦775,000',
    method: 'Visa •••• 4532',
    status: 'Refunded' as const,
  },
  {
    id: 'PAY-005',
    date: '2024-12-15',
    event: 'Year-End Mixer',
    amount: '₦5,890,000',
    method: 'Amex •••• 7722',
    status: 'Paid' as const,
  },
] as const;

/* ─── Status Badge Helper ─── */
function BookingStatusBadge({ status }: { status: 'Confirmed' | 'Pending' | 'Completed' }) {
  const config = {
    Confirmed: {
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    Pending: {
      className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      dot: 'bg-yellow-400',
    },
    Completed: {
      className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400',
    },
  }[status];

  return (
    <Badge variant="outline" className={`${config.className} border gap-1.5 px-3 py-1 text-xs font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: 'Paid' | 'Pending' | 'Refunded' }) {
  const config = {
    Paid: {
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    Pending: {
      className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    },
    Refunded: {
      className: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
  }[status];

  return (
    <Badge variant="outline" className={`${config.className} border px-3 py-1 text-xs font-medium`}>
      {status}
    </Badge>
  );
}

/* ─── Countdown Timer Hook ─── */
function useCountdown(targetDate: Date) {
  const calcTimeLeft = useCallback(() => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  return timeLeft;
}

/* ─── Countdown Display Unit ─── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-charcoal-light border border-gold/20 flex items-center justify-center overflow-hidden"
        style={{ perspective: '400px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <span className="text-2xl md:text-3xl font-bold text-gold font-display tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-[10px] md:text-xs text-cream/40 uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  );
}

/* ─── Quick Actions Data ─── */
const QUICK_ACTIONS = [
  {
    icon: Calendar,
    label: 'Book New Event',
    description: 'Start planning your next luxury event',
    action: 'booking' as const,
    primary: true,
  },
  {
    icon: Calculator,
    label: 'Cost Calculator',
    description: 'Estimate your event budget',
    action: 'calculator' as const,
    primary: false,
  },
  {
    icon: Headphones,
    label: 'Contact Support',
    description: 'Get help from our team',
    action: 'contact' as const,
    primary: false,
  },
  {
    icon: Download,
    label: 'Download All Invoices',
    description: 'Get PDF copies of all invoices',
    action: null,
    primary: false,
  },
] as const;

/* ────────────────────────────────────────── */
/* ─── Dashboard Page Component ─── */
/* ────────────────────────────────────────── */
export default function DashboardPage() {
  const { format } = useCurrency();
  const { navigate } = useNavigation();
  const { user, isAuthenticated, getToken } = useAuth();

  /* ─── Auth headers helper ─── */
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  });

  /* ─── Live Data State ─── */
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [stats, setStats] = useState({ activeBookings: 0, upcomingEvents: 0, totalSpent: 0, savedEstimates: 0 });
  const [dataLoaded, setDataLoaded] = useState(false);

  /* ─── Fetch Data ─── */
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const headers = authHeaders();
      const [profileRes, bookingsRes, estimatesRes, paymentsRes] = await Promise.all([
        fetch('/api/user/profile', { headers }),
        fetch('/api/bookings', { headers }),
        fetch('/api/estimates', { headers }),
        fetch('/api/payments', { headers }),
      ]);

        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.stats) setStats(profile.stats);
          if (profile.name) setProfileForm((prev) => ({ ...prev, name: profile.name }));
          if (profile.email) setProfileForm((prev) => ({ ...prev, email: profile.email }));
          if (profile.phone) setProfileForm((prev) => ({ ...prev, phone: profile.phone }));
        }

        if (bookingsRes.ok) {
          const b = await bookingsRes.json();
          setBookings(b.map((x: RawBooking) => ({
            _rawId: x.id,
            id: x.id.substring(0, 7).toUpperCase(),
            event: x.eventName,
            type: x.eventType,
            date: x.eventDate ? new Date(x.eventDate).toISOString().split('T')[0] : 'TBD',
            status: (x.status.charAt(0).toUpperCase() + x.status.slice(1)) as 'Confirmed' | 'Pending' | 'Completed',
            cost: format(x.totalCost),
          })));
        }

        if (estimatesRes.ok) {
          const e = await estimatesRes.json();
          setEstimates(e.map((x: RawEstimate) => ({
            _rawId: x.id,
            id: x.id.substring(0, 7).toUpperCase(),
            eventType: x.eventType,
            guestCount: x.guestCount,
            estimatedCost: format(x.totalCost),
            dateCreated: new Date(x.createdAt).toISOString().split('T')[0],
          })));
        }

        if (paymentsRes.ok) {
          const p = await paymentsRes.json();
          setPayments(p.map((x: { id: string; amount: number; method: string; status: string; createdAt: string; booking?: { eventName: string } | null }) => ({
            id: x.id.substring(0, 7).toUpperCase(),
            date: new Date(x.createdAt).toISOString().split('T')[0],
            event: x.booking?.eventName || 'N/A',
            amount: format(x.amount),
            method: x.method.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            status: (x.status.charAt(0).toUpperCase() + x.status.slice(1)) as 'Paid' | 'Pending' | 'Refunded',
          })));
        }
    } catch {
      console.error('Failed to load dashboard data');
    } finally {
      setDataLoaded(true);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* ─── Countdown Timer — Use actual next booking ─── */
  const nextEventName = (() => {
    const next = (bookings)
      .filter(b => b.status !== 'Completed' && b.date !== 'TBD' && new Date(b.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    return next?.event || null;
  })();

  const [targetDate] = useState(() => {
    const next = (bookings)
      .filter(b => b.status !== 'Completed' && b.date !== 'TBD' && new Date(b.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    if (next) {
      const d = new Date(next.date);
      d.setHours(18, 0, 0, 0);
      return d;
    }
    const d = new Date();
    d.setDate(d.getDate() + 30);
    d.setHours(18, 0, 0, 0);
    return d;
  });
  const countdown = useCountdown(targetDate);

  /* ─── Profile Form State ─── */
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      sms: true,
      marketing: false,
    },
  });

  /* ─── Handle Profile Save ─── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: profileForm.name, phone: profileForm.phone }),
      });
      if (res.ok) {
        toast.success('Profile settings saved successfully!');
      } else {
        toast.error('Failed to save profile');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  /* ─── Handle Quick Action ─── */
  const handleQuickAction = (action: string | null) => {
    if (!action) {
      // Download All Invoices — navigate to bookings tab
      toast.info('Please use the Invoice button on individual bookings to download invoices.');
      return;
    }
    navigate(action as 'booking' | 'calculator' | 'contact');
  };

  /* ─── Handle Change Password ─── */
  const handleChangePassword = async () => {
    if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (profileForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  /* ─── Handle Delete Booking ─── */
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast.success('Booking cancelled successfully');
        fetchDashboardData();
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  /* ─── Handle Delete Estimate ─── */
  const handleDeleteEstimate = async (estimateId: string) => {
    try {
      const res = await fetch(`/api/estimates?id=${estimateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast.success('Estimate deleted successfully');
        fetchDashboardData();
      } else {
        toast.error('Failed to delete estimate');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  /* ─── Show skeleton while data is loading ─── */
  if (!dataLoaded) {
    return <DashboardSkeleton />;
  }

  /* ─── Not Authenticated ─── */
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-4">
            Authentication <span className="text-gold">Required</span>
          </h2>
          <p className="text-cream/50 text-base mb-8 leading-relaxed">
            Please sign in to access your dashboard. Manage your events, bookings, and account settings all in one place.
          </p>
          <Button
            onClick={() => navigate('login')}
            className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 text-base transition-all duration-300 gold-glow hover:gold-glow-strong"
          >
            Sign In to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── Email Verification Warning ── */}
      {user && !user.emailVerified && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-yellow-200">Please verify your email address to unlock all features.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('verify-email')} className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
              Verify Now
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 1 — Header                     */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(200,164,86,0.3) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative text-center px-4"
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display">
            Welcome,{' '}
            <span className="text-gold-gradient">{user.name || 'User'}</span>
          </h1>
          <p className="text-cream/50 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-body">
            Manage your events and bookings
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 2 — Stats Cards                */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {[{
              icon: Calendar, label: 'Active Bookings',
              value: String(stats.activeBookings), trend: 'Total bookings', trendUp: true,
              color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20',
            }, {
              icon: Bell, label: 'Upcoming Events',
              value: String(stats.upcomingEvents), trend: 'Confirmed & pending', trendUp: true,
              color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20',
            }, {
              icon: DollarSign, label: 'Total Spent',
              value: format(stats.totalSpent), trend: 'All payments', trendUp: true,
              color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20',
            }, {
              icon: FileText, label: 'Saved Estimates',
              value: String(stats.savedEstimates), trend: 'Available estimates', trendUp: false,
              color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20',
            }].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.label} custom={i} variants={fadeUp}>
                  <Card className="bg-charcoal-light/50 border-gold/10 hover:border-gold/30 transition-all duration-500 hover-lift group py-0">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${card.color}`} />
                        </div>
                        {card.trendUp && (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] md:text-xs font-medium hidden sm:inline">
                              {card.trend}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-cream font-display mb-1">
                        {card.value}
                      </p>
                      <p className="text-xs md:text-sm text-cream/50">{card.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 3 — Countdown Timer + Quick Actions */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Countdown Timer Widget (2 cols) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10">
                    {/* Left info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-cream font-display">
                            Next Event Countdown
                          </h3>
                          <p className="text-xs md:text-sm text-cream/50">
                            {nextEventName || 'No upcoming events'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-cream/40">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                    {/* Right timer */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <CountdownUnit value={countdown.days} label="Days" />
                      <span className="text-gold/40 text-2xl font-light mt-[-20px]">:</span>
                      <CountdownUnit value={countdown.hours} label="Hours" />
                      <span className="text-gold/40 text-2xl font-light mt-[-20px]">:</span>
                      <CountdownUnit value={countdown.minutes} label="Min" />
                      <span className="text-gold/40 text-2xl font-light mt-[-20px] hidden sm:block">:</span>
                      <div className="hidden sm:block">
                        <CountdownUnit value={countdown.seconds} label="Sec" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Quick Actions (1 col) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-charcoal-light/50 border-gold/10 py-0 h-full">
                <CardContent className="p-6">
                  <h3 className="text-base md:text-lg font-semibold text-cream font-display mb-4">
                    Quick <span className="text-gold">Actions</span>
                  </h3>
                  <div className="space-y-3">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.action)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left group ${
                            action.primary
                              ? 'bg-gold/10 border border-gold/30 hover:bg-gold/20 hover:border-gold/50'
                              : 'bg-white/5 border border-gold/10 hover:bg-gold/5 hover:border-gold/20'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              action.primary
                                ? 'bg-gold/20'
                                : 'bg-gold/10'
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                action.primary ? 'text-gold' : 'text-gold/70'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                action.primary ? 'text-gold' : 'text-cream/80 group-hover:text-gold'
                              } transition-colors duration-300`}
                            >
                              {action.label}
                            </p>
                            <p className="text-[11px] text-cream/40 truncate">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
                              action.primary ? 'text-gold' : 'text-cream/30'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 4 — Tabbed Main Content        */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto flex h-auto bg-charcoal-light/50 border border-gold/10 p-1 mb-8">
                <TabsTrigger
                  value="bookings"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-2 md:px-4 text-xs md:text-sm font-medium data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">My</span> Bookings
                </TabsTrigger>
                <TabsTrigger
                  value="estimates"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-2 md:px-4 text-xs md:text-sm font-medium data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Saved</span> Estimates
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-2 md:px-4 text-xs md:text-sm font-medium data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Payment</span> History
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-2 md:px-4 text-xs md:text-sm font-medium data-[state=active]:bg-gold data-[state=active]:text-charcoal-dark data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                >
                  <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Profile</span> Settings
                </TabsTrigger>
              </TabsList>

              {/* ── Tab 1: My Bookings ── */}
              <TabsContent value="bookings">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="bookings"
                    variants={tabContentVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-gold/10 hover:bg-transparent">
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Event
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Type
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Date
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Status
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider text-right">
                                  Total
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bookings.length > 0 ? bookings.map((booking) => (
                                <TableRow
                                  key={booking.id}
                                  className="border-gold/5 hover:bg-gold/5 transition-colors duration-200"
                                >
                                  <TableCell>
                                    <div>
                                      <p className="text-sm font-medium text-cream">
                                        {booking.event}
                                      </p>
                                      <p className="text-xs text-cream/40">{booking.id}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-cream/70">{booking.type}</span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-cream/70">
                                      {new Date(booking.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <BookingStatusBadge status={booking.status} />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="text-sm font-semibold text-cream">
                                      {booking.cost}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toast.info(`Viewing details for ${booking.event}`)
                                        }
                                        className="text-gold hover:text-gold-light hover:bg-gold/10 h-8 px-3 text-xs"
                                      >
                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                        Details
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const token = getToken();
                                          if (booking._rawId && token) {
                                            window.open(`/api/payments/invoice?bookingId=${booking._rawId}`, '_blank');
                                          } else {
                                            toast.error('Unable to generate invoice');
                                          }
                                        }}
                                        className="text-cream/50 hover:text-cream hover:bg-white/5 h-8 px-3 text-xs"
                                      >
                                        <Download className="w-3.5 h-3.5 mr-1.5" />
                                        Invoice
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteBooking(booking._rawId || booking.id)}
                                        className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 h-8 px-3 text-xs"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-12 text-cream/40">
                                    No bookings yet.{' '}
                                    <button onClick={() => navigate('booking')} className="text-gold hover:underline">
                                      Book your first event
                                    </button>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ── Tab 2: Saved Estimates ── */}
              <TabsContent value="estimates">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="estimates"
                    variants={tabContentVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-gold/10 hover:bg-transparent">
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Event Type
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Guests
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider text-right">
                                  Est. Cost
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Created
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {estimates.length > 0 ? estimates.map((est) => (
                                <TableRow
                                  key={est.id}
                                  className="border-gold/5 hover:bg-gold/5 transition-colors duration-200"
                                >
                                  <TableCell>
                                    <div>
                                      <p className="text-sm font-medium text-cream">
                                        {est.eventType}
                                      </p>
                                      <p className="text-xs text-cream/40">{est.id}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-cream/70">
                                      {est.guestCount}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="text-sm font-semibold text-gold">
                                      {est.estimatedCost}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-cream/70">
                                      {new Date(est.dateCreated).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          navigate('booking')
                                        }
                                        className="text-gold hover:text-gold-light hover:bg-gold/10 h-8 px-3 text-xs"
                                      >
                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                        Use This
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteEstimate(est._rawId || est.id)}
                                        className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 h-8 px-3 text-xs"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-12 text-cream/40">
                                    No saved estimates.{' '}
                                    <button onClick={() => navigate('calculator')} className="text-gold hover:underline">
                                      Create one now
                                    </button>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ── Tab 3: Payment History ── */}
              <TabsContent value="payments">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="payments"
                    variants={tabContentVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-gold/10 hover:bg-transparent">
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Date
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Event
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider text-right">
                                  Amount
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Method
                                </TableHead>
                                <TableHead className="text-cream/60 text-xs font-semibold uppercase tracking-wider">
                                  Status
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.length > 0 ? payments.map((payment) => (
                                <TableRow
                                  key={payment.id}
                                  className="border-gold/5 hover:bg-gold/5 transition-colors duration-200"
                                >
                                  <TableCell>
                                    <span className="text-sm text-cream/70">
                                      {new Date(payment.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium text-cream">
                                      {payment.event}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="text-sm font-semibold text-cream">
                                      {payment.amount}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-cream/50">
                                      {payment.method}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <PaymentStatusBadge status={payment.status} />
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-12 text-cream/40">
                                    No payment history yet.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ── Tab 4: Profile Settings ── */}
              <TabsContent value="profile">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="profile"
                    variants={tabContentVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* ── Left Column: Personal Info ── */}
                      <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                        <CardContent className="p-6 md:p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-gold" />
                            </div>
                            <div>
                              <h3 className="text-base md:text-lg font-semibold text-cream font-display">
                                Personal <span className="text-gold">Information</span>
                              </h3>
                              <p className="text-xs text-cream/40">
                                Update your account details
                              </p>
                            </div>
                          </div>

                          <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div className="space-y-2">
                              <Label
                                htmlFor="dash-name"
                                className="text-cream/80 text-sm font-medium"
                              >
                                Full Name
                              </Label>
                              <Input
                                id="dash-name"
                                type="text"
                                placeholder="John Doe"
                                value={profileForm.name}
                                onChange={(e) =>
                                  setProfileForm({ ...profileForm, name: e.target.value })
                                }
                                className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="dash-email"
                                className="text-cream/80 text-sm font-medium"
                              >
                                Email Address
                              </Label>
                              <Input
                                id="dash-email"
                                type="email"
                                placeholder="john@example.com"
                                value={profileForm.email}
                                onChange={(e) =>
                                  setProfileForm({ ...profileForm, email: e.target.value })
                                }
                                className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="dash-phone"
                                className="text-cream/80 text-sm font-medium"
                              >
                                Phone Number
                              </Label>
                              <Input
                                id="dash-phone"
                                type="tel"
                                placeholder="+1 (234) 567-890"
                                value={profileForm.phone}
                                onChange={(e) =>
                                  setProfileForm({ ...profileForm, phone: e.target.value })
                                }
                                className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                              />
                            </div>

                            <Button
                              type="submit"
                              className="w-full bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-11 transition-all duration-300 gold-glow hover:gold-glow-strong mt-2"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                      {/* ── Right Column: Security + Notifications ── */}
                      <div className="flex flex-col gap-6">
                        {/* Password Change */}
                        <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                          <CardContent className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-gold" />
                              </div>
                              <div>
                                <h3 className="text-base md:text-lg font-semibold text-cream font-display">
                                  Change <span className="text-gold">Password</span>
                                </h3>
                                <p className="text-xs text-cream/40">
                                  Update your security credentials
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="current-pw"
                                  className="text-cream/80 text-sm font-medium"
                                >
                                  Current Password
                                </Label>
                                <Input
                                  id="current-pw"
                                  type="password"
                                  placeholder="••••••••"
                                  value={profileForm.currentPassword}
                                  onChange={(e) =>
                                    setProfileForm({
                                      ...profileForm,
                                      currentPassword: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="new-pw"
                                    className="text-cream/80 text-sm font-medium"
                                  >
                                    New Password
                                  </Label>
                                  <Input
                                    id="new-pw"
                                    type="password"
                                    placeholder="••••••••"
                                    value={profileForm.newPassword}
                                    onChange={(e) =>
                                      setProfileForm({
                                        ...profileForm,
                                        newPassword: e.target.value,
                                      })
                                    }
                                    className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="confirm-pw"
                                    className="text-cream/80 text-sm font-medium"
                                  >
                                    Confirm Password
                                  </Label>
                                  <Input
                                    id="confirm-pw"
                                    type="password"
                                    placeholder="••••••••"
                                    value={profileForm.confirmPassword}
                                    onChange={(e) =>
                                      setProfileForm({
                                        ...profileForm,
                                        confirmPassword: e.target.value,
                                      })
                                    }
                                    className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={handleChangePassword}
                                className="w-full bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 font-semibold h-11 transition-all duration-300"
                              >
                                Update Password
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Notification Preferences */}
                        <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                          <CardContent className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-gold" />
                              </div>
                              <div>
                                <h3 className="text-base md:text-lg font-semibold text-cream font-display">
                                  Notification <span className="text-gold">Preferences</span>
                                </h3>
                                <p className="text-xs text-cream/40">
                                  Manage how you receive updates
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-gold/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gold/70" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-cream">
                                      Email Notifications
                                    </p>
                                    <p className="text-xs text-cream/40">
                                      Booking updates and reminders
                                    </p>
                                  </div>
                                </div>
                                <Checkbox
                                  checked={profileForm.notifications.email}
                                  onCheckedChange={(checked) =>
                                    setProfileForm({
                                      ...profileForm,
                                      notifications: {
                                        ...profileForm.notifications,
                                        email: checked === true,
                                      },
                                    })
                                  }
                                  className="data-[state=checked]:bg-gold data-[state=checked]:border-gold border-gold/30"
                                />
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-gold/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gold/70" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-cream">
                                      SMS Notifications
                                    </p>
                                    <p className="text-xs text-cream/40">
                                      Text alerts for important updates
                                    </p>
                                  </div>
                                </div>
                                <Checkbox
                                  checked={profileForm.notifications.sms}
                                  onCheckedChange={(checked) =>
                                    setProfileForm({
                                      ...profileForm,
                                      notifications: {
                                        ...profileForm.notifications,
                                        sms: checked === true,
                                      },
                                    })
                                  }
                                  className="data-[state=checked]:bg-gold data-[state=checked]:border-gold border-gold/30"
                                />
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-gold/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-gold/70" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-cream">
                                      Marketing Emails
                                    </p>
                                    <p className="text-xs text-cream/40">
                                      Offers, news, and event inspiration
                                    </p>
                                  </div>
                                </div>
                                <Checkbox
                                  checked={profileForm.notifications.marketing}
                                  onCheckedChange={(checked) =>
                                    setProfileForm({
                                      ...profileForm,
                                      notifications: {
                                        ...profileForm.notifications,
                                        marketing: checked === true,
                                      },
                                    })
                                  }
                                  className="data-[state=checked]:bg-gold data-[state=checked]:border-gold border-gold/30"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </div>
  );
}