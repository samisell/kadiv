'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Headphones,
  Calendar,
  CreditCard,
  Copy,
  Check,
  Shield,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrency } from '@/lib/currency';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { useCheckoutStore } from '@/store/checkout';
import { toast } from 'sonner';

/* ─── Types ─── */
type PaymentResultStatus = 'loading' | 'verifying' | 'success' | 'failed';

interface VerificationResult {
  status: 'success' | 'failed' | 'pending';
  amount: number;
  reference: string;
  gateway: string;
  paidAt?: string;
  transactionId?: string;
}

/* ─── Animation Variants ─── */
const containerVariant: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const iconVariant: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.3 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Circular Progress for Spinner ─── */
function CircularProgress() {
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 animate-spin" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="rgba(200,164,86,0.1)"
          strokeWidth="4"
        />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="rgba(200,164,86,0.8)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="200 264"
          className="animate-dash"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Clock className="w-8 h-8 text-gold" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/* ─── Payment Result Page Component ───          */
/* ═══════════════════════════════════════════════ */
export default function PaymentResultPage() {
  const { navigate } = useNavigation();
  const { user, isAuthenticated, getToken } = useAuth();
  const { format } = useCurrency();
  const checkoutStore = useCheckoutStore();

  /* ─── State ─── */
  const [resultStatus, setResultStatus] = useState<PaymentResultStatus>('loading');
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxPolls = 20; // 20 * 3s = 60s max

  /* ─── Reference from checkout store ─── */
  const reference = checkoutStore.reference;
  const storedAmount = checkoutStore.amount;
  const storedGateway = checkoutStore.gateway;

  /* ─── Verify Payment ─── */
  const verifyPayment = useCallback(async () => {
    if (!reference) {
      setResultStatus('failed');
      return;
    }

    setResultStatus('verifying');

    try {
      const token = getToken();
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const result: VerificationResult = {
        status: data.status || 'pending',
        amount: data.amount || storedAmount,
        reference: data.reference || reference,
        gateway: data.gateway || storedGateway,
        paidAt: data.paidAt || null,
        transactionId: data.transactionId || null,
      };

      setVerificationData(result);

      if (result.status === 'success') {
        setResultStatus('success');
        checkoutStore.setCheckoutData({ status: 'success' });
        /* Stop polling on success */
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else if (result.status === 'failed') {
        setResultStatus('failed');
        checkoutStore.setCheckoutData({ status: 'failed' });
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
      /* If still pending, polling will continue */
    } catch {
      /* If API call fails, try again or show error after retries */
      setPollCount((prev) => {
        const next = prev + 1;
        if (next >= maxPolls) {
          setResultStatus('failed');
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
        return next;
      });
    }
  }, [reference, getToken, storedAmount, storedGateway, checkoutStore]);

  /* ─── Initial Load + Polling ─── */
  useEffect(() => {
    if (!reference) {
      /* No reference found - try to show a neutral state */
      setResultStatus('failed');
      return;
    }

    /* Immediately verify on mount */
    verifyPayment();

    /* Set up polling every 3 seconds */
    pollingRef.current = setInterval(() => {
      if (resultStatus === 'verifying' || resultStatus === 'loading') {
        verifyPayment();
      }
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  /* ─── Copy Reference ─── */
  const handleCopyReference = useCallback(() => {
    if (verificationData?.reference) {
      navigator.clipboard.writeText(verificationData.reference);
      setCopied(true);
      toast.success('Reference copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [verificationData?.reference]);

  /* ─── Loading / Verifying State ─── */
  if (resultStatus === 'loading' || resultStatus === 'verifying') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          <div className="flex justify-center mb-8">
            <CircularProgress />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-3">
            Verifying Your <span className="text-gold">Payment</span>
          </h2>
          <p className="text-cream/50 text-base leading-relaxed mb-2">
            Please wait while we confirm your payment status with the payment gateway.
          </p>
          <p className="text-cream/30 text-sm">
            This usually takes a few seconds...
          </p>
          {reference && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-gold/10">
              <span className="text-cream/40 text-xs">Reference:</span>
              <span className="text-cream/60 text-xs font-mono">{reference}</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  /* ─── Failed State (No Reference) ─── */
  if (resultStatus === 'failed' && !verificationData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          <motion.div
            variants={iconVariant}
            initial="hidden"
            animate="visible"
            className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-8"
          >
            <XCircle className="w-14 h-14 text-red-400" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-3">
            Payment <span className="text-red-400">Not Found</span>
          </h2>
          <p className="text-cream/50 text-base leading-relaxed mb-8">
            We couldn&apos;t find any payment to verify. This could mean the payment session expired or was already processed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate('checkout')}
              className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('contact')}
              className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 h-12 px-6"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Success State ─── */
  if (resultStatus === 'success' && verificationData) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-[100px]" />
        </div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-lg"
        >
          <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
            <CardContent className="p-8 md:p-10 text-center">
              {/* Success Icon */}
              <motion.div
                variants={iconVariant}
                initial="hidden"
                animate="visible"
                className="relative w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                {/* Pulse rings */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-2">
                  Payment <span className="text-emerald-400">Successful!</span>
                </h2>
                <p className="text-cream/50 text-base leading-relaxed">
                  Your payment has been confirmed. We&apos;ll send a receipt to your email and a member of our team will be in touch shortly.
                </p>
              </motion.div>

              {/* Payment Details */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mt-8 rounded-xl bg-white/[0.02] border border-gold/10 p-5 text-left"
              >
                <h3 className="text-xs text-cream/40 uppercase tracking-widest font-semibold mb-4">
                  Payment Details
                </h3>
                <div className="space-y-3">
                  <motion.div custom={0} variants={fadeUp} className="flex items-center justify-between">
                    <span className="text-cream/60 text-sm flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-gold/50" />
                      Amount Paid
                    </span>
                    <span className="text-cream font-bold text-base font-display">
                      {format(verificationData.amount)}
                    </span>
                  </motion.div>

                  <Separator className="bg-gold/10" />

                  <motion.div custom={1} variants={fadeUp} className="flex items-center justify-between">
                    <span className="text-cream/60 text-sm flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gold/50" />
                      Reference
                    </span>
                    <button
                      onClick={handleCopyReference}
                      className="flex items-center gap-1.5 group"
                    >
                      <span className="text-cream/70 text-sm font-mono group-hover:text-cream transition-colors">
                        {verificationData.reference.slice(0, 16)}...
                      </span>
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-cream/30 group-hover:text-gold transition-colors" />
                      )}
                    </button>
                  </motion.div>

                  <Separator className="bg-gold/10" />

                  <motion.div custom={2} variants={fadeUp} className="flex items-center justify-between">
                    <span className="text-cream/60 text-sm flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-gold/50" />
                      Gateway
                    </span>
                    <Badge
                      variant="outline"
                      className={`border ${
                        verificationData.gateway === 'paystack'
                          ? 'border-[#0A9EDC]/30 text-[#0A9EDC]'
                          : 'border-[#29BB59]/30 text-[#29BB59]'
                      } text-xs px-2.5 py-0.5`}
                    >
                      {verificationData.gateway === 'paystack' ? 'Paystack' : 'Flutterwave'}
                    </Badge>
                  </motion.div>

                  {verificationData.paidAt && (
                    <>
                      <Separator className="bg-gold/10" />
                      <motion.div custom={3} variants={fadeUp} className="flex items-center justify-between">
                        <span className="text-cream/60 text-sm flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gold/50" />
                          Paid At
                        </span>
                        <span className="text-cream/70 text-sm">
                          {new Date(verificationData.paidAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </motion.div>
                    </>
                  )}

                  {verificationData.transactionId && (
                    <>
                      <Separator className="bg-gold/10" />
                      <motion.div custom={4} variants={fadeUp} className="flex items-center justify-between">
                        <span className="text-cream/60 text-sm flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-gold/50" />
                          Transaction ID
                        </span>
                        <span className="text-cream/70 text-sm font-mono">
                          {verificationData.transactionId}
                        </span>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6"
              >
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirmed
                </Badge>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
              >
                <Button
                  onClick={() => navigate('dashboard')}
                  className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow hover:gold-glow-strong w-full sm:w-auto"
                >
                  View My Bookings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('home')}
                  className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 hover:border-gold/30 h-12 px-6 w-full sm:w-auto"
                >
                  Continue Browsing
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ─── Failed State ─── */
  if (resultStatus === 'failed' && verificationData) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-lg"
        >
          <Card className="bg-charcoal-light/50 border-gold/10 py-0 overflow-hidden">
            <CardContent className="p-8 md:p-10 text-center">
              {/* Failed Icon */}
              <motion.div
                variants={iconVariant}
                initial="hidden"
                animate="visible"
                className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-8"
              >
                <XCircle className="w-14 h-14 text-red-400" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-cream font-display mb-2">
                  Payment <span className="text-red-400">Failed</span>
                </h2>
                <p className="text-cream/50 text-base leading-relaxed">
                  Unfortunately, your payment could not be processed. This could be due to insufficient funds, a network issue, or the transaction was declined.
                </p>
              </motion.div>

              {/* Payment Details (if available) */}
              {verificationData.reference && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 rounded-xl bg-white/[0.02] border border-gold/10 p-5 text-left"
                >
                  <h3 className="text-xs text-cream/40 uppercase tracking-widest font-semibold mb-4">
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-cream/60 text-sm">Reference</span>
                      <span className="text-cream/70 text-sm font-mono">{verificationData.reference}</span>
                    </div>
                    <Separator className="bg-gold/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-cream/60 text-sm">Amount Attempted</span>
                      <span className="text-cream font-bold text-base font-display">
                        {format(verificationData.amount)}
                      </span>
                    </div>
                    <Separator className="bg-gold/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-cream/60 text-sm">Gateway</span>
                      <Badge
                        variant="outline"
                        className={`border ${
                          verificationData.gateway === 'paystack'
                            ? 'border-[#0A9EDC]/30 text-[#0A9EDC]'
                            : 'border-[#29BB59]/30 text-[#29BB59]'
                        } text-xs px-2.5 py-0.5`}
                      >
                        {verificationData.gateway === 'paystack' ? 'Paystack' : 'Flutterwave'}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 px-4 py-1.5 text-sm">
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Payment Declined
                </Badge>
              </motion.div>

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-4 rounded-lg bg-gold/5 border border-gold/10 p-4"
              >
                <p className="text-cream/40 text-sm">
                  <strong className="text-cream/60">Need help?</strong> Your money was not charged. You can try again with a different payment method or contact our support team for assistance.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
              >
                <Button
                  onClick={() => navigate('checkout')}
                  className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold h-12 px-8 transition-all duration-300 gold-glow hover:gold-glow-strong w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('contact')}
                  className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 hover:border-gold/30 h-12 px-6 w-full sm:w-auto"
                >
                  <Headphones className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ─── Fallback: Unknown state ─── */
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-cream/50">Unable to determine payment status.</p>
        <Button
          variant="outline"
          onClick={() => navigate('home')}
          className="border-gold/20 text-cream/70 hover:text-cream hover:bg-white/5 mt-4"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}