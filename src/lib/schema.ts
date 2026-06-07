import type { BreadcrumbItem } from './types';
import { LINE_URL, PHONE_DISPLAY, PHONE_E164, SITE_NAME, SITE_URL, SITE_TAGLINE, FACEBOOK_URL, GOOGLE_MAPS_URL } from './constants';

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function orgJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: SITE_TAGLINE,
    sameAs: [LINE_URL, FACEBOOK_URL, GOOGLE_MAPS_URL],
    foundingDate: '2018-03-15',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: PHONE_E164,
      contactType: 'customer service',
      areaServed: 'TH',
      availableLanguage: ['Thai', 'English']
    }
  };
}

export function localBusinessJsonLd() {
  const isanProvinces = [
    'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา', 
    'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร', 
    'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์', 
    'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี'
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: `${SITE_NAME} — รับซื้อไอทีและอุปกรณ์สำนักงานภาคอีสาน`,
    image: `${SITE_URL}/favicon.svg`,
    url: SITE_URL,
    telephone: PHONE_E164,
    priceRange: '฿฿',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '99/9 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น',
      addressLocality: 'เมืองขอนแก่น',
      addressRegion: 'Northeast (Isan)',
      postalCode: '40000',
      addressCountry: 'TH'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 16.4322,
      longitude: 102.8236
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        opens: '08:00',
        closes: '23:00'
      }
    ],
    areaServed: isanProvinces.map((prov) => ({
      '@type': 'AdministrativeArea',
      name: prov
    })),
    sameAs: [LINE_URL, FACEBOOK_URL, GOOGLE_MAPS_URL],
    parentOrganization: { '@id': `${SITE_URL}/#organization` }
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'th-TH'
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[] = []) {
  const safeItems = Array.isArray(items)
    ? items.filter((item) => item?.name && item?.href)
    : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: safeItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href)
    }))
  };
}

export function webPageJsonLd(params: {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  about?: string[];
  author?: string;
}) {
  const about = (params.about ?? [])
    .filter(Boolean)
    .map((item) => ({
      '@type': 'Thing',
      name: item
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.url),
    dateModified: params.dateModified,
    inLanguage: 'th-TH',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    author: {
      '@type': 'Organization',
      name: params.author ?? SITE_NAME
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(about.length ? { about } : {})
  };
}

export function serviceJsonLd(params: { name: string; description: string; url: string; areas?: string[] }) {
  const areaServed = params.areas && params.areas.length > 0
    ? params.areas.map(area => ({ '@type': 'AdministrativeArea', name: area }))
    : { '@type': 'Country', name: 'Thailand' };

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.url),
    serviceType: params.name,
    provider: { '@id': `${SITE_URL}/#localbusiness` },
    areaServed: areaServed
  };
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  };
}

export function articleJsonLd(params: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    url: absoluteUrl(params.url),
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author: {
      '@type': 'Organization',
      name: params.author ?? SITE_NAME
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(params.url) },
    inLanguage: 'th-TH'
  };
}

export function phoneDisplayForTel(): string {
  return PHONE_DISPLAY.replace(/\s/g, '');
}
