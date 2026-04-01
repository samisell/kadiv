import { NextRequest, NextResponse } from 'next/server';
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  contactLimiter,
  newsletterLimiter,
  paymentInitLimiter,
} from '@/lib/rate-limit';

// ─── Route → Limiter mapping ────────────────────────────────────────────────

const RATE_LIMIT_ROUTES: Array<{ pattern: string; limiter: (req: NextRequest) => NextResponse | null }> = [
  { pattern: '/api/auth/login', limiter: loginLimiter },
  { pattern: '/api/auth/register', limiter: registerLimiter },
  { pattern: '/api/auth/forgot-password', limiter: forgotPasswordLimiter },
  { pattern: '/api/contact', limiter: contactLimiter },
  { pattern: '/api/newsletter', limiter: newsletterLimiter },
  { pattern: '/api/payments/initialize', limiter: paymentInitLimiter },
];

// ─── CORS Configuration ──────────────────────────────────────────────────────

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['*'];

function getCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes('*') ? '*' : ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// ─── Security Headers ────────────────────────────────────────────────────────

function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(request),
        ...getSecurityHeaders(),
      },
    });
  }

  // 2. Apply rate limiting to matched routes
  for (const route of RATE_LIMIT_ROUTES) {
    if (pathname.startsWith(route.pattern)) {
      const limited = route.limiter(request);
      if (limited) {
        // Attach CORS + security headers to the 429 response
        const response = new NextResponse(limited.body, limited);
        const headers = new Headers(response.headers);
        const corsHeaders = getCorsHeaders(request);
        for (const [key, value] of Object.entries(corsHeaders)) {
          headers.set(key, value);
        }
        const secHeaders = getSecurityHeaders();
        for (const [key, value] of Object.entries(secHeaders)) {
          headers.set(key, value);
        }
        return new NextResponse(response.body, { status: 429, headers });
      }
      break;
    }
  }

  // 3. Attach CORS + security headers to all API responses
  const response = NextResponse.next();
  const corsHeaders = getCorsHeaders(request);
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  const secHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(secHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all API routes
     */
    '/api/:path*',
  ],
};
