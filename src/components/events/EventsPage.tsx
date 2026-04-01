'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import {
  Heart,
  Briefcase,
  Cake,
  Music,
  GlassWater,
  Church,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Star,
  Users,
  DollarSign,
  PartyPopper,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNavigation } from '@/store/navigation';
import { EVENT_CATEGORIES } from '@/data/content';
import { useCurrency } from '@/lib/currency';

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                      */
/* ------------------------------------------------------------------ */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Briefcase,
  Cake,
  Music,
  GlassWater,
  Church,
};

/* ------------------------------------------------------------------ */
/*  Comparison data                                                    */
/* ------------------------------------------------------------------ */
interface ComparisonFeature {
  label: string;
  values: Record<string, boolean | string>;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  { label: 'Venue Selection', values: { weddings: true, corporate: true, birthdays: true, concerts: true, 'private-parties': true, religious: true } },
  { label: 'Full Decoration', values: { weddings: true, corporate: true, birthdays: true, concerts: false, 'private-parties': true, religious: true } },
  { label: 'Live Music / DJ', values: { weddings: true, corporate: 'Optional', birthdays: true, concerts: true, 'private-parties': true, religious: 'Optional' } },
  { label: 'Catering (Multi-course)', values: { weddings: true, corporate: true, birthdays: 'Optional', concerts: false, 'private-parties': true, religious: true } },
  { label: 'Photography & Video', values: { weddings: true, corporate: true, birthdays: true, concerts: true, 'private-parties': 'Optional', religious: true } },
  { label: 'Security Detail', values: { weddings: 'Optional', corporate: true, birthdays: false, concerts: true, 'private-parties': 'Optional', religious: 'Optional' } },
  { label: 'Custom Theme Design', values: { weddings: true, corporate: 'Optional', birthdays: true, concerts: true, 'private-parties': true, religious: 'Optional' } },
  { label: 'Live Streaming', values: { weddings: 'Optional', corporate: true, birthdays: false, concerts: true, 'private-parties': false, religious: 'Optional' } },
  { label: 'Pastry & Cake', values: { weddings: true, corporate: 'Optional', birthdays: true, concerts: false, 'private-parties': 'Optional', religious: true } },
  { label: 'Dedicated Event Planner', values: { weddings: true, corporate: true, birthdays: true, concerts: true, 'private-parties': true, religious: true } },
];

/* ------------------------------------------------------------------ */
/*  AI Recommendation mock logic                                       */
/* ------------------------------------------------------------------ */
function getMockRecommendation(occasion: string, guests: string, budget: string) {
  const recMap: Record<string, { category: string; reason: string }> = {
    'weddings-low-50': { category: 'Private Parties', reason: 'For an intimate wedding celebration, our Private Party package offers the perfect blend of elegance and intimacy without stretching your budget.' },
    'weddings-low-100': { category: 'Birthdays', reason: 'Consider starting with a beautiful birthday-style celebration — we can scale it into a wedding celebration with all the right touches.' },
    'corporate-mid-100': { category: 'Corporate Events', reason: 'A mid-range corporate event is exactly where KADIV shines — professional, polished, and perfectly on-brand.' },
    default: { category: 'Weddings', reason: 'Based on your preferences, a full-service luxury event is our recommendation. Our dedicated team will handle every detail to create an unforgettable experience.' },
  };

  const key = `${occasion}-${budget}-${guests}`;
  return recMap[key] || recMap['default'];
}

