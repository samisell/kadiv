'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  RotateCcw,
  Clock,
  CreditCard,
  AlertTriangle,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

/* ─── Cancellation Timeline Data ─── */
const CANCELLATION_TIMELINE = [
  {
    period: '60+ days before event',
    refund: '90% of deposit',
    example: '₦4,500,000 deposit → ₦4,050,000 refund',
    adminFee: '10% admin fee (₦450,000)',
  },
  {
    period: '30–59 days before event',
    refund: '50% of deposit',
    example: '₦4,500,000 deposit → ₦2,250,000 refund',
    adminFee: '50% retained (₦2,250,000)',
  },
  {
    period: '15–29 days before event',
    refund: '25% of deposit',
    example: '₦4,500,000 deposit → ₦1,125,000 refund',
    adminFee: '75% retained (₦3,375,000)',
  },
  {
    period: 'Less than 15 days',
    refund: 'No refund',
    example: '₦4,500,000 deposit → ₦0 refund',
    adminFee: '100% retained',
  },
];

export default function RefundPage() {
  const { navigate } = useNavigation();

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
              <RotateCcw className="w-8 h-8 text-gold" />
            </div>
            <p className="text-gold text-sm tracking-[0.4em] uppercase mb-4 font-medium">
              Financial Policies
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Refund{' '}
              <span className="text-gold-gradient">Policy</span>
            </h1>
            <p className="text-cream/50 text-sm">
              Last updated: 15 January 2025
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

      {/* ─── Main Content ─── */}
      <section className="py-20 md:py-28 bg-charcoal-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="space-y-16">
            {/* Intro */}
            <FadeInSection>
              <p className="text-cream/60 leading-relaxed font-body text-base">
                At KADIV Events, we understand that plans can change. This Refund Policy outlines
                our approach to deposits, cancellations, and refunds for all event management
                services. We aim to be fair and transparent while balancing the commitments we make
                to our vendor partners on your behalf. All amounts referenced are in Nigerian
                Naira (₦).
              </p>
            </FadeInSection>

            {/* ─── Deposit Policy ─── */}
            <FadeInSection>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream">
                    Deposit Policy
                  </h2>
                </div>
                <div className="luxury-divider w-16 mb-6" />
                <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                  <p>
                    A <strong className="text-cream/80">non-refundable processing fee of 10%</strong>
                    {' '}is charged on all deposits. This fee covers administrative costs, initial
                    vendor reservations, and preliminary planning work.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-6 border border-gold/10">
                      <p className="text-gold text-sm font-semibold mb-2">Standard Events</p>
                      <p className="text-cream/80 text-lg font-bold mb-1">50% Deposit</p>
                      <p className="text-cream/50 text-sm">Due at booking confirmation. Balance due 14 days before event.</p>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gold/10">
                      <p className="text-gold text-sm font-semibold mb-2">Short-Notice Events</p>
                      <p className="text-cream/80 text-lg font-bold mb-1">100% Full Payment</p>
                      <p className="text-cream/50 text-sm">Required when booking less than 30 days before the event.</p>
                    </div>
                  </div>
                  <p>
                    The minimum deposit for any booking is <strong className="text-cream/80">₦250,000</strong>.
                    For large-scale events with estimated costs exceeding ₦50,000,000, custom deposit
                    structures may be negotiated and documented in your service agreement.
                  </p>
                  <p>
                    All deposits are acknowledged with an official receipt and booking confirmation
                    letter sent via email within 24 hours of payment. The receipt will detail the
                    amount paid, the event date, and the services confirmed.
                  </p>
                </div>
              </section>
            </FadeInSection>

            {/* ─── Cancellation Timeline ─── */}
            <FadeInSection>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream">
                    Cancellation Timeline
                  </h2>
                </div>
                <div className="luxury-divider w-16 mb-6" />
                <p className="text-cream/60 leading-relaxed font-body mb-6">
                  The refund amount depends on how far in advance you cancel. The following table
                  shows the refund schedule based on a sample deposit of <strong className="text-cream/80">₦4,500,000</strong>:
                </p>

                <div className="glass rounded-xl border border-gold/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gold/10 hover:bg-transparent">
                        <TableHead className="text-gold font-semibold text-sm">Cancellation Window</TableHead>
                        <TableHead className="text-gold font-semibold text-sm">Refund Amount</TableHead>
                        <TableHead className="text-gold font-semibold text-sm hidden md:table-cell">Example</TableHead>
                        <TableHead className="text-gold font-semibold text-sm">Fee Retained</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CANCELLATION_TIMELINE.map((row, idx) => (
                        <TableRow key={idx} className="border-gold/5">
                          <TableCell className="text-cream/80 font-medium">{row.period}</TableCell>
                          <TableCell className="text-cream/70">{row.refund}</TableCell>
                          <TableCell className="text-cream/50 text-sm hidden md:table-cell">{row.example}</TableCell>
                          <TableCell className="text-cream/50 text-sm">{row.adminFee}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-cream/50 text-sm mt-4 font-body">
                  * Examples are illustrative. Actual refund calculations are based on your total
                  deposit amount and the specific terms of your service agreement.
                </p>
              </section>
            </FadeInSection>

            {/* ─── Refund Methods ─── */}
            <FadeInSection>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream">
                    Refund Methods
                  </h2>
                </div>
                <div className="luxury-divider w-16 mb-6" />
                <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                  <p>Refunds are processed using the original payment method where possible:</p>
                  <ul className="list-none space-y-3">
                    {[
                      { method: 'Bank Transfer', desc: 'Refunded to the original Nigerian bank account used for payment. Processing time: 5–10 business days.' },
                      { method: 'Flutterwave / Paystack', desc: 'Refunded to the original card or bank account. Processing time: 5–14 business days depending on your bank.' },
                      { method: 'Credit Note', desc: 'For Clients who prefer, we can issue a credit note valid for 12 months towards a future event booking. Credit notes are transferable once.' },
                    ].map((item) => (
                      <li key={item.method}>
                        <strong className="text-cream/80">{item.method}:</strong> {item.desc}
                      </li>
                    ))}
                  </ul>
                  <p>
                    Refunds for amounts exceeding <strong className="text-cream/80">₦5,000,000</strong> may
                    require additional verification and processing time. We will communicate any delays
                    and provide regular updates on the status of your refund.
                  </p>
                </div>
              </section>
            </FadeInSection>

            {/* ─── Exceptions ─── */}
            <FadeInSection>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream">
                    Exceptions
                  </h2>
                </div>
                <div className="luxury-divider w-16 mb-6" />
                <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                  <p>The following circumstances are exceptions to our standard refund policy:</p>
                  <div className="space-y-3">
                    <div className="glass rounded-xl p-5 border border-gold/10">
                      <h3 className="text-cream/80 font-semibold mb-2">Force Majeure</h3>
                      <p className="text-cream/50 text-sm">
                        If your event cannot proceed due to circumstances beyond reasonable control
                        (government restrictions, pandemics, natural disasters, civil unrest), KADIV
                        Events will offer a full credit note valid for 18 months or assist in
                        rescheduling at no additional cost. Cash refunds are evaluated on a
                        case-by-case basis.
                      </p>
                    </div>
                    <div className="glass rounded-xl p-5 border border-gold/10">
                      <h3 className="text-cream/80 font-semibold mb-2">Vendor Cancellation</h3>
                      <p className="text-cream/50 text-sm">
                        If a key vendor (venue, caterer, entertainment) cancels and we are unable
                        to secure a comparable replacement, you will receive a full refund of all
                        payments made, or we will offer an upgraded alternative at no extra cost.
                      </p>
                    </div>
                    <div className="glass rounded-xl p-5 border border-gold/10">
                      <h3 className="text-cream/80 font-semibold mb-2">Service Deficiency</h3>
                      <p className="text-cream/50 text-sm">
                        If KADIV Events fails to deliver the agreed-upon services as outlined in
                        your service contract, you are entitled to a proportional refund. Claims
                        must be submitted in writing within 7 days of the event.
                      </p>
                    </div>
                    <div className="glass rounded-xl p-5 border border-gold/10">
                      <h3 className="text-cream/80 font-semibold mb-2">Partial Cancellation</h3>
                      <p className="text-cream/50 text-sm">
                        If you wish to reduce the scope of services (e.g., fewer guests, remove
                        add-ons), we will adjust your invoice accordingly. Refunds for scope
                        reductions are subject to the same timeline-based policy. Reductions
                        requested less than 15 days before the event may not be eligible for refund.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </FadeInSection>

            {/* ─── How to Request ─── */}
            <FadeInSection>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream">
                    How to Request a Refund
                  </h2>
                </div>
                <div className="luxury-divider w-16 mb-6" />
                <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                  <p>To request a refund, follow these steps:</p>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'Submit a Written Request', desc: 'Email refunds@kadiv.com with your full name, event date, booking reference number, and reason for cancellation.' },
                      { step: '2', title: 'Include Supporting Documents', desc: 'Attach your booking confirmation, payment receipts, and any relevant correspondence.' },
                      { step: '3', title: 'Acknowledgement', desc: 'We will acknowledge your request within 2 business days and provide a refund estimate.' },
                      { step: '4', title: 'Review & Approval', desc: 'Our finance team will review your request against this policy and your service agreement terms within 5 business days.' },
                      { step: '5', title: 'Refund Processing', desc: 'Once approved, your refund will be processed within the stated timeframe (see Processing Time section below).' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                          <span className="text-gold font-bold text-sm">{item.step}</span>
                        </div>
                        <div>
                          <h3 className="text-cream/80 font-semibold mb-1">{item.title}</h3>
                          <p className="text-cream/50 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p>
                    For urgent refund enquiries, please call our accounts department directly at{' '}
                    <span className="text-cream/70">+234 (1) 234 5679</span> during business hours.
                  </p>
                </div>
              </section>
            </FadeInSection>

            {/* ─── Processing Time ─── */}
            <FadeInSection>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream">
                    Processing Time
                  </h2>
                </div>
                <div className="luxury-divider w-16 mb-6" />
                <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-6 border border-gold/10 text-center">
                      <p className="text-3xl font-bold text-gold mb-1">5–10</p>
                      <p className="text-cream/50 text-sm">Business days for bank transfers</p>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gold/10 text-center">
                      <p className="text-3xl font-bold text-gold mb-1">5–14</p>
                      <p className="text-cream/50 text-sm">Business days for card refunds</p>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gold/10 text-center">
                      <p className="text-3xl font-bold text-gold mb-1">1–2</p>
                      <p className="text-cream/50 text-sm">Business days for credit notes</p>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gold/10 text-center">
                      <p className="text-3xl font-bold text-gold mb-1">10–21</p>
                      <p className="text-cream/50 text-sm">Business days for refunds over ₦5M</p>
                    </div>
                  </div>
                  <p>
                    Processing times begin from the date of approval notification. Delays may occur
                    due to public holidays, banking system maintenance, or additional verification
                    requirements. We will keep you informed of any delays via email.
                  </p>
                  <div className="glass rounded-xl p-6 border border-gold/10 mt-4">
                    <p className="text-cream/80 font-semibold mb-3">Contact for Refund Enquiries</p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-cream/50">Email:</span>{' '}
                        <span className="text-cream/70">refunds@kadiv.com</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Phone:</span>{' '}
                        <span className="text-cream/70">+234 (1) 234 5679</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Hours:</span>{' '}
                        <span className="text-cream/70">Monday – Friday, 9:00 AM – 5:00 PM WAT</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </FadeInSection>

            {/* ─── Related Policies CTA ─── */}
            <FadeInSection>
              <div className="glass rounded-xl p-8 border border-gold/10 text-center">
                <FileText className="w-8 h-8 text-gold/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-cream mb-3">Related Policies</h3>
                <p className="text-cream/50 text-sm mb-6 font-body">
                  Explore our other policies for complete transparency.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate('terms')}
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    Terms of Service
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('privacy')}
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    Privacy Policy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('faq')}
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    FAQ
                  </Button>
                </div>
              </div>
            </FadeInSection>
          </article>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="py-20 md:py-28 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
          <div className="luxury-divider absolute top-0 w-full" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
              Plan With <span className="text-gold-gradient">Confidence</span>
            </h2>
            <p className="text-cream/50 mb-8 font-body">
              Start planning your next extraordinary event with KADIV today.
            </p>
            <Button
              onClick={() => navigate('booking')}
              size="lg"
              className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-8 gold-glow-strong"
            >
              Book Your Event
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
