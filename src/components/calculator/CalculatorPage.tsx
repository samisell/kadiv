'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/store/navigation';
import { SERVICES } from '@/data/content';
import { useEventPlan, type ServiceItem } from '@/store/event-plan';
import { useCurrency, EVENT_LOCATIONS } from '@/lib/currency';
import {
  Heart,
  Briefcase,
  Cake,
  Music,
  GlassWater,
  Church,
  MapPin,
  Sparkles,
  UtensilsCrossed,
  Video,
  Disc,
  Camera,
  Shield,
  Minus,
  Plus,
  Download,
  Save,
  ArrowRight,
  Clock,
  Car,
  Flame,
  ChevronDown,
  ChevronUp,
  Building2,
  TreePine,
  Waves,
  Building,
  Warehouse,
  Gem,
  Crown,
  Star,
  PartyPopper,
} from 'lucide-react';

// ─── Data Definitions ──────────────────────────────────────────────

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding', icon: Heart },
  { value: 'corporate', label: 'Corporate Event', icon: Briefcase },
  { value: 'birthday', label: 'Birthday', icon: Cake },
  { value: 'concert', label: 'Concert', icon: Music },
  { value: 'private-party', label: 'Private Party', icon: GlassWater },
  { value: 'religious', label: 'Religious Event', icon: Church },
];

const VENUES = [
  {
    id: 'ballroom',
    name: 'Ballroom',
    price: 2000000,
    description: 'Elegant grand ballroom with crystal chandeliers',
    icon: Building2,
    gradient: 'from-amber-900/40 to-stone-900/60',
  },
  {
    id: 'garden',
    name: 'Garden',
    price: 1500000,
    description: 'Lush garden setting with natural beauty',
    icon: TreePine,
    gradient: 'from-emerald-900/40 to-stone-900/60',
  },
  {
    id: 'beach',
    name: 'Beach',
    price: 5000000,
    description: 'Stunning waterfront venue with ocean views',
    icon: Waves,
    gradient: 'from-cyan-900/40 to-stone-900/60',
  },
  {
    id: 'rooftop',
    name: 'Rooftop',
    price: 3000000,
    description: 'Skyline views from an exclusive rooftop terrace',
    icon: Building,
    gradient: 'from-purple-900/40 to-stone-900/60',
  },
  {
    id: 'indoor-hall',
    name: 'Indoor Hall',
    price: 1000000,
    description: 'Versatile indoor space for any occasion',
    icon: Warehouse,
    gradient: 'from-neutral-800/40 to-stone-900/60',
  },
];

const CATERING_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    pricePerGuest: 7500,
    description: 'Classic menu with essential courses',
    icon: UtensilsCrossed,
  },
  {
    id: 'premium',
    name: 'Premium',
    pricePerGuest: 15000,
    description: 'Upscale dining with premium ingredients',
    icon: Star,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    pricePerGuest: 30000,
    description: 'Gourmet experience with world-class chefs',
    icon: Crown,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    pricePerGuest: 50000,
    description: 'The ultimate bespoke culinary journey',
    icon: Gem,
  },
];

const ADD_ONS = [
  { id: 'extra-hours', name: 'Extra Hours', price: 100000, icon: Clock, description: '₦100,000/hr' },
  { id: 'valet-parking', name: 'Valet Parking', price: 200000, icon: Car, description: 'Full valet service' },
  { id: 'photo-booth', name: 'Photo Booth', price: 150000, icon: Camera, description: 'Interactive photo booth' },
  { id: 'fireworks', name: 'Fireworks', price: 500000, icon: Flame, description: 'Spectacular fireworks display' },
  { id: 'live-band', name: 'Live Band', price: 800000, icon: Music, description: 'Professional live band' },
];

const SERVICE_ICONS: Record<string, React.ElementType> = {
  MapPin,
  Sparkles,
  UtensilsCrossed,
  Cake,
  Video,
  Disc,
  Camera,
  Shield,
};

// ─── Animated Number Component ─────────────────────────────────────

