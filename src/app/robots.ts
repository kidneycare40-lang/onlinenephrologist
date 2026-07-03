import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/emr/', '/api/'],
      },
    ],
    sitemap: 'https://onlinenephrologist.com/sitemap.xml',
  };
}
