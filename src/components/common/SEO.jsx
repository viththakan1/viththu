import { useEffect } from 'react';

/**
 * Reusable SEO Manager for dynamically setting:
 * - document.title
 * - meta description
 * - canonical <link rel="canonical">
 * - OpenGraph meta tags
 * - Schema.org JSON-LD script
 */
export const SEO = ({
  title,
  description,
  canonical,
  image = 'https://haveitall.lk/haveitall-logo.png',
  type = 'website',
  productPrice,
  schema
}) => {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // Helper to update or insert a meta tag by name or property
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
    }

    // 3. Canonical Link
    if (canonical) {
      let linkEl = document.querySelector('link[rel="canonical"]');
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.setAttribute('rel', 'canonical');
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute('href', canonical);
    }

    // 4. OpenGraph Tags
    const fullCanonical = canonical || window.location.href;
    setMetaTag('property', 'og:site_name', 'HaveItAll.lk');
    setMetaTag('property', 'og:title', title || document.title);
    if (description) setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullCanonical);
    setMetaTag('property', 'og:type', type);
    if (image) setMetaTag('property', 'og:image', image);

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || document.title);
    if (description) setMetaTag('name', 'twitter:description', description);
    if (image) setMetaTag('name', 'twitter:image', image);

    // Product OpenGraph fields if present
    if (type === 'product' && productPrice) {
      setMetaTag('property', 'product:price:amount', String(productPrice));
      setMetaTag('property', 'product:price:currency', 'LKR');
    }

    // 5. Schema.org JSON-LD
    let scriptEl = document.getElementById('dynamic-schema-jsonld');
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-schema-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema, null, 2);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, canonical, image, type, productPrice, schema]);

  return null;
};
