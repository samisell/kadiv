'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/store/auth';
import { useNavigation } from '@/store/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Users,
  Mail,
  Newspaper,
  FileText,
  MessageCircle,
  Settings,
  Home,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export type AdminSection =
  | 'overview'
  | 'bookings'
  | 'services'
  | 'users'
  | 'messages'
  | 'newsletter'
  | 'blog'
  | 'chat'
  | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const NAV_ITEMS: { section: AdminSection; label: string; icon: React.ElementType }[] = [
  { section: 'overview', label: 'Overview', icon: LayoutDashboard },
  { section: 'bookings', label: 'Bookings', icon: CalendarDays },
  { section: 'services', label: 'Services', icon: Package },
  { section: 'users', label: 'Users', icon: Users },
  { section: 'messages', label: 'Messages', icon: Mail },
  { section: 'newsletter', label: 'Newsletter', icon: Newspaper },
  { section: 'blog', label: 'Blog', icon: FileText },
  { section: 'chat', label: 'Chat', icon: MessageCircle },
  { section: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();

  const handleLogout = () => {
    logout();
    navigate('home');
    toast.success('Signed out successfully');
  };

  const handleNavClick = (section: AdminSection) => {
    onSectionChange(section);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 min-h-[72px]">
        <Image src="/logo.svg" alt="KADIV" width={32} height={32} className="brightness-110 shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="font-display text-lg text-gold tracking-wider leading-tight">KADIV</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40">Admin Panel</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden text-cream/60 hover:text-gold shrink-0"
          onClick={onMobileClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="luxury-divider mx-3" />

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ section, label, icon: Icon }) => (
          <button
            key={section}
            onClick={() => handleNavClick(section)}
            title={collapsed ? label : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
              collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5'
            } ${
              activeSection === section
                ? 'bg-gold/10 text-gold border border-gold/20'
                : 'text-cream/60 hover:text-cream hover:bg-charcoal-light/50 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-2 space-y-1">
        <div className="luxury-divider mb-2" />

        <button
          onClick={() => navigate('home')}
          title={collapsed ? 'Back to Site' : undefined}
          className={`w-full flex items-center gap-3 rounded-lg text-sm transition-all ${
            collapsed ? 'px-3 py-2 justify-center' : 'px-3 py-2'
          } text-cream/60 hover:text-cream hover:bg-charcoal-light/50`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 rounded-lg text-sm transition-all ${
            collapsed ? 'px-3 py-2 justify-center' : 'px-3 py-2'
          } text-red-400/80 hover:text-red-400 hover:bg-red-500/10`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Admin info */}
      {!collapsed && (
        <div className="p-3 border-t border-gold/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 bg-gold/20 shrink-0">
              <AvatarFallback className="text-gold text-xs font-semibold">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm text-cream truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-cream/40 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle - desktop only */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center p-2 border-t border-gold/10 text-cream/40 hover:text-cream hover:bg-charcoal-light/50 transition-all"
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-charcoal-light/80 border-r border-gold/10 backdrop-blur-xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 z-30 h-full bg-charcoal-light/80 border-r border-gold/10 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
