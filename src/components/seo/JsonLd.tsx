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
    url: 'https://www.kidneycarecentre.in',
    logo: 'https://www.kidneycarecentre.in/images/kidney_logo.png',
    image: 'https://www.kidneycarecentre.in/images/dr-rajesh-goel.png',
    description: 'India leading kidney care and nephrology platform for CKD, dialysis, kidney transplant treatment.',
    telephone: '+919818235613',
    email: 'info@kidneycarecentre.in',
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
      {
        '@type': 'MedicalProcedure',
        name: 'Dialysis',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Kidney Transplant',
      },
      {
        '@type': 'MedicalTherapy',
        name: 'CKD Management',
      },
    ],
    physician: {
      '@type': 'Physician',
      name: 'Dr Rajesh Goel',
      medicalSpecialty: 'Nephrology',
      qualifications: 'MBBS, DNB Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine',
    },
    sameAs: [
      'https://www.facebook.com/kidneycarecentre',
      'https://www.twitter.com/kidneycarecentre',
      'https://www.instagram.com/kidneycarecentre',
      'https://www.youtube.com/kidneycarecentre',
    ],
  };

  return <JsonLd data={schema} />;
}

export function PhysicianSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr Rajesh Goel',
    image: 'https://www.kidneycarecentre.in/images/dr-rajesh-goel.png',
    url: 'https://www.kidneycarecentre.in/dr-rajesh-goel',
    telephone: '+919818235688',
    email: '2311.rajesh@gmail.com',
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
    image: image || 'https://www.kidneycarecentre.in/images/og-default.jpg',
    publisher: {
      '@type': 'Organization',
      name: 'Kidney Care Centre',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.kidneycarecentre.in/images/logo.png',
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
    image: image || 'https://www.kidneycarecentre.in/images/og-default.jpg',
    url,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: author || 'Dr Rajesh Goel',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kidney Care Centre',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.kidneycarecentre.in/images/logo.png',
      },
    },
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
    url: `https://www.kidneycarecentre.in/nephrologist-in-${city.toLowerCase().replace(/\s+/g, '-')}`,
    telephone: '+919818235613',
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