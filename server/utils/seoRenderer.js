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
 * Generates SEO-compliant robots.txt content
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
  INITIAL_PRODUCTS.filter(isEligibleProduct).forEach(p => {
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
  dbProducts.filter(isEligibleProduct).forEach(p => {
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
  INITIAL_BRANDS.forEach(b => {
    const slug = b.slug || toSlug(b.name);
    if (slug) {
      brandMap.set(slug, {
        slug,
        name: b.name,
        updatedAt: b.updatedAt || b.createdAt || today
      });
    }
  });
  dbBrands.forEach(b => {
    const slug = b.slug || toSlug(b.name);
    if (slug) {
      brandMap.set(slug, {
        slug,
        name: b.name,
        updatedAt: b.updatedAt || b.createdAt || today
      });
    }
  });
  // Auto-discover any active brands defined on products
  dbProducts.filter(isEligibleProduct).forEach(p => {
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
  INITIAL_CATEGORIES.forEach(c => {
    const slug = c.slug || toSlug(c.name);
    if (slug) {
      categoryMap.set(slug, {
        slug,
        name: c.name,
        updatedAt: c.updatedAt || c.createdAt || today
      });
    }
  });
  dbCategories.forEach(c => {
    const slug = c.slug || toSlug(c.name);
    if (slug) {
      categoryMap.set(slug, {
        slug,
        name: c.name,
        updatedAt: c.updatedAt || c.createdAt || today
      });
    }
  });
  // Auto-discover any active categories defined on products
  dbProducts.filter(isEligibleProduct).forEach(p => {
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

  const productUrls = Array.from(productMap.values()).map(product => ({
    loc: `${SITE_URL}/product/${product.slug || toSlug(product.name)}`,
    lastmod: formatDate(product.updatedAt),
    priority: '0.9',
    changefreq: 'daily',
    image: product.image ? { loc: product.image, title: product.name } : null
  }));

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
 * Finds a brand by slug, ID, or name
 */
export const findBrand = (nameOrSlug, dbBrands = []) => {
  if (!nameOrSlug) return null;
  let target = String(nameOrSlug).trim().toLowerCase();
  const clean = toSlug(target);

  let found = dbBrands.find(b =>
    (b.slug && b.slug.toLowerCase() === target) ||
    (b.slug && b.slug.toLowerCase() === clean) ||
    String(b.id).toLowerCase() === target ||
    String(b._id) === target ||
    toSlug(b.name) === clean ||
    b.name?.toLowerCase() === target
  );

  if (found) return found;

  return INITIAL_BRANDS.find(b =>
    (b.slug && b.slug.toLowerCase() === target) ||
    (b.slug && b.slug.toLowerCase() === clean) ||
    String(b.id).toLowerCase() === target ||
    toSlug(b.name) === clean ||
    b.name?.toLowerCase() === target
  );
};

/**
 * Finds a category by slug, ID, or name
 */
export const findCategory = (nameOrSlug, dbCategories = []) => {
  if (!nameOrSlug) return null;
  const target = String(nameOrSlug).trim().toLowerCase();
  const clean = toSlug(target);

  let found = dbCategories.find(c =>
    (c.slug && c.slug.toLowerCase() === target) ||
    (c.slug && c.slug.toLowerCase() === clean) ||
    String(c.id).toLowerCase() === target ||
    String(c._id) === target ||
    toSlug(c.name) === clean ||
    c.name?.toLowerCase() === target
  );

  if (found) return found;

  return INITIAL_CATEGORIES.find(c =>
    (c.slug && c.slug.toLowerCase() === target) ||
    (c.slug && c.slug.toLowerCase() === clean) ||
    String(c.id).toLowerCase() === target ||
    toSlug(c.name) === clean ||
    c.name?.toLowerCase() === target
  );
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
    const title = product.seoTitle || `${product.name} - Buy Online in Sri Lanka | HaveItAll.lk`;
    const description = product.seoDescription || `${shortDesc} - Rs. ${formattedPrice}. 100% Authentic ${brandName} with Islandwide Cash on Delivery in Sri Lanka at HaveItAll.lk.`;
    const canonicalUrl = `${SITE_URL}/product/${canonicalSlug}`;
    const imageUrl = product.image || (Array.isArray(product.images) && product.images[0]) || `${SITE_URL}/haveitall-logo.png`;
    const formulation = product.formulation || product.fabric || 'Standard Formulation';

    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": (Array.isArray(product.images) && product.images.length > 0) ? product.images : [imageUrl],
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
        }
      }
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

  // 3. Check Brand Page
  const brandMatch = cleanPath.match(/^\/brand\/(.+)$/);
  if (brandMatch) {
    const rawParam = decodeURIComponent(brandMatch[1]);
    const brand = findBrand(rawParam, brands);

    if (!brand) {
      return { html: baseHtml, status: 404 };
    }

    const canonicalSlug = brand.slug || toSlug(brand.name);
    // If param is uppercase, encoded, or differs -> 301 Redirect
    if (rawParam !== canonicalSlug) {
      return { redirect: `/brand/${canonicalSlug}`, status: 301 };
    }

    const title = `Buy ${brand.name} Products in Sri Lanka | 100% Authentic – HaveItAll.lk`;
    const description = `Shop 100% authentic ${brand.name} skincare, beauty & supplements at HaveItAll.lk. Islandwide cash on delivery across Sri Lanka. Fast, reliable delivery & guaranteed genuine.`;
    const canonicalUrl = `${SITE_URL}/brand/${canonicalSlug}`;
    const imageUrl = brand.logo || `${SITE_URL}/haveitall-logo.png`;

    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": canonicalUrl,
      "about": {
        "@type": "Brand",
        "name": brand.name,
        "description": brand.description || description,
        "logo": imageUrl
      }
    };

    const semanticContent = `
      <main class="ssr-brand-container" style="max-width:1200px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt;
          <a href="/brands" style="color:#00838f;text-decoration:none;">Brands</a> &gt;
          <span>${escapeHtml(brand.name)}</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;">Buy ${escapeHtml(brand.name)} Products in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;margin-bottom:16px;">${escapeHtml(brand.description || description)}</p>
          <div style="display:flex;gap:16px;font-size:13px;color:#00838f;font-weight:600;">
            <span>✓ 100% Authentic Guarantee</span>
            <span>✓ Islandwide Cash on Delivery (COD)</span>
            <span>✓ Genuine Verified Imports</span>
          </div>
        </header>
      </main>
    `;

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      imageUrl,
      type: 'website',
      schemaOrg
    });

    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 4. Check Category Page (/category/:categorySlug)
  const categoryMatch = cleanPath.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    const rawParam = decodeURIComponent(categoryMatch[1]);
    const category = findCategory(rawParam, categories);
    const cleanCategorySlug = toSlug(rawParam);

    if (rawParam !== cleanCategorySlug) {
      return { redirect: `/category/${cleanCategorySlug}`, status: 301 };
    }

    const categoryName = category?.name || cleanCategorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const title = `Buy ${categoryName} Products in Sri Lanka | 100% Authentic – HaveItAll.lk`;
    const description = `Shop 100% authentic ${categoryName} at HaveItAll.lk. Genuine global skincare, cosmetics, and wellness products with islandwide Cash on Delivery across Sri Lanka.`;
    const canonicalUrl = `${SITE_URL}/category/${cleanCategorySlug}`;

    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": canonicalUrl
    };

    const semanticContent = `
      <main class="ssr-category-container" style="max-width:1200px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#64748b;">
          <a href="/" style="color:#00838f;text-decoration:none;">Home</a> &gt;
          <a href="/shop" style="color:#00838f;text-decoration:none;">Shop</a> &gt;
          <span>${escapeHtml(categoryName)}</span>
        </nav>
        <header style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;">Buy ${escapeHtml(categoryName)} in Sri Lanka</h1>
          <p style="font-size:16px;color:#475569;line-height:1.6;margin-bottom:16px;">${escapeHtml(category?.description || description)}</p>
          <div style="display:flex;gap:16px;font-size:13px;color:#00838f;font-weight:600;">
            <span>✓ 100% Authentic Guarantee</span>
            <span>✓ Islandwide Cash on Delivery (COD)</span>
            <span>✓ Guaranteed Genuine Sri Lanka Delivery</span>
          </div>
        </header>
      </main>
    `;

    let html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      type: 'website',
      schemaOrg
    });

    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);
    return { html, status: 200 };
  }

  // 5. Shop Page
  if (cleanPath === '/shop') {
    const title = 'Online Beauty, Skincare, Cosmetics & Health Supplements Store Sri Lanka | HaveItAll.lk';
    const description = 'Browse 100% authentic skincare, health supplements, cosmetics, and beauty appliances at HaveItAll.lk. Islandwide Cash on Delivery across Sri Lanka.';
    const canonicalUrl = `${SITE_URL}/shop`;

    const html = replaceHeadSeo(baseHtml, {
      title,
      description,
      canonicalUrl,
      type: 'website'
    });
    return { html, status: 200 };
  }

  // 6. Default Page (Homepage or other pages)
  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const html = replaceHeadSeo(baseHtml, {
    canonicalUrl
  });

  return { html, status: 200 };
};

/**
 * Replaces or injects head tags (<title>, <meta description>, canonical link, OpenGraph, JSON-LD, Robots)
 */
function replaceHeadSeo(html, { title, description, canonicalUrl, imageUrl, type = 'website', price, schemaOrg, robots }) {
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

  return out;
}