function AnimatedNumber({ value, formatFn }: { value: number; formatFn: (n: number) => string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{formatFn(displayValue)}</span>;
}

// ─── Section Wrapper ───────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="font-display text-lg font-semibold text-cream">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export default function CalculatorPage() {
  const { navigate } = useNavigation();
  const {
    plan,
    setEventType,
    setGuestCount,
    setVenueType,
    setCateringPackage,
    addService,
    removeService,
    addAddOn,
    removeAddOn,
    getTotal,
    getBreakdown,
    setLocation,
  } = useEventPlan();

  const { format, symbol } = useCurrency();

  const [showInvoice, setShowInvoice] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    services: true,
    addons: true,
  });

  const breakdown = useMemo(() => getBreakdown(), [plan, getBreakdown]);
  const subtotal = useMemo(() => getTotal(), [plan, getTotal]);
  const serviceFee = subtotal * 0.1;
  const taxEstimate = subtotal * 0.08;
  const grandTotal = subtotal + serviceFee + taxEstimate;

  const selectedEventType = EVENT_TYPES.find((e) => e.value === plan.eventType);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGuestCountChange = useCallback(
    (delta: number) => {
      const newCount = Math.min(1000, Math.max(10, plan.guestCount + delta));
      setGuestCount(newCount);
    },
    [plan.guestCount, setGuestCount]
  );

  const handleServiceToggle = useCallback(
    (service: (typeof SERVICES)[0]) => {
      const isSelected = plan.services.some((s) => s.id === service.id);
      if (isSelected) {
        removeService(service.id);
      } else {
        addService({
          id: service.id,
          name: service.name,
          price: service.startingPrice,
          quantity: 1,
        });
      }
    },
    [plan.services, addService, removeService]
  );

  const handleAddOnToggle = useCallback(
    (addOn: (typeof ADD_ONS)[0]) => {
      const isSelected = plan.addOns.some((a) => a.id === addOn.id);
      if (isSelected) {
        removeAddOn(addOn.id);
      } else {
        addAddOn({
          id: addOn.id,
          name: addOn.name,
          price: addOn.price,
          quantity: 1,
        });
      }
    },
    [plan.addOns, addAddOn, removeAddOn]
  );

  const handleSaveEstimate = () => {
    toast.success('Estimate saved!', {
      description: 'Your event estimate has been saved successfully.',
      style: {
        background: '#111111',
        border: '1px solid rgba(200, 164, 86, 0.3)',
        color: '#FAF3E0',
      },
    });
  };

  const handleDownloadInvoice = () => {
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleProceedToBooking = () => {
    navigate('booking');
  };

  const isServiceSelected = (id: string) => plan.services.some((s) => s.id === id);
  const isAddOnSelected = (id: string) => plan.addOns.some((a) => a.id === id);

  return (
    <div className="min-h-screen bg-charcoal-dark py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3 font-body">
            Plan Your Dream Event
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream mb-4">
            Event <span className="text-gold-gradient">Cost Calculator</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Customize every detail of your event and see real-time pricing.
            Build your perfect celebration, then save or proceed to booking.
          </p>
          <div className="luxury-divider max-w-xs mx-auto mt-6" />
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── LEFT COLUMN: Calculator Form ─── */}
        <motion.div
          className="lg:col-span-7 space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Event Type */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <SectionHeader
                title="Event Type"
                subtitle="Select the type of event you're planning"
              />
              <Select
                value={plan.eventType}
                onValueChange={setEventType}
              >
                <SelectTrigger className="w-full bg-charcoal border-gold/20 text-cream h-12 text-base">
                  <SelectValue placeholder="Choose an event type..." />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/20">
                  {EVENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="text-cream hover:bg-gold/10 focus:bg-gold/10 focus:text-gold cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="size-4 text-gold" />
                          {type.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Event Location */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <SectionHeader
                title="Event Location"
                subtitle="Where will your event take place?"
              />
              <Select
                value={plan.location || ''}
                onValueChange={setLocation}
              >
                <SelectTrigger className="w-full bg-charcoal border-gold/20 text-cream h-12 text-base">
                  <MapPin className="size-4 text-gold mr-2" />
                  <SelectValue placeholder="Select a location..." />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/20 max-h-64 overflow-y-auto">
                  {EVENT_LOCATIONS.map((group) => (
                    <SelectGroup key={group.group}>
                      <SelectLabel className="text-gold/80 font-semibold text-xs uppercase tracking-wider">
                        {group.group}
                      </SelectLabel>
                      {group.locations.map((loc) => (
                        <SelectItem
                          key={loc.value}
                          value={loc.value}
                          className="text-cream hover:bg-gold/10 focus:bg-gold/10 focus:text-gold cursor-pointer"
                        >
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Number of Guests */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <SectionHeader
                title="Number of Guests"
                subtitle="How many guests will attend?"
              />
              <div className="flex items-center justify-between bg-charcoal rounded-lg border border-gold/15 p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleGuestCountChange(-10)}
                  disabled={plan.guestCount <= 10}
                  className="text-gold hover:bg-gold/10 hover:text-gold h-10 w-10"
                >
                  <Minus className="size-5" />
                </Button>
                <div className="text-center min-w-[140px]">
                  <div className="text-3xl font-display font-bold text-gold">
                    {plan.guestCount}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    guests
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleGuestCountChange(10)}
                  disabled={plan.guestCount >= 1000}
                  className="text-gold hover:bg-gold/10 hover:text-gold h-10 w-10"
                >
                  <Plus className="size-5" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                {[50, 100, 200, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setGuestCount(preset)}
                    className={`flex-1 py-1.5 px-2 text-xs rounded-md border transition-all cursor-pointer ${
                      plan.guestCount === preset
                        ? 'bg-gold/20 border-gold/40 text-gold'
                        : 'border-border/50 text-muted-foreground hover:border-gold/30 hover:text-cream'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Venue Type */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <SectionHeader
                title="Venue Type"
                subtitle="Select your preferred venue style"
              />
              <RadioGroup
                value={plan.venueType}
                onValueChange={setVenueType}
                className="space-y-3"
              >
                {VENUES.map((venue) => {
                  const Icon = venue.icon;
                  const isSelected = plan.venueType === venue.id;
                  return (
                    <motion.label
                      key={venue.id}
                      htmlFor={`venue-${venue.id}`}
                      className={`
                        flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 group
                        ${
                          isSelected
                            ? 'border-gold/50 bg-gold/5 shadow-[0_0_20px_rgba(200,164,86,0.08)]'
                            : 'border-border/40 hover:border-gold/25 hover:bg-gold/[0.02]'
                        }
                      `}
                      whileTap={{ scale: 0.995 }}
                    >
                      <RadioGroupItem
                        value={venue.id}
                        id={`venue-${venue.id}`}
                        className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                      />
                      <div
                        className={`flex items-center justify-center size-12 rounded-lg bg-gradient-to-br ${venue.gradient} shrink-0`}
                      >
                        <Icon
                          className={`size-5 ${isSelected ? 'text-gold' : 'text-cream/60 group-hover:text-cream'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium text-sm ${isSelected ? 'text-gold' : 'text-cream'}`}
                          >
                            {venue.name}
                          </span>
                          <span className="text-gold font-display font-semibold text-sm">
                            {format(venue.price)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {venue.description}
                        </p>
                      </div>
                    </motion.label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Catering Package */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <SectionHeader
                title="Catering Package"
                subtitle="Choose your dining experience"
              />
              <RadioGroup
                value={plan.cateringPackage}
                onValueChange={setCateringPackage}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {CATERING_PACKAGES.map((pkg) => {
                  const Icon = pkg.icon;
                  const isSelected = plan.cateringPackage === pkg.id;
                  return (
                    <motion.label
                      key={pkg.id}
                      htmlFor={`catering-${pkg.id}`}
                      className={`
                        relative flex flex-col p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? 'border-gold/50 bg-gold/5 shadow-[0_0_20px_rgba(200,164,86,0.08)]'
                            : 'border-border/40 hover:border-gold/25 hover:bg-gold/[0.02]'
                        }
                      `}
                      whileTap={{ scale: 0.995 }}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute top-2 right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <div className="size-5 rounded-full bg-gold flex items-center justify-center">
                            <svg
                              className="size-3 text-charcoal-dark"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`flex items-center justify-center size-10 rounded-lg ${
                            isSelected
                              ? 'bg-gold/15'
                              : 'bg-charcoal group-hover:bg-charcoal-light'
                          }`}
                        >
                          <Icon
                            className={`size-5 ${isSelected ? 'text-gold' : 'text-cream/60'}`}
                          />
                        </div>
                        <div>
                          <span
                            className={`font-medium text-sm ${isSelected ? 'text-gold' : 'text-cream'}`}
                          >
                            {pkg.name}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pkg.description}
                      </p>
                      <div className="mt-auto">
                        <span className="text-gold font-display font-semibold text-lg">
                          {format(pkg.pricePerGuest)}
                        </span>
                        <span className="text-xs text-muted-foreground">/guest</span>
                        {plan.cateringPackage === pkg.id && plan.guestCount > 0 && (
                          <motion.div
                            className="text-xs text-gold/60 mt-0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            = {format(pkg.pricePerGuest * plan.guestCount)} total
                          </motion.div>
                        )}
                      </div>
                      <RadioGroupItem
                        value={pkg.id}
                        id={`catering-${pkg.id}`}
                        className="sr-only"
                      />
                    </motion.label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Services Selection */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <button
                onClick={() => toggleSection('services')}
                className="w-full flex items-center justify-between mb-2 cursor-pointer"
              >
                <SectionHeader
                  title="Additional Services"
                  subtitle="Enhance your event with our premium services"
                />
                {expandedSections.services ? (
                  <ChevronUp className="size-5 text-gold shrink-0" />
                ) : (
                  <ChevronDown className="size-5 text-gold shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.services && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-4">
                      {SERVICES.map((service) => {
                        const Icon = SERVICE_ICONS[service.icon] || Sparkles;
                        const selected = isServiceSelected(service.id);
                        return (
                          <motion.div
                            key={service.id}
                            className={`
                              flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer
                              ${
                                selected
                                  ? 'border-gold/40 bg-gold/5'
                                  : 'border-border/30 hover:border-gold/20 hover:bg-gold/[0.02]'
                              }
                            `}
                            whileTap={{ scale: 0.998 }}
                            onClick={() => handleServiceToggle(service)}
                          >
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => handleServiceToggle(service)}
                              className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                            />
                            <div
                              className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${
                                selected ? 'bg-gold/15' : 'bg-charcoal'
                              }`}
                            >
                              <Icon
                                className={`size-5 ${selected ? 'text-gold' : 'text-cream/50'}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-sm font-medium ${selected ? 'text-gold' : 'text-cream'}`}
                              >
                                {service.name}
                              </span>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {service.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-gold font-display font-semibold text-sm">
                                {format(service.startingPrice)}
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                starting
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card className="bg-charcoal-light/50 border-border/50">
            <CardContent className="p-6">
              <button
                onClick={() => toggleSection('addons')}
                className="w-full flex items-center justify-between mb-2 cursor-pointer"
              >
                <SectionHeader
                  title="Add-ons"
                  subtitle="Extra touches to make your event extraordinary"
                />
                {expandedSections.addons ? (
                  <ChevronUp className="size-5 text-gold shrink-0" />
                ) : (
                  <ChevronDown className="size-5 text-gold shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.addons && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {ADD_ONS.map((addon) => {
                        const Icon = addon.icon;
                        const selected = isAddOnSelected(addon.id);
                        return (
                          <motion.div
                            key={addon.id}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer
                              ${
                                selected
                                  ? 'border-gold/40 bg-gold/5 shadow-[0_0_15px_rgba(200,164,86,0.06)]'
                                  : 'border-border/30 hover:border-gold/20 hover:bg-gold/[0.02]'
                              }
                            `}
                            whileTap={{ scale: 0.998 }}
                            onClick={() => handleAddOnToggle(addon)}
                          >
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => handleAddOnToggle(addon)}
                              className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                            />
                            <div
                              className={`flex items-center justify-center size-9 rounded-lg shrink-0 ${
                                selected ? 'bg-gold/15' : 'bg-charcoal'
                              }`}
                            >
                              <Icon
                                className={`size-4 ${selected ? 'text-gold' : 'text-cream/50'}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-sm font-medium ${selected ? 'text-gold' : 'text-cream'}`}
                              >
                                {addon.name}
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                {addon.description}
                              </p>
                            </div>
                            <span className="text-gold font-display font-semibold text-sm shrink-0">
                              {format(addon.price)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── RIGHT COLUMN: Cost Breakdown ─── */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="sticky top-24">
            <Card className="bg-charcoal-light/50 border-gold/20 shadow-[0_0_40px_rgba(200,164,86,0.06)] overflow-hidden">
              {/* Gold accent top border */}
              <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl text-cream">
                    Cost Breakdown
                  </CardTitle>
                  <div className="flex items-center gap-1.5 bg-gold/10 px-2.5 py-1 rounded-full">
                    <div className="size-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-[10px] text-gold font-medium uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2 space-y-4">
                {/* Event Type Badge */}
                {plan.eventType && selectedEventType && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/5 border border-gold/15">
                    {React.createElement(selectedEventType.icon, {
                      className: 'size-4 text-gold',
                    })}
                    <span className="text-sm text-cream">
                      {selectedEventType.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {plan.guestCount} guests
                    </span>
                  </div>
                )}

                {/* Breakdown Items */}
                <div className="space-y-0">
                  {breakdown.length > 0 ? (
                    breakdown.map((item, index) => (
                      <motion.div
                        key={`${item.label}-${item.cost}-${index}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0"
                      >
                        <span className="text-sm text-cream/80 truncate mr-4">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-cream shrink-0">
                          {format(item.cost)}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <PartyPopper className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Start selecting options to see your estimate
                      </p>
                    </div>
                  )}
                </div>

                {/* Totals */}
                {breakdown.length > 0 && (
                  <>
                    <Separator className="bg-border/30" />

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Subtotal
                        </span>
                        <span className="text-sm text-cream">
                          {format(subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Service Fee (10%)
                        </span>
                        <span className="text-sm text-cream">
                          {format(Math.round(serviceFee))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tax Estimate (8%)
                        </span>
                        <span className="text-sm text-cream">
                          {format(Math.round(taxEstimate))}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-gold/20" />

                    {/* Grand Total */}
                    <motion.div
                      className="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent rounded-xl p-5 border border-gold/20"
                      key={grandTotal}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <div className="text-xs text-gold/60 uppercase tracking-[0.2em] mb-1">
                        Grand Total
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg text-gold font-display">{symbol}</span>
                        <span className="text-4xl md:text-5xl font-display font-bold text-gold-gradient">
                          <AnimatedNumber value={Math.round(grandTotal)} formatFn={format} />
                        </span>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <Button
                        variant="outline"
                        className="w-full h-11 bg-transparent border-gold/25 text-gold hover:bg-gold/10 hover:text-gold hover:border-gold/40 cursor-pointer"
                        onClick={handleDownloadInvoice}
                      >
                        <Download className="size-4" />
                        Download Invoice
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-11 bg-transparent border-border/40 text-cream hover:bg-gold/5 hover:border-gold/30 hover:text-gold cursor-pointer"
                        onClick={handleSaveEstimate}
                      >
                        <Save className="size-4" />
                        Save Estimate
                      </Button>
                      <Button
                        className="w-full h-12 bg-gold text-charcoal-dark font-semibold text-base hover:bg-gold-light cursor-pointer"
                        onClick={handleProceedToBooking}
                      >
                        Proceed to Booking
                        <ArrowRight className="size-4 ml-1" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* ─── Invoice Dialog ─── */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="bg-charcoal-light border-gold/20 max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-cream">
              Invoice Preview
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review your event cost estimate
            </DialogDescription>
          </DialogHeader>

          {/* Invoice Content */}
          <div id="invoice-content" className="bg-charcoal rounded-lg p-6 border border-border/30">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-gold-gradient tracking-wider">
                KADIV
              </h2>
              <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mt-1">
                Luxury Event Management
              </p>
              <div className="luxury-divider max-w-[200px] mx-auto mt-3" />
            </div>

            {/* Event Details */}
            <div className="space-y-1.5 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Type</span>
                <span className="text-cream">
                  {selectedEventType?.label || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Guests</span>
                <span className="text-cream">{plan.guestCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-cream">{plan.date || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice #</span>
                <span className="text-cream">
                  KAD-{Date.now().toString().slice(-8)}
                </span>
              </div>
            </div>

            <Separator className="bg-border/30 my-4" />

            {/* Itemized Breakdown */}
            <div className="space-y-0 mb-4">
              {breakdown.map((item, index) => (
                <div
                  key={`inv-${index}`}
                  className="flex justify-between py-2 text-sm border-b border-border/15 last:border-0"
                >
                  <span className="text-cream/80">{item.label}</span>
                  <span className="text-cream font-medium">
                    {format(item.cost)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="bg-border/30 my-4" />

            {/* Invoice Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-cream">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee (10%)</span>
                <span className="text-cream">
                  {format(Math.round(serviceFee))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax Estimate (8%)</span>
                <span className="text-cream">
                  {format(Math.round(taxEstimate))}
                </span>
              </div>
            </div>

            <Separator className="bg-gold/20 my-4" />

            <div className="flex justify-between items-center">
              <span className="text-gold font-display font-semibold text-base">
                Total Due
              </span>
              <span className="text-gold font-display font-bold text-2xl">
                {format(Math.round(grandTotal))}
              </span>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border/20 text-center">
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                This is an estimate only. Final pricing may vary based on
                specific requirements and availability.
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                © {new Date().getFullYear()} KADIV Luxury Event Management
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              variant="outline"
              className="border-border/40 text-cream hover:bg-gold/5 hover:text-gold cursor-pointer"
              onClick={() => setShowInvoice(false)}
            >
              Close
            </Button>
            <Button
              className="bg-gold text-charcoal-dark hover:bg-gold-light cursor-pointer"
              onClick={handlePrintInvoice}
            >
              <Download className="size-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}