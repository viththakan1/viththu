# Full SEO, GEO, and AEO Audit Report — HaveItAll.lk

- **Audited Target**: `https://haveitall.lk`
- **Scope**: Full Website Audit (Technical SEO, SPA Rendering, Product JSON-LD Schema, Robots.txt AI Crawlers, Sitemap Coverage, On-Page SEO, Content Quality, GEO & AEO)
- **Audit Date**: 2026-11-28
- **Platform**: Vercel Serverless + React 18 SPA + Node.js Express API + MongoDB Atlas
- **Overall SEO Health Score**: **34 / 100** (Rating: **Poor / Needs Immediate Remediation**)
- **Score Confidence**: High for Technical, Schema, Sitemap, and Crawlers; Low for lab Core Web Vitals (due to Google PSI API rate limiting)
- **Interactive Dashboard**: `SEO-REPORT.html`

---

## 1. Executive Summary

A comprehensive, evidence-based SEO, Generative Engine Optimization (GEO), and Answer Engine Optimization (AEO) audit was performed on **HaveItAll.lk** (`https://haveitall.lk`) utilizing the installed deterministic SEO skill suite and local codebase architecture analysis.

HaveItAll.lk exhibits **world-class HTTP security headers (100/100, A+ grade)** and possesses an active serverless SSR engine for product detail (`/product/*`), brand (`/brand/*`), and category (`/category/*`) routes. However, its overall organic visibility, AI search citability, and indexation health are severely crippled by **three critical blockers**:

1. **Empty Client-Side Rendered (CSR) SPA Shell on Homepage & Department Pages**: Crawlers without full JavaScript rendering (Bing, DuckDuckGo, Baidu) and AI crawlers (GPTBot, ClaudeBot, PerplexityBot) fetch an empty `<div id="root"></div>` containing **11 words of body text**, zero `<h1>`, zero `<h2>`, zero crawlable `<a>` links, and zero `<img>` tags.
2. **`X-Robots-Tag: noindex, follow` HTTP Header on `sitemap.xml`**: Both `vercel.json` and `api/sitemap.js` explicitly transmit a `noindex` header on the XML sitemap, triggering indexation warnings and sitemap ingestion failure in Google Search Console and Bing Webmaster Tools.
3. **Massive Base64 Data URIs Embedded in Product JSON-LD Schema**: Product detail pages serialize raw `data:image/webp;base64,...` image strings exceeding 300,000 characters into `<script type="application/ld+json">`. Google Structured Data strictly disallows data URIs for Rich Results and Merchant Center, while inflating HTML payload size by over 300KB.

### Top 3 Critical Issues
1. **Homepage & Shop CSR Blank Shell**: Non-JS crawlers and AI bots receive an empty page with 0 internal links.
2. **Sitemap Noindex Header**: `sitemap.xml` serves `X-Robots-Tag: noindex, follow`.
3. **Invalid Base64 Schema Images**: Google rejects `data:` URIs in Product JSON-LD markup.

### Top 3 Strategic Opportunities
1. **Full SSR Pre-rendering for Homepage & Shop**: Render semantic hero, featured categories, best-selling products, and brand index to immediately unlock organic and AI discoverability.
2. **GEO & Citability Optimization (`llms.txt` + Quotable Answer Blocks)**: Deploy a standardized `/llms.txt` manifest and 40-60 word definition passages for instant citations in ChatGPT Search and Perplexity.
3. **Google Merchant Center Rich Results Expansion**: Implement `shippingDetails`, `hasMerchantReturnPolicy`, and `BreadcrumbList` schema to win enhanced product snippets and price badges.

---

## 2. Category Scorecard & Chain-of-Thought Derivation

Scoring derived under the deterministic LLM Audit Rubric with explicit Chain-of-Thought derivation:

| Category | Weight | Base Score | Severity Penalties | Category Score | Weighted Contribution |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Technical SEO & SPA** | 25% | 57.1 | -35 (2 Critical, 1 Warning) | **22 / 100** | 5.50 |
| **Schema & Structured Data** | 15% | 42.9 | -30 (1 Critical, 3 Warnings) | **13 / 100** | 1.95 |
| **On-Page SEO** | 15% | 66.7 | -10 (2 Warnings) | **57 / 100** | 8.55 |
| **Content Quality & E-E-A-T** | 20% | 50.0 | -15 (3 Warnings) | **35 / 100** | 7.00 |
| **Performance (CWV)** | 10% | 60.0 | -5 (1 Warning) | **55 / 100** | 5.50 |
| **Image Optimization** | 10% | 60.0 | -10 (2 Warnings) | **50 / 100** | 5.00 |
| **AI Search Readiness (GEO/AEO)**| 5% | 33.3 | -20 (4 Warnings) | **13 / 100** | 0.65 |
| **Total / Weighted Score** | **100%** | — | — | **34 / 100** | **34.15** |

