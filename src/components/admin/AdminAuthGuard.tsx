'use client';

import { useAuth } from '@/store/auth';
import { useNavigation } from '@/store/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, ShieldX, LogIn, ArrowLeft } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useNavigation();

  // Not authenticated — show login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h2 className="font-display text-2xl text-cream mb-3">Admin Access Required</h2>
          <p className="text-cream/50 mb-8 leading-relaxed">
            You need to sign in with an administrator account to access the dashboard.
          </p>
          <Button
            onClick={() => navigate('login')}
            className="bg-gold hover:bg-gold-light text-charcoal-dark px-8 h-11"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In as Admin
          </Button>
        </motion.div>
      </div>
    );
  }

  // Authenticated but not admin — show access denied
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="font-display text-2xl text-cream mb-3">Access Denied</h2>
          <p className="text-cream/50 mb-8 leading-relaxed">
            Your account does not have administrator privileges. Please contact your system administrator for access.
          </p>
          <Button
            onClick={() => navigate('dashboard')}
            variant="outline"
            className="border-gold/20 text-cream hover:text-gold hover:border-gold/40 px-8 h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  // Admin — render children
  return <>{children}</>;
}
