import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  retryAfter: number;
}

// ─── In-memory store ─────────────────────────────────────────────────────────

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

if (typeof globalThis !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove timestamps outside any reasonable window (keep last 15 min)
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  // .unref() is Node.js-only — safely call only when available (not in Edge runtime)
  if (timer && typeof (timer as unknown as { unref?: () => void }).unref === 'function') {
    (timer as unknown as { unref: () => void }).unref();
  }
}

// ─── Extract client IP ───────────────────────────────────────────────────────

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

// ─── Core rate limit function ────────────────────────────────────────────────

/**
 * Check if a request should be rate limited based on IP and config.
 * Returns the rate limit result with remaining count and retry-after if limited.
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): RateLimitResult {
  const ip = getClientIp(request);
  const key = `${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Filter timestamps to only those within the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (entry.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);
    return {
      limited: true,
      remaining: 0,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    limited: false,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfter: 0,
  };
}

// ─── Rate limit middleware factory ───────────────────────────────────────────

/**
 * Creates a rate limiting middleware handler.
 * Returns a NextResponse if rate limited, or null if the request should proceed.
 *
 * @example
 * ```ts
 * const limit = rateLimit({ windowMs: 60_000, maxRequests: 5 });
 * const response = limit(request);
 * if (response) return response; // rate limited
 * // proceed with request...
 * ```
 */
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const mergedConfig: RateLimitConfig = {
    windowMs: config.windowMs ?? 60_000,
    maxRequests: config.maxRequests ?? 15,
  };

  return function limitRequest(request: NextRequest): NextResponse | null {
    const result = checkRateLimit(request, mergedConfig);

    if (result.limited) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    // Return null to indicate the request should proceed
    return null;
  };
}

// ─── Route-specific limiters ─────────────────────────────────────────────────

export const loginLimiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });
export const registerLimiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });
export const forgotPasswordLimiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });
export const contactLimiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });
export const newsletterLimiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });
export const paymentInitLimiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });
