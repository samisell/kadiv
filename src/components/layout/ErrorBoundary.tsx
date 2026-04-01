'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/store/navigation';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { navigate } = useNavigation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-[80vh] flex items-center justify-center bg-charcoal-dark px-4"
    >
      <div className="text-center max-w-md">
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <span className="block w-1.5 h-1.5 rotate-45 border border-gold/40" />
          <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border border-gold/20 mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-gold" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-cream mb-3 font-display">
          Something Went <span className="text-gold">Wrong</span>
        </h1>

        {/* Description */}
        <p className="text-cream/50 text-sm md:text-base leading-relaxed mb-8 font-body">
          We encountered an unexpected error. This has been logged and our team will look into it.
          Please try again or navigate back to the homepage.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-6 h-11 transition-all duration-300 gold-glow hover:gold-glow-strong"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => navigate('home')}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 font-semibold px-6 h-11 transition-all duration-300"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className="block w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <span className="block w-1.5 h-1.5 rotate-45 border border-gold/40" />
          <span className="block w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>
      </div>
    </motion.div>
  );
}
