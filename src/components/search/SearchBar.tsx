'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  Calendar,
  FileText,
  HelpCircle,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import { searchItems, type SearchableItem } from '@/lib/search-data';
import { useNavigation } from '@/store/navigation';

/* ─── Category config ─── */

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Services: Sparkles,
  Events: Calendar,
  Blog: FileText,
  FAQ: HelpCircle,
  Pages: LayoutGrid,
};

/* ─── Highlight matching text ─── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-gold font-semibold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Group results by category ─── */

function groupByCategory(items: SearchableItem[]): Map<string, SearchableItem[]> {
  const groups = new Map<string, SearchableItem[]>();
  const order = ['Pages', 'Services', 'Events', 'Blog', 'FAQ'];

  for (const item of items) {
    if (!groups.has(item.category)) {
      groups.set(item.category, []);
    }
    groups.get(item.category)!.push(item);
  }

  // Sort groups by predefined order
  const sorted = new Map<string, SearchableItem[]>();
  for (const cat of order) {
    if (groups.has(cat)) {
      sorted.set(cat, groups.get(cat)!);
    }
  }
  return sorted;
}

/* ─── SearchBar Props ─── */

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── SearchBar Component ─── */

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { navigate } = useNavigation();

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened, reset when closed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        inputRef.current?.focus();
      } else {
        setQuery('');
        setDebouncedQuery('');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Only close if the click is not on the search trigger button
        const trigger = document.querySelector('[data-search-trigger]');
        if (trigger && !trigger.contains(e.target as Node)) {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Search results
  const results = useMemo(() => {
    if (debouncedQuery.trim().length < 2) return [];
    return searchItems(debouncedQuery);
  }, [debouncedQuery]);

  const groupedResults = useMemo(
    () => groupByCategory(results),
    [results]
  );

  const handleSelect = useCallback(
    (item: SearchableItem) => {
      navigate(item.page);
      onClose();
    },
    [navigate, onClose]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Overlay */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-x-0 top-[72px] z-[70] mx-auto max-w-2xl px-4 sm:px-6"
          >
            {/* Search Input Card */}
            <div className="glass rounded-2xl border border-gold/20 shadow-2xl shadow-black/40 overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4">
                <Search className="w-5 h-5 text-cream/40 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services, events, blog, FAQ..."
                  className="flex-1 bg-transparent text-cream text-base placeholder:text-cream/30 focus:outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button
                    onClick={handleClear}
                    className="p-1 rounded-md text-cream/40 hover:text-gold hover:bg-white/5 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-cream/10 text-cream/30 text-[10px] font-mono">
                  ESC
                </kbd>
              </div>

              {/* Divider */}
              {(query.trim().length >= 2) && (
                <div className="border-t border-gold/10" />
              )}

              {/* Results */}
              <AnimatePresence mode="wait">
                {query.trim().length >= 2 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="max-h-96 overflow-y-auto search-scrollbar"
                  >
                    {results.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <Search className="w-8 h-8 text-cream/15 mx-auto mb-3" />
                        <p className="text-cream/40 text-sm font-medium mb-1">
                          No results found
                        </p>
                        <p className="text-cream/25 text-xs">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {Array.from(groupedResults.entries()).map(
                          ([category, items]) => {
                            const IconComponent =
                              CATEGORY_ICONS[category] || LayoutGrid;
                            return (
                              <div key={category}>
                                {/* Category Header */}
                                <div className="flex items-center gap-2 px-5 py-2">
                                  <IconComponent className="w-3.5 h-3.5 text-gold/50" />
                                  <span className="text-[11px] font-semibold uppercase tracking-widest text-cream/30">
                                    {category}
                                  </span>
                                  <span className="text-[10px] text-cream/20 ml-auto">
                                    {items.length}
                                  </span>
                                </div>

                                {/* Items */}
                                {items.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="w-full flex items-start gap-3 px-5 py-2.5 text-left hover:bg-white/5 transition-colors group"
                                  >
                                    <div className="mt-0.5 w-6 h-6 rounded-md bg-white/5 border border-cream/10 flex items-center justify-center shrink-0 group-hover:border-gold/30 group-hover:bg-gold/5 transition-colors">
                                      <IconComponent className="w-3 h-3 text-cream/30 group-hover:text-gold transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-cream/80 group-hover:text-gold transition-colors truncate">
                                        <HighlightText
                                          text={item.title}
                                          query={query}
                                        />
                                      </p>
                                      {item.category !== 'Pages' && (
                                        <p className="text-xs text-cream/30 mt-0.5 line-clamp-1">
                                          <HighlightText
                                            text={item.description}
                                            query={query}
                                          />
                                        </p>
                                      )}
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-cream/10 group-hover:text-gold/50 mt-1.5 shrink-0 transition-colors" />
                                  </button>
                                ))}
                              </div>
                            );
                          }
                        )}

                        {/* Footer */}
                        <div className="border-t border-gold/10 px-5 py-2.5 flex items-center justify-between">
                          <p className="text-[11px] text-cream/25">
                            {results.length} result
                            {results.length !== 1 ? 's' : ''} found
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-cream/20">
                            <span className="flex items-center gap-1">
                              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-cream/10 font-mono text-[9px]">
                                ↑↓
                              </kbd>
                              Navigate
                            </span>
                            <span className="flex items-center gap-1">
                              <kbd className="px-1 py-0.5 rounded bg-white/5 border border-cream/10 font-mono text-[9px]">
                                ↵
                              </kbd>
                              Select
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State — when query is too short */}
              {query.trim().length < 2 && query.length > 0 && (
                <div className="px-5 py-4 text-center">
                  <p className="text-cream/25 text-xs">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
