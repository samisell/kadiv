'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  Lock,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Landmark,
  Smartphone,
  Building2,
  Users,
  MapPin,
  Calendar,
  Crown,
  PartyPopper,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/lib/currency';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { useEventPlan } from '@/store/event-plan';
import { useCheckoutStore } from '@/store/checkout';
import { toast } from 'sonner';

/* ─── Animation Variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ─── Payment Gateway Config ─── */
interface GatewayOption {
  id: 'flutterwave' | 'paystack';
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  methods: { icon: LucideIcon; label: string }[];
  recommended?: boolean;
}

const GATEWAYS: GatewayOption[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Trusted by over 60,000 businesses across Africa. Seamless card and bank payments.',
    color: '#0A9EDC',
    bgColor: 'bg-[#0A9EDC]/10',
    borderColor: 'border-[#0A9EDC]/30',
    methods: [
      { icon: CreditCard, label: 'Card' },
      { icon: Building2, label: 'Bank Transfer' },
      { icon: Smartphone, label: 'USSD' },
    ],
    recommended: true,
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Africa\'s leading payment technology company. Accept payments globally.',
    color: '#29BB59',
    bgColor: 'bg-[#29BB59]/10',
    borderColor: 'border-[#29BB59]/30',
    methods: [
      { icon: CreditCard, label: 'Card' },
      { icon: Landmark, label: 'Bank Transfer' },
      { icon: Smartphone, label: 'Mobile Money' },
    ],
  },
];

/* ─── Venue & Catering display names ─── */
const VENUE_NAMES: Record<string, string> = {
  ballroom: 'Grand Ballroom',
  garden: 'Garden Pavilion',
  beach: 'Beach Front',
  rooftop: 'Rooftop Terrace',
  'indoor-hall': 'Indoor Hall',
};

const CATERING_NAMES: Record<string, string> = {
  basic: 'Basic Catering',
  premium: 'Premium Catering',
  luxury: 'Luxury Catering',
  platinum: 'Platinum Catering',
};

const EVENT_TYPE_NAMES: Record<string, string> = {
  weddings: 'Wedding',
  corporate: 'Corporate Event',
  birthdays: 'Birthday Party',
  concerts: 'Concert',
  'private-parties': 'Private Party',
  religious: 'Religious Ceremony',
  galas: 'Charity Gala',
  exhibitions: 'Exhibition',
  'baby-shower': 'Baby Shower',
  engagement: 'Engagement Party',
  graduation: 'Graduation',
  housewarming: 'Housewarming',
};

