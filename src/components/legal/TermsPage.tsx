'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Scale, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

/* ─── Table of Contents ─── */
const SECTIONS = [
  { id: 'agreement', label: '1. Agreement to Terms' },
  { id: 'services', label: '2. Services Description' },
  { id: 'booking', label: '3. Booking & Payment' },
  { id: 'cancellation', label: '4. Cancellation & Refund' },
  { id: 'ip', label: '5. Intellectual Property' },
  { id: 'liability', label: '6. Limitation of Liability' },
  { id: 'governing-law', label: '7. Governing Law' },
  { id: 'contact', label: '8. Contact Information' },
];

export default function TermsPage() {
  const { navigate } = useNavigation();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
              <Scale className="w-8 h-8 text-gold" />
            </div>
            <p className="text-gold text-sm tracking-[0.4em] uppercase mb-4 font-medium">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Terms of{' '}
              <span className="text-gold-gradient">Service</span>
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
          <div className="grid lg:grid-cols-[240px_1fr] gap-12">
            {/* Table of Contents Sidebar */}
            <aside className="hidden lg:block">
              <FadeInSection>
                <div className="sticky top-24">
                  <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4 font-semibold">
                    Contents
                  </p>
                  <nav className="space-y-2">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => scrollToSection(s.id)}
                        className="block w-full text-left text-cream/50 hover:text-gold text-sm transition-colors duration-200 py-1.5 pl-3 border-l-2 border-transparent hover:border-gold/40"
                      >
                        {s.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </FadeInSection>
            </aside>

            {/* Content */}
            <article className="space-y-16">
              <FadeInSection>
                <p className="text-cream/60 leading-relaxed font-body text-base">
                  Welcome to KADIV Events (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service
                  (&quot;Terms&quot;) govern your use of our event management services, website, and related
                  platforms operated within the Federal Republic of Nigeria. By accessing our services or
                  placing a booking, you agree to be bound by these Terms in their entirety.
                </p>
              </FadeInSection>

              {/* Mobile TOC */}
              <FadeInSection className="lg:hidden">
                <div className="glass rounded-xl p-6 border border-gold/10">
                  <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4 font-semibold">
                    Table of Contents
                  </p>
                  <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => scrollToSection(s.id)}
                        className="text-left text-cream/50 hover:text-gold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gold/5"
                      >
                        {s.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </FadeInSection>

              {/* ─── Section 1 ─── */}
              <FadeInSection>
                <section id="agreement">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">1.</span> Agreement to Terms
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      By engaging KADIV Events for any event planning, coordination, or management
                      service, you acknowledge that you have read, understood, and agree to be bound
                      by these Terms of Service. These Terms constitute a legally binding agreement
                      between you (&quot;Client&quot;) and KADIV Events, registered under the Laws of the
                      Federal Republic of Nigeria.
                    </p>
                    <p>
                      You must be at least 18 years of age to enter into this agreement. If you are
                      entering into this agreement on behalf of an organisation, you represent and
                      warrant that you have the authority to bind that organisation to these Terms.
                    </p>
                    <p>
                      We reserve the right to modify these Terms at any time. Changes will be
                      effective immediately upon posting to our website. Your continued use of our
                      services after any such changes constitutes acceptance of the new Terms. We
                      encourage you to review these Terms periodically.
                    </p>
                    <p>
                      If you do not agree with any part of these Terms, you must discontinue use of
                      our services immediately and contact us to resolve any concerns before proceeding
                      with a booking.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 2 ─── */}
              <FadeInSection>
                <section id="services">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">2.</span> Services Description
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      KADIV Events provides premium event management services including but not
                      limited to: wedding planning and coordination, corporate event management,
                      private party organisation, gala and awards night planning, concert and festival
                      production, exhibition management, birthday celebrations, engagement parties,
                      religious event coordination, baby showers, graduation ceremonies, and
                      housewarming events.
                    </p>
                    <p>
                      Our services encompass venue sourcing and decoration, catering coordination,
                      entertainment and live music booking, photography and videography, lighting and
                      sound system provision, guest management, security coordination, transportation
                      logistics, invitation design and distribution, event-day coordination, and
                      post-event cleanup and evaluation.
                    </p>
                    <p>
                      All services are subject to availability and confirmation. We reserve the right
                      to decline any booking request at our discretion. The specific scope of services
                      for your event will be outlined in a detailed proposal and service agreement
                      provided upon booking confirmation.
                    </p>
                    <p>
                      KADIV Events acts as an intermediary between Clients and third-party vendors
                      (venues, caterers, decorators, etc.). While we carefully vet all our partners,
                      we are not directly liable for the performance of third-party service providers,
                      except where such performance is directly managed and controlled by our team.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 3 ─── */}
              <FadeInSection>
                <section id="booking">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">3.</span> Booking &amp; Payment
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      All bookings require a non-refundable deposit of 50% of the total estimated
                      event cost. This deposit secures your preferred date, venue, and service
                      providers. The remaining 50% balance is due no later than 14 days before the
                      scheduled event date.
                    </p>
                    <p>
                      For events booked less than 30 days before the event date, full payment (100%)
                      is required at the time of booking. We accept payment via bank transfer
                      (domestic Nigerian banks), Flutterwave, Paystack, and other approved payment
                      gateways.
                    </p>
                    <p>
                      A detailed quotation will be provided before any payment is required. All prices
                      are quoted in Nigerian Naira (₦) unless otherwise specified. Prices are valid
                      for 7 days from the date of quotation, after which they may be subject to
                      revision based on vendor availability and market conditions.
                    </p>
                    <p>
                      KADIV Events reserves the right to adjust pricing if the scope of services
                      changes after the initial booking. Any additional costs arising from changes
                      requested by the Client will be communicated in writing and require Client
                      approval before proceeding.
                    </p>
                    <p>
                      Failure to pay the balance by the due date may result in the cancellation of
                      your event booking without refund of the initial deposit. We will provide at
                      least two written reminders before the balance due date.
                    </p>
                    <p>
                      All payments made to KADIV Events are documented with official receipts and
                      are subject to applicable Nigerian tax laws, including Value Added Tax (VAT) at
                      the prevailing rate of 7.5%.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 4 ─── */}
              <FadeInSection>
                <section id="cancellation">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">4.</span> Cancellation &amp; Refund
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      Cancellations must be submitted in writing (email or formal letter) to
                      KADIV Events. The date of receipt of your cancellation notice will determine
                      the applicable refund policy.
                    </p>
                    <p>
                      <strong className="text-cream/80">More than 60 days before event:</strong> Full
                      refund of deposit minus a 10% administrative fee.
                    </p>
                    <p>
                      <strong className="text-cream/80">30 to 60 days before event:</strong> 50% refund
                      of deposit. The remaining portion covers vendor commitment costs already incurred.
                    </p>
                    <p>
                      <strong className="text-cream/80">15 to 29 days before event:</strong> 25% refund
                      of deposit. Significant vendor payments have been committed at this stage.
                    </p>
                    <p>
                      <strong className="text-cream/80">Less than 15 days before event:</strong> No
                      refund. All vendor commitments and logistical arrangements have been fully executed.
                    </p>
                    <p>
                      If KADIV Events cancels an event due to circumstances within our control, a
                      full refund of all payments made will be issued within 14 working days. If
                      cancellation is due to force majeure (acts of God, government restrictions,
                      pandemics, natural disasters), we will work with you to reschedule the event
                      at no additional cost, or provide a credit note valid for 12 months.
                    </p>
                    <p>
                      For detailed refund timelines and processing information, please refer to our
                      dedicated{' '}
                      <button
                        onClick={() => navigate('refund')}
                        className="text-gold hover:text-gold-light underline underline-offset-2"
                      >
                        Refund Policy
                      </button>.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 5 ─── */}
              <FadeInSection>
                <section id="ip">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">5.</span> Intellectual Property
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      All content on the KADIV Events website, including but not limited to text,
                      graphics, logos, images, photographs, videos, event designs, floor plans, and
                      software, is the exclusive property of KADIV Events or its content suppliers
                      and is protected by Nigerian copyright laws and international intellectual
                      property conventions.
                    </p>
                    <p>
                      The KADIV name, logo, and all associated branding elements are registered
                      trademarks of KADIV Events. No part of this website or our service materials
                      may be reproduced, distributed, modified, or used for commercial purposes
                      without prior written consent from KADIV Events.
                    </p>
                    <p>
                      Event concepts, themes, and creative designs developed by KADIV Events for a
                      Client remain the intellectual property of KADIV Events until full payment has
                      been received. Upon full payment, the Client receives a licence to use the
                      event-specific creative materials for personal use only. Commercial
                      redistribution or reproduction requires explicit written permission.
                    </p>
                    <p>
                      Photographs and videos taken during events by KADIV Events&apos; designated
                      photographers and videographers remain the property of KADIV Events. Clients
                      receive a licence to use these materials for personal purposes. Social media
                      sharing is permitted with credit to KADIV Events.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 6 ─── */}
              <FadeInSection>
                <section id="liability">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">6.</span> Limitation of Liability
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      To the maximum extent permitted by Nigerian law, KADIV Events shall not be
                      liable for any indirect, incidental, special, consequential, or punitive
                      damages arising out of or in connection with our services, including but not
                      limited to loss of profits, loss of data, business interruption, or emotional
                      distress.
                    </p>
                    <p>
                      Our total aggregate liability for any claims arising from a single event shall
                      not exceed the total fees paid by the Client for that specific event. This
                      limitation applies regardless of the legal theory on which the claim is based.
                    </p>
                    <p>
                      KADIV Events is not liable for any loss, damage, or injury sustained during
                      an event caused by third-party vendors, guests, or circumstances beyond our
                      reasonable control. This includes but is not limited to weather conditions,
                      power outages, transportation delays, or vendor no-shows.
                    </p>
                    <p>
                      The Client agrees to indemnify and hold KADIV Events, its directors, employees,
                      and agents harmless from any claims, damages, liabilities, and expenses
                      (including legal fees) arising from the Client&apos;s breach of these Terms or any
                      negligent or wrongful act committed by the Client or their guests during an event.
                    </p>
                    <p>
                      KADIV Events maintains comprehensive public liability insurance. Certificates of
                      insurance are available upon request. We strongly recommend that Clients also
                      obtain event-specific insurance for high-value events.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 7 ─── */}
              <FadeInSection>
                <section id="governing-law">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">7.</span> Governing Law
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      These Terms of Service shall be governed by and construed in accordance with
                      the laws of the Federal Republic of Nigeria. Any disputes arising out of or
                      in connection with these Terms shall be subject to the exclusive jurisdiction
                      of the courts of Lagos State, Nigeria.
                    </p>
                    <p>
                      Before initiating any formal legal proceedings, both parties agree to attempt
                      to resolve disputes through good-faith negotiation for a period of not less
                      than 30 days. If negotiation fails, disputes may be referred to mediation
                      through a mutually agreed mediator in Lagos, Nigeria.
                    </p>
                    <p>
                      If any provision of these Terms is found to be invalid or unenforceable by a
                      court of competent jurisdiction, the remaining provisions shall continue in full
                      force and effect. The invalid provision shall be modified to the minimum extent
                      necessary to make it valid and enforceable.
                    </p>
                    <p>
                      These Terms constitute the entire agreement between you and KADIV Events
                      regarding the subject matter herein, and supersede all prior or contemporaneous
                      agreements, representations, and understandings, whether written or oral.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 8 ─── */}
              <FadeInSection>
                <section id="contact">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">8.</span> Contact Information
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      If you have any questions, concerns, or requests regarding these Terms of
                      Service, please contact us using any of the following channels:
                    </p>
                    <div className="glass rounded-xl p-6 border border-gold/10 space-y-3">
                      <p className="text-cream/80 font-semibold">KADIV Events Limited</p>
                      <p>
                        <span className="text-cream/50">Address:</span>{' '}
                        <span className="text-cream/70">Plot 12, Victoria Island, Lagos, Nigeria</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Email:</span>{' '}
                        <span className="text-cream/70">legal@kadiv.com</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Phone:</span>{' '}
                        <span className="text-cream/70">+234 (1) 234 5678</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Operating Hours:</span>{' '}
                        <span className="text-cream/70">Monday – Friday, 9:00 AM – 6:00 PM WAT</span>
                      </p>
                    </div>
                    <p>
                      We aim to respond to all legal enquiries within 3 business days. For urgent
                      matters, please contact our office directly by phone during operating hours.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── CTA ─── */}
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
                      onClick={() => navigate('privacy')}
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      Privacy Policy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('refund')}
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      Refund Policy
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
              Ready to Get <span className="text-gold-gradient">Started?</span>
            </h2>
            <p className="text-cream/50 mb-8 font-body">
              Book your next event with KADIV and let us create something extraordinary.
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