/* ------------------------------------------------------------------ */
/*  Framer helpers                                                     */
/* ------------------------------------------------------------------ */
function FadeInWhenVisible({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Hero Banner                                               */
/* ------------------------------------------------------------------ */
function HeroBanner() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark via-charcoal to-charcoal-dark" />
      {/* Decorative gold lines */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold to-transparent" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-gold to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-gold to-transparent" />
      </div>
      {/* Gold glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px]" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="w-12 h-px bg-gold/50" />
          <Sparkles className="w-5 h-5 text-gold" />
          <span className="w-12 h-px bg-gold/50" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gold-gradient mb-6"
        >
          Our Event Categories
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-cream/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-elegant"
        >
          From intimate celebrations to grand spectacles, discover the perfect event type
          crafted by KADIV&apos;s world-class team.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10"
        >
          <div className="luxury-divider max-w-xs mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Category Showcase                                         */
/* ------------------------------------------------------------------ */
function CategoryShowcase() {
  const { navigate } = useNavigation();

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-16">
        {EVENT_CATEGORIES.map((category, idx) => {
          const IconComponent = ICON_MAP[category.icon] || Sparkles;
          const isEven = idx % 2 === 0;

          return (
            <FadeInWhenVisible key={category.id} delay={0.1}>
              <div className="group relative">
                {/* Category Banner Card */}
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="relative w-full h-[340px] sm:h-[400px] md:h-[440px] rounded-2xl overflow-hidden cursor-pointer border border-transparent transition-all duration-500 hover:border-gold/50 hover:shadow-[0_0_40px_rgba(200,164,86,0.15)]"
                  onClick={() => navigate('booking')}
                >
                  {/* Background Image */}
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

                  {/* Gold accent border on hover */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold/30 transition-all duration-500" />

                  {/* Content */}
                  <div className={`absolute inset-0 flex items-center ${isEven ? 'justify-start' : 'justify-end'} px-8 sm:px-12 md:px-16`}>
                    <div className={`max-w-lg ${isEven ? 'text-left' : 'text-right'}`}>
                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className={`flex items-center gap-3 mb-4 ${!isEven ? 'justify-end' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center backdrop-blur-sm">
                          <IconComponent className="w-6 h-6 text-gold" />
                        </div>
                        <span className="text-gold/60 text-xs font-medium uppercase tracking-[0.25em]">
                          {String(idx + 1).padStart(2, '0')} / {String(EVENT_CATEGORIES.length).padStart(2, '0')}
                        </span>
                      </motion.div>

                      {/* Name */}
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cream mb-4 font-display leading-tight">
                        {category.name}
                      </h2>

                      {/* Description */}
                      <p className="text-cream/60 text-base sm:text-lg leading-relaxed mb-8 font-elegant">
                        {category.description}
                      </p>

                      {/* CTA */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('booking');
                        }}
                        className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-8 h-12 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,164,86,0.3)]"
                      >
                        Book This Type of Event
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </motion.div>

                {/* Gallery Grid */}
                {category.gallery && category.gallery.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-hidden rounded-2xl">
                    {category.gallery.map((img, i) => (
                      <motion.div
                        key={img + i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 * (i + 1) }}
                        className="relative h-[180px] sm:h-[200px] rounded-xl overflow-hidden group/gallery"
                      >
                        <Image
                          src={img}
                          alt={`${category.name} gallery ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/gallery:scale-105"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/gallery:bg-black/30 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300">
                          <span className="text-cream text-sm font-medium uppercase tracking-wider">
                            View
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </FadeInWhenVisible>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Comparison Table                                          */
/* ------------------------------------------------------------------ */
function ComparisonSection() {
  return (
    <section className="relative py-24 px-4">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark via-charcoal to-charcoal-dark" />
      <div className="absolute top-0 left-0 right-0 luxury-divider" />
      <div className="absolute bottom-0 left-0 right-0 luxury-divider" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <FadeInWhenVisible className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-gold/50" />
            <span className="text-gold/60 text-xs font-medium uppercase tracking-[0.25em]">Compare</span>
            <span className="w-8 h-px bg-gold/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cream mb-4 font-display">
            What&apos;s <span className="text-gold-gradient">Included</span>
          </h2>
          <p className="text-cream/50 text-lg max-w-xl mx-auto font-elegant">
            See at a glance what each event category offers to help you make the perfect choice.
          </p>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.2}>
          <div className="overflow-x-auto rounded-2xl border border-gold/10 bg-charcoal/80 backdrop-blur-sm max-h-[500px] overflow-y-auto">
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-charcoal border-b border-gold/15">
                  <th className="text-left px-6 py-5 text-sm font-semibold text-cream/70 uppercase tracking-wider min-w-[200px]">
                    Feature
                  </th>
                  {EVENT_CATEGORIES.map((cat) => {
                    const IconComponent = ICON_MAP[cat.icon] || Sparkles;
                    return (
                      <th
                        key={cat.id}
                        className="text-center px-4 py-5 text-sm font-semibold text-gold uppercase tracking-wider"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent className="w-4 h-4 text-gold/60" />
                          <span className="whitespace-nowrap">{cat.name.replace(' Events', '').replace(' Parties', '')}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={`border-b border-gold/5 transition-colors hover:bg-gold/[0.03] ${
                      i % 2 === 0 ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-cream/70 font-medium">{feature.label}</td>
                    {EVENT_CATEGORIES.map((cat) => {
                      const val = feature.values[cat.id];
                      return (
                        <td key={cat.id} className="text-center px-4 py-4">
                          {val === true ? (
                            <Check className="w-5 h-5 text-gold mx-auto" />
                          ) : val === false ? (
                            <X className="w-5 h-5 text-cream/20 mx-auto" />
                          ) : (
                            <span className="text-xs text-cream/40 font-medium uppercase tracking-wider">
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInWhenVisible>

        {/* Legend */}
        <FadeInWhenVisible delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-cream/40">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span>Included</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-cream/20" />
              <span>Not Included</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider">Optional</span>
              <span>— Available on request</span>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: AI Recommendation                                          */
/* ------------------------------------------------------------------ */
function AIRecommendationSection() {
  const [occasion, setOccasion] = useState('');
  const [guests, setGuests] = useState('');
  const [budget, setBudget] = useState('');
  const [recommendation, setRecommendation] = useState<{ category: string; reason: string } | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const { formatShort } = useCurrency();

  const handleGetRecommendation = () => {
    if (!occasion || !guests || !budget) return;
    setIsRecommending(true);
    setRecommendation(null);

    // Simulate AI processing
    setTimeout(() => {
      const result = getMockRecommendation(occasion, guests, budget);
      setRecommendation(result);
      setIsRecommending(false);
    }, 1800);
  };

  const occasionOptions = [
    { value: 'weddings', label: 'Wedding / Vow Renewal' },
    { value: 'corporate', label: 'Corporate / Business' },
    { value: 'birthdays', label: 'Birthday / Milestone' },
    { value: 'concerts', label: 'Concert / Entertainment' },
    { value: 'private-parties', label: 'Private Party / Social' },
    { value: 'religious', label: 'Religious / Ceremony' },
  ];

  const guestOptions = [
    { value: '20', label: 'Up to 20 guests' },
    { value: '50', label: '20 – 50 guests' },
    { value: '100', label: '50 – 100 guests' },
    { value: '250', label: '100 – 250 guests' },
    { value: '500', label: '250 – 500 guests' },
    { value: '1000', label: '500+ guests' },
  ];

  const budgetOptions = [
    { value: 'low', label: `Under ${formatShort(7_500_000)}` },
    { value: 'mid', label: `${formatShort(7_500_000)} – ${formatShort(22_500_000)}` },
    { value: 'high', label: `${formatShort(22_500_000)} – ${formatShort(75_000_000)}` },
    { value: 'premium', label: `${formatShort(75_000_000)}+` },
  ];

  return (
    <section className="relative py-24 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-[150px]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <FadeInWhenVisible className="text-center mb-14">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6"
            whileHover={{ scale: 1.03 }}
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold text-xs font-medium uppercase tracking-wider">AI Powered</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cream mb-4 font-display">
            Not Sure Which Event <span className="text-gold-gradient">Fits</span> Your Needs?
          </h2>
          <p className="text-cream/50 text-lg max-w-xl mx-auto font-elegant">
            Answer three quick questions and our intelligent recommendation engine will suggest the perfect event type for you.
          </p>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.2}>
          <div className="glass rounded-2xl p-8 sm:p-10 gold-glow">
            {/* Question 1: Occasion */}
            <div className="mb-8">
              <Label className="text-cream/70 text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-gold" />
                What is the occasion?
              </Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="w-full bg-charcoal border-gold/15 text-cream focus:ring-gold/30 focus:border-gold/40 h-12 rounded-lg">
                  <SelectValue placeholder="Select your occasion" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/15 text-cream">
                  {occasionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-cream/80 hover:text-gold hover:bg-gold/10 focus:bg-gold/10 focus:text-gold">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question 2: Guest Count */}
            <div className="mb-8">
              <Label className="text-cream/70 text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                How many guests are you expecting?
              </Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-full bg-charcoal border-gold/15 text-cream focus:ring-gold/30 focus:border-gold/40 h-12 rounded-lg">
                  <SelectValue placeholder="Select guest count range" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/15 text-cream">
                  {guestOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-cream/80 hover:text-gold hover:bg-gold/10 focus:bg-gold/10 focus:text-gold">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question 3: Budget */}
            <div className="mb-10">
              <Label className="text-cream/70 text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gold" />
                What is your estimated budget range?
              </Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger className="w-full bg-charcoal border-gold/15 text-cream focus:ring-gold/30 focus:border-gold/40 h-12 rounded-lg">
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-gold/15 text-cream">
                  {budgetOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-cream/80 hover:text-gold hover:bg-gold/10 focus:bg-gold/10 focus:text-gold">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleGetRecommendation}
              disabled={!occasion || !guests || !budget || isRecommending}
              className="w-full h-14 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-charcoal-dark hover:from-gold hover:via-gold-light hover:to-gold font-bold text-base uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(200,164,86,0.3)]"
            >
              {isRecommending ? (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-5 h-5 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  />
                  Analyzing your preferences...
                </motion.div>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Recommendation
                </span>
              )}
            </Button>
          </div>
        </FadeInWhenVisible>

        {/* Recommendation Result */}
        {recommendation && (
          <FadeInWhenVisible className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative rounded-2xl overflow-hidden"
            >
              {/* Gold gradient border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-gold/30" />
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_50px_rgba(200,164,86,0.1)]" />

              <div className="relative bg-gradient-to-br from-charcoal to-charcoal-light rounded-2xl p-8 sm:p-10">
                {/* Star decoration */}
                <div className="absolute top-6 right-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                  >
                    <Star className="w-8 h-8 text-gold/20" fill="currentColor" />
                  </motion.div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <span className="text-gold text-sm font-semibold uppercase tracking-wider">
                    Our Recommendation
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-cream mb-3 font-display">
                  {recommendation.category}
                </h3>

                <p className="text-cream/60 text-base leading-relaxed mb-8 font-elegant max-w-lg">
                  {recommendation.reason}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => useNavigation.getState().navigate('booking')}
                    className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-8 h-12 text-sm uppercase tracking-wider"
                  >
                    Start Planning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gold/20 text-gold hover:bg-gold/10 px-8 h-12 text-sm uppercase tracking-wider"
                    onClick={() => {
                      setRecommendation(null);
                      setOccasion('');
                      setGuests('');
                      setBudget('');
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </motion.div>
          </FadeInWhenVisible>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main EventsPage Component                                          */
/* ------------------------------------------------------------------ */
export default function EventsPage() {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <CategoryShowcase />
      <ComparisonSection />
      <AIRecommendationSection />
    </div>
  );
}
