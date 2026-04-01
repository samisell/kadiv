'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Heart,
  Briefcase,
  Cake,
  Music,
  GlassWater,
  Star,
  ArrowRight,
  Calendar,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/store/navigation';
import { useCurrency } from '@/lib/currency';
import {
  EVENT_CATEGORIES,
  SERVICES,
  TESTIMONIALS,
  STATS,
  GALLERY_IMAGES,
} from '@/data/content';

// ─── Icon Helper ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Briefcase,
  Cake,
  Music,
  GlassWater,
  Church: Heart, // fallback for religious
  MapPin,
  Sparkles,
  UtensilsCrossed: Settings,
  Video: Play,
  Disc: Music,
  Camera: Star,
  Shield: CheckCircle2,
};

function getCategoryIcon(iconName: string) {
  return ICON_MAP[iconName] || Sparkles;
}

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  inView,
}: {
  target: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span>{count.toLocaleString()}</span>;
}

// ─── Section Wrapper ────────────────────────────────────────────────────────
function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Section Title ──────────────────────────────────────────────────────────
function SectionTitle({
  subtitle,
  title,
  description,
  center = true,
}: {
  subtitle: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 md:mb-16 ${center ? 'text-center' : ''}`}>
      <p className="text-gold text-sm font-semibold tracking-[0.25em] uppercase mb-3">
        {subtitle}
      </p>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-cream mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-cream/60 text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
      <div className="luxury-divider mt-6 max-w-xs mx-auto" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { navigate } = useNavigation();

  // ─── Hero Slideshow State ────────────────────────────────────────────────
  const heroImages = [
    '/images/hero-wedding.png',
    '/images/hero-corporate.png',
    '/images/hero-birthday.png',
  ];
  const heroTexts = [
    {
      tag: 'Weddings & Celebrations',
      headline: 'We Handle Every Detail of Your Event',
      sub: 'From grand weddings to intimate soirées, we transform your vision into an unforgettable experience.',
    },
    {
      tag: 'Corporate Excellence',
      headline: 'Elevate Your Brand Experience',
      sub: 'Professionally orchestrated corporate events that leave lasting impressions on every attendee.',
    },
    {
      tag: 'Milestone Moments',
      headline: 'Celebrate Life\'s Greatest Moments',
      sub: 'Birthdays, anniversaries, and milestones deserve nothing less than extraordinary.',
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // ─── Testimonials Carousel State ─────────────────────────────────────────
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const testimonialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTestimonialAutoplay = useCallback(() => {
    if (testimonialTimerRef.current) clearInterval(testimonialTimerRef.current);
    testimonialTimerRef.current = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startTestimonialAutoplay();
    return () => {
      if (testimonialTimerRef.current) clearInterval(testimonialTimerRef.current);
    };
  }, [startTestimonialAutoplay]);

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    startTestimonialAutoplay();
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    startTestimonialAutoplay();
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  1. HERO SECTION
  // ═══════════════════════════════════════════════════════════════════════
  const HeroSection = () => (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slideshow Images */}
      {heroImages.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={src}
            alt={`KADIV Event ${idx + 1}`}
            fill
            className={`object-cover ${
              idx === currentSlide ? 'animate-ken-burns' : ''
            }`}
            priority={idx === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-charcoal-dark/70 via-charcoal-dark/40 to-charcoal-dark" />

      {/* Decorative Gold Lines */}
      <div className="absolute top-0 left-0 right-0 z-30 luxury-divider" />
      <div className="absolute bottom-20 left-0 right-0 z-30 luxury-divider opacity-40" />

      {/* Hero Content */}
      <div className="relative z-30 h-full flex flex-col items-center justify-center px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gold text-sm md:text-base font-semibold tracking-[0.3em] uppercase mb-4"
            >
              {heroTexts[currentSlide].tag}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-cream leading-tight mb-6"
            >
              {heroTexts[currentSlide].headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {heroTexts[currentSlide].sub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate('booking')}
                size="lg"
                className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold text-base px-8 py-3 rounded-lg gold-glow"
              >
                Book Your Event
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('calculator')}
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold-light text-base px-8 py-3 rounded-lg"
              >
                Get Estimate
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-500 rounded-full ${
                idx === currentSlide
                  ? 'w-10 h-2 bg-gold'
                  : 'w-2 h-2 bg-cream/30 hover:bg-cream/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 right-8 z-30 hidden md:block"
      >
        <div className="w-6 h-10 rounded-full border-2 border-gold/30 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 bg-gold/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  2. STATS COUNTER SECTION
  // ═══════════════════════════════════════════════════════════════════════
  const StatsSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    return (
      <Section className="py-16 md:py-20 bg-charcoal-dark relative" id="stats">
        <div className="absolute top-0 left-0 right-0 luxury-divider" />
        <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gold-gradient mb-2">
                  <AnimatedCounter target={stat.value} inView={inView} />
                  {stat.value >= 1000 ? '+' : '+'}
                </div>
                <p className="text-cream/50 text-sm md:text-base tracking-wide uppercase font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 luxury-divider" />
      </Section>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  3. EVENT CATEGORIES GRID
  // ═══════════════════════════════════════════════════════════════════════
  const CategoriesSection = () => (
    <Section
      className="py-20 md:py-24 bg-charcoal-dark"
      id="categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="What We Do"
          title="Event Categories"
          description="From intimate celebrations to grand productions, we specialize in crafting extraordinary events across every category."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENT_CATEGORIES.map((category, idx) => {
            const IconComponent = getCategoryIcon(category.icon);
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative overflow-hidden rounded-xl cursor-pointer hover-lift border border-gold/0 hover:border-gold/30 transition-colors duration-500"
                onClick={() => navigate('events')}
              >
                {/* Card Image */}
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/50 to-transparent" />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors duration-500" />

                  {/* Category Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                    <IconComponent className="w-5 h-5 text-gold" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-display font-bold text-cream mb-2 group-hover:text-gold transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-cream/60 text-sm leading-relaxed mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  4. FEATURED SERVICES SECTION
  // ═══════════════════════════════════════════════════════════════════════
  const ServicesSection = () => {
    const { format } = useCurrency();
    return (
    <Section className="py-20 md:py-24 bg-charcoal" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Our Expertise"
          title="Featured Services"
          description="Premium services tailored to make every moment extraordinary. Each service is delivered with meticulous attention to detail."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.slice(0, 4).map((service, idx) => {
            const IconComponent = getCategoryIcon(service.icon);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-xl bg-charcoal-dark border border-gold/10 hover:border-gold/30 transition-all duration-500 hover-lift"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark to-transparent" />

                  {/* Price Badge */}
                  <div className="absolute top-3 left-3 glass rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <span className="text-gold text-xs font-bold">From</span>
                    <span className="text-cream text-sm font-bold">
                      {format(service.startingPrice)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4.5 h-4.5 text-gold" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-cream group-hover:text-gold transition-colors">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-cream/50 text-sm leading-relaxed mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <button
                    onClick={() => navigate('services')}
                    className="inline-flex items-center gap-1.5 text-gold text-sm font-medium hover:text-gold-light transition-colors group/btn"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Services CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('services')}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold-light px-8"
          >
            View All Services
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </Section>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  5. HOW IT WORKS SECTION
  // ═══════════════════════════════════════════════════════════════════════
  const HOW_IT_WORKS_STEPS = [
    {
      number: '01',
      icon: Calendar,
      title: 'Choose Your Event',
      description:
        'Browse our categories and select the type of event you envision. Share your dreams with us, and we\'ll begin crafting a personalized plan.',
    },
    {
      number: '02',
      icon: Settings,
      title: 'Customize & Plan',
      description:
        'Work closely with our expert planners to customize every detail — from venue and décor to catering and entertainment. Nothing is left to chance.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'We Execute',
      description:
        'Sit back and enjoy while our dedicated team brings your event to life with precision, elegance, and flawless execution.',
    },
  ];

  const HowItWorksSection = () => (
    <Section className="py-20 md:py-24 bg-charcoal-dark" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Simple Process"
          title="How It Works"
          description="Three simple steps to bring your vision to life. We make luxury event planning effortless."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative">
          {/* Connecting Gold Line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20" />

          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="relative flex flex-col items-center text-center px-4 md:px-6"
            >
              {/* Step Number Circle */}
              <div className="relative z-10 w-32 h-32 rounded-full bg-charcoal border-2 border-gold/30 flex flex-col items-center justify-center mb-6 group hover:border-gold/60 hover:bg-gold/5 transition-all duration-500">
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-charcoal-dark text-xs font-bold">
                    {step.number}
                  </span>
                </div>
                <step.icon className="w-10 h-10 text-gold mb-1" />
              </div>

              <h3 className="text-xl font-display font-bold text-cream mb-3">
                {step.title}
              </h3>
              <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  6. TESTIMONIALS CAROUSEL
  // ═══════════════════════════════════════════════════════════════════════
  const TestimonialsSection = () => {
    const current = TESTIMONIALS[testimonialIndex];

    return (
      <Section className="py-20 md:py-24 bg-charcoal" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Client Stories"
            title="What Our Clients Say"
            description="Don't just take our word for it — hear from the people who've experienced the KADIV difference."
          />

          <div className="max-w-3xl mx-auto relative">
            {/* Decorative Quote Marks */}
            <div className="absolute -top-6 left-0 md:left-8 text-gold/10 text-[120px] font-display leading-none select-none pointer-events-none">
              &ldquo;
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5 }}
                className="relative glass rounded-2xl p-8 md:p-12"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < current.rating
                          ? 'fill-gold text-gold'
                          : 'fill-cream/20 text-cream/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote Text */}
                <blockquote className="text-cream/80 text-lg md:text-xl leading-relaxed font-elegant italic mb-8">
                  &ldquo;{current.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                    <span className="text-gold font-bold text-sm">
                      {current.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-cream font-semibold text-base">
                      {current.name}
                    </p>
                    <p className="text-cream/50 text-sm">{current.event}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-11 h-11 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTestimonialIndex(idx);
                      startTestimonialAutoplay();
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      idx === testimonialIndex
                        ? 'w-8 h-2.5 bg-gold'
                        : 'w-2.5 h-2.5 bg-cream/20 hover:bg-cream/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-11 h-11 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Section>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  7. GALLERY PREVIEW
  // ═══════════════════════════════════════════════════════════════════════
  const GallerySection = () => {
    const previewImages = GALLERY_IMAGES.slice(0, 6);

    return (
      <Section className="py-20 md:py-24 bg-charcoal-dark" id="gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Our Portfolio"
            title="Event Gallery"
            description="A glimpse into the extraordinary events we've had the privilege of creating."
          />

          <div className="masonry-grid">
            {previewImages.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-xl cursor-pointer break-inside-avoid mb-4"
                onClick={() => navigate('gallery')}
              >
                {/* Alternate heights for masonry effect */}
                <div
                  className={`relative overflow-hidden ${
                    idx === 0 || idx === 4 ? 'h-72' : idx === 2 || idx === 5 ? 'h-64' : 'h-56'
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-charcoal-dark/0 group-hover:bg-charcoal-dark/60 transition-colors duration-500 flex items-end justify-center">
                  <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pb-4">
                    <span className="glass rounded-full px-4 py-2 text-sm text-gold font-medium">
                      {img.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View Full Gallery Button */}
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('gallery')}
              size="lg"
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold-light px-10 py-3"
            >
              View Full Gallery
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </Section>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  8. CTA BANNER
  // ═══════════════════════════════════════════════════════════════════════
  const CTABanner = () => (
    <Section className="py-20 md:py-24 relative overflow-hidden" id="cta">
      {/* Gold Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-dark via-gold to-gold-light opacity-90" />

      {/* Shimmer Overlay */}
      <div className="absolute inset-0 animate-shimmer" />

      {/* Subtle Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, white 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-10 h-10 text-charcoal-dark/60 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-charcoal-dark mb-6 leading-tight">
            Ready to Create Something
            <br />
            Extraordinary?
          </h2>
          <p className="text-charcoal-dark/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Let us turn your vision into a breathtaking reality. Our team of expert
            planners is ready to craft an event that exceeds your wildest expectations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('booking')}
              size="lg"
              className="bg-charcoal-dark text-gold hover:bg-charcoal font-semibold text-base px-10 py-3 rounded-lg"
            >
              Start Planning Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate('contact')}
              size="lg"
              variant="outline"
              className="border-charcoal-dark/30 text-charcoal-dark hover:bg-charcoal-dark/10 hover:text-charcoal-dark text-base px-10 py-3 rounded-lg"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <GallerySection />
      <CTABanner />
    </div>
  );
}
