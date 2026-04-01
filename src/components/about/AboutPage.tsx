'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import {
  Target,
  Eye,
  Heart,
  Crown,
  Gem,
  Users,
  Clock,
  Package,
  Headphones,
  Sparkles,
  ArrowRight,
  Quote,
  CheckCircle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/store/navigation';
import { TEAM_MEMBERS, STATS } from '@/data/content';

/* ─── Scroll-triggered wrapper ─── */
function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 2200, bounce: 0 });
  const display = useTransform(spring, (v: number) => Math.round(v));
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (inView) {
      motionVal.set(value);
    }
  }, [inView, motionVal, value]);

  useEffect(() => {
    const unsub = display.on('change', (v: number) => setDisplayed(v));
    return unsub;
  }, [display]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl md:text-6xl font-bold text-gold-gradient mb-2">
        {displayed.toLocaleString()}
        {value >= 1000 ? '+' : value === 15 ? '+' : ''}
      </p>
      <p className="text-cream/60 text-sm tracking-widest uppercase">{label}</p>
    </div>
  );
}

/* ─── Section Heading ─── */
function SectionHeading({
  subtitle,
  title,
  description,
}: {
  subtitle: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center mb-16">
      <FadeInSection>
        <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3 font-medium">{subtitle}</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4">
          <span className="text-gold-gradient">{title}</span>
        </h2>
        <div className="luxury-divider w-24 mx-auto mb-6" />
        {description && (
          <p className="text-cream/60 max-w-2xl mx-auto text-lg leading-relaxed font-body">
            {description}
          </p>
        )}
      </FadeInSection>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════════════ */
export default function AboutPage() {
  const { navigate } = useNavigation();

  return (
    <div className="overflow-hidden">
      {/* ─── 1. Hero Banner ─── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/team-photo.png"
            alt="KADIV Team"
            fill
            className="object-cover animate-ken-burns"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/80 via-charcoal-dark/60 to-charcoal-dark" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold text-sm tracking-[0.4em] uppercase mb-4 font-medium">
              Discover Our Story
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              About{' '}
              <span className="text-gold-gradient">KADIV</span>
            </h1>
            <p className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-body">
              Where luxury meets extraordinary. Crafting unforgettable events
              with precision, passion, and unparalleled elegance.
            </p>
          </motion.div>

          {/* Decorative Gold Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="luxury-divider w-40 mx-auto mt-10"
          />
        </div>
      </section>

      {/* ─── 2. Our Story ─── */}
      <section className="py-24 md:py-32 bg-charcoal-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image */}
            <FadeInSection>
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden border-2 border-gold/30 gold-glow">
                  <Image
                    src="/images/kadiv-logo.png"
                    alt="KADIV Legacy"
                    width={600}
                    height={500}
                    className="w-full h-auto object-cover"
                    quality={85}
                  />
                </div>
                {/* Corner accents */}
                <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-gold/50 rounded-tl-lg" />
                <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-gold/50 rounded-br-lg" />
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -right-6 md:right-8 glass rounded-xl p-4 gold-glow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gold">15+</p>
                      <p className="text-cream/50 text-xs tracking-wider uppercase">Years of Excellence</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </FadeInSection>

            {/* Right: Story Text */}
            <FadeInSection delay={0.2}>
              <div>
                <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                  Our Story
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-cream mb-6">
                  Born from a{' '}
                  <span className="text-gold-gradient">Passion</span> for
                  Perfection
                </h2>
                <div className="luxury-divider w-20 mb-8" />

                <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                  <p>
                    Founded in 2010, KADIV was born from a simple yet powerful vision: to transform
                    ordinary events into extraordinary experiences. What began as a small team of
                    passionate event enthusiasts has grown into one of the most sought-after luxury
                    event management companies.
                  </p>
                  <p>
                    Our founder, Victoria Kadiv, recognized a gap in the market for truly personalized,
                    high-end event experiences that went beyond the ordinary. With an unwavering commitment
                    to excellence and an eye for the finest details, she assembled a team of world-class
                    professionals who share her passion.
                  </p>
                  <p>
                    Today, KADIV stands as a beacon of luxury event planning, having orchestrated over
                    2,500 successful events across weddings, corporate galas, concerts, and private
                    celebrations. Every event we touch becomes a masterpiece.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-6">
                  {[
                    { icon: CheckCircle, text: 'Bespoke Planning' },
                    { icon: CheckCircle, text: 'Premium Venues' },
                    { icon: CheckCircle, text: 'Global Reach' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2">
                      <item.icon className="w-5 h-5 text-gold" />
                      <span className="text-cream/80 text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ─── 3. Mission, Vision, Values ─── */}
      <section className="py-24 md:py-32 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="What Drives Us"
            title="Mission, Vision & Values"
            description="The pillars that guide everything we do at KADIV."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                description:
                  'To deliver extraordinary event experiences that exceed expectations, creating moments of joy and celebration that last a lifetime. We are dedicated to turning visions into reality with unmatched creativity and precision.',
              },
              {
                icon: Eye,
                title: 'Our Vision',
                description:
                  'To be the global leader in luxury event management, setting new standards of excellence and innovation. We envision a world where every celebration is a masterpiece of design, emotion, and flawless execution.',
              },
              {
                icon: Heart,
                title: 'Our Values',
                description:
                  'Integrity, excellence, and passion drive every decision we make. We believe in building lasting relationships, embracing creativity, and delivering on our promises with unwavering dedication and attention to detail.',
              },
            ].map((card, idx) => (
              <FadeInSection key={card.title} delay={idx * 0.15}>
                <div className="glass rounded-xl p-8 hover-lift h-full border-t-2 border-t-gold/60 relative group overflow-hidden">
                  {/* Subtle gold glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-300">
                      <card.icon className="w-7 h-7 text-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-cream mb-4">{card.title}</h3>
                    <p className="text-cream/50 leading-relaxed font-body">{card.description}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Why Choose Us ─── */}
      <section className="py-24 md:py-32 bg-charcoal-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="The KADIV Difference"
            title="Why Choose Us"
            description="We don't just plan events — we craft experiences that leave a lasting impression."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Crown,
                title: 'Luxury Service',
                description:
                  'Every event is treated with the highest standard of luxury, from initial consultation to the final farewell.',
              },
              {
                icon: Gem,
                title: 'Attention to Detail',
                description:
                  'We obsess over every element — from the color of napkins to the timing of lighting — ensuring absolute perfection.',
              },
              {
                icon: Award,
                title: 'Award-Winning Team',
                description:
                  'Our team of 45+ professionals has been recognized with industry awards for excellence in event management.',
              },
              {
                icon: Package,
                title: 'End-to-End Solutions',
                description:
                  'From venue selection and decor to catering and entertainment, we handle every aspect of your event seamlessly.',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                description:
                  'Our dedicated support team is always available, ensuring peace of mind from planning through execution.',
              },
              {
                icon: Sparkles,
                title: 'Custom Packages',
                description:
                  'No two events are alike. We create tailored packages that perfectly match your vision, style, and budget.',
              },
            ].map((feature, idx) => (
              <FadeInSection key={feature.title} delay={idx * 0.1}>
                <div className="glass rounded-xl p-6 hover-lift h-full group border border-gold/5 hover:border-gold/20 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors duration-300">
                      <feature.icon className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-cream mb-2">{feature.title}</h3>
                      <p className="text-cream/50 text-sm leading-relaxed font-body">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Team Section ─── */}
      <section className="py-24 md:py-32 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Meet The Experts"
            title="Our Team"
            description="A talented group of professionals dedicated to making your events extraordinary."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member, idx) => (
              <FadeInSection key={member.id} delay={idx * 0.12}>
                <div className="group relative rounded-xl overflow-hidden hover-lift">
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      quality={80}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/30 to-transparent" />

                    {/* Gold border on hover */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 rounded-xl transition-colors duration-500" />

                    {/* Content on bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-lg font-bold text-cream mb-1">{member.name}</h3>
                      <p className="text-gold text-sm font-medium tracking-wide uppercase mb-3">
                        {member.role}
                      </p>
                      <div className="luxury-divider w-10 mb-3 opacity-60" />
                      <p className="text-cream/50 text-sm leading-relaxed font-body line-clamp-3">
                        {member.bio}
                      </p>
                    </div>
                  </div>

                  {/* Hover gold corner decoration */}
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-gold/0 group-hover:border-gold/50 rounded-tr-lg transition-colors duration-500" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-gold/0 group-hover:border-gold/50 rounded-bl-lg transition-colors duration-500" />
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Stats Section ─── */}
      <section className="py-24 md:py-32 bg-charcoal-dark relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/3 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            subtitle="Numbers That Speak"
            title="Our Achievements"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, idx) => (
              <FadeInSection key={stat.label} delay={idx * 0.15}>
                <div className="glass rounded-xl p-8 text-center gold-glow">
                  <AnimatedCounter value={stat.value} label={stat.label} />
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. CTA Section ─── */}
      <section className="py-24 md:py-32 bg-charcoal relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
          <div className="luxury-divider absolute top-0 w-full" />
          <div className="luxury-divider absolute bottom-0 w-full" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInSection>
            <Quote className="w-10 h-10 text-gold/30 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-6">
              Ready to Work{' '}
              <span className="text-gold-gradient">With Us?</span>
            </h2>
            <p className="text-cream/60 text-lg max-w-2xl mx-auto leading-relaxed font-body mb-10">
              Let&apos;s transform your vision into a breathtaking reality. Contact our team today
              and start planning the event of a lifetime with KADIV.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('booking')}
                size="lg"
                className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-8 py-6 text-base gold-glow-strong"
              >
                Book Your Event
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate('contact')}
                variant="outline"
                size="lg"
                className="border-gold/30 text-gold hover:bg-gold/10 px-8 py-6 text-base"
              >
                Contact Us
              </Button>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
