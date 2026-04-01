import { SERVICES, EVENT_CATEGORIES, BLOG_POSTS } from '@/data/content';
import type { Page } from '@/store/navigation';

/* ─── Types ─── */

export interface SearchableItem {
  id: string;
  category: string;
  title: string;
  description: string;
  page: Page;
  keywords: string[];
}

/* ─── FAQ Data ─── */

interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  // Booking & Services (4)
  {
    question: 'How far in advance should I book my event?',
    answer:
      'We recommend booking at least 3–6 months in advance for standard events and 6–12 months for large-scale weddings or corporate galas.',
  },
  {
    question: 'What types of events does KADIV plan?',
    answer:
      'KADIV Events plans weddings, corporate events, private parties, galas, concerts, exhibitions, birthdays, engagement parties, religious events, baby showers, graduations, and housewarming events.',
  },
  {
    question: 'Can I customise a package to fit my specific needs?',
    answer:
      'Every event is unique. We specialise in creating bespoke packages tailored to your vision, style, and budget. You can add or remove services, upgrade venues, and customise every aspect.',
  },
  {
    question: 'Do you provide event-day coordination only, or full planning?',
    answer:
      'We offer Full Planning, Day-Of Coordination, and partial planning options. Full Planning covers everything from concept to execution.',
  },
  // Payment & Pricing (4)
  {
    question: 'What is the minimum cost for a KADIV event?',
    answer:
      'Our packages typically start from ₦1,500,000 for intimate gatherings. Use our online Cost Calculator for an instant estimate.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept bank transfers, Flutterwave, and Paystack (card, bank transfer, USSD). Corporate clients can also use company cheques with prior arrangement.',
  },
  {
    question: 'Is there a deposit required to secure a booking?',
    answer:
      'A 50% deposit of the total estimated cost is required at booking. The remaining 50% is due 14 days before the event. Short-notice bookings require full upfront payment.',
  },
  {
    question: 'Does the quoted price include VAT?',
    answer:
      'All quotations include service fees but exclude VAT at 7.5%. VAT will be clearly stated on your invoice as a separate line item.',
  },
  // Cancellation & Refunds (3)
  {
    question: 'What is your cancellation policy?',
    answer:
      '60+ days before event = 90% refund. 30–59 days = 50%. 15–29 days = 25%. Less than 15 days = no refund.',
  },
  {
    question: 'What happens if KADIV cancels my event?',
    answer:
      'If we cancel due to our control, you receive a full refund within 14 business days. For force majeure, we offer a full credit note valid for 18 months.',
  },
  {
    question: 'Can I get a partial refund if I reduce my guest count?',
    answer:
      'Scope reductions follow the same timeline-based cancellation policy. Reductions more than 15 days before the event may be partially refunded.',
  },
  // Venue & Logistics (4)
  {
    question: 'Which locations do you serve?',
    answer:
      'KADIV Events operates primarily in Lagos with coverage across Abuja, Port Harcourt, Enugu, Calabar, Benin City, Ibadan, Uyo, Owerri, and more.',
  },
  {
    question: 'Do you source the venue or can I choose my own?',
    answer:
      'Both options are available. We have partnerships with premium venues across Nigeria, or you can choose your own and we will coordinate directly.',
  },
  {
    question: 'Do you handle decorations, catering, and entertainment?',
    answer:
      'Yes! KADIV provides end-to-end event management — decorators, florists, caterers, photographers, videographers, DJs, live bands, MCs, and more.',
  },
  {
    question: 'Can you accommodate guests with dietary restrictions or accessibility needs?',
    answer:
      'We collect detailed dietary requirements and accessibility needs during planning and work closely with caterers and venues to accommodate all guests.',
  },
  // General (3)
  {
    question: 'How do I get started with KADIV Events?',
    answer:
      'Fill out our online booking form, use the Cost Calculator, or contact us at info@kadiv.com or call +234 (1) 234 5678 for a complimentary consultation.',
  },
  {
    question: 'Do you have a physical office I can visit?',
    answer:
      'Our main office is at Plot 12, Victoria Island, Lagos, Nigeria. Open Monday to Friday, 9:00 AM to 6:00 PM WAT.',
  },
  {
    question: 'Can I see examples of past events you have planned?',
    answer:
      'Visit our Gallery page to browse photographs from our past events. We also share event recaps on social media.',
  },
];

/* ─── Static Pages ─── */

