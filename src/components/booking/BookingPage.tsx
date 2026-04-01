'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  FileText,
  Minus,
  Plus,
  PartyPopper,
  Camera,
  Crown,
  Disc,
  Music,
  Shield,
  UtensilsCrossed,
  Video,
  Clock,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency, EVENT_LOCATIONS } from '@/lib/currency';
import { useNavigation } from '@/store/navigation';
import { SERVICES, EVENT_CATEGORIES } from '@/data/content';
import { useEventPlan } from '@/store/event-plan';
import { useAuth } from '@/store/auth';
import { useCheckoutStore } from '@/store/checkout';
import { toast } from 'sonner';

/* ─── Icon Map for Service Icons ─── */
const ICON_MAP: Record<string, LucideIcon> = {
  MapPin,
  Sparkles,
  UtensilsCrossed,
  Camera,
  Video,
  Disc,
  Music,
  Shield,
  Heart: Sparkles,
  Briefcase: FileText,
  Cake: PartyPopper,
  GlassWater: Sparkles,
  Church: FileText,
};

/* ─── Venue Options (prices in NGN) ─── */
const VENUE_OPTIONS = [
  { value: 'ballroom', label: 'Ballroom', icon: Crown, price: '₦2,000,000' },
  { value: 'garden', label: 'Garden', icon: Sparkles, price: '₦1,500,000' },
  { value: 'beach', label: 'Beach', icon: MapPin, price: '₦5,000,000' },
  { value: 'rooftop', label: 'Rooftop', icon: Crown, price: '₦3,000,000' },
  { value: 'indoor-hall', label: 'Indoor Hall', icon: FileText, price: '₦1,000,000' },
] as const;

/* ─── Catering Options (prices in NGN) ─── */
const CATERING_OPTIONS = [
  { value: 'basic', label: 'Basic', price: '₦7,500/guest', desc: 'Standard menu with select options' },
  { value: 'premium', label: 'Premium', price: '₦15,000/guest', desc: 'Expanded menu with premium ingredients' },
  { value: 'luxury', label: 'Luxury', price: '₦30,000/guest', desc: 'Gourmet cuisine by world-class chefs' },
  { value: 'platinum', label: 'Platinum', price: '₦50,000/guest', desc: 'Bespoke culinary experience' },
] as const;

/* ─── Add-on Options (prices in NGN) ─── */
const ADD_ON_OPTIONS = [
  { id: 'photo-booth', name: 'Photo Booth', price: 150000, icon: Camera },
  { id: 'extra-hours', name: 'Extra Hours', price: 100000, icon: Clock, suffix: '/hr' },
  { id: 'valet-parking', name: 'Valet Parking', price: 200000, icon: Shield },
  { id: 'fireworks', name: 'Fireworks', price: 500000, icon: Sparkles },
  { id: 'live-band', name: 'Live Band', price: 800000, icon: Music },
] as const;


/* ─── Step Config ─── */
const STEPS = [
  { number: 1, label: 'Event Details' },
  { number: 2, label: 'Services' },
  { number: 3, label: 'Venue & Add-ons' },
  { number: 4, label: 'Review' },
] as const;

/* ─── Animation Variants ─── */
const fadeSlideIn: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3, ease: 'easeIn' } },
};

const fadeSlideBack: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.3, ease: 'easeIn' } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' },
  }),
};

