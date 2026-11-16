/**
 * departmentCategories.js
 * Centralized definition and matching utilities for department subcategories.
 *
 * Supported Departments:
 * 1. Cosmatics: Sunscreens, Moisturizers, Hair Serum, Face Serum, Body Lotions, Body Washes, Face Washes, Lipsticks, Lip Balms, Toners, Strobe Creams
 * 2. Fashion: Saree, T-Shirt, Shirt, Jeans, Watches, Belts, Chain, Earrings, Bangles, Bracelets
 * 3. Applieances: Iron Box, Mixers & Blenders, Hair Dryer, Trimmers
 */

export const DEPARTMENT_SUBCATEGORIES = {
  Cosmatics: [
    { id: 'sunscreens', name: 'Sunscreens', label: 'Sunscreens', icon: '☀️' },
    { id: 'moisturizers', name: 'Moisturizers', label: 'Moisturizers', icon: '🧴' },
    { id: 'hair-serum', name: 'Hair Serum', label: 'Hair Serum', icon: '✨' },
    { id: 'face-serum', name: 'Face Serum', label: 'Face Serum', icon: '💧' },
    { id: 'body-lotions', name: 'Body Lotions', label: 'Body Lotions', icon: '🌸' },
    { id: 'body-washes', name: 'Body Washes', label: 'Body Washes', icon: '🧼' },
    { id: 'face-washes', name: 'Face Washes', label: 'Face Washes', icon: '🫧' },
    { id: 'lipsticks', name: 'Lipsticks', label: 'Lipsticks', icon: '💄' },
    { id: 'lip-balms', name: 'Lip Balms', label: 'Lip Balms', icon: '💋' },
    { id: 'toners', name: 'Toners', label: 'Toners', icon: '🌿' },
    { id: 'strobe-creams', name: 'Strobe Creams', label: 'Strobe Creams', icon: '✨' }
  ],
  Fashion: [
    { id: 'saree', name: 'Saree', label: 'Saree', icon: '🥻' },
    { id: 't-shirt', name: 'T-Shirt', label: 'T-Shirt', icon: '👕' },
    { id: 'shirt', name: 'Shirt', label: 'Shirt', icon: '👔' },
    { id: 'jeans', name: 'Jeans', label: 'Jeans', icon: '👖' },
    { id: 'watches', name: 'Watches', label: 'Watches', icon: '⌚' },
    { id: 'belts', name: 'Belts', label: 'Belts', icon: '🎗️' },
    { id: 'chain', name: 'Chain', label: 'Chain', icon: '⛓️' },
    { id: 'earrings', name: 'Earrings', label: 'Earrings', icon: '💎' },
    { id: 'bangles', name: 'Bangles', label: 'Bangles', icon: '💫' },
    { id: 'bracelets', name: 'Bracelets', label: 'Bracelets', icon: '📿' }
  ],
  Applieances: [
    { id: 'iron-box', name: 'Iron Box', label: 'Iron Box', icon: '👔' },
    { id: 'mixers-blenders', name: 'Mixers & Blenders', label: 'Mixers & Blenders', icon: '🍹' },
    { id: 'hair-dryer', name: 'Hair Dryer', label: 'Hair Dryer', icon: '💨' },
    { id: 'trimmers', name: 'Trimmers', label: 'Trimmers', icon: '✂️' }
  ]
};

// Aliases for department keys
export const normalizeDepartmentKey = (rawDept = '') => {
  const d = String(rawDept || '').trim().toLowerCase();
  if (d === 'cosmatics' || d === 'cosmetics') return 'Cosmatics';
  if (d === 'applieances' || d === 'appliances') return 'Applieances';
  if (d === 'fashion') return 'Fashion';
  return 'Cosmatics';
};

/**
 * Check if a product matches a specific subcategory.
 * Uses exact word-boundary regexes on product name, category, and subCategory to eliminate false positives.
 */
