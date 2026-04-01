'use client';

import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigation } from '@/store/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', page: 'about' as const },
    { label: 'Our Services', page: 'services' as const },
    { label: 'Gallery', page: 'gallery' as const },
    { label: 'Blog', page: 'blog' as const },
    { label: 'Contact', page: 'contact' as const },
  ],
  Services: [
    { label: 'Wedding Planning', page: 'events' as const },
    { label: 'Corporate Events', page: 'events' as const },
    { label: 'Private Parties', page: 'events' as const },
    { label: 'Cost Calculator', page: 'calculator' as const },
    { label: 'Book an Event', page: 'booking' as const },
  ],
  Support: [
    { label: 'FAQ', page: 'faq' as const },
    { label: 'Terms of Service', page: 'terms' as const },
    { label: 'Privacy Policy', page: 'privacy' as const },
    { label: 'Refund Policy', page: 'refund' as const },
  ],
};

export default function Footer() {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to subscribe');
      }
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to subscribe', { description: message });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative bg-charcoal-dark border-t border-gold/10">
      {/* Newsletter Section */}
      <div className="luxury-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-cream mb-3">
              Stay Updated with <span className="text-gold">KADIV</span>
            </h3>
            <p className="text-cream/60 text-sm">
              Subscribe to our newsletter for the latest trends, exclusive offers, and event inspiration.
            </p>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <Button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-6 h-12 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subscribing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded border border-gold/30 flex items-center justify-center bg-gold/5">
                <span className="text-lg font-bold text-gold font-[Georgia,serif]">K</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gold tracking-widest font-[Georgia,serif]">KADIV</h4>
                <p className="text-[10px] text-cream/40 tracking-[0.3em] uppercase">Events</p>
              </div>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed mb-6 max-w-sm">
              Premium event management company dedicated to creating extraordinary experiences.
              From intimate gatherings to grand celebrations, we handle every detail with precision and elegance.
            </p>
            <div className="space-y-3">
              <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE || '+23412345678'}`} className="flex items-center gap-3 text-cream/50 hover:text-gold text-sm transition-colors">
                <Phone className="w-4 h-4" />
                <span>{process.env.NEXT_PUBLIC_COMPANY_PHONE || '+234 (1) 234-5678'}</span>
              </a>
              <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@kadiv.com'}`} className="flex items-center gap-3 text-cream/50 hover:text-gold text-sm transition-colors">
                <Mail className="w-4 h-4" />
                <span>{process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@kadiv.com'}</span>
              </a>
              <div className="flex items-center gap-3 text-cream/50 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Plot 12, Victoria Island, Lagos, Nigeria'}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-gold tracking-wider uppercase mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.page)}
                      className="text-cream/50 hover:text-gold text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="luxury-divider mt-12 mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-xs">
            © {new Date().getFullYear()} KADIV Events. All rights reserved. Crafted with excellence.
          </p>
          <div className="flex items-center gap-4">
            <a href={process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
              <Instagram className="w-4 h-4" />
            </a>
            <a href={process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
              <Facebook className="w-4 h-4" />
            </a>
            <a href={process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
