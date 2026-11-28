import { toSlug, createSlug, isCleanSlug } from './slug.js';
import { INITIAL_PRODUCTS, INITIAL_BRANDS, INITIAL_CATEGORIES } from '../../src/data/initialData.js';

const SITE_URL = 'https://haveitall.lk';

const escapeHtml = (str = '') => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Rewrites any external image URL to use HaveItAll's first-party image proxy endpoint
 */
export const toProxiedImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) return `${SITE_URL}/haveitall-logo.png`;
  const trimmed = url.trim();
  // Do NOT return raw base64 data URIs for public image discovery or schema
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return `${SITE_URL}/haveitall-logo.png`;
  }
  if (trimmed.startsWith(SITE_URL)) return trimmed;
  if (trimmed.startsWith('/')) return `${SITE_URL}${trimmed}`;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `${SITE_URL}/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }
  return `${SITE_URL}/haveitall-logo.png`;
};

/**
 * Generates SEO-compliant robots.txt content with AI search engine declarations
 */
export const generateRobotsTxt = () => {
  return `# HaveItAll.lk - 100% Authentic Skincare, Supplements & Cosmetics in Sri Lanka
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /vendor
Disallow: /vendor/
Disallow: /dropshipper
Disallow: /dropshipper/
Disallow: /api/

# Explicitly Allow AI Search Engines and Conversational Discovery Agents
User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /dropshipper
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /dropshipper
Disallow: /api/

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /dropshipper
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /dropshipper
Disallow: /api/

User-agent: Applebot-Extended
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /dropshipper
Disallow: /api/

User-agent: Google-Extended
Allow: /