export const matchesSubcategory = (product, subcategoryName) => {
  if (!product) return false;
  if (!subcategoryName || subcategoryName === 'All') return true;

  const target = String(subcategoryName).trim().toLowerCase();
  const cat = String(product.category || '').trim().toLowerCase();
  const subCat = String(product.subCategory || product.subcategory || '').trim().toLowerCase();
  const subCats = Array.isArray(product.subCategories)
    ? product.subCategories.map(s => String(s).toLowerCase().trim())
    : [];
  const name = String(product.name || '').toLowerCase();
  const titleAndCat = `${name} ${cat} ${subCat} ${subCats.join(' ')}`;

  // Direct exact match on category, subCategory, or ticked subCategories array
  if (cat === target || subCat === target || subCats.includes(target)) return true;

  // 1. COSMATICS SUBCATEGORIES
  if (target === 'sunscreens' || target === 'sunscreen') {
    return /\b(sunscreen|sun-screen|sunblock|spf)\b/i.test(titleAndCat);
  }

  if (target === 'moisturizers' || target === 'moisturizer') {
    return /\b(moisturiz|moisturis|hydrating cream|barrier cream|face cream|day cream|night cream)\b/i.test(titleAndCat);
  }

  if (target === 'hair serum' || target === 'hair-serum') {
    return (
      /\b(hair growth serum|hair serum|scalp serum|hair oil)\b/i.test(titleAndCat) ||
      (/\bhair\b/i.test(titleAndCat) && /\bserum\b/i.test(titleAndCat))
    );
  }

  if (target === 'face serum' || target === 'faceserum' || target === 'face-serum') {
    if (/\bhair\b/i.test(titleAndCat)) return false;
    return (
      /\b(face serum|faceserum|brightening serum|clearing serum|niacinamide|vitamin c serum|hyaluronic serum|salicylic serum|glow serum)\b/i.test(titleAndCat) ||
      /\bserum\b/i.test(titleAndCat)
    );
  }

  if (
    target === 'body lotions' ||
    target === 'body lotion' ||
    target === 'body loations' ||
    target === 'body-lotions'
  ) {
    return (
      /\b(body lotion|body milk|aha body lotion|body moisturizer)\b/i.test(titleAndCat) ||
      (/\bbody\b/i.test(titleAndCat) && /\blotion\b/i.test(titleAndCat))
    );
  }

  if (target === 'body washes' || target === 'body wash' || target === 'body-washes') {
    return (
      /\b(body wash|shower gel|body scrub|body cleanser)\b/i.test(titleAndCat) ||
      (/\bbody\b/i.test(titleAndCat) && /\bwash\b/i.test(titleAndCat))
    );
  }

  if (target === 'face washes' || target === 'face wash' || target === 'facewash' || target === 'face-washes') {
    return /\b(face wash|facewash|face cleanser|face scrub|facial cleanser|cleansing foam|detan face wash|anti-acne face wash)\b/i.test(titleAndCat);
  }

  if (target === 'lipsticks' || target === 'lipstick') {
    return /\b(lipstick|lip stick|liquid lipstick|matte lip)\b/i.test(titleAndCat);
  }

  if (
    target === 'lip balms' ||
    target === 'lip balm' ||
    target === 'lipbalms' ||
    target === 'lipbalm' ||
    target === 'lip-balms'
  ) {
    return /\b(lip balm|lipbalm|tinted lip balm|lip butter|lip care|lip oil|lip mask)\b/i.test(titleAndCat);
  }

  if (target === 'toners' || target === 'toner') {
    return /\b(toner|toners|facial mist|skin tonic|essence)\b/i.test(titleAndCat);
  }

  if (
    target === 'strobe creams' ||
    target === 'strobe cream' ||
    target === 'strobe' ||
    target === 'strobe-creams'
  ) {
    return /\b(strobe cream|strobe|illuminator|illuminating cream|highlighter cream)\b/i.test(titleAndCat);
  }

  // 2. FASHION SUBCATEGORIES
  if (target === 'saree' || target === 'sarees') {
    return /\b(saree|sarees|sari|saris)\b/i.test(titleAndCat);
  }

  if (
    target === 't-shirt' ||
    target === 'tshirt' ||
    target === 't shirt' ||
    target === 't-shirts' ||
    target === 'tshirts'
  ) {
    return /\b(t-shirt|tshirt|t-shirts|tshirts|t shirt|tees?|polo)\b/i.test(titleAndCat);
  }

  if (target === 'shirt' || target === 'shirts') {
    if (/\b(t-shirt|tshirt|t shirt)\b/i.test(titleAndCat)) return false;
    return /\b(shirt|shirts|oxford|linen shirt)\b/i.test(titleAndCat);
  }

  if (target === 'jeans' || target === 'jean') {
    return /\b(jeans?|denims?)\b/i.test(titleAndCat);
  }

  if (target === 'watches' || target === 'watch') {
    return /\b(watch|watches|timepiece|chronograph)\b/i.test(titleAndCat);
  }

  if (target === 'belts' || target === 'belt') {
    return /\b(belt|belts)\b/i.test(titleAndCat);
  }

  if (target === 'chain' || target === 'chains') {
    return /\b(chain|chains|necklaces?|pendants?)\b/i.test(titleAndCat);
  }

  if (
    target === 'earrings' ||
    target === 'earring' ||
    target === 'earings' ||
    target === 'earing'
  ) {
    return /\b(earrings?|earings?|ear studs?|jhumkas?)\b/i.test(titleAndCat);
  }

  if (
    target === 'bangles' ||
    target === 'bangle' ||
    target === 'bangel' ||
    target === 'bangels'
  ) {
    return /\b(bangles?|bangels?|kadas?|chudis?)\b/i.test(titleAndCat);
  }

  if (target === 'bracelets' || target === 'bracelet') {
    return /\b(bracelets?|wristbands?|cuffs?)\b/i.test(titleAndCat);
  }

  // 3. APPLIANCES SUBCATEGORIES
  if (
    target === 'iron box' ||
    target === 'iorn box' ||
    target === 'iron' ||
    target === 'iron-box'
  ) {
    return (
      /\b(iron box|dry iron|steam iron|garment steamer|pressing iron)\b/i.test(titleAndCat) ||
      (/\biron\b/i.test(titleAndCat) && /\b(dry|steam|box|philips|watt|1000w|press)\b/i.test(titleAndCat))
    );
  }

  if (
    target === 'mixers & blenders' ||
    target === 'mixes and blenders' ||
    target === 'mixer' ||
    target === 'blender' ||
    target === 'mixers' ||
    target === 'blenders' ||
    target === 'mixers-blenders'
  ) {
    return /\b(mixer|blender|mixers|blenders|grinder|juicer|food processor|smoothie maker)\b/i.test(titleAndCat);
  }

  if (
    target === 'hair dryer' ||
    target === 'hairdryer' ||
    target === 'hair dryers' ||
    target === 'hair-dryer'
  ) {
    return /\b(hair dryer|hairdryer|blow dryer)\b/i.test(titleAndCat);
  }

  if (target === 'trimmers' || target === 'trimmer') {
    return /\b(trimmer|trimmers|shaver|oneblade|clippers?|grooming)\b/i.test(titleAndCat);
  }

  return false;
};

