# SEO, GEO & AEO Action Plan — HaveItAll.lk

- **Audited Target**: `https://haveitall.lk`
- **Current SEO Health Score**: **34 / 100**
- **Target Health Score Post-Implementation**: **88+ / 100**
- **Artifacts**: [FULL-AUDIT-REPORT.md](file:///c:/Users/vitht/OneDrive/Desktop/haveitall/FULL-AUDIT-REPORT.md) | [SEO-REPORT.html](file:///c:/Users/vitht/OneDrive/Desktop/haveitall/SEO-REPORT.html)

---

## 1. Execution Roadmap Overview

```
Phase 1: Immediate Blockers (Day 1)
├── 1. Remove X-Robots-Tag noindex header from sitemap.xml
├── 2. Purge Base64 data URIs from Product JSON-LD schema
└── 3. Pre-render semantic SSR HTML for Homepage (/) & Shop (/shop)

Phase 2: Quick Wins (Days 2–4)
├── 4. Deploy AI Crawler policy in robots.txt (GPTBot, ClaudeBot, PerplexityBot)
├── 5. Deploy /llms.txt & /llms-full.txt machine-readable manifests
├── 6. Add Merchant shippingDetails & hasMerchantReturnPolicy to Product schema
├── 7. Inject BreadcrumbList JSON-LD on product, brand, and category pages
├── 8. Add sameAs authority social links to OnlineStore schema
└── 9. Redirect /sitemap_index.xml to /sitemap.xml

Phase 3: Strategic Improvements (Weeks 2–3)
├── 10. Incorporate Question-Based H2/H3 Answer Blocks (AEO / PAA optimization)
├── 11. Refactor Base64 database product images to CDN image hosting
└── 12. Optimize OpenGraph / Twitter meta title character lengths
```

---

## 2. Immediate Blockers (Fix Immediately)

### Action 1: Remove `X-Robots-Tag: noindex, follow` from Sitemap Endpoints
- **Priority**: 🔴 Critical
- **Impact**: High (Restores XML sitemap parsing in Google Search Console and Bing Webmaster Tools)
- **Effort**: Low (5 minutes)
- **Files**: `vercel.json` and `api/sitemap.js`

**Step-by-step fix in `vercel.json`**:
Remove or modify lines 54-57 and lines 71-74:
```diff
--- a/vercel.json
+++ b/vercel.json
@@ -51,10 +51,6 @@
         {
           "key": "Cache-Control",
           "value": "public, max-age=0, must-revalidate"
-        },
-        {
-          "key": "X-Robots-Tag",
-          "value": "noindex, follow"
         }
       ]
     },
```

**Step-by-step fix in `api/sitemap.js`**:
```diff
--- a/api/sitemap.js
+++ b/api/sitemap.js
@@ -8,7 +8,6 @@ export default async function handler(req, res) {
   // Enforce XML Content-Type header with UTF-8 charset and real-time freshness
   res.setHeader('Content-Type', 'application/xml; charset=utf-8');
   res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
-  res.setHeader('X-Robots-Tag', 'noindex, follow');
```

---

### Action 2: Purge Base64 Data URIs from Product JSON-LD Schema
- **Priority**: 🔴 Critical
- **Impact**: High (Enables Google Rich Results eligibility and eliminates 300KB+ HTML payload bloat)
- **Effort**: Low (15 minutes)
- **File**: `server/utils/seoRenderer.js`

**Implementation**:
In `server/utils/seoRenderer.js`, ensure `toProxiedImageUrl` never outputs a `data:` URI into structured data:
```javascript
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
  return trimmed;
};
```
And in `renderSSRHtml` (product detail):
```javascript
const schemaImages = (Array.isArray(product.images) && product.images.length > 0)
  ? product.images.map(img => toProxiedImageUrl(img)).filter(u => u && !u.startsWith('data:'))
  : [toProxiedImageUrl(rawImage)];

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "image": schemaImages.length > 0 ? schemaImages : [`${SITE_URL}/haveitall-logo.png`],
  // ...
};
```

---

### Action 3: Pre-Render Semantic SSR HTML for Homepage (`/`) and Shop (`/shop`)
- **Priority**: 🔴 Critical
- **Impact**: Maximum (Unlocks search crawling for Bing, DuckDuckGo, AI agents, and non-JS clients)
- **Effort**: Medium (2–3 hours)
- **Files**: `server/utils/seoRenderer.js` and `vercel.json`

**Implementation in `vercel.json`**:
Route the root and shop to `api/index.js` so `renderSSRHtml` handles them:
```json
{
  "source": "/(shop|)",
  "destination": "/api/index.js"
}
```

**Implementation in `server/utils/seoRenderer.js` (`cleanPath === '/'`)**:
Pre-render an accessible semantic layout into `<div id="root">`:
- `<h1>HaveItAll.lk | 100% Authentic Skincare, Supplements & Cosmetics in Sri Lanka</h1>`
- Navigation cards linking to top departments (`/cosmetics`, `/appliances`, `/fashion`, `/category/moisturizers`, etc.) with crawlable `<a href="...">` links.
- Featured products grid with semantic `<article>`, image, title, price, and links.
- Verified store guarantees: Islandwide Cash on Delivery (COD), 100% Authenticity Guarantee, Fast Islandwide Dispatch.

---

## 3. Quick Wins (Days 2–4)

### Action 4: Deploy Dedicated AI Crawler Directives in `robots.txt`
- **Priority**: ⚠️ High
- **Impact**: High (Explicitly welcomes AI search discovery while managing aggressive scrapers)
- **Effort**: Low (10 minutes)
- **Files**: `public/robots.txt` and `server/utils/seoRenderer.js` (`generateRobotsTxt`)

```text
# HaveItAll.lk - 100% Authentic Skincare, Supplements & Cosmetics in Sri Lanka
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /vendor
Disallow: /vendor/
Disallow: /dropshipper
Disallow: /dropshipper/
Disallow: /api/

# AI Search Engines & Conversational Assistants (Allowed for discovery)
User-agent: GPTBot
Allow: /
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /api/

User-agent: Applebot-Extended
Allow: /
Disallow: /api/

# Restrict Aggressive AI Model Training Scrapers
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

# Sitemap
Sitemap: https://haveitall.lk/sitemap.xml
```

---

### Action 5: Deploy `/llms.txt` and `/llms-full.txt` Standard Manifests
- **Priority**: ⚠️ High
- **Impact**: High (Provides LLM agents with condensed, citation-ready brand facts)
- **Effort**: Low (15 minutes)
- **New Files**: `public/llms.txt`, `public/llms-full.txt`
- **Update**: `vercel.json` rewrites and headers

**Content for `public/llms.txt`**:
```markdown
# HaveItAll.lk
> Sri Lanka's trusted e-commerce platform for 100% authentic skincare, health supplements, cosmetics, and beauty appliances with islandwide Cash on Delivery.

## Main Catalog Sections
- [Skincare & Cosmetics](https://haveitall.lk/cosmetics): Authentic face serums, moisturizers, cleansers, and sunscreens.
- [Health Supplements](https://haveitall.lk/shop): Verified vitamins, hair growth formulas, and wellness nutrition.
- [Beauty Appliances](https://haveitall.lk/appliances): Trimmers, stylers, and personal grooming electronics.
- [Brand Directory](https://haveitall.lk/brands): Verified stockist directory including Foxtale, Pilgrim, UV Doux, Chicnutrix, and Reginald.

## Key Facts & Shopping Policies
- Authenticity: 100% genuine product guarantee; directly sourced from authorized brand distributors.
- Payment Options: Islandwide Cash on Delivery (COD) and direct bank transfer accepted across all 25 districts in Sri Lanka.
- Currency: Sri Lankan Rupee (LKR).
- Customer Service Hotline: +94 77 065 0063
- Dispatch Time: Fast islandwide delivery within 2 to 4 business days.
```

**Routing update in `vercel.json`**:
```json
{
  "source": "/(llms\\.txt|llms-full\\.txt)",
  "headers": [
    { "key": "Content-Type", "value": "text/plain; charset=utf-8" },
    { "key": "Cache-Control", "value": "public, max-age=86400, must-revalidate" }
  ]
}
```

---

### Action 6: Add Merchant `shippingDetails` & `hasMerchantReturnPolicy` to Product Schema
- **Priority**: ⚠️ High
- **Impact**: High (Resolves Google Search Console merchant listing warnings and unlocks price badges)
- **Effort**: Low (20 minutes)
- **File**: `server/utils/seoRenderer.js`

**Update in `offers` object in `seoRenderer.js`**:
```javascript
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
```

---

### Action 7: Add `BreadcrumbList` JSON-LD Schema
- **Priority**: ⚠️ Medium
- **Impact**: Medium (Replaces messy URLs with structured breadcrumbs in SERP results)
- **Effort**: Low (15 minutes)
- **File**: `server/utils/seoRenderer.js`

```javascript
const breadcrumbSchema = {
  "@context": "https://schema.org",
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
};
```

---

### Action 8: Add `sameAs` Links to `OnlineStore` Schema
- **Priority**: ⚠️ Medium
- **Impact**: Medium (Strengthens Knowledge Graph entity signals)
- **Effort**: Low (10 minutes)
- **File**: `index.html`

Add the company's verified social URLs to the `OnlineStore` block:
```json
"sameAs": [
  "https://www.facebook.com/haveitall.lk",
  "https://www.instagram.com/haveitall.lk",
  "https://www.tiktok.com/@haveitall.lk"
]
```

---

### Action 9: Redirect Alternative Sitemap Paths to `/sitemap.xml`
- **Priority**: ⚠️ Medium
- **Impact**: Low–Medium (Eliminates soft-200 syntax errors on standard crawler discovery paths)
- **Effort**: Low (5 minutes)
- **File**: `vercel.json`

```json
{
  "source": "/(sitemap_index\\.xml|sitemap-index\\.xml)",
  "headers": [
    {
      "key": "Location",
      "value": "/sitemap.xml"
    }
  ],
  "status": 301
}
```

---

## 4. Strategic Improvements (Weeks 2–3)

### Action 10: Incorporate Question-Based H2/H3 Answer Blocks (GEO & AEO)
- **Priority**: ⚠️ Medium
- **Impact**: High (Wins Google Featured Snippets, People Also Ask boxes, and AI citations)
- **Effort**: Medium (1–2 days)
- **Implementation**:
  - In product detail SSR templates, append structured Q&A:
    ```html
    <section class="ssr-product-faq">
      <h3>What are the primary benefits of this product?</h3>
      <p>[40–55 word direct answer block without filler].</p>
      <h3>How should this product be applied for best results?</h3>
      <p>[40–55 word procedural step-by-step guidance].</p>
    </section>
    ```

### Action 11: Cloudinary / S3 Image Asset Refactor
- **Priority**: ⚠️ Medium
- **Impact**: High (Decreases database footprint and improves LCP)
- **Effort**: High (2–3 days)
- **Implementation**:
  - Ensure all product photos uploaded via Admin/Vendor portals are stored on cloud CDN storage (e.g., Cloudinary, AWS S3, or Vercel Blob) rather than embedded as base64 in MongoDB.

### Action 12: Optimize OpenGraph / Twitter Title Lengths
- **Priority**: ⚠️ Low
- **Impact**: Low–Medium (Ensures clean card previews on social messaging apps)
- **Effort**: Low (15 minutes)
- **Implementation**:
  - In `index.html`: Update `og:title` and `twitter:title` from 89 characters to:
    `"HaveItAll.lk | Authentic Skincare & Supplements Sri Lanka"` (56 characters).

---

## 5. Verification Checklist Post-Implementation

After deploying the changes, execute the following deterministic skill verification scripts:

```bash
# 1. Verify robots.txt and AI crawler management
python3 .agent/skills/seo/scripts/robots_checker.py https://haveitall.lk

# 2. Verify llms.txt standard formatting and status
python3 .agent/skills/seo/scripts/llms_txt_checker.py https://haveitall.lk

# 3. Verify sitemap HTTP headers (ensure noindex is absent)
python3 .agent/skills/seo/scripts/sitemap_checker.py https://haveitall.lk/sitemap.xml

# 4. Verify Product JSON-LD schema validity (ensure data: URIs are gone)
python3 .agent/skills/seo/scripts/product_schema_checker.py https://haveitall.lk/product/foxtale-12-niacinamide-face-serum-with-azelaic-acid

# 5. Verify social metadata lengths
python3 .agent/skills/seo/scripts/social_meta.py https://haveitall.lk

# 6. Re-generate verified HTML dashboard
python3 .agent/skills/seo/scripts/generate_report.py https://haveitall.lk --output SEO-REPORT.html
```
