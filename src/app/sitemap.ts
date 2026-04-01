import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pages = [
    'home',
    'about',
    'services',
    'events',
    'calculator',
    'booking',
    'gallery',
    'contact',
    'blog',
    'faq',
    'terms',
    'privacy',
    'refund',
  ] as const;

  return pages.map((page) => ({
    url: `${baseUrl}/#${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: page === 'home' ? 1.0 : 0.8,
  }));
}
