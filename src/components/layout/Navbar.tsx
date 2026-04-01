'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, ShoppingBag, Globe, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation, type Page } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { useCurrency } from '@/lib/currency';
import { CURRENCY_META } from '@/store/currencyStore';
import Image from 'next/image';
import SearchBar from '@/components/search/SearchBar';

const NAV_ITEMS: { label: string; page: Page; children?: { label: string; page: Page }[] }[] = [
  { label: 'Home', page: 'home' },
  { label: 'About', page: 'about' },
  { label: 'Services', page: 'services' },
  { label: 'Events', page: 'events' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'Blog', page: 'blog' },
  { label: 'Contact', page: 'contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { currentPage, navigate } = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const { currency, rate, setCurrency } = useCurrency();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
    setDropdownOpen(null);
    setUserMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button onClick={() => handleNavigate('home')} className="flex items-center gap-3 group">
              <Image
                src="/logo.svg"
                alt="KADIV"
                width={160}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavigate(item.page)}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                    currentPage === item.page
                      ? 'text-gold'
                      : 'text-cream/70 hover:text-gold'
                  }`}
                >
                  {item.label}
                  {currentPage === item.page && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-gold"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
              <button
                onClick={() => handleNavigate('calculator')}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                  currentPage === 'calculator'
                    ? 'text-gold'
                    : 'text-gold-light hover:text-gold'
                }`}
              >
                Cost Calculator
              </button>
            </nav>

            {/* Desktop Search & Currency Selector */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                data-search-trigger
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-gold hover:bg-white/5 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline font-medium">Search</span>
                <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded bg-white/5 border border-cream/10 text-cream/20 text-[10px] font-mono ml-1">⌘K</kbd>
              </button>
              <div className="relative" onMouseEnter={() => setDropdownOpen('currency')} onMouseLeave={() => setDropdownOpen(null)}>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-gold hover:bg-white/5 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">{CURRENCY_META[currency].symbol}{currency}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen === 'currency' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen === 'currency' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-1 w-44 glass rounded-xl p-1.5 shadow-xl"
                    >
                      {(['NGN', 'USD'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => { setCurrency(c); setDropdownOpen(null); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            currency === c ? 'bg-gold/15 text-gold' : 'text-cream/70 hover:text-gold hover:bg-white/5'
                          }`}
                        >
                          <span className="font-bold text-base">{CURRENCY_META[c].symbol}</span>
                          <div className="text-left">
                            <div className="font-medium">{c}</div>
                            <div className="text-[10px] opacity-60">{CURRENCY_META[c].name}</div>
                          </div>
                        </button>
                      ))}
                      <div className="px-3 pt-1.5 pb-0.5 mt-1 border-t border-gold/10">
                        <div className="text-[10px] text-cream/40">Rate: 1 USD = ₦{rate.toLocaleString()}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-gold">{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-cream/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 glass rounded-xl p-2 shadow-xl"
                      >
                        <div className="px-3 py-2 border-b border-gold/10 mb-1">
                          <p className="text-sm font-medium text-cream">{user?.name || 'User'}</p>
                          <p className="text-xs text-cream/50">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => handleNavigate('dashboard')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-gold hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => handleNavigate('booking')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cream/70 hover:text-gold hover:bg-white/5 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Book Event
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleNavigate('admin')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gold hover:bg-gold/10 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </button>
                        )}
                        <div className="border-t border-gold/10 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate('login')}
                    className="text-cream/70 hover:text-gold hover:bg-white/5"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => handleNavigate('booking')}
                    className="bg-gold text-charcoal-dark hover:bg-gold-light font-semibold px-6"
                  >
                    Book Event
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                data-search-trigger
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-cream/70 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-cream/70 hover:text-gold transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-charcoal-dark border-l border-gold/10 overflow-y-auto">
              <div className="p-6 pt-24">
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleNavigate(item.page)}
                      className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium tracking-wide uppercase transition-colors ${
                        currentPage === item.page
                          ? 'text-gold bg-gold/10'
                          : 'text-cream/70 hover:text-gold hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleNavigate('calculator')}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium tracking-wide uppercase transition-colors ${
                      currentPage === 'calculator'
                        ? 'text-gold bg-gold/10'
                        : 'text-gold-light hover:text-gold hover:bg-white/5'
                    }`}
                  >
                    Cost Calculator
                  </button>
                </nav>
                <div className="mt-6 pt-6 border-t border-gold/10 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => handleNavigate('dashboard')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-cream/70 hover:text-gold hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('booking')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-cream/70 hover:text-gold hover:bg-white/5 transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-medium">Book Event</span>
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleNavigate('admin')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                        >
                          <Shield className="w-5 h-5" />
                          <span className="font-medium">Admin Panel</span>
                        </button>
                      )}
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleNavigate('login')}
                        className="w-full border-gold/30 text-gold hover:bg-gold/10"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => handleNavigate('register')}
                        className="w-full bg-gold text-charcoal-dark hover:bg-gold-light font-semibold"
                      >
                        Create Account
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
