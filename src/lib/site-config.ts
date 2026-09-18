export interface SiteConfig {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  clinicId: string;
  consultationType: string;
  phone: string;
  email: string;
  address: string;
  tagline?: string;
  allowedDomains: string[];
  showClinicSelector: boolean;
  showLocationToggle: boolean;
  showPricing: boolean;
  fee?: number;
  feeCurrency?: string;
}

export const SITE_CONFIGS: Record<string, SiteConfig> = {
  kcc: {
    id: 'kcc',
    name: 'Kidney Care Centre',
    domain: 'kidneycarecentre.in',
    primaryColor: '#1a5276',
    secondaryColor: '#f0f4f8',
    accentColor: '#2e86c1',
    clinicId: 'kcc-faridabad',
    consultationType: 'offline',
    phone: '+919818235613',
    email: 'info@kidneycarecentre.in',
    address: 'Faridabad, Haryana',
    tagline: 'Expert Kidney Care with 20+ Years Experience',
    allowedDomains: ['kidneycarecentre.in', 'www.kidneycarecentre.in'],
    showClinicSelector: false,
    showLocationToggle: true,
    showPricing: true,
    fee: 500,
    feeCurrency: 'INR',
  },
  online: {
    id: 'online',
    name: 'Online Nephrologist',
    domain: 'onlinenephrologist.com',
    primaryColor: '#0A75BB',
    secondaryColor: '#ffffff',
    accentColor: '#085a94',
    clinicId: 'online',
    consultationType: 'online',
    phone: '+919818235613',
    email: 'info@onlinenephrologist.com',
    address: 'Online',
    tagline: 'Consult a Nephrologist from Anywhere',
    allowedDomains: ['onlinenephrologist.com', 'www.onlinenephrologist.com'],
    showClinicSelector: true,
    showLocationToggle: true,
    showPricing: true,
    fee: 500,
    feeCurrency: 'INR',
  },
  saket: {
    id: 'saket',
    name: 'Kidney Care Centre - Saket',
    domain: 'kidneycarecentre.in',
    primaryColor: '#1a5276',
    secondaryColor: '#f0f4f8',
    accentColor: '#2e86c1',
    clinicId: 'kcc-saket',
    consultationType: 'offline',
    phone: '+919818235688',
    email: 'saket@kidneycarecentre.in',
    address: 'Saket, New Delhi',
    tagline: 'Expert Kidney Care in South Delhi',
    allowedDomains: ['kidneycarecentre.in', 'www.kidneycarecentre.in'],
    showClinicSelector: false,
    showLocationToggle: true,
    showPricing: true,
    fee: 1200,
    feeCurrency: 'INR',
  },
  psri: {
    id: 'psri',
    name: 'PSRI Hospital',
    domain: 'psrihospital.com',
    primaryColor: '#0066cc',
    secondaryColor: '#f8f9fa',
    accentColor: '#004999',
    clinicId: 'psri-delhi',
    consultationType: 'hospital',
    phone: '+919818235613',
    email: 'nephrology@psrihospital.com',
    address: 'PSRI Hospital, Delhi',
    tagline: 'Multi-Specialty Hospital with Advanced Kidney Care',
    allowedDomains: ['psrihospital.com', 'www.psrihospital.com'],
    showClinicSelector: false,
    showLocationToggle: false,
    showPricing: true,
    fee: 1000,
    feeCurrency: 'INR',
  },
  international: {
    id: 'international',
    name: 'Online Nephrologist - International',
    domain: 'onlinenephrologist.com',
    primaryColor: '#0A75BB',
    secondaryColor: '#ffffff',
    accentColor: '#085a94',
    clinicId: 'online-intl',
    consultationType: 'online_intl',
    phone: '+919818235613',
    email: 'info@onlinenephrologist.com',
    address: 'Online',
    tagline: 'International Video Consultation',
    allowedDomains: ['onlinenephrologist.com', 'www.onlinenephrologist.com'],
    showClinicSelector: false,
    showLocationToggle: false,
    showPricing: true,
    fee: 25,
    feeCurrency: 'USD',
  },
};

export function getSiteConfig(siteId: string): SiteConfig | null {
  return SITE_CONFIGS[siteId] || null;
}

export function getSiteConfigByDomain(domain: string): SiteConfig | null {
  return Object.values(SITE_CONFIGS).find(
    (config) => config.domain === domain || config.allowedDomains.includes(domain)
  ) || null;
}

export function getAllSiteIds(): string[] {
  return Object.keys(SITE_CONFIGS);
}

export function getSiteClinicMapping(siteId: string): string {
  const config = SITE_CONFIGS[siteId];
  return config?.clinicId || 'online';
}
