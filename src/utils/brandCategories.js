/**
 * Utility to categorize brands into Cosmetics, Appliances, and Fashion
 * Based on explicit brand.category, associated product categories, and keyword heuristics.
 */

export const BRAND_DEPARTMENTS = [
  { id: 'all', label: 'All Brands', countKey: 'all' },
  { id: 'cosmetics', label: 'Cosmetics', alias: 'cosmatics', countKey: 'cosmetics' },
  { id: 'appliances', label: 'Appliances', alias: 'applieances', countKey: 'appliances' },
  { id: 'fashion', label: 'Fashion', alias: 'fashion', countKey: 'fashion' }
];

export const isCosmeticsCategory = (cat = '') => {
  const c = String(cat).toLowerCase().trim();
  return (
    c.includes('cosmat') ||
    c.includes('cosmet') ||
    c.includes('skin') ||
    c.includes('lip') ||
    c.includes('hair') ||
    c.includes('body') ||
    c.includes('suppl') ||
    c.includes('collag') ||
    c.includes('colleg') ||
    c.includes('fragran') ||
    c.includes('beauty') ||
    c.includes('care') ||
    c.includes('sunscreen') ||
    c.includes('moisturiz') ||
    c.includes('serum') ||
    c.includes('lotion') ||
    c.includes('wash') ||
    c.includes('toner') ||
    c.includes('strobe')
  );
};
export const isCosmaticsCategory = isCosmeticsCategory;

export const isAppliancesCategory = (cat = '') => {
  const c = String(cat).toLowerCase().trim();
  return (
    c.includes('appliance') ||
    c.includes('applieance') ||
    c.includes('electric') ||
    c.includes('gadget') ||
    c.includes('tool') ||
    c.includes('trimmer') ||
    c.includes('dryer') ||
    c.includes('styler') ||
    c.includes('iron') ||
    c.includes('mixer') ||
    c.includes('blender')
  );
};

export const isFashionCategory = (cat = '') => {
  const c = String(cat).toLowerCase().trim();
  return (
    c.includes('fashion') ||
    c.includes('wellness') ||
    c.includes('jewel') ||
    c.includes('watch') ||
    c.includes('saree') ||
    c.includes('wear') ||
    c.includes('dress') ||
    c.includes('bag') ||
    c.includes('cloth') ||
    c.includes('shirt') ||
    c.includes('tshirt') ||
    c.includes('t-shirt') ||
    c.includes('jean') ||
    c.includes('belt') ||
    c.includes('chain') ||
    c.includes('earring') ||
    c.includes('bangle') ||
    c.includes('bracelet')
  );
};

export const categorizeBrand = (brand, products = []) => {
  const brandName = (brand?.name || '').toLowerCase().trim();
  const brandDesc = (brand?.description || '').toLowerCase();
  const explicitCat = (brand?.category || brand?.department || '').toLowerCase().trim();

  const matchedDepartments = new Set();

  // 1. Check explicit brand category / department if set in admin
  if (explicitCat) {
    if (explicitCat.includes('appli')) matchedDepartments.add('appliances');
    if (explicitCat.includes('fash') || explicitCat.includes('lifesty')) matchedDepartments.add('fashion');
    if (explicitCat.includes('cosm') || explicitCat.includes('skin') || explicitCat.includes('suppl')) matchedDepartments.add('cosmetics');
  }

  // 2. Check all products associated with this brand
  const brandProducts = (products || []).filter(
    (p) => (p?.brand || '').toLowerCase().trim() === brandName
  );

  brandProducts.forEach((p) => {
    const pCat = p?.category || '';
    if (isAppliancesCategory(pCat)) matchedDepartments.add('appliances');
    if (isFashionCategory(pCat)) matchedDepartments.add('fashion');
    if (isCosmeticsCategory(pCat)) matchedDepartments.add('cosmetics');
  });

  // 3. Name & Keyword Heuristics for famous or specialized brands
  const appliancesKeywords = ['philips', 'dyson', 'braun', 'panasonic', 'babyliss', 'havells', 'oral-b', 'perfora', 'nova', 'xiaomi', 'geepas', 'appliance'];
  if (appliancesKeywords.some((kw) => brandName.includes(kw) || brandDesc.includes(kw))) {
    matchedDepartments.add('appliances');
  }

  const fashionKeywords = ['zara', 'h&m', 'fashion', 'watch', 'jewel', 'titan', 'casio', 'fossil', 'rolex', 'fastrack', 'ray-ban', 'sunglass'];
  if (fashionKeywords.some((kw) => brandName.includes(kw) || brandDesc.includes(kw))) {
    matchedDepartments.add('fashion');
  }

  // 4. Default: If not matched to anything, default to Cosmetics
  if (matchedDepartments.size === 0) {
    matchedDepartments.add('cosmetics');
  }

  return matchedDepartments;
};

export const groupBrandsByDepartment = (brands = [], products = []) => {
  const cosmetics = [];
  const appliances = [];
  const fashion = [];

  brands.forEach((brand) => {
    const depts = categorizeBrand(brand, products);
    if (depts.has('cosmetics')) cosmetics.push(brand);
    if (depts.has('appliances')) appliances.push(brand);
    if (depts.has('fashion')) fashion.push(brand);
  });

  return {
    all: brands,
    cosmetics,
    cosmatics: cosmetics, // alias for backwards compatibility
    appliances,
    applieances: appliances, // alias for backwards compatibility
    fashion
  };
};