/* ─── Utility ─── */
function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/* ═══════════════════════════════════════════════ */
/* ─── Booking Page Component ───                  */
/* ═══════════════════════════════════════════════ */
export default function BookingPage() {
  const { navigate } = useNavigation();
  const plan = useEventPlan();
  const { format } = useCurrency();

  /* ─── Step State ─── */
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  /* ─── Step 1: Event Details ─── */
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  /* ─── Location: custom mode ─── */
  const [showCustomLocation, setShowCustomLocation] = useState(plan.plan.location === 'custom');

  /* ─── Step 4: Review ─── */
  const [termsAccepted, setTermsAccepted] = useState(false);

  /* ─── Validation Errors ─── */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ─── Derived State ─── */
  const selectedServiceIds = new Set(plan.plan.services.map((s) => s.id));
  const selectedAddOnIds = new Set(plan.plan.addOns.map((a) => a.id));

  /* ─── Step Navigation ─── */
  const goNext = useCallback(() => {
    setErrors({});
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!plan.plan.eventType) { newErrors.eventType = 'Please select an event type'; valid = false; }
      if (!eventName.trim()) { newErrors.eventName = 'Please enter an event name'; valid = false; }
      if (plan.plan.guestCount < 10) { newErrors.guestCount = 'Minimum 10 guests'; valid = false; }
      if (!plan.plan.date) { newErrors.date = 'Please select a date'; valid = false; }
    }

    if (currentStep === 2) {
      if (plan.plan.services.length === 0) { newErrors.services = 'Please select at least one service'; valid = false; }
    }

    if (currentStep === 3) {
      if (!plan.plan.venueType) { newErrors.venueType = 'Please select a venue type'; valid = false; }
      if (!plan.plan.cateringPackage) { newErrors.cateringPackage = 'Please select a catering package'; valid = false; }
    }

    if (!valid) {
      setErrors(newErrors);
      toast.error('Please complete all required fields');
      return;
    }

    if (currentStep < 4) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, plan.plan.eventType, eventName, plan.plan.guestCount, plan.plan.date, plan.plan.services.length, plan.plan.venueType, plan.plan.cateringPackage]);

  const goBack = useCallback(() => {
    setErrors({});
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  /* ─── Service Toggle ─── */
  const toggleService = useCallback(
    (serviceId: string, name: string, price: number) => {
      if (selectedServiceIds.has(serviceId)) {
        plan.removeService(serviceId);
      } else {
        plan.addService({ id: serviceId, name, price, quantity: 1 });
      }
    },
    [selectedServiceIds, plan]
  );

  const updateServiceQty = useCallback(
    (serviceId: string, qty: number) => {
      const clamped = Math.min(5, Math.max(1, qty));
      plan.updateServiceQuantity(serviceId, clamped);
    },
    [plan]
  );

  /* ─── Add-on Toggle ─── */
  const toggleAddOn = useCallback(
    (id: string, name: string, price: number) => {
      if (selectedAddOnIds.has(id)) {
        plan.removeAddOn(id);
      } else {
        plan.addAddOn({ id, name, price, quantity: 1 });
      }
    },
    [selectedAddOnIds, plan]
  );

  /* ─── Cost helpers (computed before handlers) ─── */
  const totalCost = plan.getTotal();
  const breakdown = plan.getBreakdown();

  /* ─── Confirm Booking → Navigate to Checkout ─── */
  const { user } = useAuth();
  const checkoutStore = useCheckoutStore();
  const handleConfirm = useCallback(() => {
    if (!termsAccepted) {
      setErrors({ terms: 'You must accept the terms and conditions' });
      toast.error('Please accept the terms and conditions');
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error('Please sign in to proceed with booking');
      navigate('login');
      return;
    }

    plan.setNotes(eventDescription);

    // Store checkout data for the checkout page to read
    checkoutStore.setCheckoutData({
      amount: totalCost,
      customerEmail: user.email,
      customerName: user.name || '',
      gateway: 'paystack', // default gateway
      paymentType: 'deposit', // default to deposit
    });

    // Navigate to checkout page
    navigate('checkout');
  }, [termsAccepted, plan, eventDescription, navigate, user, totalCost, checkoutStore]);

  /* ─── Guest +/- ─── */
  const adjustGuests = useCallback(
    (delta: number) => {
      const next = Math.min(2000, Math.max(10, plan.plan.guestCount + delta));
      plan.setGuestCount(next);
    },
    [plan.plan.guestCount, plan]
  );

  /* ═══════════════════════════════════════════════ */
  /* ─── RENDER ───                                  */
  /* ═══════════════════════════════════════════════ */
  return (
    <div className="relative">
      {/* ═══════════════════════════════════════ */}
      {/* HERO BANNER                              */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
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
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative text-center px-4 pt-28 pb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gold-gradient font-display">Book Your Event</span>
          </h1>
          <p className="text-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-body">
            Let us orchestrate every detail of your dream event. Start your journey to an unforgettable experience.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* STEP INDICATORS                          */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center flex-1 last:flex-none">
                  {/* Step circle + label */}
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        borderColor: isActive ? 'rgba(200,164,86,1)' : isCompleted ? 'rgba(200,164,86,0.7)' : 'rgba(200,164,86,0.2)',
                        backgroundColor: isCompleted ? 'rgba(200,164,86,0.15)' : isActive ? 'rgba(200,164,86,0.08)' : 'transparent',
                      }}
                      className="relative w-11 h-11 rounded-full border-2 flex items-center justify-center transition-colors duration-500"
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-gold" />
                      ) : (
                        <span
                          className={`text-sm font-semibold font-display ${isActive ? 'text-gold' : 'text-cream/40'}`}
                        >
                          {step.number}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="step-glow"
                          className="absolute inset-0 rounded-full border-2 border-gold/30"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                    <span
                      className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                        isActive ? 'text-gold' : isCompleted ? 'text-cream/60' : 'text-cream/30'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div className="h-px w-full bg-gold/10 relative overflow-hidden rounded-full">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{
                            width: isCompleted ? '100%' : '0%',
                          }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          className="absolute inset-y-0 left-0 bg-gold/50 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* FORM CONTENT                             */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─── STEP 1: EVENT DETAILS ─── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={direction === 'forward' ? fadeSlideIn : fadeSlideBack}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                  <CardContent className="p-6 md:p-10">
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-2">
                        Event <span className="text-gold">Details</span>
                      </h2>
                      <p className="text-cream/50 text-sm">
                        Tell us about the event you&apos;re envisioning.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Event Type */}
                      <div className="space-y-2">
                        <Label htmlFor="eventType" className="text-cream/80 text-sm font-medium">
                          Event Type <span className="text-gold">*</span>
                        </Label>
                        <Select
                          value={plan.plan.eventType}
                          onValueChange={(val) => {
                            plan.setEventType(val);
                            if (errors.eventType) setErrors((e) => ({ ...e, eventType: '' }));
                          }}
                        >
                          <SelectTrigger
                            className={`w-full bg-white/5 border-gold/20 text-cream focus:border-gold/50 h-11 ${
                              errors.eventType ? 'border-red-500/50' : ''
                            }`}
                          >
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent className="bg-charcoal border-gold/20">
                            {EVENT_CATEGORIES.map((cat) => (
                              <SelectItem
                                key={cat.id}
                                value={cat.id}
                                className="text-cream focus:bg-gold/10 focus:text-gold"
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.eventType && (
                          <p className="text-red-400 text-xs">{errors.eventType}</p>
                        )}
                      </div>

                      {/* Event Name */}
                      <div className="space-y-2">
                        <Label htmlFor="eventName" className="text-cream/80 text-sm font-medium">
                          Event Name <span className="text-gold">*</span>
                        </Label>
                        <Input
                          id="eventName"
                          type="text"
                          placeholder="e.g., Sarah & James Wedding Reception"
                          value={eventName}
                          onChange={(e) => {
                            setEventName(e.target.value);
                            if (errors.eventName) setErrors((e) => ({ ...e, eventName: '' }));
                          }}
                          className={`bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11 ${
                            errors.eventName ? 'border-red-500/50' : ''
                          }`}
                        />
                        {errors.eventName && (
                          <p className="text-red-400 text-xs">{errors.eventName}</p>
                        )}
                      </div>

                      {/* Number of Guests */}
                      <div className="space-y-2">
                        <Label className="text-cream/80 text-sm font-medium">
                          Number of Guests <span className="text-gold">*</span>
                        </Label>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-0">
                            <button
                              type="button"
                              onClick={() => adjustGuests(-10)}
                              className="w-11 h-11 rounded-l-xl bg-white/5 border border-gold/20 border-r-0 flex items-center justify-center text-cream/60 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all duration-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="w-24 h-11 bg-white/5 border border-gold/20 flex items-center justify-center">
                              <span className="text-cream font-semibold font-display text-lg">
                                {plan.plan.guestCount}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => adjustGuests(10)}
                              className="w-11 h-11 rounded-r-xl bg-white/5 border border-gold/20 border-l-0 flex items-center justify-center text-cream/60 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all duration-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gold/50" />
                            <span className="text-cream/40 text-sm">10 &ndash; 2,000 guests</span>
                          </div>
                        </div>
                        {errors.guestCount && (
                          <p className="text-red-400 text-xs">{errors.guestCount}</p>
                        )}
                      </div>

                      {/* Event Date */}
                      <div className="space-y-2">
                        <Label htmlFor="eventDate" className="text-cream/80 text-sm font-medium">
                          Event Date <span className="text-gold">*</span>
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 pointer-events-none" />
                          <Input
                            id="eventDate"
                            type="date"
                            value={plan.plan.date || ''}
                            onChange={(e) => {
                              plan.setDate(e.target.value);
                              if (errors.date) setErrors((e) => ({ ...e, date: '' }));
                            }}
                            className={`bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11 pl-10 [color-scheme:dark] ${
                              errors.date ? 'border-red-500/50' : ''
                            }`}
                          />
                        </div>
                        {errors.date && (
                          <p className="text-red-400 text-xs">{errors.date}</p>
                        )}
                      </div>

                      {/* Event Description */}
                      <div className="space-y-2">
                        <Label htmlFor="eventDesc" className="text-cream/80 text-sm font-medium">
                          Event Description
                        </Label>
                        <Textarea
                          id="eventDesc"
                          placeholder="Share your vision, theme preferences, or any special requirements you have in mind..."
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          rows={4}
                          className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 resize-none"
                        />
                      </div>
                    </div>

                    {/* ─── Navigation ─── */}
                    <div className="flex justify-end mt-10">
                      <Button
                        onClick={goNext}
                        className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow hover:gold-glow-strong"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── STEP 2: SERVICE SELECTION ─── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={direction === 'forward' ? fadeSlideIn : fadeSlideBack}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                  <CardContent className="p-6 md:p-10">
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-2">
                        Select <span className="text-gold">Services</span>
                      </h2>
                      <p className="text-cream/50 text-sm">
                        Choose the services you need. Click to toggle, then adjust quantities.
                      </p>
                    </div>

                    {errors.services && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <p className="text-red-400 text-sm">{errors.services}</p>
                      </motion.div>
                    )}

                    <motion.div
                      variants={stagger}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {SERVICES.map((service, i) => {
                        const isSelected = selectedServiceIds.has(service.id);
                        const selectedService = plan.plan.services.find((s) => s.id === service.id);
                        const IconComp = ICON_MAP[service.icon] || Sparkles;

                        return (
                          <motion.div key={service.id} custom={i} variants={fadeUp}>
                            <motion.div
                              whileHover={{ y: -2 }}
                              onClick={() => toggleService(service.id, service.name, service.startingPrice)}
                              className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300 ${
                                isSelected
                                  ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5'
                                  : 'bg-white/[0.02] border-gold/10 hover:border-gold/25 hover:bg-white/[0.04]'
                              }`}
                            >
                              {/* Selected indicator */}
                              <div
                                className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-gold border-gold'
                                    : 'border-cream/20 bg-transparent'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 text-charcoal-dark" />}
                              </div>

                              {/* Icon + Name */}
                              <div className="flex items-start gap-4 mb-3 pr-8">
                                <div
                                  className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                    isSelected
                                      ? 'bg-gold/20 border border-gold/30'
                                      : 'bg-gold/5 border border-gold/10'
                                  }`}
                                >
                                  <IconComp
                                    className={`w-5 h-5 ${isSelected ? 'text-gold' : 'text-gold/60'}`}
                                  />
                                </div>
                                <div>
                                  <h3
                                    className={`font-semibold text-sm font-display transition-colors duration-300 ${
                                      isSelected ? 'text-gold' : 'text-cream'
                                    }`}
                                  >
                                    {service.name}
                                  </h3>
                                  <p className="text-cream/40 text-xs mt-0.5 leading-relaxed">
                                    {truncate(service.description, 70)}
                                  </p>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex items-center justify-between">
                                <span className="text-gold/70 text-sm font-medium">
                                  From {format(service.startingPrice)}
                                </span>

                                {/* Quantity selector */}
                                {isSelected && selectedService && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => updateServiceQty(service.id, selectedService.quantity - 1)}
                                      className="w-7 h-7 rounded-md bg-white/5 border border-gold/20 flex items-center justify-center text-cream/60 hover:bg-gold/10 hover:text-gold transition-all duration-200"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-cream font-semibold text-sm w-6 text-center">
                                      {selectedService.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateServiceQty(service.id, selectedService.quantity + 1)}
                                      className="w-7 h-7 rounded-md bg-white/5 border border-gold/20 flex items-center justify-center text-cream/60 hover:bg-gold/10 hover:text-gold transition-all duration-200"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Selected count */}
                    <div className="mt-6 flex items-center gap-2 text-cream/40 text-sm">
                      <Sparkles className="w-4 h-4 text-gold/50" />
                      <span>
                        {plan.plan.services.length} service{plan.plan.services.length !== 1 ? 's' : ''} selected
                        {plan.plan.services.length > 0 &&
                          ` — ${format(plan.plan.services.reduce((sum, s) => sum + s.price * s.quantity, 0))}`}
                      </span>
                    </div>

                    {/* ─── Navigation ─── */}
                    <div className="flex items-center justify-between mt-10">
                      <Button
                        onClick={goBack}
                        variant="outline"
                        className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 hover:border-gold/30 h-12 px-6"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={goNext}
                        className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow hover:gold-glow-strong"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── STEP 3: VENUE, LOCATION & ADD-ONS ─── */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={direction === 'forward' ? fadeSlideIn : fadeSlideBack}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                  <CardContent className="p-6 md:p-10">
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-2">
                        Venue & <span className="text-gold">Add-ons</span>
                      </h2>
                      <p className="text-cream/50 text-sm">
                        Choose your venue style, catering package, and extra services.
                      </p>
                    </div>

                    <div className="space-y-10">
                      {/* ── Preferred Venue Type ── */}
                      <div className="space-y-4">
                        <Label className="text-cream/80 text-sm font-medium">
                          Preferred Venue Type <span className="text-gold">*</span>
                        </Label>
                        <RadioGroup
                          value={plan.plan.venueType}
                          onValueChange={(val) => {
                            plan.setVenueType(val);
                            if (errors.venueType) setErrors((e) => ({ ...e, venueType: '' }));
                          }}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
                        >
                          {VENUE_OPTIONS.map((venue) => {
                            const Icon = venue.icon;
                            const isSelected = plan.plan.venueType === venue.value;
                            return (
                              <motion.label
                                key={venue.value}
                                whileHover={{ y: -2 }}
                                className={`relative cursor-pointer rounded-xl border p-4 text-center transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5'
                                    : 'bg-white/[0.02] border-gold/10 hover:border-gold/25 hover:bg-white/[0.04]'
                                }`}
                              >
                                <RadioGroupItem
                                  value={venue.value}
                                  className="sr-only"
                                />
                                <div
                                  className={`mx-auto w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors duration-300 ${
                                    isSelected
                                      ? 'bg-gold/20 border border-gold/30'
                                      : 'bg-gold/5 border border-gold/10'
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 ${isSelected ? 'text-gold' : 'text-gold/60'}`}
                                  />
                                </div>
                                <p
                                  className={`text-xs font-semibold font-display mb-1 transition-colors duration-300 ${
                                    isSelected ? 'text-gold' : 'text-cream/80'
                                  }`}
                                >
                                  {venue.label}
                                </p>
                                <p className="text-[11px] text-cream/40">{venue.price}</p>
                              </motion.label>
                            );
                          })}
                        </RadioGroup>
                        {errors.venueType && (
                          <p className="text-red-400 text-xs">{errors.venueType}</p>
                        )}
                      </div>

                      {/* ── Catering Package ── */}
                      <div className="space-y-4">
                        <Label className="text-cream/80 text-sm font-medium">
                          Catering Package <span className="text-gold">*</span>
                        </Label>
                        <RadioGroup
                          value={plan.plan.cateringPackage}
                          onValueChange={(val) => {
                            plan.setCateringPackage(val);
                            if (errors.cateringPackage) setErrors((e) => ({ ...e, cateringPackage: '' }));
                          }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          {CATERING_OPTIONS.map((pkg) => {
                            const isSelected = plan.plan.cateringPackage === pkg.value;
                            return (
                              <motion.label
                                key={pkg.value}
                                whileHover={{ y: -1 }}
                                className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5'
                                    : 'bg-white/[0.02] border-gold/10 hover:border-gold/25 hover:bg-white/[0.04]'
                                }`}
                              >
                                <RadioGroupItem
                                  value={pkg.value}
                                  className="sr-only"
                                />
                                <div className="flex items-center justify-between mb-1">
                                  <p
                                    className={`font-semibold text-sm font-display transition-colors duration-300 ${
                                      isSelected ? 'text-gold' : 'text-cream'
                                    }`}
                                  >
                                    {pkg.label}
                                  </p>
                                  <p className="text-gold/70 text-sm font-medium">{pkg.price}</p>
                                </div>
                                <p className="text-cream/40 text-xs">{pkg.desc}</p>
                              </motion.label>
                            );
                          })}
                        </RadioGroup>
                        {errors.cateringPackage && (
                          <p className="text-red-400 text-xs">{errors.cateringPackage}</p>
                        )}
                      </div>

                      {/* ── Location & Special Requirements ── */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-cream/80 text-sm font-medium">
                            Event Location / Address
                          </Label>
                          <Select
                            value={plan.plan.location || ''}
                            onValueChange={(val) => {
                              plan.setLocation(val);
                              setShowCustomLocation(val === 'custom');
                            }}
                          >
                            <SelectTrigger className="w-full bg-white/5 border-gold/20 text-cream focus:border-gold/50 h-11">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gold/40 shrink-0" />
                                <SelectValue placeholder="Select event location" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-charcoal border-gold/20">
                              {EVENT_LOCATIONS.map((group) => (
                                <SelectGroup key={group.group}>
                                  <SelectLabel className="text-gold/60 text-xs font-semibold uppercase tracking-wider">
                                    {group.group}
                                  </SelectLabel>
                                  {group.locations.map((loc) => (
                                    <SelectItem
                                      key={loc.value}
                                      value={loc.value}
                                      className="text-cream focus:bg-gold/10 focus:text-gold"
                                    >
                                      {loc.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                              <SelectGroup>
                                <SelectLabel className="text-gold/60 text-xs font-semibold uppercase tracking-wider">
                                  Other
                                </SelectLabel>
                                <SelectItem
                                  value="custom"
                                  className="text-cream focus:bg-gold/10 focus:text-gold"
                                >
                                  <span className="flex items-center gap-2">
                                    <Pencil className="w-3.5 h-3.5 text-gold/50" />
                                    Custom Location
                                  </span>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {showCustomLocation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                type="text"
                                placeholder="Enter your custom address"
                                value={plan.plan.location === 'custom' ? '' : plan.plan.location}
                                onChange={(e) => plan.setLocation(e.target.value)}
                                className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11 mt-2"
                              />
                            </motion.div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialReqs" className="text-cream/80 text-sm font-medium">
                            Special Requirements
                          </Label>
                          <Input
                            id="specialReqs"
                            type="text"
                            placeholder="e.g., Wheelchair accessible, vegan options"
                            value={plan.plan.notes || ''}
                            onChange={(e) => plan.setNotes(e.target.value)}
                            className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                          />
                        </div>
                      </div>

                      {/* ── Add-ons Section ── */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-cream/80 text-sm font-medium">
                            Add-ons
                          </Label>
                          <p className="text-cream/40 text-xs mt-1">
                            Enhance your event with these premium extras.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {ADD_ON_OPTIONS.map((addon) => {
                            const isSelected = selectedAddOnIds.has(addon.id);
                            const Icon = addon.icon;
                            return (
                              <motion.div
                                key={addon.id}
                                whileHover={{ y: -2 }}
                                onClick={() => toggleAddOn(addon.id, addon.name, addon.price)}
                                className={`relative cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5'
                                    : 'bg-white/[0.02] border-gold/10 hover:border-gold/25 hover:bg-white/[0.04]'
                                }`}
                              >
                                <div
                                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                                    isSelected
                                      ? 'bg-gold/20 border border-gold/30'
                                      : 'bg-gold/5 border border-gold/10'
                                  }`}
                                >
                                  <Icon
                                    className={`w-4 h-4 ${isSelected ? 'text-gold' : 'text-gold/60'}`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-semibold font-display transition-colors duration-300 ${
                                      isSelected ? 'text-gold' : 'text-cream/80'
                                    }`}
                                  >
                                    {addon.name}
                                  </p>
                                  <p className="text-cream/40 text-xs">
                                    {format(addon.price)}
                                    {'suffix' in addon ? addon.suffix : ''}
                                  </p>
                                </div>
                                <div
                                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isSelected
                                      ? 'bg-gold border-gold'
                                      : 'border-cream/20'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-charcoal-dark" />}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ─── Navigation ─── */}
                    <div className="flex items-center justify-between mt-10">
                      <Button
                        onClick={goBack}
                        variant="outline"
                        className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 hover:border-gold/30 h-12 px-6"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={goNext}
                        className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow hover:gold-glow-strong"
                      >
                        Review Booking
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── STEP 4: REVIEW & CONFIRM ─── */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={direction === 'forward' ? fadeSlideIn : fadeSlideBack}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="space-y-6">
                  {/* ── Summary Card ── */}
                  <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                    <CardContent className="p-6 md:p-10">
                      <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-2">
                          Review Your <span className="text-gold">Booking</span>
                        </h2>
                        <p className="text-cream/50 text-sm">
                          Please review your selections before confirming.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Event Info Summary */}
                        <div className="rounded-xl bg-white/[0.02] border border-gold/10 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-gold" />
                            </div>
                            <h3 className="text-cream font-semibold font-display text-sm">Event Information</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-cream/40 text-xs mb-1">Event Type</p>
                              <p className="text-cream text-sm font-medium">
                                {EVENT_CATEGORIES.find((c) => c.id === plan.plan.eventType)?.name || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-cream/40 text-xs mb-1">Event Name</p>
                              <p className="text-cream text-sm font-medium">{eventName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-cream/40 text-xs mb-1">Guests</p>
                              <p className="text-cream text-sm font-medium">{plan.plan.guestCount} guests</p>
                            </div>
                            <div>
                              <p className="text-cream/40 text-xs mb-1">Date</p>
                              <p className="text-cream text-sm font-medium">
                                {plan.plan.date
                                  ? new Date(plan.plan.date + 'T00:00:00').toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : '—'}
                              </p>
                            </div>
                            {plan.plan.location && (
                              <div className="sm:col-span-2">
                                <p className="text-cream/40 text-xs mb-1">Location</p>
                                <p className="text-cream text-sm font-medium">{plan.plan.location}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Services Summary */}
                        <div className="rounded-xl bg-white/[0.02] border border-gold/10 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-gold" />
                            </div>
                            <h3 className="text-cream font-semibold font-display text-sm">Selected Services</h3>
                          </div>
                          {plan.plan.services.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {plan.plan.services.map((s) => (
                                <span
                                  key={s.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-medium"
                                >
                                  {s.name} x{s.quantity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-cream/40 text-sm">No services selected</p>
                          )}
                        </div>

                        {/* Venue & Catering Summary */}
                        <div className="rounded-xl bg-white/[0.02] border border-gold/10 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-gold" />
                            </div>
                            <h3 className="text-cream font-semibold font-display text-sm">Venue & Catering</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-cream/40 text-xs mb-1">Venue Type</p>
                              <p className="text-cream text-sm font-medium capitalize">
                                {VENUE_OPTIONS.find((v) => v.value === plan.plan.venueType)?.label || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-cream/40 text-xs mb-1">Catering Package</p>
                              <p className="text-cream text-sm font-medium capitalize">
                                {CATERING_OPTIONS.find((c) => c.value === plan.plan.cateringPackage)?.label || '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Add-ons Summary */}
                        {plan.plan.addOns.length > 0 && (
                          <div className="rounded-xl bg-white/[0.02] border border-gold/10 p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-gold" />
                              </div>
                              <h3 className="text-cream font-semibold font-display text-sm">Add-ons</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {plan.plan.addOns.map((a) => (
                                <span
                                  key={a.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-medium"
                                >
                                  {a.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Special Requirements */}
                        {(plan.plan.notes || eventDescription) && (
                          <div className="rounded-xl bg-white/[0.02] border border-gold/10 p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-gold" />
                              </div>
                              <h3 className="text-cream font-semibold font-display text-sm">Notes & Requirements</h3>
                            </div>
                            <p className="text-cream/60 text-sm leading-relaxed">
                              {plan.plan.notes || eventDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── Cost Breakdown Card ── */}
                  <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                    <CardContent className="p-6 md:p-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-gold" />
                        </div>
                        <h3 className="text-cream font-semibold font-display">Cost Breakdown</h3>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-3 mb-6 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,164,86,0.2) transparent' }}>
                        {breakdown.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0">
                            <span className="text-cream/70 text-sm">{item.label}</span>
                            <span className="text-cream font-medium text-sm">{format(item.cost)}</span>
                          </div>
                        ))}
                        {breakdown.length === 0 && (
                          <p className="text-cream/40 text-sm text-center py-4">No items selected yet</p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="luxury-divider my-6" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cream/50 text-sm">Estimated Total</p>
                          <p className="text-2xl md:text-3xl font-bold text-gold font-display">
                            {format(totalCost)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-cream/30 text-xs">* Final pricing may vary</p>
                          <p className="text-cream/30 text-xs">based on customization</p>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="mt-8 pt-6 border-t border-gold/10">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => {
                              setTermsAccepted(checked === true);
                              if (errors.terms) setErrors((e) => ({ ...e, terms: '' }));
                            }}
                            className={`mt-0.5 data-[state=checked]:bg-gold data-[state=checked]:border-gold ${
                              errors.terms ? 'border-red-500/50' : ''
                            }`}
                          />
                          <Label
                            htmlFor="terms"
                            className="text-cream/60 text-sm leading-relaxed cursor-pointer"
                          >
                            I agree to the{' '}
                            <span className="text-gold hover:text-gold-light underline underline-offset-2 cursor-pointer">
                              Terms & Conditions
                            </span>{' '}
                            and{' '}
                            <span className="text-gold hover:text-gold-light underline underline-offset-2 cursor-pointer">
                              Booking Policy
                            </span>
                            . I understand that a 30% deposit is required to confirm the booking.
                          </Label>
                        </div>
                        {errors.terms && (
                          <p className="text-red-400 text-xs mt-2 ml-7">{errors.terms}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ─── Navigation ─── */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={goBack}
                      variant="outline"
                      className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 hover:border-gold/30 h-12 px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow hover:gold-glow-strong"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
