import { SITE_CONFIG } from '@/lib/constants';
import { getAllConditions } from '@/lib/data/conditions-data';

const staticPages = [
  { url: SITE_CONFIG.url, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
  { url: `${SITE_CONFIG.url}/dr-rajesh-goel`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
  { url: `${SITE_CONFIG.url}/book-appointment`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  { url: `${SITE_CONFIG.url}/book-online-consultation`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  { url: `${SITE_CONFIG.url}/conditions`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: `${SITE_CONFIG.url}/videos`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
  { url: `${SITE_CONFIG.url}/medical-tourism`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: `${SITE_CONFIG.url}/tests-for-kidney-disease`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
  { url: `${SITE_CONFIG.url}/calculators`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: `${SITE_CONFIG.url}/medicines`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
  { url: `${SITE_CONFIG.url}/medical-abbreviations`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
  { url: `${SITE_CONFIG.url}/whatsapp-channel`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  { url: `${SITE_CONFIG.url}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  { url: `${SITE_CONFIG.url}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  { url: `${SITE_CONFIG.url}/patient/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  { url: `${SITE_CONFIG.url}/patient/dashboard`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  { url: `${SITE_CONFIG.url}/international-patients`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
];

const conditionPages = getAllConditions().map((c) => ({
  url: `${SITE_CONFIG.url}/conditions/${c.slug}`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
}));

export default function sitemap() {
  return [...staticPages, ...conditionPages].map((page) => ({
    url: page.url,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
