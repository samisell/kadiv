'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Diamond } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { navigate } = useNavigation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid email or password');
        return;
      }

      login(
        {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
          role: data.role,
          emailVerified: data.emailVerified,
        },
        data.token
      );

      if (data.warning) {
        toast.warning(data.warning, {
          description: 'Please verify your email address to access all features.',
        });
      } else {
        toast.success('Welcome back! You have signed in successfully.');
      }

      navigate('dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login is coming soon!`);
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-cream/50 text-sm mt-1">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cream/70 text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-charcoal/50 border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold focus-visible:ring-gold/20 rounded-lg"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-cream/70 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-charcoal/50 border-gold/20 text-cream placeholder:text-cream/30 focus-visible:border-gold focus-visible:ring-gold/20 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-charcoal-dark"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-cream/50 text-sm font-normal cursor-pointer select-none"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-gold/70 text-sm hover:text-gold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gold text-charcoal-dark hover:bg-gold-light font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full luxury-divider" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#111111] px-4 text-cream/30 text-xs uppercase tracking-widest">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 h-11 rounded-lg border border-gold/15 bg-charcoal/30 text-cream/70 hover:text-cream hover:border-gold/30 hover:bg-charcoal/50 transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 h-11 rounded-lg border border-gold/15 bg-charcoal/30 text-cream/70 hover:text-cream hover:border-gold/30 hover:bg-charcoal/50 transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-sm font-medium">Apple</span>
              </button>
            </div>
          </CardContent>

          <CardFooter className="justify-center pb-8 pt-2">
            <p className="text-cream/40 text-sm">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="text-gold hover:text-gold-light font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
          </CardFooter>
        </Card>

        {/* Bottom diamond divider */}
        <GoldDiamondDivider />
      </motion.div>
    </div>
  );
}
