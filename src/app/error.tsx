'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex items-center justify-center bg-charcoal-dark px-4"
    >
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <span className="block w-1.5 h-1.5 rotate-45 border border-gold/40" />
          <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border border-gold/20 mb-6">
          <AlertTriangle className="w-10 h-10 text-gold" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-cream mb-3 font-display">
          Something Went <span className="text-gold">Wrong</span>
        </h1>
        <p className="text-cream/50 text-sm md:text-base leading-relaxed mb-8 font-body">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-6 h-11 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 font-semibold px-6 h-11 transition-all duration-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <span className="block w-1.5 h-1.5 rotate-45 border border-gold/40" />
          <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>
      </div>
    </motion.div>
  );
}
