'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useMemo } from 'react';
import {
  ArrowRight,
  Search,
  HelpCircle,
  Calendar,
  CreditCard,
  RotateCcw,
  MapPin,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNavigation } from '@/store/navigation';

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
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── FAQ Data ─── */
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'booking',
    title: 'Booking & Services',
    icon: Calendar,
    items: [
      {
        question: 'How far in advance should I book my event?',
        answer:
          'We recommend booking at least 3–6 months in advance for standard events and 6–12 months for large-scale weddings or corporate galas. This allows adequate time for venue selection, vendor coordination, and detailed planning. However, we also accommodate short-notice bookings (less than 30 days) with full upfront payment.',
      },
      {
        question: 'What types of events does KADIV plan?',
        answer:
          'KADIV Events plans a wide range of events including weddings, corporate events, private parties, galas and awards nights, concerts, exhibitions, birthday celebrations, engagement parties, religious events, baby showers, graduation ceremonies, and housewarming events. If you have a unique event idea, contact us to discuss a custom package.',
      },
      {
        question: 'Can I customise a package to fit my specific needs?',
        answer:
          'Absolutely! Every event is unique, and we specialise in creating bespoke packages tailored to your vision, style, and budget. During your initial consultation, our team will discuss your requirements and craft a personalised proposal. You can add or remove services, upgrade venues, and customise every aspect of your event.',
      },
      {
        question: 'Do you provide event-day coordination only, or full planning?',
        answer:
          'We offer both options. Our Full Planning package covers everything from concept to execution, including vendor sourcing, design, logistics, and on-site management. Our Day-Of Coordination package is for Clients who have made their own arrangements but need professional oversight on the event day itself. We also offer partial planning for Clients who need help with specific aspects.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment & Pricing',
    icon: CreditCard,
    items: [
      {
        question: 'What is the minimum cost for a KADIV event?',
        answer:
          'Event costs vary widely based on scope, guest count, venue, and services selected. Our packages typically start from ₦1,500,000 for intimate gatherings. For a standard wedding with 200 guests, budgets usually range from ₦5,000,000 to ₦25,000,000. Corporate events and large-scale productions may exceed ₦50,000,000. Use our online Cost Calculator for an instant estimate.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept bank transfers (all major Nigerian banks), Flutterwave, and Paystack (card payments, bank transfers, USSD). For corporate clients, we also accept company cheques with prior arrangement. All payments are documented with official receipts. Payment plans can be arranged for events with total costs exceeding ₦10,000,000.',
      },
      {
        question: 'Is there a deposit required to secure a booking?',
        answer:
          'Yes. A 50% deposit of the total estimated cost is required at the time of booking to secure your date, venue, and preferred vendors. The remaining 50% balance is due 14 days before your event. For short-notice bookings (less than 30 days before the event), full payment (100%) is required upfront.',
      },
      {
        question: 'Does the quoted price include VAT?',
        answer:
          'All quotations from KADIV Events are inclusive of our service fees but exclusive of Value Added Tax (VAT) at the prevailing rate of 7.5%. VAT will be clearly stated on your invoice as a separate line item. Certain vendor charges may also attract VAT, which will be communicated transparently in your proposal.',
      },
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation & Refunds',
    icon: RotateCcw,
    items: [
      {
        question: 'What is your cancellation policy?',
        answer:
          'Cancellation refunds depend on timing: 60+ days before your event = 90% refund of deposit. 30–59 days = 50% refund. 15–29 days = 25% refund. Less than 15 days = no refund. Cancellations must be submitted in writing. For detailed information, please review our complete Refund Policy page.',
      },
      {
        question: 'What happens if KADIV cancels my event?',
        answer:
          'If we cancel due to circumstances within our control, you receive a full refund of all payments within 14 business days. If cancellation is due to force majeure (government restrictions, natural disasters, pandemics), we will offer a full credit note valid for 18 months or help reschedule at no additional cost.',
      },
      {
        question: 'Can I get a partial refund if I reduce my guest count?',
        answer:
          'Yes, scope reductions are treated as partial cancellations and follow the same timeline-based policy. If you reduce your guest count more than 15 days before the event, the cost difference may be partially refunded. Reductions within 15 days are generally not eligible for refund as vendor commitments are already in place.',
      },
    ],
  },
  {
    id: 'venue',
    title: 'Venue & Logistics',
    icon: MapPin,
    items: [
      {
        question: 'Which locations do you serve?',
        answer:
          'KADIV Events operates primarily in Lagos with coverage across all major Nigerian cities including Abuja, Port Harcourt, Enugu, Calabar, Benin City, Ibadan, Uyo, Owerri, and more. We also plan destination events across West Africa. For international events, we partner with local coordinators to ensure seamless execution.',
      },
      {
        question: 'Do you source the venue or can I choose my own?',
        answer:
          'Both options are available. We have partnerships with premium venues across Nigeria and can recommend options based on your event type, guest count, and budget. Alternatively, if you have a specific venue in mind, we will coordinate with the venue directly and integrate it into your event plan.',
      },
      {
        question: 'Do you handle decorations, catering, and entertainment?',
        answer:
          'Yes! KADIV provides end-to-end event management. We source and coordinate all vendors including decorators, florists, caterers, photographers, videographers, DJs, live bands, MCs, lighting technicians, and more. We carefully vet all our vendor partners to ensure they meet our luxury standards. You have the final say on all vendor selections.',
      },
      {
        question: 'Can you accommodate guests with dietary restrictions or accessibility needs?',
        answer:
          'Absolutely. During the planning process, we collect detailed information about dietary requirements (vegetarian, vegan, halal, allergies, etc.) and accessibility needs (wheelchair access, hearing assistance, etc.). We work closely with caterers and venue managers to ensure all guests are comfortably accommodated.',
      },
    ],
  },
  {
    id: 'general',
    title: 'General',
    icon: HelpCircle,
    items: [
      {
        question: 'How do I get started with KADIV Events?',
        answer:
          'Getting started is easy! You can fill out our online booking form, use the Cost Calculator for an instant estimate, or contact us directly via email at info@kadiv.com or call +234 (1) 234 5678. We will schedule a complimentary consultation to discuss your vision and provide a detailed proposal.',
      },
      {
        question: 'Do you have a physical office I can visit?',
        answer:
          'Yes, our main office is located at Plot 12, Victoria Island, Lagos, Nigeria. We are open Monday to Friday, 9:00 AM to 6:00 PM WAT. We encourage scheduling an appointment before visiting so we can dedicate proper time to discuss your event needs with our planning consultants.',
      },
      {
        question: 'Can I see examples of past events you have planned?',
        answer:
          'Of course! Visit our Gallery page to browse photographs and highlights from our past events. We also share event recaps on our social media channels. During your consultation, we can share more detailed case studies relevant to the type of event you are planning.',
      },
    ],
  },
];

export default function FaqPage() {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return FAQ_CATEGORIES
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchQuery]);

  const totalResults = filteredCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <div className="overflow-hidden">
      {/* ─── Hero Banner ─── */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal to-charcoal-dark" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[150px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-gold" />
            </div>
            <p className="text-gold text-sm tracking-[0.4em] uppercase mb-4 font-medium">
              Help Centre
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked{' '}
              <span className="text-gold-gradient">Questions</span>
            </h1>
            <p className="text-cream/60 max-w-2xl mx-auto">
              Find answers to common questions about our services, pricing,
              cancellation policies, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="luxury-divider w-40 mx-auto mt-8"
          />
        </div>
      </section>

      {/* ─── Search Bar ─── */}
      <section className="bg-charcoal-dark py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/30" />
              <Input
                placeholder="Search questions... (e.g., cancellation, deposit, venue)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-14 rounded-xl text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold text-sm"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <p className="text-cream/40 text-sm mt-3 text-center">
                {totalResults} question{totalResults !== 1 ? 's' : ''} found
              </p>
            )}
          </FadeInSection>
        </div>
      </section>

      {/* ─── FAQ Categories ─── */}
      <section className="py-16 md:py-24 bg-charcoal-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <FadeInSection>
              <div className="text-center py-16">
                <HelpCircle className="w-12 h-12 text-cream/20 mx-auto mb-4" />
                <p className="text-cream/50 text-lg mb-2">No results found</p>
                <p className="text-cream/30 text-sm">
                  Try a different search term or browse all categories below.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="border-gold/30 text-gold hover:bg-gold/10 mt-6"
                >
                  Clear Search
                </Button>
              </div>
            </FadeInSection>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category, catIdx) => (
                <FadeInSection key={category.id} delay={catIdx * 0.1}>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <category.icon className="w-5 h-5 text-gold" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-cream">
                        {category.title}
                      </h2>
                      <span className="ml-auto text-cream/30 text-sm">
                        {category.items.length} question{category.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="glass rounded-xl border border-gold/10 overflow-hidden">
                      <Accordion type="multiple" className="w-full">
                        {category.items.map((item, itemIdx) => (
                          <AccordionItem
                            key={`${category.id}-${itemIdx}`}
                            value={`${category.id}-${itemIdx}`}
                            className="border-gold/5"
                          >
                            <AccordionTrigger className="px-6 py-4 text-left text-cream/80 hover:text-gold hover:no-underline transition-colors duration-200 [&[data-state=open]>svg.chevron-down]:rotate-180 [&[data-state=open]]:text-gold">
                              <span className="font-medium pr-4">{item.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-5">
                              <p className="text-cream/50 leading-relaxed font-body text-sm">
                                {item.answer}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Still Have Questions CTA ─── */}
      <section className="py-20 md:py-28 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
          <div className="luxury-divider absolute top-0 w-full" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="glass rounded-2xl p-8 md:p-12 border border-gold/20 text-center gold-glow">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-cream mb-3">
                Still Have <span className="text-gold-gradient">Questions?</span>
              </h2>
              <p className="text-cream/50 mb-8 max-w-lg mx-auto font-body">
                Our team is here to help. Reach out to us and we&apos;ll get back to you
                within 24 hours with a detailed response.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('contact')}
                  size="lg"
                  className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-8 gold-glow-strong"
                >
                  Contact Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('booking')}
                  size="lg"
                  className="border-gold/30 text-gold hover:bg-gold/10 px-8"
                >
                  Book a Consultation
                </Button>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
