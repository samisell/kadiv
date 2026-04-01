'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/* ─── Dashboard Skeleton ─── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pt-28 pb-8 text-center space-y-4">
        <Skeleton className="h-10 w-64 mx-auto bg-charcoal-light" />
        <Skeleton className="h-5 w-48 mx-auto bg-charcoal-light" />
      </div>

      {/* Stats Row — 4 cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-charcoal-light/50 border-gold/10 py-0">
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-charcoal-light" />
                  <Skeleton className="h-4 w-16 bg-charcoal-light" />
                </div>
                <Skeleton className="h-7 w-24 bg-charcoal-light" />
                <Skeleton className="h-3 w-32 bg-charcoal-light" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-charcoal-light/50 border-gold/10 py-0">
          <CardContent className="p-0">
            {/* Tabs skeleton */}
            <div className="flex items-center justify-center gap-2 p-4 mb-4">
              {[180, 140, 160, 140].map((w, i) => (
                <Skeleton key={i} className="h-10 rounded-lg bg-charcoal-light" style={{ width: w }} />
              ))}
            </div>

            {/* Table header */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-gold/10">
              {['w-1/4', 'w-1/6', 'w-1/6', 'w-1/6', 'w-1/6', 'w-1/6'].map((w, i) => (
                <Skeleton key={i} className={`h-3 ${w} bg-charcoal-light`} />
              ))}
            </div>

            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gold/5">
                <Skeleton className="h-4 w-1/4 bg-charcoal-light" />
                <Skeleton className="h-4 w-1/6 bg-charcoal-light" />
                <Skeleton className="h-4 w-1/6 bg-charcoal-light" />
                <Skeleton className="h-5 w-20 rounded-full bg-charcoal-light" />
                <Skeleton className="h-4 w-1/6 bg-charcoal-light" />
                <Skeleton className="h-4 w-1/6 bg-charcoal-light" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Admin Table Skeleton ─── */
export function AdminTableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  const colWidths = Array.from({ length: cols }).map((_, i) => {
    if (i === 0) return 'flex-1';
    if (i === cols - 1) return 'w-20';
    return 'w-28';
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search bar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm bg-charcoal-light rounded-lg" />
        <Skeleton className="h-10 w-32 bg-charcoal-light rounded-lg" />
      </div>

      {/* Table skeleton */}
      <Card className="bg-charcoal border-gold/10">
        <CardContent className="p-0">
          {/* Header row */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gold/10">
            {colWidths.map((w, i) => (
              <Skeleton key={`h-${i}`} className={`h-3.5 ${w} bg-charcoal-light`} />
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-3 px-5 py-3.5 border-b border-gold/5 last:border-0">
              {colWidths.map((w, c) => (
                <Skeleton key={`r-${r}-${c}`} className={`h-4 ${w} bg-charcoal-light`} />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 bg-charcoal-light" />
        <div className="flex gap-1">
          {[1, 2, 3].map((p) => (
            <Skeleton key={p} className="h-8 w-8 rounded bg-charcoal-light" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Card Grid Skeleton ─── */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="bg-charcoal-light/50 border-gold/10 overflow-hidden">
          <Skeleton className="h-40 w-full bg-charcoal-light" />
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-3/4 bg-charcoal-light" />
            <Skeleton className="h-3 w-full bg-charcoal-light" />
            <Skeleton className="h-3 w-2/3 bg-charcoal-light" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-24 bg-charcoal-light" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md bg-charcoal-light" />
              <Skeleton className="h-8 w-20 rounded-md bg-charcoal-light" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Generic Content Skeleton ─── */
export function ContentSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300 p-4 lg:p-6">
      {/* Title */}
      <Skeleton className="h-8 w-1/2 bg-charcoal-light" />
      <Skeleton className="h-4 w-3/4 bg-charcoal-light" />

      {/* Paragraph lines */}
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 bg-charcoal-light ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>

      {/* Action area */}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-32 rounded-md bg-charcoal-light" />
        <Skeleton className="h-10 w-24 rounded-md bg-charcoal-light" />
      </div>
    </div>
  );
}