'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/auth';
import { useCurrency } from '@/lib/currency';
import { Bell, Search } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  onToggleMobileSidebar: () => void;
  unreadCount?: number;
  onNotificationClick?: () => void;
}

export default function AdminHeader({
  title,
  onToggleMobileSidebar,
  unreadCount,
  onNotificationClick,
}: AdminHeaderProps) {
  const { user } = useAuth();
  const { currency, symbol } = useCurrency();

  return (
    <header className="sticky top-0 z-20 bg-charcoal-dark/90 backdrop-blur-md border-b border-gold/10">
      <div className="flex items-center gap-4 px-4 lg:px-6 py-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-cream/60 hover:text-gold shrink-0"
          onClick={onToggleMobileSidebar}
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Title */}
        <h1 className="font-display text-lg lg:text-xl text-cream tracking-wide truncate">{title}</h1>

        <div className="flex-1" />

        {/* Search bar (decorative) */}
        <div className="hidden md:flex relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-charcoal-light border-gold/10 text-cream placeholder:text-cream/30 h-9"
            readOnly
          />
        </div>

        {/* Currency badge */}
        <Badge
          variant="outline"
          className="hidden sm:flex border-gold/20 text-gold text-xs font-medium px-2.5 py-1"
        >
          {currency} {symbol}
        </Badge>

        {/* Notification bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg hover:bg-charcoal-light transition-colors"
        >
          <Bell className="w-5 h-5 text-cream/60" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-charcoal-dark text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 bg-gold/20 border border-gold/30">
            <AvatarFallback className="text-gold text-sm font-semibold">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-cream truncate leading-tight">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-gold/70 truncate leading-tight">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
