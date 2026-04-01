'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Shield, FileText } from 'lucide-react';
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
  { id: 'collection', label: '1. Information We Collect' },
  { id: 'usage', label: '2. How We Use Your Data' },
  { id: 'sharing', label: '3. Data Sharing' },
  { id: 'security', label: '4. Data Security' },
  { id: 'cookies', label: '5. Cookies & Tracking' },
  { id: 'rights', label: '6. Your Rights' },
  { id: 'retention', label: '7. Data Retention' },
  { id: 'children', label: "8. Children's Privacy" },
  { id: 'changes', label: '9. Changes to This Policy' },
  { id: 'contact', label: '10. Contact Information' },
];

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <p className="text-gold text-sm tracking-[0.4em] uppercase mb-4 font-medium">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Privacy{' '}
              <span className="text-gold-gradient">Policy</span>
            </h1>
            <p className="text-cream/50 text-sm">
              Last updated: 15 January 2025 &middot; Effective: 1 February 2025
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
                  KADIV Events (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting and respecting
                  your privacy. This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website, use our services, or interact
                  with us in any capacity. This policy is drafted in compliance with the Nigeria Data
                  Protection Act (NDPA) 2023 and the Nigeria Data Protection Regulation (NDPR) 2019.
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
                <section id="collection">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">1.</span> Information We Collect
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <h3 className="text-lg font-semibold text-cream/80">Personal Information</h3>
                    <p>
                      When you create an account, book an event, or contact us, we may collect the
                      following personal data: full name, email address, phone number, home or
                      business address, date of birth (for identity verification), gender, and
                      profile photograph. For corporate clients, we may also collect company name,
                      business registration number, and job title.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Event-Related Information</h3>
                    <p>
                      To provide our services, we collect details about your event including: event
                      type and theme, preferred dates and times, estimated number of guests, budget
                      range, venue preferences, dietary requirements and allergies, special requests
                      or accessibility needs, and emergency contact information.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Payment Information</h3>
                    <p>
                      We collect payment details necessary to process transactions, including billing
                      address, payment method preference, and transaction records. Credit card and bank
                      details are processed securely through our third-party payment partners
                      (Flutterwave and Paystack) and are never stored on our servers.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Automatically Collected Information</h3>
                    <p>
                      When you visit our website, we automatically collect certain information
                      including: IP address, browser type and version, operating system, pages
                      visited and time spent on each page, referring URL, device type, and
                      approximate geographic location. This data is collected through cookies and
                      similar technologies.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Communication Data</h3>
                    <p>
                      When you communicate with us through our contact form, live chat, email, or
                      phone, we record the content of those communications, timestamps, and any
                      attachments shared, solely for the purpose of responding to your enquiries
                      and improving our services.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 2 ─── */}
              <FadeInSection>
                <section id="usage">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">2.</span> How We Use Your Data
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>We use your personal information for the following legitimate purposes:</p>
                    <ul className="list-none space-y-2">
                      {[
                        'Providing and managing our event planning and management services',
                        'Processing bookings, payments, and issuing invoices and receipts',
                        'Communicating with you about your event, including updates, changes, and confirmations',
                        'Sending service-related notifications, reminders, and follow-ups',
                        'Personalising your experience and tailoring recommendations to your preferences',
                        'Improving our website, services, and overall customer experience',
                        'Conducting market research and analysing usage trends to enhance our offerings',
                        'Preventing fraud, ensuring security, and enforcing our Terms of Service',
                        'Complying with legal obligations, tax requirements, and regulatory frameworks',
                        'Sending promotional materials and newsletters (only with your explicit consent)',
                        'Responding to enquiries, support requests, and feedback',
                        'Maintaining and updating our customer database',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p>
                      We will only process your personal data for the purposes for which it was
                      collected, or for other compatible purposes that are clearly communicated to
                      you. Where required by Nigerian law, we will obtain your explicit consent
                      before processing sensitive personal data.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 3 ─── */}
              <FadeInSection>
                <section id="sharing">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">3.</span> Data Sharing
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      We do not sell, trade, or rent your personal information to third parties.
                      However, we may share your data in the following circumstances:
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Service Partners and Vendors</h3>
                    <p>
                      We share relevant event details with our trusted vendors (venues, caterers,
                      decorators, photographers) solely for the purpose of delivering your event
                      services. All vendors are bound by confidentiality agreements and are only
                      provided with the minimum information necessary to fulfil their role.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Payment Processors</h3>
                    <p>
                      Payment information is shared with Flutterwave and Paystack to securely process
                      your transactions. These partners are PCI DSS compliant and operate under
                      strict data protection protocols.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Legal and Regulatory Requirements</h3>
                    <p>
                      We may disclose your information if required by law, regulation, legal process,
                      or governmental request. This includes responding to court orders, subpoenas,
                      or requests from Nigerian regulatory authorities such as the National
                      Information Technology Development Agency (NITDA).
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Business Transfers</h3>
                    <p>
                      In the event of a merger, acquisition, or sale of all or a portion of our
                      assets, your personal information may be transferred as part of that
                      transaction. We will notify you of any such change and the choices available
                      to you regarding your data.
                    </p>
                    <p>
                      We implement robust data processing agreements (DPAs) with all third-party
                      service providers to ensure your data is handled in accordance with the NDPA
                      and this Privacy Policy.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 4 ─── */}
              <FadeInSection>
                <section id="security">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">4.</span> Data Security
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      We implement industry-standard security measures to protect your personal
                      information from unauthorised access, alteration, disclosure, or destruction.
                      Our security practices include:
                    </p>
                    <ul className="list-none space-y-2">
                      {[
                        'SSL/TLS encryption for all data transmitted between your browser and our servers',
                        'AES-256 encryption for sensitive data at rest',
                        'Regular security audits and vulnerability assessments',
                        'Access controls and authentication mechanisms to limit data access to authorised personnel only',
                        'Secure, encrypted backups stored in geographically distributed locations',
                        'Employee training on data protection best practices and confidentiality obligations',
                        'Incident response procedures for detecting, reporting, and responding to data breaches',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p>
                      While we strive to protect your personal information, no method of transmission
                      over the Internet or electronic storage is 100% secure. We cannot guarantee
                      absolute security but are committed to maintaining the highest standards of
                      data protection in accordance with the NDPA 2023.
                    </p>
                    <p>
                      In the event of a data breach that may affect your personal information, we
                      will notify affected individuals within 72 hours of becoming aware of the
                      breach, as required by the NDPA, and will report to NITDA as stipulated.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 5 ─── */}
              <FadeInSection>
                <section id="cookies">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">5.</span> Cookies &amp; Tracking
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      Our website uses cookies and similar tracking technologies to enhance your
                      browsing experience and collect information about how you use our site.
                    </p>
                    <h3 className="text-lg font-semibold text-cream/80">Types of Cookies We Use</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                        <span><strong className="text-cream/80">Essential Cookies:</strong> Required for basic website functionality, including session management and security features. These cannot be disabled.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                        <span><strong className="text-cream/80">Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous usage data (e.g., Google Analytics).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                        <span><strong className="text-cream/80">Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness. Only activated with your consent.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                        <span><strong className="text-cream/80">Preference Cookies:</strong> Remember your settings and preferences (e.g., currency selection, language) for a personalised experience.</span>
                      </li>
                    </ul>
                    <p>
                      You can manage your cookie preferences through your browser settings. Please
                      note that disabling certain cookies may affect the functionality of our website.
                      For more information on managing cookies, visit{' '}
                      <span className="text-cream/70">www.allaboutcookies.org</span>.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 6 ─── */}
              <FadeInSection>
                <section id="rights">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">6.</span> Your Rights
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      Under the Nigeria Data Protection Act (NDPA) 2023, you have the following
                      rights regarding your personal data:
                    </p>
                    <ul className="list-none space-y-3">
                      {[
                        { title: 'Right of Access', desc: 'You may request a copy of the personal data we hold about you.' },
                        { title: 'Right to Rectification', desc: 'You may request correction of any inaccurate or incomplete personal data.' },
                        { title: 'Right to Erasure', desc: 'You may request deletion of your personal data, subject to legal retention requirements.' },
                        { title: 'Right to Restrict Processing', desc: 'You may request that we limit how we use your data in certain circumstances.' },
                        { title: 'Right to Data Portability', desc: 'You may request your data in a structured, commonly used, machine-readable format.' },
                        { title: 'Right to Object', desc: 'You may object to the processing of your personal data for direct marketing purposes.' },
                        { title: 'Right to Withdraw Consent', desc: 'Where processing is based on consent, you may withdraw your consent at any time.' },
                        { title: 'Right to Lodge a Complaint', desc: 'You have the right to lodge a complaint with NITDA or the Data Protection Commission.' },
                      ].map((item) => (
                        <li key={item.title} className="flex items-start gap-3">
                          <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                          <span>
                            <strong className="text-cream/80">{item.title}:</strong> {item.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p>
                      To exercise any of these rights, please contact us at{' '}
                      <span className="text-cream/70">privacy@kadiv.com</span>. We will respond to
                      your request within 30 days as required by the NDPA. We may request
                      verification of your identity before processing your request.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 7 ─── */}
              <FadeInSection>
                <section id="retention">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">7.</span> Data Retention
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      We retain your personal information only for as long as necessary to fulfil
                      the purposes for which it was collected, or as required by law. Our retention
                      periods are as follows:
                    </p>
                    <ul className="list-none space-y-2">
                      {[
                        'Account information: Retained for the duration of your account plus 5 years after your last interaction.',
                        'Event records: Retained for 7 years after the event date for tax and legal compliance.',
                        'Payment records: Retained for 7 years as required by the Federal Inland Revenue Service (FIRS).',
                        'Communication records: Retained for 3 years after the last communication.',
                        'Marketing consent records: Retained for the duration of consent plus 3 years.',
                        'Website analytics data: Retained for 26 months (Google Analytics default retention).',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="text-gold mt-1.5 shrink-0">&#9670;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p>
                      Upon expiration of the applicable retention period, personal data is securely
                      deleted or anonymised. You may request earlier deletion by contacting us,
                      subject to any legal obligations that require continued retention.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 8 ─── */}
              <FadeInSection>
                <section id="children">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">8.</span> Children&apos;s Privacy
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      Our services are not directed to individuals under the age of 18. We do not
                      knowingly collect personal information from children. If you are a parent or
                      guardian and become aware that your child has provided us with personal data,
                      please contact us immediately.
                    </p>
                    <p>
                      If we discover that we have inadvertently collected personal information from
                      a child under 18, we will take prompt steps to delete such information from
                      our servers and records. If you believe that a child under 18 has provided
                      us with personal information, please contact us at{' '}
                      <span className="text-cream/70">privacy@kadiv.com</span>.
                    </p>
                    <p>
                      For events involving children (e.g., birthday parties, naming ceremonies), we
                      require parental or guardian consent before collecting any information related
                      to the child. Parental consent is obtained during the booking process.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 9 ─── */}
              <FadeInSection>
                <section id="changes">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">9.</span> Changes to This Policy
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      We reserve the right to update or modify this Privacy Policy at any time. Any
                      changes will be posted on this page with an updated &quot;Last updated&quot; date.
                      Material changes that affect how we handle your personal data will be
                      communicated through prominent notice on our website or via email.
                    </p>
                    <p>
                      We encourage you to review this Privacy Policy periodically to stay informed
                      about how we protect your information. Your continued use of our services
                      after any changes to this Policy constitutes your acceptance of the revised
                      terms.
                    </p>
                    <p>
                      Where required by the NDPA, we will seek your explicit consent before
                      implementing changes that significantly alter how we process your personal
                      data. You will always have the option to opt out of new data processing
                      activities that require consent.
                    </p>
                  </div>
                </section>
              </FadeInSection>

              {/* ─── Section 10 ─── */}
              <FadeInSection>
                <section id="contact">
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
                    <span className="text-gold">10.</span> Contact Information
                  </h2>
                  <div className="luxury-divider w-16 mb-6" />
                  <div className="space-y-4 text-cream/60 leading-relaxed font-body">
                    <p>
                      If you have any questions about this Privacy Policy, wish to exercise your
                      data rights, or need to report a data-related concern, please contact our
                      Data Protection Officer:
                    </p>
                    <div className="glass rounded-xl p-6 border border-gold/10 space-y-3">
                      <p className="text-cream/80 font-semibold">Data Protection Officer</p>
                      <p className="text-cream/80">KADIV Events Limited</p>
                      <p>
                        <span className="text-cream/50">Address:</span>{' '}
                        <span className="text-cream/70">Plot 12, Victoria Island, Lagos, Nigeria</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Email:</span>{' '}
                        <span className="text-cream/70">privacy@kadiv.com</span>
                      </p>
                      <p>
                        <span className="text-cream/50">Phone:</span>{' '}
                        <span className="text-cream/70">+234 (1) 234 5678</span>
                      </p>
                      <p>
                        <span className="text-cream/50">NITDA Registration:</span>{' '}
                        <span className="text-cream/70">NDPR/NC/123/4567</span>
                      </p>
                    </div>
                    <p>
                      We aim to respond to all data-related requests within 30 days as stipulated
                      by the NDPA. For urgent privacy concerns, please contact our office directly
                      by phone during operating hours (Monday – Friday, 9:00 AM – 6:00 PM WAT).
                    </p>
                    <p>
                      If you are unsatisfied with our response to your data rights request, you have
                      the right to lodge a complaint with the Nigeria Data Protection Commission
                      (NDPC) at{' '}
                      <span className="text-cream/70">www.ndpc.gov.ng</span>.
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
                      onClick={() => navigate('terms')}
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      Terms of Service
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
              Your Privacy <span className="text-gold-gradient">Matters</span>
            </h2>
            <p className="text-cream/50 mb-8 font-body">
              Have questions about how we handle your data? We&apos;re here to help.
            </p>
            <Button
              onClick={() => navigate('contact')}
              size="lg"
              className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-8 gold-glow-strong"
            >
              Contact Us
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
