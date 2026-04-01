'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import LiveChatWidget from '@/components/chat/LiveChatWidget';
import { useNavigation, type Page, initFromHash, handleHashChange } from '@/store/navigation';
import { lazy, Suspense, useEffect } from 'react';

const HomePage = lazy(() => import('@/components/home/HomePage'));
const AboutPage = lazy(() => import('@/components/about/AboutPage'));
const ServicesPage = lazy(() => import('@/components/services/ServicesPage'));
const EventsPage = lazy(() => import('@/components/events/EventsPage'));
const CalculatorPage = lazy(() => import('@/components/calculator/CalculatorPage'));
const BookingPage = lazy(() => import('@/components/booking/BookingPage'));
const LoginPage = lazy(() => import('@/components/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/components/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/components/auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/components/auth/VerifyEmailPage'));
const DashboardPage = lazy(() => import('@/components/dashboard/DashboardPage'));
const GalleryPage = lazy(() => import('@/components/gallery/GalleryPage'));
const ContactPage = lazy(() => import('@/components/contact/ContactPage'));
const BlogPage = lazy(() => import('@/components/blog/BlogPage'));
const BlogDetailPage = lazy(() => import('@/components/blog/BlogDetailPage'));
const AdminPage = lazy(() => import('@/components/admin/AdminPage'));
const CheckoutPage = lazy(() => import('@/components/checkout/CheckoutPage'));
const PaymentResultPage = lazy(() => import('@/components/checkout/PaymentResultPage'));
const TermsPage = lazy(() => import('@/components/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/components/legal/PrivacyPage'));
const RefundPage = lazy(() => import('@/components/legal/RefundPage'));
const FaqPage = lazy(() => import('@/components/faq/FaqPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-6" />
        <p className="text-gold/60 text-sm tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}

const PAGE_COMPONENTS: Record<Page, React.LazyExoticComponent<React.ComponentType<any>>> = {
  home: HomePage,
  about: AboutPage,
  services: ServicesPage,
  events: EventsPage,
  calculator: CalculatorPage,
  booking: BookingPage,
  login: LoginPage,
  register: RegisterPage,
  'forgot-password': ForgotPasswordPage,
  'verify-email': VerifyEmailPage,
  'reset-password': ForgotPasswordPage,
  dashboard: DashboardPage,
  gallery: GalleryPage,
  contact: ContactPage,
  blog: BlogPage,
  'blog-detail': BlogDetailPage,
  admin: AdminPage,
  checkout: CheckoutPage,
  'payment-result': PaymentResultPage,
  terms: TermsPage,
  privacy: PrivacyPage,
  refund: RefundPage,
  faq: FaqPage,
};

export default function App() {
  const { currentPage } = useNavigation();
  const PageComponent = PAGE_COMPONENTS[currentPage];

  // ── Deep linking: restore page from URL hash on mount ──
  useEffect(() => {
    initFromHash();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const isAdmin = currentPage === 'admin';
  const isAuthPage = currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot-password' || currentPage === 'verify-email' || currentPage === 'reset-password';
  const isMinimalPage = currentPage === 'admin' || currentPage === 'payment-result';

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-dark">
      {!isMinimalPage && !isAuthPage && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                {PageComponent && <PageComponent />}
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isMinimalPage && !isAuthPage && <Footer />}
      {!isMinimalPage && !isAuthPage && <LiveChatWidget />}
    </div>
  );
}