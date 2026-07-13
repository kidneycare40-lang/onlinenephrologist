import { SITE_CONFIG } from '@/lib/constants';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function MedicalOrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Kidney Care Centre',
    alternateName: 'KCC',
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    description: 'India leading kidney care and nephrology platform for CKD, dialysis, kidney transplant treatment.',
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    medicalSpecialty: 'Nephrology',
    availableService: [
      { '@type': 'MedicalProcedure', name: 'Dialysis' },
      { '@type': 'MedicalProcedure', name: 'Kidney Transplant' },
      { '@type': 'MedicalTherapy', name: 'CKD Management' },
    ],
    physician: {
      '@type': 'Physician',
      name: 'Dr Rajesh Goel',
      medicalSpecialty: 'Nephrology',
      qualifications: 'MBBS, DNB Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine',
    },
    sameAs: SITE_CONFIG.sameAs,
  };

  return <JsonLd data={schema} />;
}

export function PhysicianSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr Rajesh Goel',
    image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    url: `${SITE_CONFIG.url}/dr-rajesh-goel`,
    telephone: SITE_CONFIG.emergencyPhone,
    email: SITE_CONFIG.email,
    medicalSpecialty: 'Nephrology',
    qualifications: 'MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine',
    availableService: [
      { '@type': 'MedicalProcedure', name: 'Dialysis' },
      { '@type': 'MedicalProcedure', name: 'Kidney Transplant' },
      { '@type': 'MedicalTherapy', name: 'CKD Management' },
    ],
    hospitalAffiliation: {
      '@type': 'Hospital',
      name: 'PSRI Hospital, New Delhi',
    },
    worksFor: {
      '@type': 'Hospital',
      name: 'PSRI Hospital, New Delhi',
    },
  };

  return <JsonLd data={schema} />;
}

export function WebPageSchema({
  title,
  description,
  url,
  image,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    image: image || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
  };

  return <JsonLd data={schema} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={schema} />;
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={schema} />;
}

export function ArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    url,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: author || SITE_CONFIG.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
  };

  return <JsonLd data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/conditions?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={schema} />;
}

export function BreadcrumbListSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={schema} />;
}

export function LocalBusinessSchema({
  city,
  state,
}: {
  city: string;
  state: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: `Kidney Care Centre - ${city}`,
    description: `Best nephrologist in ${city}, ${state}. Expert kidney care treatment by Dr Rajesh Goel.`,
    url: `${SITE_CONFIG.url}/nephrologist-in-${city.toLowerCase().replace(/\s+/g, '-')}`,
    telephone: SITE_CONFIG.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    medicalSpecialty: 'Nephrology',
    physician: {
      '@type': 'Physician',
      name: 'Dr Rajesh Goel',
      medicalSpecialty: 'Nephrology',
    },
  };

  return <JsonLd data={schema} />;
}

export function HowToSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Book an Online Kidney Consultation with Dr Rajesh Goel',
    description: 'Steps to book an online video consultation with Dr Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician in Delhi.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Book Appointment',
        text: 'Click on "Book Appointment" on the website or send a message on WhatsApp at +91 9818235613. Choose online video consultation.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Share Medical Reports',
        text: 'Upload or WhatsApp your recent blood tests, urine tests, kidney function reports, and current medication list.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Confirm Your Slot',
        text: 'Choose a convenient time slot. Pay the consultation fee online. You will receive a confirmation with video call link.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Video Consultation',
        text: 'Join the video call at the scheduled time. Dr Goel will review your reports, discuss your condition, and provide a treatment plan.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Receive Prescription',
        text: 'After consultation, you will receive a detailed digital prescription and treatment plan via WhatsApp and email.',
      },
    ],
  };

  return <JsonLd data={schema} />;
}