### Category Derivations
- **Technical SEO (22/100)**: Reflects perfect security headers (100) and dynamic sitemap generation (+), heavily penalized by client-side rendered empty homepage shell (Critical, -15), `noindex` header on sitemap.xml (Critical, -15), and soft-200 alternative sitemap errors (Warning, -5).
- **Schema & Structured Data (13/100)**: Reflects baseline WebSite and OnlineStore presence (+), penalized by base64 data URIs in Product schema (Critical, -15), missing Google Merchant shipping and return policies (Warning, -5), missing BreadcrumbList markup (Warning, -5), and missing `sameAs` authority links (Warning, -5).
- **On-Page SEO (57/100)**: Reflects strong product page title tags and canonical URLs (+), penalized by missing homepage H1/H2 in initial HTML (Warning, -5) and social title tags exceeding character limits (Warning, -5).
- **Content Quality & E-E-A-T (35/100)**: Reflects authentic Sri Lankan localized product copy and Cash on Delivery clarity (+), penalized by thin homepage initial text (Warning, -5), complex readability metrics (Flesch 27.8) (Warning, -5), and lack of formal author/expert credentials (Warning, -5).
- **Performance & CWV (55/100)**: Reflects excellent edge cache-control headers and fast single-hop HTTPS (+), penalized by heavy JS execution overhead and base64 bloat (Warning, -5). Lab data marked as environment limitation due to API rate limit.
- **Image Optimization (50/100)**: Reflects WebP adoption and descriptive product alt text (+), penalized by base64 image storage (Warning, -5) and missing explicit dimensions (Warning, -5).
- **AI Search Readiness (13/100)**: Reflects unblocked AI crawlers and valid searchbox action (+), penalized by missing `llms.txt` (Warning, -5), unmanaged AI crawler rules (Warning, -5), zero citability answer blocks (Warning, -5), and lack of PAA/snippet optimization (Warning, -5).

---

## 3. Detailed Findings Table (Verified)

All findings have been deduplicated and verified via `finding_verifier.py`:

