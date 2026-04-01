/**
 * Server-side environment configuration.
 * Only import this file in Server Components, API routes, or middleware.
 * Never use in client components.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

export const env = {
  // Database
  database: {
    url: required('DATABASE_URL'),
  },

  // App
  app: {
    name: optional('NEXT_PUBLIC_APP_NAME', 'KADIV Events'),
    url: optional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    description: optional('NEXT_PUBLIC_APP_DESCRIPTION', 'Premium event management company'),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
  },

  // Auth
  auth: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    jwtSecret: optional('JWT_SECRET'),
  },
} as const;

// Type-safe access for NEXT_PUBLIC_ vars (safe for client)
export const publicEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'KADIV Events',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  companyPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+1 (234) 567-890',
  companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@kadiv.com',
  bookingsEmail: process.env.NEXT_PUBLIC_COMPANY_BOOKINGS_EMAIL || 'bookings@kadiv.com',
  companyAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Plot 12, Victoria Island, Lagos, Nigeria',
  companyHours: process.env.NEXT_PUBLIC_COMPANY_HOURS || 'Mon - Sat, 9am - 6pm',
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '#',
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '#',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '#',
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '#',
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '#',
  },
} as const;
