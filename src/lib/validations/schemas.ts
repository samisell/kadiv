import { z } from 'zod/v4';

// ── Auth ──────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Booking ───────────────────────────────────────
export const createBookingSchema = z.object({
  userId: z.string().min(1),
  eventType: z.string().min(1, 'Event type is required'),
  eventName: z.string().min(1, 'Event name is required'),
  guestCount: z.number().int().min(1, 'At least 1 guest required').max(10000),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  venueType: z.string().optional(),
  cateringPackage: z.string().optional(),
  services: z.array(z.any()).optional().default([]),
  addOns: z.array(z.any()).optional().default([]),
  totalCost: z.number().min(0).default(0),
  notes: z.string().optional(),
});

// ── Estimate ──────────────────────────────────────
export const createEstimateSchema = z.object({
  userId: z.string().min(1),
  eventType: z.string().min(1),
  guestCount: z.number().int().min(1),
  venueType: z.string().optional(),
  cateringPackage: z.string().optional(),
  services: z.array(z.any()).optional().default([]),
  addOns: z.array(z.any()).optional().default([]),
  subtotal: z.number().min(0).default(0),
  serviceFee: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  totalCost: z.number().min(0).default(0),
});

// ── Contact ───────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  phone: z.string().optional(),
  eventType: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// ── Newsletter ────────────────────────────────────
export const newsletterSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

// ── User Profile ──────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});
