import { connectDB } from '../server/config/db.js';
import { generateSitemapXml } from '../server/utils/seoRenderer.js';
import { Product } from '../server/models/Product.js';
import { Category } from '../server/models/Category.js';
import { Brand } from '../server/models/Brand.js';

export default async function handler(req, res) {
  // Enforce XML Content-Type header with UTF-8 charset and real-time freshness
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

  try {
    await connectDB();
    const [products, brands, categories] = await Promise.all([
      Product.find().lean().catch(() => []),
      Brand.find().lean().catch(() => []),
      Category.find().lean().catch(() => []),
    ]);

    const xml = generateSitemapXml(products, brands, categories);
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating dynamic sitemap in serverless function:', err);
    const fallbackXml = generateSitemapXml();
    return res.status(200).send(fallbackXml);
  }
}
