'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/store/auth';

import AdminAuthGuard from './AdminAuthGuard';
import AdminSidebar, { type AdminSection } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import OverviewSection from './OverviewSection';
import BookingsSection from './BookingsSection';
import ServicesSection from './ServicesSection';
import UsersSection from './UsersSection';
import MessagesSection from './MessagesSection';
import NewsletterSection from './NewsletterSection';
import BlogSection from './BlogSection';
import AdminChatSection from './AdminChatSection';
import SettingsSection from './SettingsSection';

// ─── Section Titles ─────────────────────────────────────────────────────────

const SECTION_TITLES: Record<AdminSection, string> = {
  overview: 'Dashboard Overview',
  bookings: 'Manage Bookings',
  services: 'Services Management',
  users: 'Manage Users',
  messages: 'Messages Inbox',
  newsletter: 'Newsletter Subscribers',
  blog: 'Blog Posts',
  chat: 'Live Chat',
  settings: 'Settings',
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, getToken } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Seed data on mount for admin users
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const seed = async () => {
      try {
        const token = getToken();
        await fetch('/api/admin/seed', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch {
        // Silently fail — seed data may already exist
      }
    };
    seed();
  }, [user, getToken]);

  // Fetch initial settings
  const fetchSettings = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/admin/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // Silently fail
    }
  }, [getToken]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let cancelled = false;
    (async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/admin/settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSettings(data);
        }
      } catch { /* silently fail */ }
    })();
    return () => { cancelled = true; };
  }, [user, getToken]);

  // Fetch unread message count (contact messages)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchUnread = async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/admin/messages', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.messages.filter((m: { isRead: boolean }) => !m.isRead).length);
        }
      } catch {
        // Silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, getToken]);

  // Fetch chat unread count
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchChatUnread = async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/admin/chat', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const total = (data.conversations || []).reduce(
            (sum: number, c: { adminUnreadCount: number }) => sum + (c.adminUnreadCount || 0),
            0,
          );
          setChatUnreadCount(total);
        }
      } catch {
        // Silently fail
      }
    };
    fetchChatUnread();
    const interval = setInterval(fetchChatUnread, 5000);
    return () => clearInterval(interval);
  }, [user, getToken]);

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
  };

  const handleNotificationClick = () => {
    setActiveSection('messages');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigateToSection={handleSectionChange} />;
      case 'bookings':
        return <BookingsSection />;
      case 'services':
        return <ServicesSection />;
      case 'users':
        return <UsersSection />;
      case 'messages':
        return <MessagesSection />;
      case 'newsletter':
        return <NewsletterSection />;
      case 'blog':
        return <BlogSection />;
      case 'chat':
        return <AdminChatSection />;
      case 'settings':
        return <SettingsSection settings={settings} onSettingsUpdated={fetchSettings} />;
      default:
        return <OverviewSection onNavigateToSection={handleSectionChange} />;
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-charcoal-dark">
        {/* Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobileOpen}
          onMobileClose={() => setSidebarMobileOpen(false)}
        />

        {/* Main Content */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
          }`}
        >
          {/* Header */}
          <AdminHeader
            title={SECTION_TITLES[activeSection]}
            onToggleMobileSidebar={() => setSidebarMobileOpen(true)}
            unreadCount={unreadCount}
            onNotificationClick={handleNotificationClick}
          />

          {/* Content Area */}
          <main className="min-h-[calc(100vh-65px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={sectionVariants.initial}
                animate={sectionVariants.animate}
                exit={sectionVariants.exit}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