| Area | Severity | Confidence | Finding | Evidence | Fix |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Technical SEO (SPA)** | 🔴 Critical | Confirmed | Client-Side Rendered (CSR) Empty Root Shell on Homepage & Core Routes | `curl https://haveitall.lk/` yields `<div id="root"></div>` with 11 words, 0 `<h1>`, 0 `<h2>`, and 0 `<a>` links. `vercel.json` rewrites `/` to `/index.html`. `broken_links.py` detected 0 links on root. | Pre-render semantic SSR HTML for `/` and `/shop` in `server/utils/seoRenderer.js` with hero, category links, product cards, and update `vercel.json` to route `/` to `api/index.js`. |
| **Technical SEO (Sitemap)** | 🔴 Critical | Confirmed | `X-Robots-Tag: noindex, follow` header served on `sitemap.xml` | `vercel.json` (lines 54-57, 71-74) and `api/sitemap.js` (line 11) transmit `res.setHeader('X-Robots-Tag', 'noindex, follow')`. | Remove `X-Robots-Tag: noindex, follow` from `vercel.json` and `api/sitemap.js`. Sitemaps should never be served with noindex headers. |
| **Structured Data (Product)** | 🔴 Critical | Confirmed | Base64 data URI embedded directly into Product JSON-LD schema `image` | `live_product.html` contains `"image": ["data:image/webp;base64,UklGR..."]` exceeding 300,000 characters. `toProxiedImageUrl()` leaves data URIs unproxied. | Update `toProxiedImageUrl()` in `seoRenderer.js` to ensure schema only outputs public `https://` URLs (fallback to `/haveitall-logo.png` or hosted image CDN). |
| **Structured Data (Merchant)** | ⚠️ Warning | Confirmed | Missing Google Merchant rich result fields: `shippingDetails` & `hasMerchantReturnPolicy` | `product_schema_checker.py` detected `Offer is missing shippingDetails` and `hasMerchantReturnPolicy`. | Add `OfferShippingDetails` (LKR 350-450, 2-4 business days) and `MerchantReturnPolicy` (7-day returns) inside `offers` in `seoRenderer.js`. |
| **Structured Data (Nav)** | ⚠️ Warning | Confirmed | Missing `BreadcrumbList` JSON-LD schema on product, category, and brand pages | Visual breadcrumb `<nav aria-label="Breadcrumb">` exists in HTML, but no corresponding Schema.org JSON-LD is output in `@graph`. | Inject `@type: "BreadcrumbList"` JSON-LD schema with `itemListElement` array linking Home → Shop → Category/Brand → Product. |
| **Structured Data (Entity)**| ⚠️ Warning | Confirmed | Missing `sameAs` authority links in `OnlineStore` schema | `entity_checker.py` found 0 `sameAs` URLs in `index.html` `OnlineStore` schema. | Add `sameAs` array linking to official Facebook, Instagram, TikTok, LinkedIn, and YouTube profiles. |
| **Technical SEO (Robots)** | ⚠️ Warning | Confirmed | `robots.txt` lacks explicit management for 11 major AI crawlers | `robots_checker.py` shows only `User-agent: *`. AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended, etc.) inherit wildcard. | Add explicit User-agent blocks allowing search bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Applebot-Extended`) and disallowing scraping bots (`Bytespider`, `CCBot`). |
| **AI Search (GEO)** | ⚠️ Warning | Confirmed | `llms.txt` standard file is missing and returns soft-200 HTML error | `https://haveitall.lk/llms.txt` returns HTTP 200 with `index.html` SPA shell. `llms_txt_checker.py` quality score: 5/100. | Create `public/llms.txt` and `public/llms-full.txt` and configure `vercel.json` to serve them with `text/plain; charset=utf-8`. |
| **AI Search (GEO)** | ⚠️ Warning | Confirmed | Zero direct answer blocks or quotable definition passages on Homepage (Score: 0/100) | `answer_block_scanner.py` found 0 answer blocks (20-70 words) and 0 question headings. | Add question H2/H3 blocks on homepage (e.g., "Is HaveItAll.lk authentic?", "How does Cash on Delivery work?") with 40-60 word direct answers. |
| **Answer Engine (AEO)** | ⚠️ Warning | Confirmed | Lack of question-framed H2/H3 headings for Featured Snippets & PAA on product pages | Product pages contain only generic `<h2>About This Product</h2>` without structured Q&A or key benefit lists. | Add an FAQ/Benefits section to product SSR templates with question H3s (e.g., "Who should use this serum?") followed by 40-55 word direct answers. |
| **Technical SEO (Sitemap)** | ⚠️ Warning | Confirmed | Alternative sitemap paths (`/sitemap_index.xml`, `/sitemap-index.xml`) return soft-200 invalid XML | `sitemap_checker.py` detected syntax error: line 1, column 0 because Vercel rewrites unmatched paths to `index.html` with 200 OK. | Add 301 redirects in `vercel.json` from `/sitemap_index.xml` and `/sitemap-index.xml` to `/sitemap.xml`. |
| **On-Page SEO** | ⚠️ Warning | Confirmed | OpenGraph and Twitter meta title tags exceed recommended character limits | `social_meta.py` flagged `og:title` (89 chars, max 60) and `twitter:title` (89 chars, max 70). | Truncate and optimize social titles to concise, high-impact phrasing (e.g. "HaveItAll.lk \| Authentic Skincare & Cosmetics in Sri Lanka"). |
| **Technical SEO (Security)**| ✅ Pass | Confirmed | Outstanding HTTP Security Headers (Grade A+ / Score 100/100) | `security_headers.py` confirmed HSTS (max-age 63072000, preload), CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy. | Maintain current strict security configuration. |
| **Answer Engine (AEO)** | ✅ Pass | Confirmed | Sitelinks Searchbox JSON-LD Schema properly implemented on Homepage | `WebSite` schema contains valid `SearchAction` pointing to `https://haveitall.lk/shop?search={search_term_string}`. | Maintain current SearchAction implementation. |
| **Performance (CWV)** | ℹ️ Info | Hypothesis | Google PageSpeed Insights API rate limit reached during automated audit | `pagespeed.py` returned: `Rate limited by Google API. Wait a few minutes or add an API key.` | Add `PAGESPEED_API_KEY` to `.env` to record continuous CrUX field data and lab Lighthouse metrics. |

---

## 4. Deep-Dive Domain Audits