const STATIC_PAGES: { label: string; page: Page; keywords: string[] }[] = [
  { label: 'Home', page: 'home', keywords: ['home', 'landing', 'welcome', 'main', 'hero'] },
  { label: 'About Us', page: 'about', keywords: ['about', 'team', 'company', 'who we are', 'story', 'mission', 'values'] },
  { label: 'Services', page: 'services', keywords: ['services', 'offerings', 'what we do', 'packages', 'pricing'] },
  { label: 'Events', page: 'events', keywords: ['events', 'event types', 'categories', 'occasions', 'celebrations'] },
  { label: 'Cost Calculator', page: 'calculator', keywords: ['calculator', 'estimate', 'budget', 'cost', 'pricing tool', 'quote'] },
  { label: 'Book Event', page: 'booking', keywords: ['booking', 'book', 'reserve', 'reservation', 'hire', 'schedule'] },
  { label: 'Gallery', page: 'gallery', keywords: ['gallery', 'photos', 'images', 'portfolio', 'pictures', 'past events'] },
  { label: 'Contact', page: 'contact', keywords: ['contact', 'reach', 'email', 'phone', 'address', 'message'] },
  { label: 'Blog', page: 'blog', keywords: ['blog', 'articles', 'news', 'tips', 'stories', 'insights'] },
  { label: 'FAQ', page: 'faq', keywords: ['faq', 'frequently asked', 'questions', 'help', 'support', 'answers'] },
  { label: 'Terms of Service', page: 'terms', keywords: ['terms', 'terms of service', 'conditions', 'agreement', 'legal'] },
  { label: 'Privacy Policy', page: 'privacy', keywords: ['privacy', 'privacy policy', 'data', 'personal information', 'legal'] },
  { label: 'Refund Policy', page: 'refund', keywords: ['refund', 'refund policy', 'cancellation', 'money back', 'returns'] },
];

/* ─── Build Searchable Items ─── */

export function getSearchableItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Services
  for (const service of SERVICES) {
    items.push({
      id: `service-${service.id}`,
      category: 'Services',
      title: service.name,
      description: service.description,
      page: 'services',
      keywords: [service.id, 'service', 'offering', 'package'],
    });
  }

  // Event Types
  for (const event of EVENT_CATEGORIES) {
    items.push({
      id: `event-${event.id}`,
      category: 'Events',
      title: event.name,
      description: event.description,
      page: 'events',
      keywords: [event.id, 'event type', 'category', 'celebration'],
    });
  }

  // Blog Posts
  for (const post of BLOG_POSTS) {
    items.push({
      id: `blog-${post.id}`,
      category: 'Blog',
      title: post.title,
      description: post.excerpt,
      page: 'blog',
      keywords: [post.category, 'article', 'post', 'read', post.readTime],
    });
  }

  // FAQ Items
  for (let i = 0; i < FAQ_ITEMS.length; i++) {
    const faq = FAQ_ITEMS[i];
    items.push({
      id: `faq-${i}`,
      category: 'FAQ',
      title: faq.question,
      description: faq.answer,
      page: 'faq',
      keywords: ['question', 'answer', 'help', 'support'],
    });
  }

  // Static Pages
  for (const page of STATIC_PAGES) {
    items.push({
      id: `page-${page.page}`,
      category: 'Pages',
      title: page.label,
      description: `Navigate to ${page.label}`,
      page: page.page,
      keywords: page.keywords,
    });
  }

  return items;
}

/* ─── Search Function ─── */

interface ScoredItem extends SearchableItem {
  score: number;
}

function matchScore(item: SearchableItem, query: string): number {
  const q = query.toLowerCase();
  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();
  const kwLower = item.keywords.join(' ').toLowerCase();

  // Title exact match (highest priority)
  if (titleLower === q) return 100;

  // Title starts with query
  if (titleLower.startsWith(q)) return 80;

  // Title contains query (word boundary)
  const titleWords = titleLower.split(/\s+/);
  const queryWords = q.split(/\s+/);
  const titleWordMatchCount = queryWords.filter((qw) =>
    titleWords.some((tw) => tw === qw || tw.startsWith(qw))
  ).length;
  if (titleWordMatchCount === queryWords.length) return 70;

  // Title contains query substring
  if (titleLower.includes(q)) return 60;

  // Keywords contain query
  if (kwLower.includes(q)) return 45;

  // Description contains query
  if (descLower.includes(q)) return 30;

  // Any query word matches in title
  if (titleWordMatchCount > 0) return 25;

  // Any query word matches in description
  const descWords = descLower.split(/\s+/);
  const descWordMatchCount = queryWords.filter((qw) =>
    descWords.some((dw) => dw === qw || dw.startsWith(qw))
  ).length;
  if (descWordMatchCount > 0) return 15;

  return 0;
}

export function searchItems(query: string): SearchableItem[] {
  if (!query.trim() || query.length < 2) return [];

  const allItems = getSearchableItems();
  const scored: ScoredItem[] = [];

  for (const item of allItems) {
    const score = matchScore(item, query);
    if (score > 0) {
      scored.push({ ...item, score });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Group by category, take top 10 per category
  const seenCategories = new Map<string, number>();
  const results: SearchableItem[] = [];

  for (const item of scored) {
    const count = seenCategories.get(item.category) || 0;
    if (count < 10) {
      seenCategories.set(item.category, count + 1);
      results.push(item);
    }
  }

  return results;
}
