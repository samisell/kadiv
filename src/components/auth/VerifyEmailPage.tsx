'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, ArrowRight, Diamond, RefreshCw, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';

function GoldDiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gold/40" />
      <Diamond className="w-3 h-3 text-gold/40 fill-gold/20" />
      <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gold/40" />
    </div>
  );
}

export default function VerifyEmailPage() {
  const { user, isAuthenticated, setEmailVerified } = useAuth();
  const { navigate } = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenValue, setTokenValue] = useState('');

  const isVerified = isAuthenticated && user?.emailVerified === true;
  const isNotVerified = isAuthenticated && user?.emailVerified !== true;

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to resend verification email');
        return;
      }

      toast.success('Verification email sent! Check your inbox.');

      // In development, API may return a token for manual verification
      if (data.token) {
        toast.info('Development mode: Verification token received. Use the manual verify option below.');
        setTokenValue(data.token);
        setShowTokenInput(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenValue.trim()) {
      toast.error('Please enter the verification token');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(tokenValue.trim())}`, {
        method: 'GET',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Verification failed. Please try again.');
        return;
      }

      setEmailVerified(true);
      toast.success('Email verified successfully!');
      setTokenValue('');
      setShowTokenInput(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!isVerified) {
      toast.warning('Your email is not yet verified. Some features may be limited.', {
        description: 'You can verify your email later from your dashboard settings.',
      });
    }
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-dark px-4 py-20">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #C8A456 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top diamond divider */}
        <GoldDiamondDivider />

        <Card className="glass gold-glow rounded-2xl overflow-hidden border-gold/10">
          <CardHeader className="text-center pb-2 pt-8">
            {/* KADIV Text Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <span className="text-3xl font-display font-bold text-gold tracking-[0.2em]">
                  KADIV
                </span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-cream tracking-tight">
              {isVerified ? 'Email Verified' : 'Verify Your Email'}
            </CardTitle>
            <CardDescription className="text-cream/50 text-sm mt-1">
              {isVerified
                ? 'Your email has been successfully verified'
                : 'Please verify your email address to get started'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-4">
            <div className="py-6 space-y-6">
              {/* Email Icon Illustration */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <motion.div
                  animate={
                    isVerified
                      ? {}
                      : {
                          y: [0, -6, 0],
                        }
                  }
                  transition={
                    isVerified
                      ? {}
                      : {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                  }
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    isVerified
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-gold/10 border border-gold/20'
                  }`}
                >
                  {isVerified ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 12,
                        delay: 0.4,
                      }}
                    >
                      <Check className="w-12 h-12 text-green-400" />
                    </motion.div>
                  ) : (
                    <Mail className="w-12 h-12 text-gold" />
                  )}
                </motion.div>
              </motion.div>

              <AnimatePresence mode="wait">
                {/* Already Verified State */}
                {isVerified && (
                  <motion.div
                    key="verified"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-cream">
                        All Set!
                      </h3>
                      <p className="text-cream/50 text-sm leading-relaxed">
                        Your email <span className="text-gold font-medium">{user?.email}</span> has
                        been verified. You now have full access to all features.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Not Yet Verified State */}
                {isNotVerified && (
                  <motion.div
                    key="not-verified"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center space-y-2">
                      <p className="text-cream/50 text-sm leading-relaxed">
                        We&apos;ve sent a verification email to{' '}
                        <span className="text-gold font-medium">{user?.email}</span>.
                        Please click the link in that email to verify your account.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Resend Verification */}
                      <Button
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="w-full h-11 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Resend Verification Email
                          </div>
                        )}
                      </Button>

                      {/* Toggle manual token input */}
                      <button
                        type="button"
                        onClick={() => setShowTokenInput(!showTokenInput)}
                        className="w-full flex items-center justify-center gap-2 text-gold/70 text-sm hover:text-gold transition-colors py-2"
                      >
                        <Link2 className="w-4 h-4" />
                        {showTokenInput
                          ? 'Hide manual verification'
                          : 'I have a verification link'}
                      </button>

                      {/* Manual Token Input */}
                      <AnimatePresence>
                        {showTokenInput && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleManualVerify}
                            className="space-y-3 overflow-hidden"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="verify-token" className="text-cream/70 text-sm font-medium">
                                Verification Token
                              </Label>
                              <Input
                                id="verify-token"
                                type="text"
                                placeholder="Paste your verification token here"
                                value={tokenValue}
                                onChange={(e) => setTokenValue(e.target.value)}
                                className="h-11 bg-charcoal/50 border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold focus-visible:ring-gold/20 rounded-lg font-mono text-sm"
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={isLoading || !tokenValue.trim()}
                              variant="outline"
                              className="w-full h-11 border-gold/20 text-gold hover:bg-gold/10 hover:text-gold font-medium rounded-lg transition-all duration-300"
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                  Verifying...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  Verify Token
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </Button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* Not Authenticated State */}
                {!isAuthenticated && (
                  <motion.div
                    key="not-auth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-cream">
                        Sign In Required
                      </h3>
                      <p className="text-cream/50 text-sm leading-relaxed">
                        Please sign in to verify your email address.
                      </p>
                    </div>

                    <Button
                      onClick={() => navigate('login')}
                      className="w-full h-11 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30"
                    >
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          {isAuthenticated && (
            <CardFooter className="justify-center pb-8 pt-2">
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 text-cream/40 text-sm hover:text-gold transition-colors group"
              >
                Continue to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </CardFooter>
          )}
        </Card>

        {/* Bottom diamond divider */}
        <GoldDiamondDivider />
      </motion.div>
    </div>
  );
}