/**
 * Check if a product belongs to a department overall.
 */
export const matchesDepartmentProduct = (product, departmentName) => {
  if (!product) return false;
  const deptKey = normalizeDepartmentKey(departmentName);
  const pCat = String(product.category || '').toLowerCase().trim();
  const pSub = String(product.subCategory || product.subcategory || '').toLowerCase().trim();
  const pName = String(product.name || '').toLowerCase().trim();
  const combined = `${pCat} ${pSub} ${pName}`;

  if (deptKey === 'Cosmatics') {
    if (
      pCat === 'cosmatics' ||
      pCat === 'cosmetics' ||
      pCat === 'skincare' ||
      pCat === 'lipcare' ||
      pCat === 'bodycare' ||
      pCat === 'haircare' ||
      pCat === 'suppliments' ||
      pCat === 'fragrances'
    ) {
      return true;
    }
    return DEPARTMENT_SUBCATEGORIES.Cosmatics.some(sub => matchesSubcategory(product, sub.name));
  }

  if (deptKey === 'Applieances') {
    if (
      pCat === 'applieances' ||
      pCat === 'appliances' ||
      combined.includes('appliance') ||
      combined.includes('styler') ||
      combined.includes('electric')
    ) {
      return true;
    }
    return DEPARTMENT_SUBCATEGORIES.Applieances.some(sub => matchesSubcategory(product, sub.name));
  }

  if (deptKey === 'Fashion') {
    if (
      pCat === 'fashion' ||
      pCat === 'accessories' ||
      pCat === 'jewelleries' ||
      pCat === 'watches' ||
      pCat === 'lifestyle' ||
      pCat === 'sarees'
    ) {
      return true;
    }
    return DEPARTMENT_SUBCATEGORIES.Fashion.some(sub => matchesSubcategory(product, sub.name));
  }

  return false;
};

/**
 * Returns subcategory list for a department with product counts.
 */
export const getSubcategoriesWithCounts = (departmentName, departmentProducts = []) => {
  const deptKey = normalizeDepartmentKey(departmentName);
  const subcats = DEPARTMENT_SUBCATEGORIES[deptKey] || [];

  return subcats.map(sub => {
    const count = departmentProducts.filter(p => matchesSubcategory(p, sub.name)).length;
    return {
      ...sub,
      count
    };
  });
};