# Restrict Aggressive Model-Training Scrapers
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml
`;
};

const escapeXml = (str = '') => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const normalizeString = (str = '') => {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

/**
 * Combines DB products/brands/categories with initialData fallback and generates XML sitemap
 */
export const generateSitemapXml = (dbProducts = [], dbBrands = [], dbCategories = []) => {
  const today = new Date().toISOString().split('T')[0];
  const formatDate = (date) => {
    if (!date) return today;
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}
    return today;
  };

  const isEligibleProduct = (p) => {
    if (!p) return false;
    if (p.isDeleted === true || p.status === 'inactive') return false;
    const name = p.name || p.title || '';
    if (!name || name.toLowerCase().includes('test item') || name.toLowerCase().includes('test product')) return false;
    return true;
  };

  const productMap = new Map();
  // If active database products are available, exclusively use them so deleted or orphaned records are never included in sitemap.
  const sourceProducts = (Array.isArray(dbProducts) && dbProducts.length > 0)
    ? dbProducts
    : INITIAL_PRODUCTS;

  sourceProducts.filter(isEligibleProduct).forEach(p => {
    const slug = p.slug || toSlug(p.name || p.title);
    if (slug) {
      productMap.set(slug, {
        slug,
        name: p.name || p.title,
        brand: p.brand || 'HaveItAll',
        image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
        updatedAt: p.updatedAt || p.createdAt || today
      });
    }
  });

  const brandMap = new Map();
  const sourceBrands = (Array.isArray(dbBrands) && dbBrands.length > 0)
    ? dbBrands
    : INITIAL_BRANDS;

  sourceBrands.filter(b => b && b.isDeleted !== true).forEach(b => {
    const slug = b.slug || toSlug(b.name);
    if (slug) {
      brandMap.set(slug, {
        slug,
        name: b.name,
        updatedAt: b.updatedAt || b.createdAt || today
      });
    }
  });

  // Auto-discover any active brands defined on active products
  sourceProducts.filter(isEligibleProduct).forEach(p => {
    if (p.brand && typeof p.brand === 'string') {
      const slug = toSlug(p.brand);
      if (slug && !brandMap.has(slug)) {
        brandMap.set(slug, {
          slug,
          name: p.brand,
          updatedAt: p.updatedAt || p.createdAt || today
        });
      }
    }
  });

  const categoryMap = new Map();
  const sourceCategories = (Array.isArray(dbCategories) && dbCategories.length > 0)
    ? dbCategories
    : INITIAL_CATEGORIES;

  sourceCategories.filter(c => c && c.isDeleted !== true).forEach(c => {
    const slug = c.slug || toSlug(c.name);
    if (slug) {
      categoryMap.set(slug, {
        slug,
        name: c.name,
        updatedAt: c.updatedAt || c.createdAt || today
      });
    }
  });

  // Auto-discover any active categories defined on active products
  sourceProducts.filter(isEligibleProduct).forEach(p => {
    if (p.category && typeof p.category === 'string') {
      const slug = toSlug(p.category);
      if (slug && !categoryMap.has(slug)) {
        categoryMap.set(slug, {
          slug,
          name: p.category,
          updatedAt: p.updatedAt || p.createdAt || today
        });
      }
    }
  });

  const staticUrls = [
    { loc: `${SITE_URL}/`, lastmod: today, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_URL}/shop`, lastmod: today, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/cosmetics`, lastmod: today, priority: '0.8', changefreq: 'daily' },
    { loc: `${SITE_URL}/appliances`, lastmod: today, priority: '0.8', changefreq: 'daily' },
    { loc: `${SITE_URL}/fashion`, lastmod: today, priority: '0.8', changefreq: 'daily' },
    { loc: `${SITE_URL}/brands`, lastmod: today, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/order-tracking`, lastmod: today, priority: '0.5', changefreq: 'monthly' },
    { loc: `${SITE_URL}/faq`, lastmod: today, priority: '0.5', changefreq: 'monthly' },
    { loc: `${SITE_URL}/contact`, lastmod: today, priority: '0.5', changefreq: 'monthly' },
  ];

  const categoryUrls = Array.from(categoryMap.values()).map(cat => ({
    loc: `${SITE_URL}/category/${cat.slug || toSlug(cat.name)}`,
    lastmod: formatDate(cat.updatedAt),
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const brandUrls = Array.from(brandMap.values()).map(brand => ({
    loc: `${SITE_URL}/brand/${brand.slug || toSlug(brand.name)}`,
    lastmod: formatDate(brand.updatedAt),
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const productUrls = Array.from(productMap.values()).map(product => {
    const canonicalSlug = product.slug || toSlug(product.name);
    const validImage = (product.image && typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('/')))
      ? {
          loc: toProxiedImageUrl(product.image),
          title: `${product.name} - ${product.brand || 'HaveItAll'} Sri Lanka`
        }
      : null;

    return {
      loc: `${SITE_URL}/product/${canonicalSlug}`,
      lastmod: formatDate(product.updatedAt),
      priority: '0.9',
      changefreq: 'daily',
      image: validImage
    };
  });

  const allUrls = [...staticUrls, ...categoryUrls, ...brandUrls, ...productUrls];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  allUrls.forEach(u => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
    xml += `    <lastmod>${u.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    if (u.image && u.image.loc) {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escapeXml(u.image.loc)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(u.image.title || '')}</image:title>\n`;
      xml += '    </image:image>\n';
    }
    xml += '  </url>\n';
  });
  xml += '</urlset>\n';

  return xml;
};

export const findProduct = (idOrSlug, dbProducts = []) => {
  if (!idOrSlug) return null;
  const target = String(idOrSlug).trim().toLowerCase();
  const clean = toSlug(target);

  // Search in DB products first if provided
  let found = dbProducts.find(p =>
    (p.slug && p.slug.toLowerCase() === target) ||
    (p.slug && p.slug.toLowerCase() === clean) ||
    String(p.id).toLowerCase() === target ||
    String(p._id) === target ||
    toSlug(p.name || p.title) === clean ||
    p.name?.toLowerCase() === target
  );

  if (found) return found;

  // Search in INITIAL_PRODUCTS
  return INITIAL_PRODUCTS.find(p =>
    (p.slug && p.slug.toLowerCase() === target) ||
    (p.slug && p.slug.toLowerCase() === clean) ||
    String(p.id).toLowerCase() === target ||
    toSlug(p.name || p.title) === clean ||
    p.name?.toLowerCase() === target
  );
};

/**
 * Finds a brand by slug, ID, or name with space-normalized matching and product auto-discovery
 */
export const findBrand = (nameOrSlug, dbBrands = [], dbProducts = []) => {
  if (!nameOrSlug) return null;
  const target = String(nameOrSlug).trim().toLowerCase();
  const clean = toSlug(target);
  const normTarget = normalizeString(target);

  let found = dbBrands.find(b =>
    (b.slug && b.slug.toLowerCase() === target) ||
    (b.slug && b.slug.toLowerCase() === clean) ||
    (b.slug && normalizeString(b.slug) === normTarget) ||
    (b.name && normalizeString(b.name) === normTarget) ||
    String(b.id).toLowerCase() === target ||
    String(b._id) === target ||
    toSlug(b.name) === clean ||
    b.name?.toLowerCase() === target
  );

  if (found) return found;

  found = INITIAL_BRANDS.find(b =>
    (b.slug && b.slug.toLowerCase() === target) ||
    (b.slug && b.slug.toLowerCase() === clean) ||
    (b.slug && normalizeString(b.slug) === normTarget) ||
    (b.name && normalizeString(b.name) === normTarget) ||
    String(b.id).toLowerCase() === target ||
    toSlug(b.name) === clean ||
    b.name?.toLowerCase() === target
  );

  if (found) return found;

  // Auto-discover brand from products in DB or initial data
  const allProds = [...dbProducts, ...INITIAL_PRODUCTS];
  const prodWithBrand = allProds.find(p =>
    p.brand && (
      normalizeString(p.brand) === normTarget ||
      toSlug(p.brand) === clean ||
      p.brand.toLowerCase() === target
    )
  );

  if (prodWithBrand) {
    const brandName = prodWithBrand.brand;
    return {
      id: `brand-${toSlug(brandName)}`,
      name: brandName,
      slug: toSlug(brandName),
      description: `Shop 100% authentic ${brandName} beauty, skincare, and cosmetics online in Sri Lanka at HaveItAll.lk with islandwide cash on delivery.`,
      logo: '',
      banner: ''
    };
  }

  return null;
};

/**
 * Finds a category by slug, ID, or name with space-normalized matching and product auto-discovery
 */
export const findCategory = (nameOrSlug, dbCategories = [], dbProducts = []) => {
  if (!nameOrSlug) return null;
  const target = String(nameOrSlug).trim().toLowerCase();
  const clean = toSlug(target);
  const normTarget = normalizeString(target);

  let found = dbCategories.find(c =>
    (c.slug && c.slug.toLowerCase() === target) ||
    (c.slug && c.slug.toLowerCase() === clean) ||
    (c.slug && normalizeString(c.slug) === normTarget) ||
    (c.name && normalizeString(c.name) === normTarget) ||
    String(c.id).toLowerCase() === target ||
    String(c._id) === target ||
    toSlug(c.name) === clean ||
    c.name?.toLowerCase() === target
  );

  if (found) return found;

  found = INITIAL_CATEGORIES.find(c =>
    (c.slug && c.slug.toLowerCase() === target) ||
    (c.slug && c.slug.toLowerCase() === clean) ||
    (c.slug && normalizeString(c.slug) === normTarget) ||
    (c.name && normalizeString(c.name) === normTarget) ||
    String(c.id).toLowerCase() === target ||
    toSlug(c.name) === clean ||
    c.name?.toLowerCase() === target
  );

  if (found) return found;

  // Auto-discover category from products in DB or initial data
  const allProds = [...dbProducts, ...INITIAL_PRODUCTS];
  const prodWithCat = allProds.find(p =>
    (p.category && (normalizeString(p.category) === normTarget || toSlug(p.category) === clean)) ||
    (Array.isArray(p.subCategories) && p.subCategories.some(sub => normalizeString(sub) === normTarget || toSlug(sub) === clean))
  );

  if (prodWithCat) {
    const catName = prodWithCat.category || clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      id: `cat-${toSlug(catName)}`,
      name: catName,
      slug: toSlug(catName),
      description: `Buy authentic ${catName} products online in Sri Lanka at HaveItAll.lk with islandwide delivery.`
    };
  }

  return null;
};

/**
 * Injects or replaces SEO metadata, OpenGraph, Canonical, Schema.org JSON-LD and pre-rendered semantic HTML
 */
export const renderSSRHtml = (pathname, baseHtml, { products = [], brands = [], categories = [] } = {}) => {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';

  // 1. Check legacy typo department redirects (HTTP 301)
  if (cleanPath === '/cosmatics' || cleanPath.startsWith('/cosmatics/')) {
    return { redirect: cleanPath.replace('/cosmatics', '/cosmetics'), status: 301 };
  }
  if (cleanPath === '/applieances' || cleanPath.startsWith('/applieances/')) {
    return { redirect: cleanPath.replace('/applieances', '/appliances'), status: 301 };
  }
  if (cleanPath === '/suppliments' || cleanPath.startsWith('/suppliments/')) {
    return { redirect: cleanPath.replace('/suppliments', '/supplements'), status: 301 };
  }

  // 2. Check Product Detail Page
  const productMatch = cleanPath.match(/^\/product\/(.+)$/);
  if (productMatch) {
    const rawParam = decodeURIComponent(productMatch[1]);
    const product = findProduct(rawParam, products);

    if (!product) {
      const notFoundTitle = 'Product Not Found (404) | HaveItAll.lk';
      const notFoundDesc = 'The requested product could not be found or is no longer available on HaveItAll.lk. Explore 100% authentic skincare, cosmetics, and supplements in Sri Lanka.';
      let html = replaceHeadSeo(baseHtml, {
        title: notFoundTitle,
        description: notFoundDesc,
        canonicalUrl: null,
        robots: 'noindex, nofollow'
      });
      const notFoundContent = `
        <main class="ssr-404-container" style="max-width:800px;margin:80px auto;padding:32px 16px;text-align:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
          <h1 style="font-size:32px;font-weight:800;margin-bottom:12px;color:#0f172a;">Product Not Found (404)</h1>
          <p style="font-size:16px;color:#64748b;margin-bottom:24px;line-height:1.5;">The product you are looking for does not exist or has been removed from our catalog.</p>
          <a href="/shop" style="display:inline-block;padding:12px 28px;background:#00838f;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;box-shadow:0 4px 12px rgba(0,131,143,0.25);">Browse All Products</a>
        </main>
      `;
      html = html.replace('<div id="root"></div>', `<div id="root">${notFoundContent}</div>`);
      return { html, status: 404 };
    }

    const canonicalSlug = product.slug || toSlug(product.name || product.title || product.id);
    // If param is numeric, encoded, or differs from canonical slug -> 301 Redirect
    if (rawParam !== canonicalSlug) {
      return { redirect: `/product/${canonicalSlug}`, status: 301 };
    }

    const formattedPrice = Number(product.price || 0).toLocaleString('en-LK');
    const brandName = product.brand || 'HaveItAll';
    const shortDesc = (product.description || '').replace(/\s+/g, ' ').slice(0, 160).trim() || `${product.name} available at HaveItAll.lk`;
    const title = (product.seoTitle && product.seoTitle.startsWith(product.name))
      ? product.seoTitle
      : `${product.name} | Buy Online in Sri Lanka | HaveItAll.lk`;
    const description = product.seoDescription || `${shortDesc} - Rs. ${formattedPrice}. 100% Authentic ${brandName} with Islandwide Cash on Delivery in Sri Lanka at HaveItAll.lk.`;
    const canonicalUrl = `${SITE_URL}/product/${canonicalSlug}`;
    const rawImage = product.image || (Array.isArray(product.images) && product.images[0]) || '';
    const imageUrl = toProxiedImageUrl(rawImage);
    const allImages = (Array.isArray(product.images) && product.images.length > 0)
      ? product.images.map(img => toProxiedImageUrl(img))
      : [imageUrl];
    const formulation = product.formulation || product.fabric || 'Standard Formulation';

    const validImages = allImages.filter(img => img && !img.startsWith('data:'));
    const safeImages = validImages.length > 0 ? validImages : [`${SITE_URL}/haveitall-logo.png`];

    const schemaOrg = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "name": product.name,
          "image": safeImages,
          "description": product.description || description,
          "sku": String(product.barcode || product.id || canonicalSlug),
          "brand": {
            "@type": "Brand",
            "name": brandName
          },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "LKR",
            "price": Number(product.price || 0),
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "HaveItAll.lk"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "350",
                "currency": "LKR"
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "LK"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 4,
                  "unitCode": "DAY"
                }
              }
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "LK",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 7,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/FreeReturn"
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Shop",
              "item": `${SITE_URL}/shop`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": brandName,
              "item": `${SITE_URL}/brand/${toSlug(brandName)}`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": product.name,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    const semanticContent = `
      <main class="ssr-product-container" style="max-width:1200px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt;
          <a href="/shop" style="color:#00838f;text-decoration:none;">Shop</a> &gt;
          <a href="/brand/${toSlug(brandName)}" style="color:#00838f;text-decoration:none;">${escapeHtml(brandName)}</a> &gt;
          <span>${escapeHtml(product.name)}</span>
        </nav>
        <article style="display:flex;flex-wrap:wrap;gap:32px;">
          <div style="flex:1;min-width:300px;max-width:480px;">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)} - ${escapeHtml(brandName)} Sri Lanka" style="width:100%;height:auto;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);" />
          </div>
          <div style="flex:1;min-width:320px;">
            <div style="font-size:14px;color:#00838f;font-weight:700;text-transform:uppercase;margin-bottom:6px;">
              <a href="/brand/${toSlug(brandName)}" style="color:#00838f;text-decoration:none;">${escapeHtml(brandName)}</a>
            </div>
            <h1 style="font-size:28px;font-weight:800;line-height:1.25;margin:0 0 12px 0;color:#0f172a;">${escapeHtml(product.name)}</h1>
            <div style="font-size:26px;font-weight:800;color:#0f172a;margin-bottom:12px;">
              LKR ${formattedPrice}
              <span style="font-size:14px;font-weight:600;color:#16a34a;margin-left:8px;">(In Stock - 100% Authentic)</span>
            </div>
            <div style="background:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#0f766e;">
              <strong>Product Form / Formulation:</strong> ${escapeHtml(formulation)}
            </div>
            <div style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:24px;">
              <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">About This Product</h2>
              <p>${escapeHtml(product.description || '')}</p>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:20px;">
              <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">Why Buy from HaveItAll.lk?</h3>
              <p style="font-size:13px;color:#475569;margin:0 0 10px 0;line-height:1.5;">HaveItAll.lk is a verified Sri Lankan retailer guaranteeing 100% authentic ${escapeHtml(brandName)} products. We offer islandwide Cash on Delivery (COD) across all 25 districts with delivery in 2 to 4 business days.</p>
              <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">How does Cash on Delivery work?</h3>
              <p style="font-size:13px;color:#475569;margin:0;line-height:1.5;">Simply place your order online and select Cash on Delivery. Pay the delivery courier in cash upon receiving and inspecting your package at your doorstep.</p>
            </div>
          </div>
        </article>
      </main>
    `;

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      imageUrl,
      type: 'product',
      price: product.price,
      schemaOrg
    });

    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 3. Check Brand Page (/brand/:brandSlug)
  const brandMatch = cleanPath.match(/^\/brand\/(.+)$/);
  if (brandMatch) {
    const rawParam = decodeURIComponent(brandMatch[1]);
    const brand = findBrand(rawParam, brands, products);

    if (!brand) {
      const notFoundTitle = 'Brand Not Found (404) | HaveItAll.lk';
      const notFoundDesc = 'The requested brand could not be found or has no active products on HaveItAll.lk. Browse our full range of 100% authentic brands in Sri Lanka.';
      let html = replaceHeadSeo(baseHtml, {
        title: notFoundTitle,
        description: notFoundDesc,
        canonicalUrl: null,
        robots: 'noindex, nofollow'
      });
      const notFoundContent = `
        <main class="ssr-404-container" style="max-width:800px;margin:80px auto;padding:32px 16px;text-align:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
          <h1 style="font-size:32px;font-weight:800;margin-bottom:12px;color:#0f172a;">Brand Not Found (404)</h1>
          <p style="font-size:16px;color:#64748b;margin-bottom:24px;line-height:1.5;">The brand you are looking for does not exist or has been removed from our catalog.</p>
          <a href="/brands" style="display:inline-block;padding:12px 28px;background:#00838f;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;box-shadow:0 4px 12px rgba(0,131,143,0.25);">Browse All Brands</a>
        </main>
      `;
      html = html.replace('<div id="root"></div>', `<div id="root">${notFoundContent}</div>`);
      return { html, status: 404 };
    }

    const canonicalSlug = brand.slug || toSlug(brand.name);
    // If param is uppercase, encoded, or differs from canonical slug -> 301 Redirect
    if (rawParam !== canonicalSlug && normalizeString(rawParam) === normalizeString(canonicalSlug)) {
      return { redirect: `/brand/${canonicalSlug}`, status: 301 };
    }

    // Filter all active published products belonging to this brand (space-normalized match)
    const normBrandName = normalizeString(brand.name);
    const normBrandSlug = normalizeString(canonicalSlug);
    const brandProducts = products.filter(p => {
      if (!p || p.isDeleted === true || p.status === 'inactive') return false;
      const pBrand = p.brand || '';
      const normPBrand = normalizeString(pBrand);
      return (
        normPBrand === normBrandName ||
        normPBrand === normBrandSlug ||
        toSlug(pBrand) === canonicalSlug ||
        pBrand.toLowerCase() === brand.name.toLowerCase()
      );
    });

    const formattedCount = brandProducts.length;
    const title = `Buy ${brand.name} Products in Sri Lanka | 100% Authentic | HaveItAll.lk`;
    const description = `Shop 100% authentic ${brand.name} products in Sri Lanka at HaveItAll.lk. Showing ${formattedCount} verified products with islandwide Cash on Delivery (COD) & fast delivery guaranteed.`;
    const canonicalUrl = `${SITE_URL}/brand/${canonicalSlug}`;
    const rawBrandImage = brand.logo || (brandProducts[0]?.image) || '';
    const imageUrl = toProxiedImageUrl(rawBrandImage);
    const brandLogoUrl = brand.logo ? toProxiedImageUrl(brand.logo) : '';

    // ItemList schema elements for every brand product
    const itemListElements = brandProducts.map((p, idx) => {
      const pSlug = p.slug || toSlug(p.name || p.title || p.id);
      const pUrl = `${SITE_URL}/product/${pSlug}`;
      const pRawImage = p.image || (Array.isArray(p.images) && p.images[0]) || '';
      const pImage = toProxiedImageUrl(pRawImage);
      return {
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Product",
          "name": p.name || p.title,
          "url": pUrl,
          "image": pImage,
          "description": p.description ? p.description.slice(0, 160) : `${p.name} by ${brand.name}`,
          "sku": String(p.barcode || p.id || pSlug),
          "brand": {
            "@type": "Brand",
            "name": brand.name
          },
          "offers": {
            "@type": "Offer",
            "url": pUrl,
            "priceCurrency": "LKR",
            "price": Number(p.price || 0),
            "availability": p.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        }
      };
    });

    const schemaOrg = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": canonicalUrl,
          "name": title,
          "description": description,
          "url": canonicalUrl,
          "numberOfItems": formattedCount,
          "about": {
            "@type": "Brand",
            "name": brand.name,
            "description": brand.description || description,
            "logo": brandLogoUrl || imageUrl
          },
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": formattedCount,
            "itemListElement": itemListElements
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Brands",
              "item": `${SITE_URL}/brands`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": brand.name,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    // Pre-rendered HTML product cards
    const productCardsHtml = brandProducts.length > 0
      ? brandProducts.map(p => {
          const pSlug = p.slug || toSlug(p.name || p.title || p.id);
          const pUrl = `/product/${pSlug}`;
          const pRawImage = p.image || (Array.isArray(p.images) && p.images[0]) || '';
          const pImage = toProxiedImageUrl(pRawImage);
          const formattedPrice = Number(p.price || 0).toLocaleString('en-LK');
          const inStock = p.inStock !== false;
          return `
            <article class="ssr-product-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
              <a href="${pUrl}" style="text-decoration:none;color:inherit;display:block;">
                <div style="width:100%;aspect-ratio:3/4;background:#f8fafc;overflow:hidden;position:relative;">
                  <img src="${escapeHtml(pImage)}" alt="${escapeHtml(p.name)} - ${escapeHtml(brand.name)} Sri Lanka" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
                </div>
                <div style="padding:14px;">
                  <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#00838f;margin-bottom:4px;">${escapeHtml(p.category || brand.name)}</div>
                  <h2 style="font-size:14px;font-weight:700;line-height:1.35;margin:0 0 8px 0;color:#0f172a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.name)}</h2>
                  <div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:4px;">LKR ${formattedPrice}</div>
                  <div style="font-size:12px;font-weight:600;color:${inStock ? '#16a34a' : '#dc2626'};">${inStock ? 'In Stock (100% Authentic)' : 'Out of Stock'}</div>
                </div>
              </a>
            </article>
          `;
        }).join('')
      : `
        <div style="grid-column:1/-1;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:48px 24px;text-align:center;">
          <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">No products currently listed under ${escapeHtml(brand.name)}</h3>
          <p style="font-size:14px;color:#64748b;margin-bottom:16px;">Browse our full catalog of authentic skincare and cosmetics.</p>
          <a href="/shop" style="display:inline-block;padding:10px 24px;background:#00838f;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;">Explore Shop</a>
        </div>
      `;

    const semanticContent = `
      <main class="ssr-brand-container" style="max-width:1280px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt;
          <a href="/brands" style="color:#00838f;text-decoration:none;">Brands</a> &gt;
          <span>${escapeHtml(brand.name)}</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
            ${brandLogoUrl ? `<img src="${escapeHtml(brandLogoUrl)}" alt="${escapeHtml(brand.name)} Logo" style="width:64px;height:64px;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0;" />` : ''}
            <div>
              <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 6px 0;">Buy ${escapeHtml(brand.name)} Products in Sri Lanka</h1>
              <p style="font-size:13px;color:#00838f;font-weight:700;margin:0;">100% Authentic • Islandwide Cash on Delivery • Verified Stockist</p>
            </div>
          </div>
          <p style="font-size:15px;color:#475569;line-height:1.6;margin-bottom:16px;">${escapeHtml(brand.description || description)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#00838f;font-weight:600;">
            <span>✓ 100% Authentic Guarantee</span>
            <span>✓ Islandwide Cash on Delivery (COD)</span>
            <span>✓ Verified Stockist (${formattedCount} Products)</span>
          </div>
        </header>

        <section aria-label="${escapeHtml(brand.name)} Products Catalog">
          <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:between;">
            <h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:0;">Available ${escapeHtml(brand.name)} Products (${formattedCount})</h2>
          </div>
          <div class="ssr-products-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;">
            ${productCardsHtml}
          </div>
        </section>
      </main>
    `;

    const initialDataPayload = {
      type: 'brand',
      brand: {
        id: brand.id,
        name: brand.name,
        slug: canonicalSlug,
        description: brand.description,
        logo: brandLogoUrl || brand.logo,
        banner: brand.banner ? toProxiedImageUrl(brand.banner) : '',
        origin: brand.origin
      },
      products: brandProducts,
      brandProducts: brandProducts
    };

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      imageUrl,
      type: 'website',
      schemaOrg,
      initialData: initialDataPayload
    });

    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 4. Check Category Page (/category/:categorySlug)
  const categoryMatch = cleanPath.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    const rawParam = decodeURIComponent(categoryMatch[1]);
    const category = findCategory(rawParam, categories, products);
    const cleanCategorySlug = toSlug(rawParam);

    if (rawParam !== cleanCategorySlug && normalizeString(rawParam) === normalizeString(cleanCategorySlug)) {
      return { redirect: `/category/${cleanCategorySlug}`, status: 301 };
    }

    const categoryName = category?.name || cleanCategorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const normCatName = normalizeString(categoryName);
    const normCatSlug = normalizeString(cleanCategorySlug);

    // Filter all active published products belonging to this category
    const categoryProducts = products.filter(p => {
      if (!p || p.isDeleted === true || p.status === 'inactive') return false;
      const pCat = p.category || '';
      const normPCat = normalizeString(pCat);
      const inSub = Array.isArray(p.subCategories) && p.subCategories.some(s => normalizeString(s) === normCatName || normalizeString(s) === normCatSlug);
      return (
        normPCat === normCatName ||
        normPCat === normCatSlug ||
        toSlug(pCat) === cleanCategorySlug ||
        inSub
      );
    });

    const formattedCount = categoryProducts.length;
    const title = `Buy ${categoryName} Products Online in Sri Lanka | HaveItAll.lk`;
    const description = `Shop 100% authentic ${categoryName} in Sri Lanka at HaveItAll.lk. Showing ${formattedCount} products with islandwide Cash on Delivery across Sri Lanka.`;
    const canonicalUrl = `${SITE_URL}/category/${cleanCategorySlug}`;
    const rawCatImage = categoryProducts[0]?.image || '';
    const imageUrl = toProxiedImageUrl(rawCatImage);

    // ItemList schema elements for every category product
    const itemListElements = categoryProducts.map((p, idx) => {
      const pSlug = p.slug || toSlug(p.name || p.title || p.id);
      const pUrl = `${SITE_URL}/product/${pSlug}`;
      const pRawImage = p.image || (Array.isArray(p.images) && p.images[0]) || '';
      const pImage = toProxiedImageUrl(pRawImage);
      return {
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Product",
          "name": p.name || p.title,
          "url": pUrl,
          "image": pImage,
          "description": p.description ? p.description.slice(0, 160) : `${p.name} in ${categoryName}`,
          "sku": String(p.barcode || p.id || pSlug),
          "brand": {
            "@type": "Brand",
            "name": p.brand || 'HaveItAll'
          },
          "offers": {
            "@type": "Offer",
            "url": pUrl,
            "priceCurrency": "LKR",
            "price": Number(p.price || 0),
            "availability": p.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        }
      };
    });

    const schemaOrg = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": canonicalUrl,
          "name": title,
          "description": description,
          "url": canonicalUrl,
          "numberOfItems": formattedCount,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": formattedCount,
            "itemListElement": itemListElements
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Shop",
              "item": `${SITE_URL}/shop`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": categoryName,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    // Pre-rendered HTML product cards
    const productCardsHtml = categoryProducts.length > 0
      ? categoryProducts.map(p => {
          const pSlug = p.slug || toSlug(p.name || p.title || p.id);
          const pUrl = `/product/${pSlug}`;
          const pRawImage = p.image || (Array.isArray(p.images) && p.images[0]) || '';
          const pImage = toProxiedImageUrl(pRawImage);
          const formattedPrice = Number(p.price || 0).toLocaleString('en-LK');
          const inStock = p.inStock !== false;
          return `
            <article class="ssr-product-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
              <a href="${pUrl}" style="text-decoration:none;color:inherit;display:block;">
                <div style="width:100%;aspect-ratio:3/4;background:#f8fafc;overflow:hidden;position:relative;">
                  <img src="${escapeHtml(pImage)}" alt="${escapeHtml(p.name)} - ${escapeHtml(p.brand || 'HaveItAll')} Sri Lanka" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
                </div>
                <div style="padding:14px;">
                  <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#00838f;margin-bottom:4px;">${escapeHtml(p.brand || categoryName)}</div>
                  <h2 style="font-size:14px;font-weight:700;line-height:1.35;margin:0 0 8px 0;color:#0f172a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.name)}</h2>
                  <div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:4px;">LKR ${formattedPrice}</div>
                  <div style="font-size:12px;font-weight:600;color:${inStock ? '#16a34a' : '#dc2626'};">${inStock ? 'In Stock (100% Authentic)' : 'Out of Stock'}</div>
                </div>
              </a>
            </article>
          `;
        }).join('')
      : `
        <div style="grid-column:1/-1;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:48px 24px;text-align:center;">
          <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">No products currently listed under ${escapeHtml(categoryName)}</h3>
          <p style="font-size:14px;color:#64748b;margin-bottom:16px;">Browse our full catalog of authentic skincare and cosmetics.</p>
          <a href="/shop" style="display:inline-block;padding:10px 24px;background:#00838f;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;">Explore Shop</a>
        </div>
      `;

    const semanticContent = `
      <main class="ssr-category-container" style="max-width:1280px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt;
          <a href="/shop" style="color:#00838f;text-decoration:none;">Shop</a> &gt;
          <span>${escapeHtml(categoryName)}</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;">Buy ${escapeHtml(categoryName)} in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;margin-bottom:16px;">${escapeHtml(category?.description || description)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#00838f;font-weight:600;">
            <span>✓ 100% Authentic Guarantee</span>
            <span>✓ Islandwide Cash on Delivery (COD)</span>
            <span>✓ ${formattedCount} Products Available</span>
          </div>
        </header>

        <section aria-label="${escapeHtml(categoryName)} Products Catalog">
          <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:between;">
            <h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:0;">Available ${escapeHtml(categoryName)} Products (${formattedCount})</h2>
          </div>
          <div class="ssr-products-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;">
            ${productCardsHtml}
          </div>
        </section>
      </main>
    `;

    const initialDataPayload = {
      type: 'category',
      category: {
        name: categoryName,
        slug: cleanCategorySlug
      },
      products: categoryProducts,
      categoryProducts: categoryProducts
    };

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      imageUrl,
      type: 'website',
      schemaOrg,
      initialData: initialDataPayload
    });

    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // Helper to build product card markup
  const buildProductCard = (p) => {
    const pSlug = p.slug || toSlug(p.name || p.title || p.id);
    const pUrl = `/product/${pSlug}`;
    const pRawImage = p.image || (Array.isArray(p.images) && p.images[0]) || '';
    const pImage = toProxiedImageUrl(pRawImage);
    const formattedPrice = Number(p.price || 0).toLocaleString('en-LK');
    const inStock = p.inStock !== false;
    return `
      <article class="ssr-product-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
        <a href="${pUrl}" style="text-decoration:none;color:inherit;display:block;">
          <div style="width:100%;aspect-ratio:3/4;background:#f8fafc;overflow:hidden;position:relative;">
            <img src="${escapeHtml(pImage)}" alt="${escapeHtml(p.name)} - ${escapeHtml(p.brand || 'HaveItAll')} Sri Lanka" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
          </div>
          <div style="padding:14px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#00838f;margin-bottom:4px;">${escapeHtml(p.brand || p.category || 'HaveItAll')}</div>
            <h2 style="font-size:14px;font-weight:700;line-height:1.35;margin:0 0 8px 0;color:#0f172a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.name || p.title)}</h2>
            <div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:4px;">LKR ${formattedPrice}</div>
            <div style="font-size:12px;font-weight:600;color:${inStock ? '#16a34a' : '#dc2626'};">${inStock ? 'In Stock (100% Authentic)' : 'Out of Stock'}</div>
          </div>
        </a>
      </article>
    `;
  };

  const activeProducts = (Array.isArray(products) && products.length > 0)
    ? products.filter(p => p && p.isDeleted !== true && p.status !== 'inactive')
    : INITIAL_PRODUCTS.filter(p => p && p.isDeleted !== true && p.status !== 'inactive');

  const activeBrands = (Array.isArray(brands) && brands.length > 0)
    ? brands.filter(b => b && b.isDeleted !== true)
    : INITIAL_BRANDS.filter(b => b && b.isDeleted !== true);

  const activeCategories = (Array.isArray(categories) && categories.length > 0)
    ? categories.filter(c => c && c.isDeleted !== true)
    : INITIAL_CATEGORIES.filter(c => c && c.isDeleted !== true);

  // 5. Shop Page (/shop)
  if (cleanPath === '/shop') {
    const title = 'Online Beauty, Skincare, Cosmetics & Health Supplements Store Sri Lanka | HaveItAll.lk';
    const description = 'Browse 100% authentic skincare, health supplements, cosmetics, and beauty appliances at HaveItAll.lk. Islandwide Cash on Delivery across Sri Lanka.';
    const canonicalUrl = `${SITE_URL}/shop`;
    const cards = activeProducts.map(buildProductCard).join('');

    const semanticContent = `
      <main class="ssr-shop-container" style="max-width:1280px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt; <span>Shop All Products</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;">Shop 100% Authentic Products Online in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;margin-bottom:16px;">Explore Sri Lanka's largest verified collection of authentic skincare serums, moisturizers, sunscreens, hair growth supplements, and grooming appliances.</p>
          <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#00838f;font-weight:600;">
            <span>✓ 100% Genuine Guaranteed</span>
            <span>✓ Islandwide Cash on Delivery (COD)</span>
            <span>✓ ${activeProducts.length} Verified Products</span>
          </div>
        </header>
        <section aria-label="All Catalog Products">
          <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
            <h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:0;">Available Products (${activeProducts.length})</h2>
          </div>
          <div class="ssr-products-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;">
            ${cards}
          </div>
        </section>
      </main>
    `;

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      type: 'website'
    });
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 6. Cosmetics Department (/cosmetics)
  if (cleanPath === '/cosmetics') {
    const cosmeticProducts = activeProducts.filter(p => {
      const c = (p.category || '').toLowerCase();
      const d = (p.department || '').toLowerCase();
      return c.includes('serum') || c.includes('skin') || c.includes('face') || c.includes('moistur') || c.includes('lip') || c.includes('body') || c.includes('sun') || d.includes('cosmetic');
    });
    const title = 'Buy 100% Authentic Skincare & Cosmetics in Sri Lanka | HaveItAll.lk';
    const description = 'Shop genuine global skincare, face serums, sunscreens, moisturizers & cosmetics in Sri Lanka. Islandwide Cash on Delivery (COD) & fast delivery guaranteed.';
    const canonicalUrl = `${SITE_URL}/cosmetics`;
    const cards = (cosmeticProducts.length > 0 ? cosmeticProducts : activeProducts).map(buildProductCard).join('');

    const semanticContent = `
      <main class="ssr-department-container" style="max-width:1280px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt; <span>Skincare & Cosmetics</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;">100% Authentic Skincare & Cosmetics in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;margin-bottom:16px;">Discover dermatologist-tested serums, hydrating moisturizers, broad-spectrum sunscreens, and nourishing lip care. 100% authentic brands with islandwide Cash on Delivery.</p>
        </header>
        <div class="ssr-products-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;">
          ${cards}
        </div>
      </main>
    `;

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      type: 'website'
    });
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 7. Brands Directory (/brands)
  if (cleanPath === '/brands') {
    const title = 'Verified Authentic Beauty & Wellness Brand Stockists in Sri Lanka | HaveItAll.lk';
    const description = 'Explore verified authentic brands at HaveItAll.lk including Foxtale, Pilgrim, UV Doux, Chicnutrix, Woodoo, and Reginald. Islandwide Cash on Delivery in Sri Lanka.';
    const canonicalUrl = `${SITE_URL}/brands`;

    const brandCards = activeBrands.map(b => {
      const bSlug = b.slug || toSlug(b.name);
      const bLogo = b.logo ? toProxiedImageUrl(b.logo) : `${SITE_URL}/haveitall-logo.png`;
      return `
        <article style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <a href="/brand/${bSlug}" style="text-decoration:none;color:inherit;display:block;">
            <img src="${escapeHtml(bLogo)}" alt="${escapeHtml(b.name)} Logo" style="width:64px;height:64px;object-fit:cover;border-radius:12px;margin:0 auto 12px auto;display:block;" loading="lazy" />
            <h2 style="font-size:16px;font-weight:800;color:#0f172a;margin:0 0 4px 0;">${escapeHtml(b.name)}</h2>
            <div style="font-size:12px;color:#00838f;font-weight:700;">View Products &rarr;</div>
          </a>
        </article>
      `;
    }).join('');

    const semanticContent = `
      <main class="ssr-brands-container" style="max-width:1280px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt; <span>Brands Directory</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;">Authorized Brand Stockists in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;">HaveItAll.lk is an official stockist of premium global skincare, hair care, and wellness brands. Every product is 100% verified and guaranteed authentic.</p>
        </header>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:16px;">
          ${brandCards}
        </div>
      </main>
    `;

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      type: 'website'
    });
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 8. Homepage Pre-Rendering (cleanPath === '/')
  if (cleanPath === '/') {
    const featuredProds = activeProducts.slice(0, 16);
    const featuredCards = featuredProds.map(buildProductCard).join('');
    const brandPills = activeBrands.slice(0, 10).map(b => {
      const bSlug = b.slug || toSlug(b.name);
      return `<a href="/brand/${bSlug}" style="display:inline-block;padding:8px 16px;background:#f0fdfa;border:1px solid #ccfbf1;color:#0f766e;border-radius:20px;text-decoration:none;font-weight:700;font-size:13px;">${escapeHtml(b.name)}</a>`;
    }).join(' ');

    const semanticContent = `
      <main class="ssr-homepage-container" style="max-width:1280px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <header style="background:linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);border-radius:20px;padding:40px 24px;border:1px solid #ccfbf1;margin-bottom:32px;box-shadow:0 4px 16px rgba(0,131,143,0.06);text-align:center;">
          <h1 style="font-size:32px;font-weight:900;color:#0f172a;line-height:1.25;margin:0 0 16px 0;">HaveItAll.lk | 100% Authentic Skincare, Supplements & Cosmetics in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;max-width:800px;margin:0 auto 24px auto;line-height:1.6;">Sri Lanka's trusted online beauty and wellness store. Shop 100% authentic global skincare, cosmetics, health supplements, and personal care appliances with fast islandwide Cash on Delivery (COD).</p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px;font-size:14px;color:#00838f;font-weight:700;">
            <span>✓ 100% Authentic Guarantee</span>
            <span>✓ Islandwide Cash on Delivery (COD)</span>
            <span>✓ 2–4 Day Islandwide Delivery</span>
            <span>✓ Verified Global Brands</span>
          </div>
        </header>

        <nav aria-label="Main Departments" style="margin-bottom:32px;">
          <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 16px 0;">Shop by Department</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:16px;">
            <a href="/cosmetics" style="display:block;background:white;padding:20px;border-radius:16px;border:1px solid #e2e8f0;text-decoration:none;color:#0f172a;font-weight:800;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <div style="font-size:16px;margin-bottom:4px;color:#00838f;">Skincare & Cosmetics</div>
              <div style="font-size:12px;color:#64748b;">Serums, Sunscreens, Cleansers</div>
            </a>
            <a href="/shop" style="display:block;background:white;padding:20px;border-radius:16px;border:1px solid #e2e8f0;text-decoration:none;color:#0f172a;font-weight:800;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <div style="font-size:16px;margin-bottom:4px;color:#00838f;">Health Supplements</div>
              <div style="font-size:12px;color:#64748b;">Vitamins & Nutrition</div>
            </a>
            <a href="/appliances" style="display:block;background:white;padding:20px;border-radius:16px;border:1px solid #e2e8f0;text-decoration:none;color:#0f172a;font-weight:800;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <div style="font-size:16px;margin-bottom:4px;color:#00838f;">Beauty Appliances</div>
              <div style="font-size:12px;color:#64748b;">Trimmers & Shavers</div>
            </a>
            <a href="/fashion" style="display:block;background:white;padding:20px;border-radius:16px;border:1px solid #e2e8f0;text-decoration:none;color:#0f172a;font-weight:800;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <div style="font-size:16px;margin-bottom:4px;color:#00838f;">Fashion Accessories</div>
              <div style="font-size:12px;color:#64748b;">Jewelry & Watches</div>
            </a>
            <a href="/brands" style="display:block;background:white;padding:20px;border-radius:16px;border:1px solid #e2e8f0;text-decoration:none;color:#0f172a;font-weight:800;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <div style="font-size:16px;margin-bottom:4px;color:#00838f;">Brands Directory</div>
              <div style="font-size:12px;color:#64748b;">View All Stockists</div>
            </a>
          </div>
        </nav>

        <section aria-label="Featured Products" style="margin-bottom:40px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;">Featured Authentic Products in Sri Lanka</h2>
            <a href="/shop" style="color:#00838f;text-decoration:none;font-weight:700;font-size:14px;">View All &rarr;</a>
          </div>
          <div class="ssr-products-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;">
            ${featuredCards}
          </div>
        </section>

        <section aria-label="Featured Brands" style="margin-bottom:40px;background:white;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
          <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 16px 0;">Popular Verified Brands</h2>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${brandPills}
          </div>
        </section>

        <!-- GEO & AEO Citability Section (High-Value Content Blocks for Search Engines & AI Overviews) -->
        <section aria-label="Store Guarantees and Frequently Asked Questions" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:32px 24px;margin-bottom:32px;">
          <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 20px 0;">Frequently Asked Questions & Authenticity Guarantees</h2>
          
          <div style="margin-bottom:20px;">
            <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">Is HaveItAll.lk a verified authentic retailer in Sri Lanka?</h3>
            <p style="font-size:15px;color:#475569;line-height:1.6;margin:0;">Yes, HaveItAll.lk is a verified Sri Lankan online retailer that exclusively stocks 100% authentic skincare, cosmetics, and health supplements sourced directly from official brand manufacturers and authorized distributors. We maintain a zero-tolerance counterfeit policy.</p>
          </div>

          <div style="margin-bottom:20px;">
            <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">How does islandwide Cash on Delivery (COD) work?</h3>
            <p style="font-size:15px;color:#475569;line-height:1.6;margin:0;">HaveItAll.lk provides Cash on Delivery across all 25 districts in Sri Lanka. Customers place their orders online without advance payment and pay the delivery courier in cash upon receiving and inspecting their package at their doorstep.</p>
          </div>

          <div style="margin-bottom:20px;">
            <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">What is the delivery time for orders in Sri Lanka?</h3>
            <p style="font-size:15px;color:#475569;line-height:1.6;margin:0;">Orders placed on HaveItAll.lk are dispatched rapidly from our central hub and delivered islandwide within 2 to 4 business days. Delivery tracking updates are sent directly to your phone via SMS or WhatsApp.</p>
          </div>

          <div>
            <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">What payment methods are supported on HaveItAll.lk?</h3>
            <p style="font-size:15px;color:#475569;line-height:1.6;margin:0;">We accept Cash on Delivery (COD) and direct bank transfer for all orders across Sri Lanka. All prices are listed in Sri Lankan Rupees (LKR) with no hidden fees or extra surcharges.</p>
          </div>
        </section>

        <footer style="border-top:1px solid #e2e8f0;padding-top:24px;font-size:13px;color:#64748b;line-height:1.6;text-align:center;">
          <p><strong>HaveItAll.lk Head Office:</strong> Sellathurai Veethy, Mallakam, Jaffna, Sri Lanka | <strong>Customer Care:</strong> +94 77 065 0063 | <strong>Email:</strong> buyclicks2020@gmail.com</p>
        </footer>
      </main>
    `;

    const initialDataPayload = {
      type: 'home',
      products: activeProducts.slice(0, 24),
      brands: activeBrands,
      categories: activeCategories
    };

    let html = replaceHeadSeo(baseHtml, {
      canonicalUrl: `${SITE_URL}/`,
      initialData: initialDataPayload
    });
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 9. Default Fallback
  const canonicalUrl = `${SITE_URL}${cleanPath}`;
  const html = replaceHeadSeo(baseHtml, {
    canonicalUrl
  });

  return { html, status: 200 };
};

/**
 * Replaces or injects head tags (<title>, <meta description>, canonical link, OpenGraph, JSON-LD, Robots)
 */
function replaceHeadSeo(html, { title, description, canonicalUrl, imageUrl, type = 'website', price, schemaOrg, robots, initialData }) {
  let out = html;

  if (title) {
    out = out.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    out = out.replace(/<meta\s+property=["']og:title["'].*?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    out = out.replace(/<meta\s+name=["']twitter:title["'].*?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  }

  if (description) {
    out = out.replace(/<meta\s+name=["']description["'].*?>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
    out = out.replace(/<meta\s+property=["']og:description["'].*?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    out = out.replace(/<meta\s+name=["']twitter:description["'].*?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  }

  if (canonicalUrl === null) {
    out = out.replace(/<link\s+rel=["']canonical["'].*?>/i, '');
    out = out.replace(/<meta\s+property=["']og:url["'].*?>/i, '');
  } else if (canonicalUrl) {
    out = out.replace(/<link\s+rel=["']canonical["'].*?>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
    out = out.replace(/<meta\s+property=["']og:url["'].*?>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
  }

  if (imageUrl) {
    out = out.replace(/<meta\s+property=["']og:image["'].*?>/i, `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);
    out = out.replace(/<meta\s+name=["']twitter:image["'].*?>/i, `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`);
  }

  if (robots) {
    if (out.includes('<meta name="robots"')) {
      out = out.replace(/<meta\s+name=["']robots["'].*?>/i, `<meta name="robots" content="${escapeHtml(robots)}" />`);
    } else {
      out = out.replace('</head>', `    <meta name="robots" content="${escapeHtml(robots)}" />\n  </head>`);
    }
  }

  if (type === 'product' && price) {
    out = out.replace(/<meta\s+property=["']og:type["'].*?>/i, `<meta property="og:type" content="product" />\n    <meta property="product:price:amount" content="${price}" />\n    <meta property="product:price:currency" content="LKR" />`);
  }

  if (schemaOrg) {
    const jsonLd = `\n    <!-- Dynamic Page JSON-LD -->\n    <script type="application/ld+json">\n${JSON.stringify(schemaOrg, null, 2)}\n    </script>\n`;
    out = out.replace('</head>', `${jsonLd}</head>`);
  }

  if (initialData) {
    const safeData = JSON.stringify(initialData).replace(/</g, '\\u003c');
    const dataScript = `\n    <!-- Hydrated SSR Initial State -->\n    <script>window.__INITIAL_DATA__ = ${safeData};</script>\n`;
    out = out.replace('</head>', `${dataScript}</head>`);
  }

  return out;
}
