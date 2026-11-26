import { connectDB } from '../server/config/db.js';
import { generateSitemapXml } from '../server/utils/seoRenderer.js';
import { Product } from '../server/models/Product.js';
import { Category } from '../server/models/Category.js';
import { Brand } from '../server/models/Brand.js';

export default async function handler(req, res) {
  // Enforce XML Content-Type header with UTF-8 charset, real-time freshness, and prevent sitemap indexing in SERP
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, follow');

  // Security Headers
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  try {
    await connectDB();
    const [products, brands, categories] = await Promise.all([
      Product.find({ isDeleted: { $ne: true }, status: { $ne: 'inactive' } }).lean().catch(() => []),
      Brand.find({ isDeleted: { $ne: true } }).lean().catch(() => []),
      Category.find({ isDeleted: { $ne: true } }).lean().catch(() => []),
    ]);

    const xml = generateSitemapXml(products, brands, categories);
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating dynamic sitemap in serverless function:', err);
    const fallbackXml = generateSitemapXml();
    return res.status(200).send(fallbackXml);
  }
}
