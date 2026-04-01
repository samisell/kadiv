'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Plus,
  Check,
  Sparkles,
  ArrowRight,
  MapPin,
  UtensilsCrossed,
  Cake,
  Video,
  Disc,
  Camera,
  Shield,
  Star,
  Users,
  Clock,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigation } from '@/store/navigation';
import { SERVICES } from '@/data/content';
import { useEventPlan } from '@/store/event-plan';
import { useCurrency } from '@/lib/currency';

// Icon mapping from string names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Sparkles,
  UtensilsCrossed,
  Cake,
  Video,
  Disc,
  Camera,
  Shield,
};

// Key features for the comparison table
const serviceFeatures: Record<string, string[]> = {
  venue: ['Up to 500+ guests', 'Indoor & outdoor options', 'VIP lounge access', 'Valet parking'],
  decoration: ['Custom theme design', 'Floral arrangements', 'Lighting design', 'Table styling'],
  catering: ['World-class chefs', 'Dietary accommodations', 'Full bar service', 'Table service staff'],
  pastry: ['Custom cake design', 'Dessert station', 'Tasting session included', 'Artisan pastries'],
  media: ['4K videography', 'Live streaming', 'Drone footage', 'Same-day highlight reel'],
  music: ['Live band options', 'Celebrity DJs', 'Sound engineering', 'Custom playlists'],
  photography: ['Award-winning team', 'Same-day edits', 'Photo album included', 'Drone photography'],
  security: ['Discreet personnel', 'CCTV monitoring', 'Guest list management', 'VIP close protection'],
};

function formatPrice(price: number, formatFn: (n: number) => string): string {
  return formatFn(price);
}

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

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

function HeroBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark via-charcoal to-charcoal-dark" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #C8A456 1px, transparent 1px), radial-gradient(circle at 75% 75%, #C8A456 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Gold accent lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-gold/40" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent to-gold/40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-8"
        >
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-gold text-sm font-medium tracking-wider uppercase font-body">
            Premium Event Solutions
          </span>
          <Sparkles className="w-4 h-4 text-gold" />
        </motion.div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gold-gradient mb-6 leading-tight">
          Our Premium Services
        </h1>

        <div className="luxury-divider w-32 mx-auto mb-6" />

        <p className="text-cream/60 text-lg md:text-xl font-body max-w-2xl mx-auto leading-relaxed">
          End-to-end solutions for extraordinary events. From intimate gatherings
          to grand celebrations, we deliver perfection at every scale.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 mt-10 text-cream/40 text-sm font-body"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gold/60" />
            <span>2500+ Events</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gold/40" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gold/60" />
            <span>15 Years Experience</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gold/40" />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gold/60" />
            <span>1800+ Happy Clients</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  isInPlan,
  onAdd,
}: {
  service: (typeof SERVICES)[0];
  index: number;
  isInPlan: boolean;
  onAdd: () => void;
}) {
  const { format } = useCurrency();
  const isReversed = index % 2 !== 0;
  const IconComponent = iconMap[service.icon] || Sparkles;

  return (
    <AnimatedSection delay={index * 0.1}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center group">
        {/* Image Section */}
        <div className={`${isReversed ? 'lg:order-2' : 'lg:order-1'} relative`}>
          <div className="relative overflow-hidden rounded-2xl border border-gold/10 bg-charcoal aspect-[4/3]">
            <Image
              src={service.image}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/60 via-transparent to-transparent" />

            {/* Price Badge on Image */}
            <div className="absolute bottom-4 left-4 z-10">
              <Badge className="bg-charcoal-dark/90 text-gold border-gold/30 px-3 py-1 text-sm backdrop-blur-sm">
                Starting from {formatPrice(service.startingPrice, format)}
              </Badge>
            </div>

            {/* Icon overlay */}
            <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center backdrop-blur-sm">
              <IconComponent className="w-5 h-5 text-gold" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'} flex flex-col gap-5`}>
          {/* Category number */}
          <div className="flex items-center gap-3">
            <span className="text-gold/40 font-display text-3xl font-light">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          {/* Service name */}
          <h3 className="font-display text-3xl md:text-4xl font-bold text-cream group-hover:text-gold transition-colors duration-300">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-cream/50 font-body text-base leading-relaxed">
            {service.description}
          </p>

          {/* Key features preview */}
          <div className="flex flex-wrap gap-2">
            {(serviceFeatures[service.id] || []).slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-xs text-cream/40 bg-charcoal-light/50 px-2.5 py-1 rounded-full border border-gold/5"
              >
                <Check className="w-3 h-3 text-gold/50" />
                {feature}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4 mt-2">
            {isInPlan ? (
              <Button
                disabled
                className="bg-gold/10 text-gold border border-gold/30 hover:bg-gold/15 cursor-default font-body"
              >
                <Check className="w-4 h-4" />
                Added to Plan
              </Button>
            ) : (
              <Button
                onClick={onAdd}
                className="bg-gold text-charcoal-dark hover:bg-gold-light font-body font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,164,86,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Add to Event Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Divider between services (except last) */}
      {index < SERVICES.length - 1 && (
        <div className="luxury-divider my-16 md:my-20" />
      )}
    </AnimatedSection>
  );
}

function ServiceComparisonTable() {
  const { format } = useCurrency();
  return (
    <AnimatedSection>
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
          Compare Our Services
        </h2>
        <div className="luxury-divider w-24 mx-auto mb-4" />
        <p className="text-cream/40 font-body max-w-lg mx-auto">
          A comprehensive overview of all our premium event services and their starting prices.
        </p>
      </div>

      <div className="border border-gold/10 rounded-2xl overflow-hidden bg-charcoal/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold font-body font-semibold text-sm uppercase tracking-wider">
                Service
              </TableHead>
              <TableHead className="text-gold font-body font-semibold text-sm uppercase tracking-wider hidden md:table-cell">
                Starting Price
              </TableHead>
              <TableHead className="text-gold font-body font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">
                Key Features
              </TableHead>
              <TableHead className="text-gold font-body font-semibold text-sm uppercase tracking-wider text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SERVICES.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Sparkles;
              return (
                <TableRow
                  key={service.id}
                  className="border-gold/5 hover:bg-gold/[0.02] transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <span className="text-cream font-body font-medium text-sm">
                          {service.name}
                        </span>
                        <span className="text-cream/30 font-body text-xs block md:hidden">
                          {formatPrice(service.startingPrice, format)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 hidden md:table-cell">
                    <span className="text-gold font-body font-semibold">
                      {formatPrice(service.startingPrice, format)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {(serviceFeatures[service.id] || []).slice(0, 2).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs text-cream/40 bg-charcoal-light/50 px-2 py-0.5 rounded-full border border-gold/5"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <ComparisonAddButton service={service} index={index} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AnimatedSection>
  );
}

function ComparisonAddButton({
  service,
}: {
  service: (typeof SERVICES)[0];
  index: number;
}) {
  const { plan, addService } = useEventPlan();
  const isInPlan = plan.services.some((s) => s.id === service.id);

  const handleAdd = () => {
    if (isInPlan) return;
    addService({
      id: service.id,
      name: service.name,
      price: service.startingPrice,
      quantity: 1,
    });
    toast.success('Service added to your event plan!', {
      description: `${service.name} has been added.`,
    });
  };

  if (isInPlan) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="text-gold/60 font-body text-xs cursor-default"
      >
        <Check className="w-3.5 h-3.5" />
        In Plan
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAdd}
      className="text-gold hover:text-gold-light hover:bg-gold/10 font-body text-xs transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      Add
    </Button>
  );
}

function CTASection() {
  const { navigate } = useNavigation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark via-charcoal to-charcoal-dark" />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #C8A456 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/20 mb-8">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-6">
            Not Sure What You Need?
          </h2>

          <div className="luxury-divider w-24 mx-auto mb-6" />

          <p className="text-cream/50 font-body text-lg leading-relaxed mb-10">
            Use our Cost Calculator to get a personalized estimate tailored
            to your event vision. Build your dream event and see the cost in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('calculator')}
              size="lg"
              className="bg-gold text-charcoal-dark hover:bg-gold-light font-body font-semibold px-8 h-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,164,86,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              Open Cost Calculator
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate('contact')}
              variant="outline"
              size="lg"
              className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold-light font-body px-8 h-12 transition-colors"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  const { plan, addService } = useEventPlan();
  const { format } = useCurrency();

  const handleAddService = (service: (typeof SERVICES)[0]) => {
    const alreadyInPlan = plan.services.some((s) => s.id === service.id);
    if (alreadyInPlan) return;

    addService({
      id: service.id,
      name: service.name,
      price: service.startingPrice,
      quantity: 1,
    });
    toast.success('Service added to your event plan!', {
      description: `${service.name} has been added. Starting from ${formatPrice(service.startingPrice, format)}.`,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Services Grid */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
                What We Offer
              </h2>
              <div className="luxury-divider w-24 mx-auto mb-4" />
              <p className="text-cream/40 font-body max-w-lg mx-auto">
                Explore our comprehensive suite of premium event services, each crafted to exceed expectations.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            {SERVICES.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                isInPlan={plan.services.some((s) => s.id === service.id)}
                onAdd={() => handleAddService(service)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Service Comparison Table */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-charcoal-dark">
        <div className="max-w-5xl mx-auto">
          <ServiceComparisonTable />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