/* ═══════════════════════════════════════════════ */
/* ─── Checkout Page Component ───                  */
/* ═══════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { navigate, goBack } = useNavigation();
  const { user, isAuthenticated, getToken } = useAuth();
  const { format, symbol } = useCurrency();
  const plan = useEventPlan();
  const checkoutStore = useCheckoutStore();

  /* ─── Form State ─── */
  const [selectedGateway, setSelectedGateway] = useState<'flutterwave' | 'paystack'>('paystack');
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [isProcessing, setIsProcessing] = useState(false);

  /* ─── Derived Values ─── */
  const breakdown = plan.getBreakdown();
  const total = plan.getTotal();
  const depositAmount = Math.ceil(total * 0.3);
  const payableAmount = paymentType === 'deposit' ? depositAmount : total;
  const hasPlanData = breakdown.length > 0;

  /* ─── Handle Payment (before early return to satisfy rules-of-hooks) ─── */
  const handlePayment = useCallback(async () => {
    if (!hasPlanData) {
      toast.error('No event plan found. Please create a booking first.');
      return;
    }
    if (!customerEmail.trim() || !customerName.trim()) {
      toast.error('Please provide your name and email.');
      return;
    }
    if (payableAmount <= 0) {
      toast.error('Invalid payment amount.');
      return;
    }

    setIsProcessing(true);

    try {
      const token = getToken();
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: payableAmount,
          gateway: selectedGateway,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim(),
          paymentType,
          eventPlan: {
            eventType: plan.plan.eventType,
            guestCount: plan.plan.guestCount,
            venueType: plan.plan.venueType,
            cateringPackage: plan.plan.cateringPackage,
            services: plan.plan.services,
            addOns: plan.plan.addOns,
            location: plan.plan.location,
            date: plan.plan.date,
            notes: plan.plan.notes,
            total,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      /* Store checkout state for payment result page */
      checkoutStore.setCheckoutData({
        reference: data.reference || null,
        status: 'pending',
        amount: payableAmount,
        gateway: selectedGateway,
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        paymentType,
      });

      /* Redirect to payment gateway */
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        /* Fallback: navigate to payment result with the reference */
        navigate('payment-result');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [hasPlanData, customerEmail, customerName, payableAmount, getToken, selectedGateway, paymentType, plan, total, checkoutStore, navigate]);

  /* ─── Auth Guard ─── */
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
            <Lock className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-4">
            Sign In to <span className="text-gold">Checkout</span>
          </h2>
          <p className="text-cream/50 text-base mb-8 leading-relaxed">
            Please sign in to your account to complete your booking payment. Your event plan will be waiting for you.
          </p>
          <Button
            onClick={() => navigate('login')}
            className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 text-base transition-all duration-300 gold-glow hover:gold-glow-strong"
          >
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════ */}
      {/* HERO BANNER                              */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,164,86,0.3) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative text-center px-4 pt-28 pb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gold-gradient font-display">Secure Checkout</span>
          </h1>
          <p className="text-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-body">
            Complete your payment to confirm your luxury event booking
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* BACK BUTTON                              */}
      {/* ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Button
          variant="ghost"
          onClick={goBack}
          className="text-cream/60 hover:text-cream hover:bg-white/5 -ml-2 h-9 px-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking
        </Button>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* MAIN CONTENT                             */}
      {/* ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ─── LEFT: Order Summary (3 cols) ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
              {/* Card Header */}
              <div className="p-6 md:p-8 pb-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-cream font-display">
                      Order <span className="text-gold">Summary</span>
                    </h2>
                    <p className="text-cream/40 text-sm">Review your selected services</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 md:p-8">
                {!hasPlanData ? (
                  /* ── Empty State ── */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto mb-4">
                      <PartyPopper className="w-8 h-8 text-gold/40" />
                    </div>
                    <h3 className="text-cream font-display text-lg mb-2">No Event Plan Found</h3>
                    <p className="text-cream/40 text-sm mb-6">
                      You haven&apos;t configured an event plan yet. Start by creating a booking.
                    </p>
                    <Button
                      onClick={() => navigate('booking')}
                      className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-11 px-6 transition-all duration-300"
                    >
                      Create Booking
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* ── Event Details Header ── */}
                    <div className="rounded-xl bg-white/[0.02] border border-gold/10 p-4 md:p-5 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                            <PartyPopper className="w-4 h-4 text-gold/70" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-cream/40 uppercase tracking-wider font-medium">Event Type</p>
                            <p className="text-cream text-sm font-medium truncate">
                              {EVENT_TYPE_NAMES[plan.plan.eventType] || plan.plan.eventType || 'Not selected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-gold/70" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-cream/40 uppercase tracking-wider font-medium">Guests</p>
                            <p className="text-cream text-sm font-medium">
                              {plan.plan.guestCount} guests
                            </p>
                          </div>
                        </div>
                        {plan.plan.date && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-gold/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-cream/40 uppercase tracking-wider font-medium">Date</p>
                              <p className="text-cream text-sm font-medium">
                                {new Date(plan.plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        )}
                        {plan.plan.location && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-gold/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-cream/40 uppercase tracking-wider font-medium">Location</p>
                              <p className="text-cream text-sm font-medium truncate">
                                {plan.plan.location.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Breakdown Items ── */}
                    <div className="space-y-3">
                      <h3 className="text-xs text-cream/40 uppercase tracking-widest font-semibold mb-3">
                        Services & Add-ons
                      </h3>
                      <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="space-y-2"
                      >
                        {breakdown.map((item, i) => (
                          <motion.div
                            key={item.label}
                            custom={i}
                            variants={fadeUp}
                            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors duration-200 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />
                              <span className="text-cream/70 text-sm group-hover:text-cream transition-colors truncate">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-cream text-sm font-medium ml-4 shrink-0">
                              {format(item.cost)}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* ── Totals ── */}
                    <Separator className="my-5 bg-gold/10" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-cream/60 text-sm">Subtotal</span>
                        <span className="text-cream text-sm font-medium">{format(total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-cream/60 text-sm">30% Deposit</span>
                          <Badge variant="outline" className="border-gold/30 text-gold text-[10px] px-2 py-0 h-5">
                            Recommended
                          </Badge>
                        </div>
                        <span className="text-gold text-sm font-semibold">{format(depositAmount)}</span>
                      </div>
                      <Separator className="bg-gold/10" />
                      <div className="flex items-center justify-between">
                        <span className="text-cream/60 text-sm">Full Amount</span>
                        <span className="text-cream text-base font-bold">{format(total)}</span>
                      </div>
                    </div>

                    {/* ── Savings Badge ── */}
                    {paymentType === 'deposit' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <p className="text-emerald-300 text-xs">
                            Pay the 30% deposit now ({format(depositAmount)}) and the remaining balance ({format(total - depositAmount)}) later.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── RIGHT: Payment Form (2 cols) ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* ── Payment Gateway Selection ── */}
            <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
              <div className="p-6 md:p-8 pb-0">
                <h2 className="text-xl font-bold text-cream font-display mb-1">
                  Payment <span className="text-gold">Method</span>
                </h2>
                <p className="text-cream/40 text-sm">Choose your preferred payment gateway</p>
              </div>

              <CardContent className="p-6 md:p-8">
                <div className="space-y-3">
                  {GATEWAYS.map((gateway) => {
                    const isSelected = selectedGateway === gateway.id;
                    return (
                      <motion.button
                        key={gateway.id}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedGateway(gateway.id)}
                        className={`w-full relative rounded-xl border p-4 md:p-5 text-left transition-all duration-300 ${
                          isSelected
                            ? 'bg-white/[0.04] border-gold/50 shadow-lg shadow-gold/5'
                            : 'bg-white/[0.01] border-gold/10 hover:border-gold/25 hover:bg-white/[0.03]'
                        }`}
                      >
                        {gateway.recommended && (
                          <Badge
                            className="absolute top-3 right-3 bg-gold/15 text-gold border border-gold/30 text-[10px] px-2 py-0 h-5"
                          >
                            Recommended
                          </Badge>
                        )}

                        <div className="flex items-center gap-4 mb-3">
                          {/* Gateway "Logo" */}
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-colors duration-300 ${
                              isSelected
                                ? `${gateway.bgColor} ${gateway.borderColor}`
                                : 'bg-white/[0.03] border-gold/10'
                            }`}
                          >
                            <CreditCard
                              className="w-5 h-5 transition-colors duration-300"
                              style={{ color: isSelected ? gateway.color : 'rgba(200,164,86,0.5)' }}
                            />
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={`font-semibold text-sm font-display transition-colors duration-300 ${
                                isSelected ? 'text-cream' : 'text-cream/80'
                              }`}
                            >
                              {gateway.name}
                            </h3>
                            <p className="text-cream/40 text-xs leading-relaxed mt-0.5">
                              {gateway.description}
                            </p>
                          </div>
                        </div>

                        {/* Accepted Methods */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {gateway.methods.map((method) => {
                            const Icon = method.icon;
                            return (
                              <span
                                key={method.label}
                                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-colors duration-300 ${
                                  isSelected
                                    ? 'bg-white/[0.05] text-cream/60 border border-gold/10'
                                    : 'bg-white/[0.02] text-cream/30 border border-transparent'
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                                {method.label}
                              </span>
                            );
                          })}
                        </div>

                        {/* Selected Indicator */}
                        <div
                          className={`absolute top-4 right-3 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                            gateway.recommended ? 'top-4 right-3 mt-5' : ''
                          } ${isSelected ? 'bg-gold border-gold' : 'border-cream/20 bg-transparent'}`}
                          style={gateway.recommended ? { marginTop: '20px' } : {}}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-charcoal-dark" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ── Payment Amount Selection ── */}
            {hasPlanData && (
              <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-base font-semibold text-cream font-display mb-4">
                    Payment <span className="text-gold">Amount</span>
                  </h3>
                  <RadioGroup
                    value={paymentType}
                    onValueChange={(val) => setPaymentType(val as 'deposit' | 'full')}
                    className="space-y-3"
                  >
                    <motion.label
                      whileHover={{ y: -1 }}
                      className={`relative flex items-center gap-4 cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                        paymentType === 'deposit'
                          ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5'
                          : 'bg-white/[0.02] border-gold/10 hover:border-gold/25'
                      }`}
                    >
                      <RadioGroupItem value="deposit" className="sr-only" />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                          paymentType === 'deposit' ? 'bg-gold border-gold' : 'border-cream/20'
                        }`}
                      >
                        {paymentType === 'deposit' && <CheckCircle2 className="w-5 h-5 text-charcoal-dark" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium font-display ${paymentType === 'deposit' ? 'text-gold' : 'text-cream'}`}>
                            30% Deposit
                          </span>
                          <span className="text-gold font-bold text-lg font-display">
                            {format(depositAmount)}
                          </span>
                        </div>
                        <p className="text-cream/40 text-xs mt-0.5">
                          Pay deposit now, remaining balance before the event
                        </p>
                      </div>
                    </motion.label>

                    <motion.label
                      whileHover={{ y: -1 }}
                      className={`relative flex items-center gap-4 cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                        paymentType === 'full'
                          ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5'
                          : 'bg-white/[0.02] border-gold/10 hover:border-gold/25'
                      }`}
                    >
                      <RadioGroupItem value="full" className="sr-only" />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                          paymentType === 'full' ? 'bg-gold border-gold' : 'border-cream/20'
                        }`}
                      >
                        {paymentType === 'full' && <CheckCircle2 className="w-5 h-5 text-charcoal-dark" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium font-display ${paymentType === 'full' ? 'text-gold' : 'text-cream'}`}>
                            Pay in Full
                          </span>
                          <span className="text-cream font-bold text-lg font-display">
                            {format(total)}
                          </span>
                        </div>
                        <p className="text-cream/40 text-xs mt-0.5">
                          Pay the complete amount upfront
                        </p>
                      </div>
                    </motion.label>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* ── Contact Information ── */}
            {hasPlanData && (
              <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-base font-semibold text-cream font-display mb-4">
                    Contact <span className="text-gold">Details</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkoutName" className="text-cream/80 text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="checkoutName"
                        type="text"
                        placeholder="Enter your full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkoutEmail" className="text-cream/80 text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="checkoutEmail"
                        type="email"
                        placeholder="Enter your email address"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                      />
                      <p className="text-cream/30 text-xs">
                        Payment receipt will be sent to this email
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Pay Now Button ── */}
            {hasPlanData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !customerEmail.trim() || !customerName.trim()}
                  className="w-full bg-gold text-charcoal-dark hover:bg-gold-light font-bold h-14 px-8 text-base transition-all duration-300 gold-glow hover:gold-glow-strong disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay {format(payableAmount)} Now
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-3 text-cream/30 text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                  <span className="text-gold/20">•</span>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Trust Badges ── */}
            <Card className="bg-charcoal-light/30 border-gold/5 py-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-center gap-6 text-cream/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-xs font-medium">Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span className="text-xs font-medium">256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-medium">Money-back Guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}