### 4.1 SPA Rendering & Crawlability Architecture
- **Current Behavior**:
  - `vercel.json` lines 188-190 route all unassigned paths to static `/index.html`.
  - While `/product/:slug`, `/category/:slug`, and `/brand/:slug` route to `api/index.js` (executing `renderSSRHtml` and returning pre-rendered semantic HTML), the **homepage (`/`)** and **`/shop`** do not go through SSR.
  - When search engine bots (Bingbot, Yandex, DuckDuckGo) or AI search crawlers request `https://haveitall.lk/`, they encounter:
    ```html
    <body class="...">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
    ```
  - Total body word count: **11 words** (from head tags). Total internal links: **0**.
  - **Consequence**: Search engine crawlers cannot discover category pages or product URLs from homepage crawling; they are 100% dependent on `sitemap.xml`.

### 4.2 Product JSON-LD Schema & Google Merchant Eligibility
- **Current Behavior**:
  - `server/utils/seoRenderer.js` dynamically generates `@type: "Product"` schema for all product pages.
  - However, in `toProxiedImageUrl(url)`:
    ```javascript
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
    ```
    If a product in MongoDB or `initialData.js` has a base64 WebP image, the schema receives:
    ```json
    "image": [
      "data:image/webp;base64,UklGRoxvAABXRUJQVlA4WAoAAAAgAAAApgIAiQIASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRy..."
    ]
    ```
  - **Consequence**:
    1. Google Rich Results guidelines state: *"Image URLs must be crawlable and indexable HTTP/HTTPS URLs."* Google disregards data URIs.
    2. Over 300KB of raw text is injected into `<head>`, severely degrading First Byte Time and DOM parsing speed.
    3. Missing Google Merchant attributes: `OfferShippingDetails` and `MerchantReturnPolicy`.

### 4.3 Robots.txt AI Crawlers Policy
- **Current State**:
  ```text
  User-agent: *
  Allow: /
  Disallow: /admin
  Disallow: /vendor
  Disallow: /dropshipper
  Disallow: /api/
  Sitemap: https://haveitall.lk/sitemap.xml
  ```
- **Analysis**:
  - AI search assistants (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Applebot-Extended`) inherit the wildcard allow rule, which permits indexing public pages.
  - However, they also inherit disallow rules without explicit prioritization, and AI scraping bots (`Bytespider`, `CCBot`) have unrestricted access to scrap entire product catalogs.
  - Modern GEO best practice is to explicitly declare permissions for search-assisting bots while controlling scraping crawlers.

### 4.4 Sitemap Coverage & Response Headers
- **Current State**:
  - Dynamically generated by `api/sitemap.js` via `generateSitemapXml()`.
  - Accurately discovers 112 URLs (9 static pages + dynamic categories + brands + products) with image extensions and `lastmod` timestamps.
- **Defect**:
  - `vercel.json` (line 54) and `api/sitemap.js` (line 11) enforce:
    ```text
    X-Robots-Tag: noindex, follow
    ```
  - Google Search Console and Bing Webmaster Tools flag sitemaps served with `X-Robots-Tag: noindex` as invalid or conflicting directives.
  - Requesting `/sitemap_index.xml` returns HTTP 200 with HTML (`index.html`), causing XML parsing errors.

### 4.5 Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO)
- **Citability Score**: **0 / 100** on Homepage; **25 / 100** on Product Pages.
- **llms.txt**: Non-existent; requests to `https://haveitall.lk/llms.txt` return an HTML SPA shell.
- **Brand Mentions & Entity Signals**:
  - `entity_checker.py` detected 0 `sameAs` links pointing to official social channels.
  - No Wikipedia or Wikidata entity presence (typical for e-commerce stores, making on-site schema disambiguation critical).
- **Featured Snippets & PAA**:
  - No question-phrased H2/H3 headings.
  - No 40-55 word direct answer blocks immediately following headings.

---

## 5. Environment Limitations

During this audit:
- The Google PageSpeed Insights API encountered a rate limit (`Rate limited by Google API. Wait a few minutes or add an API key.`).
- Consequently, field CrUX and lab Lighthouse Core Web Vitals (LCP, INP, CLS) could not be retrieved deterministically from Google PSI.
- In accordance with Step 4 of the SEO skill rubric, this has been labeled as an **environment limitation** and assigned `Hypothesis` confidence. Technical caching and compression signals were verified directly via HTTP response headers.

---

## 6. Verification and Next Steps

All 15 raw findings were verified through `finding_verifier.py`. See `ACTION-PLAN.md` for the step-by-step implementation plan categorized by immediate blockers, quick wins, and strategic improvements.
