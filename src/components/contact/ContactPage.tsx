'use client';

import { useState, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

/* ─── Contact Info Data ─── */
const CONTACT_CARDS = [
  {
    icon: Phone,
    title: 'Phone',
    lines: [process.env.NEXT_PUBLIC_COMPANY_PHONE || '+1 (234) 567-890', 'Mon - Sat, 9am - 6pm'],
    extraIcon: Clock,
  },
  {
    icon: Mail,
    title: 'Email',
    lines: [process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@kadiv.com', 'bookings@kadiv.com'],
  },
  {
    icon: MapPin,
    title: 'Address',
    lines: ['2541 Routh St', 'Dallas, TX 75201'],
  },
] as const;

/* ─── Event Types ─── */
const EVENT_TYPES = [
  'Wedding',
  'Corporate',
  'Birthday',
  'Concert',
  'Private Party',
  'Other',
] as const;

/* ─── Social Links ─── */
const SOCIAL_LINKS = [
  { icon: Instagram, label: 'Instagram', href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '#' },
  { icon: Facebook, label: 'Facebook', href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '#' },
  { icon: Twitter, label: 'Twitter', href: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '#' },
  { icon: Linkedin, label: 'LinkedIn', href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '#' },
  { icon: Youtube, label: 'YouTube', href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '#' },
] as const;

/* ─── FAQ Data ─── */
const FAQ_DATA = [
  {
    q: 'How far in advance should I book?',
    a: 'We recommend booking at least 6-12 months in advance for large events like weddings and galas, and 2-3 months for smaller gatherings. However, we do accommodate short-notice requests when our schedule allows. Contact us to check availability for your preferred dates.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Cancellations made more than 60 days before the event receive a full refund minus a 10% administrative fee. Between 30-60 days, a 50% refund applies. Within 30 days, deposits are non-refundable. We strongly recommend event insurance for comprehensive coverage.',
  },
  {
    q: 'Do you offer payment plans?',
    a: 'Yes, we offer flexible payment plans tailored to your event package. Typically, we require a 30% deposit to secure your date, with the remaining balance due in installments leading up to the event. Custom payment schedules can be arranged during your consultation.',
  },
  {
    q: 'Can I customize my event package?',
    a: 'Absolutely! Every event is unique, and our packages are designed as starting points. We work closely with you to tailor every detail — from venue décor and catering to entertainment and photography. Your dedicated event planner will ensure your vision comes to life exactly as you imagine it.',
  },
  {
    q: 'Do you work with external vendors?',
    a: 'Yes, we have an extensive network of trusted external vendors including florists, photographers, caterers, DJs, and more. You are welcome to bring your own preferred vendors as well. We handle all vendor coordination to ensure seamless collaboration on your event day.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We are based in New York City but proudly serve clients across the entire Tri-State area and beyond. We also travel for destination events, both domestically and internationally. Wherever your vision takes you, our team is ready to deliver a flawless experience.',
  },
];

/* ────────────────────────────────────────── */
/* ─── Contact Page Component ─── */
/* ────────────────────────────────────────── */
export default function ContactPage() {
  /* ─── Contact Form State ─── */
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    message: '',
  });

  /* ─── Quick Inquiry State ─── */
  const [quickForm, setQuickForm] = useState({
    email: '',
    message: '',
  });

  const [contactLoading, setContactLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);

  const handleContactSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message,
          eventType: form.eventType || undefined,
          preferredDate: form.date || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', phone: '', eventType: '', date: '', message: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to send message', { description: message });
    } finally {
      setContactLoading(false);
    }
  }, [form]);

  const handleQuickSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickForm.email,
          email: quickForm.email,
          message: quickForm.message,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send inquiry');
      }
      toast.success("Quick inquiry sent! We'll respond shortly.");
      setQuickForm({ email: '', message: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to send inquiry', { description: message });
    } finally {
      setQuickLoading(false);
    }
  }, [quickForm]);

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════ */}
      {/* SECTION 1 — Hero Banner                */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background pattern */}
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
        {/* Gold glow accents */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative text-center px-4 pt-28 pb-16"
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <span className="block w-2 h-2 rotate-45 border border-gold/60" />
            <span className="block w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gold-gradient font-display">Get In Touch</span>
          </h1>
          <p className="text-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-body">
            We&apos;d love to hear from you. Let us bring your vision to life with elegance and precision.
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
      {/* SECTION 2 — Contact Info Cards          */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {CONTACT_CARDS.map((card, i) => {
              const Icon = card.icon;
              const ExtraIcon = 'extraIcon' in card ? card.extraIcon : null;
              return (
                <motion.div key={card.title} custom={i} variants={fadeUp}>
                  <Card className="bg-charcoal-light/50 border-gold/10 hover:border-gold/30 transition-all duration-500 hover-lift group py-0">
                    <CardContent className="p-6 flex items-start gap-5">
                      {/* Icon */}
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-gold" />
                      </div>
                      {/* Content */}
                      <div>
                        <h3 className="text-base font-semibold text-cream mb-2 font-display">
                          {card.title}
                        </h3>
                        {card.lines.map((line, j) => (
                          <p
                            key={j}
                            className="text-sm text-cream/60 leading-relaxed"
                          >
                            {j === 0 && ExtraIcon ? (
                              <span className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-gold/70 inline" />
                                {line}
                              </span>
                            ) : j === 1 && card.title === 'Phone' ? (
                              <span className="flex items-center gap-2 mt-1">
                                <Clock className="w-3.5 h-3.5 text-gold/70 inline" />
                                {line}
                              </span>
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 3 — Two-Column Contact Section  */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-16">
        <div className="luxury-divider mb-16" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-cream font-display mb-4">
              Send Us a <span className="text-gold">Message</span>
            </h2>
            <p className="text-cream/50 text-base max-w-lg mx-auto">
              Fill out the form below and our team will reach out within 24 hours to discuss your event.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* ── LEFT: Contact Form (3 cols) ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-cream/80 text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                      />
                    </div>

                    {/* Email & Phone row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-cream/80 text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-cream/80 text-sm font-medium">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (234) 567-890"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                        />
                      </div>
                    </div>

                    {/* Event Type & Date row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="eventType" className="text-cream/80 text-sm font-medium">
                          Event Type
                        </Label>
                        <Select
                          value={form.eventType}
                          onValueChange={(val) => setForm({ ...form, eventType: val })}
                          required
                        >
                          <SelectTrigger className="w-full bg-white/5 border-gold/20 text-cream focus:border-gold/50 h-11">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent className="bg-charcoal border-gold/20">
                            {EVENT_TYPES.map((type) => (
                              <SelectItem
                                key={type}
                                value={type}
                                className="text-cream focus:bg-gold/10 focus:text-gold"
                              >
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-cream/80 text-sm font-medium">
                          Preferred Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11 [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-cream/80 text-sm font-medium">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your event vision, guest count, special requirements..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        rows={5}
                        className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 text-base transition-all duration-300 gold-glow hover:gold-glow-strong disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {contactLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {contactLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── RIGHT: Map + Quick Inquiry (2 cols) ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 flex flex-col gap-8"
            >
              {/* Map Placeholder */}
              <Card className="bg-charcoal-light/50 border-gold/10 overflow-hidden py-0">
                <CardContent className="p-0">
                  <div className="relative h-64 w-full bg-charcoal-dark overflow-hidden">
                    {/* Grid pattern */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(200,164,86,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(200,164,86,0.06) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                      }}
                    />
                    {/* Map roads illustration */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 400 250"
                        className="w-full h-full opacity-30"
                        fill="none"
                        stroke="rgba(200,164,86,0.4)"
                        strokeWidth="1"
                      >
                        {/* Main roads */}
                        <line x1="0" y1="125" x2="400" y2="125" strokeWidth="2" />
                        <line x1="200" y1="0" x2="200" y2="250" strokeWidth="2" />
                        <line x1="50" y1="0" x2="350" y2="250" strokeWidth="1" />
                        <line x1="350" y1="0" x2="50" y2="250" strokeWidth="1" />
                        {/* Blocks */}
                        <rect x="60" y="40" width="80" height="50" rx="4" strokeWidth="1" />
                        <rect x="260" y="40" width="80" height="50" rx="4" strokeWidth="1" />
                        <rect x="60" y="160" width="80" height="50" rx="4" strokeWidth="1" />
                        <rect x="260" y="160" width="80" height="50" rx="4" strokeWidth="1" />
                        <rect x="140" y="70" width="120" height="110" rx="4" strokeWidth="1.5" strokeDasharray="4 2" />
                        {/* Location pin */}
                        <circle cx="200" cy="125" r="20" fill="rgba(200,164,86,0.1)" stroke="rgba(200,164,86,0.6)" strokeWidth="2" />
                        <circle cx="200" cy="125" r="6" fill="#C8A456" />
                      </svg>
                    </div>
                    {/* Location label */}
                    <div className="absolute bottom-4 left-4 glass rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gold" />
                        <span className="text-sm font-medium text-cream">
                          Plot 12, Victoria Island, Lagos
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Inquiry */}
              <Card className="bg-charcoal-light/50 border-gold/10 py-0">
                <CardContent className="p-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-cream font-display mb-1">
                      Quick <span className="text-gold">Inquiry</span>
                    </h3>
                    <p className="text-cream/50 text-sm">
                      Have a quick question? Drop us a line.
                    </p>
                  </div>

                  <form onSubmit={handleQuickSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quickEmail" className="text-cream/80 text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="quickEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={quickForm.email}
                        onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                        required
                        className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quickMessage" className="text-cream/80 text-sm font-medium">
                        Message
                      </Label>
                      <Textarea
                        id="quickMessage"
                        placeholder="Your quick question..."
                        value={quickForm.message}
                        onChange={(e) => setQuickForm({ ...quickForm, message: e.target.value })}
                        required
                        rows={3}
                        className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={quickLoading}
                      className="w-full bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 font-semibold h-11 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {quickLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {quickLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 4 — Social Media                */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-16">
        <div className="luxury-divider mb-16" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-cream font-display mb-4">
              Follow Us on <span className="text-gold">Social Media</span>
            </h2>
            <p className="text-cream/50 text-base max-w-lg mx-auto mb-10">
              Stay connected and get inspired by our latest events, behind-the-scenes, and design trends.
            </p>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              {SOCIAL_LINKS.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    custom={i}
                    variants={fadeUp}
                    className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-charcoal-light/50 border border-gold/10 hover:border-gold/30 transition-all duration-300 hover-lift"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-sm font-medium text-cream/70 group-hover:text-gold transition-colors duration-300">
                      {social.label}
                    </span>
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 5 — FAQ Accordion               */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-16 pb-24">
        <div className="luxury-divider mb-16" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-cream font-display mb-4">
              Frequently Asked <span className="text-gold">Questions</span>
            </h2>
            <p className="text-cream/50 text-base max-w-lg mx-auto">
              Everything you need to know about working with KADIV for your next event.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Card className="bg-charcoal-light/50 border-gold/10 py-0">
              <CardContent className="p-4 md:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_DATA.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="border-gold/10"
                    >
                      <AccordionTrigger className="text-left text-sm md:text-base font-medium text-cream/90 hover:text-gold hover:no-underline py-4 transition-colors duration-200 [&>svg]:text-gold/60 [&[data-state=open]>svg]:text-gold">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-cream/60 text-sm leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}