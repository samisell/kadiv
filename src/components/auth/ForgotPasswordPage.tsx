'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Check, Diamond, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigation } from '@/store/navigation';
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

type Step = 'enter-email' | 'email-sent' | 'new-password' | 'complete';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('enter-email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { navigate } = useNavigation();

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset link');
        return;
      }

      toast.success('Reset link sent! Check your inbox.');
      setStep('email-sent');

      // In development, API returns a token — store it and auto-navigate to Step 3
      if (data.token) {
        setResetToken(data.token);
        setTimeout(() => {
          setStep('new-password');
        }, 2000);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      toast.success('Password has been reset successfully!');
      setStep('complete');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

            {step === 'enter-email' && (
              <>
                <CardTitle className="text-2xl font-bold text-cream tracking-tight">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-cream/50 text-sm mt-1">
                  Enter your email and we&apos;ll send you a reset link
                </CardDescription>
              </>
            )}
            {(step === 'new-password' || step === 'complete') && (
              <>
                <CardTitle className="text-2xl font-bold text-cream tracking-tight">
                  {step === 'new-password' ? 'New Password' : 'Password Reset'}
                </CardTitle>
                <CardDescription className="text-cream/50 text-sm mt-1">
                  {step === 'new-password'
                    ? 'Enter your new password below'
                    : 'Your password has been updated'}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Enter Email */}
              {step === 'enter-email' && (
                <motion.form
                  key="enter-email"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendResetLink}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-cream/70 text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        className={`pl-10 h-11 bg-charcoal/50 border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold focus-visible:ring-gold/20 rounded-lg ${
                          error ? 'border-red-500/50 focus-visible:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {error && (
                      <p className="text-red-400 text-xs mt-1">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Step 2: Email Sent Success */}
              {step === 'email-sent' && (
                <motion.div
                  key="email-sent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-6 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 250,
                        damping: 12,
                        delay: 0.3,
                      }}
                    >
                      <Check className="w-8 h-8 text-green-400" />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-cream">
                      Check Your Email
                    </h3>
                    <p className="text-cream/50 text-sm leading-relaxed">
                      We&apos;ve sent a password reset link to{' '}
                      <span className="text-gold font-medium">{email}</span>.
                      Please check your inbox and follow the instructions.
                    </p>
                  </div>

                  <p className="text-cream/30 text-xs">
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => {
                        setStep('enter-email');
                        setEmail('');
                      }}
                      className="text-gold/70 hover:text-gold font-medium transition-colors"
                    >
                      try again
                    </button>
                  </p>

                  <Button
                    onClick={() => navigate('login')}
                    className="mt-4 h-11 bg-charcoal/50 border border-gold/20 text-cream hover:bg-charcoal hover:border-gold/40 font-medium rounded-lg transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Enter New Password */}
              {step === 'new-password' && (
                <motion.form
                  key="new-password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-cream/70 text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError('');
                        }}
                        className={`pl-10 pr-10 h-11 bg-charcoal/50 border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold focus-visible:ring-gold/20 rounded-lg ${
                          error ? 'border-red-500/50 focus-visible:border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold transition-colors"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-cream/70 text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (error) setError('');
                        }}
                        className={`pl-10 pr-10 h-11 bg-charcoal/50 border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold focus-visible:ring-gold/20 rounded-lg ${
                          error ? 'border-red-500/50 focus-visible:border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin" />
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Step 4: Complete */}
              {step === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-6 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 250,
                        damping: 12,
                        delay: 0.3,
                      }}
                    >
                      <Check className="w-10 h-10 text-gold" />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-cream">
                      Password Reset Complete
                    </h3>
                    <p className="text-cream/50 text-sm leading-relaxed">
                      Your password has been reset successfully. You can now sign
                      in with your new password.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate('login')}
                    className="mt-4 h-11 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30"
                  >
                    Sign In
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          {(step === 'enter-email' || step === 'new-password') && (
            <CardFooter className="justify-center pb-8 pt-2">
              <button
                onClick={() => navigate('login')}
                className="flex items-center gap-2 text-cream/40 text-sm hover:text-gold transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
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
