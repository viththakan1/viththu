import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Check,
  Star,
  ExternalLink,
  ChevronDown,
  Award,
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Ruler
} from 'lucide-react';

export const AdminProducts = () => {
  const {
    products,
    categories,
    brands = [],
    addProduct,
    updateProduct,
    deleteProduct,
    bulkAddProducts,
    showToast,
    formatPrice
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Bulk Upload & Download States
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedBulkProducts, setParsedBulkProducts] = useState([]);
  const [bulkUploadError, setBulkUploadError] = useState('');
  const [bulkImportMode, setBulkImportMode] = useState('append'); // 'append' | 'replace'
  const exportDropdownRef = useRef(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleExportClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleExportClickOutside);
    return () => document.removeEventListener('mousedown', handleExportClickOutside);
  }, []);

  // Auto-suggest brand dropdown state
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const initialForm = {
    name: '',
    category: categories[0]?.name || 'Sarees',
    brand: brands[0]?.name || 'AxisX Originals',
    barcode: '',
    price: '',
    oldPrice: '',
    fabric: 'Pure Silk',
    stockQty: '15',
    badge: 'New',
    colors: ['Red', 'Gold'],
    sizes: ['Free Size'],
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92&crop=entropy',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92&crop=entropy',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=92&crop=entropy'
    ],
    description: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  // Export all or filtered products to CSV
  const exportProductsToCSV = (productList = products, filenameSuffix = 'catalog') => {
    const headers = [
      'id',
      'barcode',
      'name',
      'category',
      'brand',
      'price',
      'oldPrice',
      'stockQty',
      'inStock',
      'fabric',
      'badge',
      'rating',
      'reviews',
      'colors',
      'sizes',
      'image',
      'images',
      'description'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = productList.map((p) => {
      const pImages = Array.isArray(p.images) ? p.images.join(' | ') : (p.image || '');
      const pColors = Array.isArray(p.colors) ? p.colors.join(' | ') : (p.colors || '');
      const pSizes = Array.isArray(p.sizes) ? p.sizes.join(' | ') : (p.sizes || '');
      const pBarcode = p.barcode || `AXISX-${String(p.id).padStart(6, '0')}`;

      return [
        escapeCSV(p.id),
        escapeCSV(pBarcode),
        escapeCSV(p.name),
        escapeCSV(p.category || ''),
        escapeCSV(p.brand || ''),
        escapeCSV(p.price || 0),
        escapeCSV(p.oldPrice || ''),
        escapeCSV(p.stockQty !== undefined ? p.stockQty : 10),
        escapeCSV(p.inStock !== false ? 'true' : 'false'),
        escapeCSV(p.fabric || ''),
        escapeCSV(p.badge || ''),
        escapeCSV(p.rating || 5.0),
        escapeCSV(p.reviews || 0),
        escapeCSV(pColors),
        escapeCSV(pSizes),
        escapeCSV(p.image || ''),
        escapeCSV(pImages),
        escapeCSV(p.description || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_products_${filenameSuffix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${productList.length} products to CSV!`);
  };

  // Export to JSON
  const exportProductsToJSON = (productList = products) => {
    const jsonContent = JSON.stringify(productList, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_products_catalog_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${productList.length} products to JSON!`);
  };

  // Download Sample CSV Template
  const downloadSampleCSVTemplate = () => {
    const headers = [
      'name',
      'barcode',
      'category',
      'brand',
      'price',
      'oldPrice',
      'stockQty',
      'inStock',
      'fabric',
      'badge',
      'colors',
      'sizes',
      'image',
      'images',
      'description'
    ];

    const sampleRows = [
      [
        '"Royal Silk Banarasi Saree"',
        '"AXISX-100001"',
        '"Sarees"',
        '"Heritage Looms"',
        '"12500"',
        '"15000"',
        '"15"',
        '"true"',
        '"Pure Katan Silk"',
        '"Best Seller"',
        '"Red | Gold | Maroon"',
        '"Free Size"',
        '"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1200&fit=crop"',
        '"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1200&fit=crop | https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&h=1200&fit=crop"',
        '"Exquisite handwoven Banarasi silk saree with intricate gold zari work."'
      ].join(','),
      [
        '"Premium Linen Mandarin Shirt"',
        '"AXISX-100002"',
        '"Men\'s Wear"',
        '"AxisX Originals"',
        '"3200"',
        '"4000"',
        '"30"',
        '"true"',
        '"Pure Organic Linen"',
        '"New Arrival"',
        '"White | Sky Blue | Beige"',
        '"S | M | L | XL | XXL"',
        '"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&h=1200&fit=crop"',
        '"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&h=1200&fit=crop | https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&h=1200&fit=crop"',
        '"Relaxed fit breathable tropical linen shirt crafted for luxury casual comfort."'
      ].join(',')
    ];

    const content = '\uFEFF' + [headers.join(','), ...sampleRows].join('\r\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'axisx_bulk_product_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast('Sample template downloaded!');
  };

  // Robust CSV parser
  const parseCSVText = (text) => {
    const lines = [];
    let currentRow = [];
    let currentVal = '';
    let inQuotes = false;

    // Clean BOM if present
    const cleanText = text.replace(/^\uFEFF/, '');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentVal.trim());
        if (currentRow.some((col) => col.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }

    if (currentVal || currentRow.length > 0) {
      currentRow.push(currentVal.trim());
      if (currentRow.some((col) => col.length > 0)) {
        lines.push(currentRow);
      }
    }

    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one product row.');
    }

    const rawHeaders = lines[0].map((h) => h.replace(/^["']|["']$/g, '').toLowerCase().trim());

    const items = [];
    for (let r = 1; r < lines.length; r++) {
      const row = lines[r];
      const item = {};
      rawHeaders.forEach((header, idx) => {
        const val = row[idx] !== undefined ? row[idx].replace(/^["']|["']$/g, '').trim() : '';
        item[header] = val;
      });

      if (item.name && (item.price !== undefined && item.price !== '')) {
        const rawImages = item.images || item.image || '';
        const imagesArr = rawImages.split(/[|,]/).map((s) => s.trim()).filter(Boolean);
        const mainImg = item.image || imagesArr[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1200&fit=crop';
        const colorsArr = (item.colors || '').split(/[|,]/).map((s) => s.trim()).filter(Boolean);
        const sizesArr = (item.sizes || '').split(/[|,]/).map((s) => s.trim()).filter(Boolean);

        items.push({
          id: item.id ? String(item.id) : `prod-${Date.now()}-${r}`,
          name: item.name,
          barcode: item.barcode || `AXISX-${Date.now().toString().slice(-6)}`,
          category: item.category || (categories[0]?.name || 'Sarees'),
          brand: item.brand || (brands[0]?.name || 'AxisX Originals'),
          price: Number(item.price) || 0,
          oldPrice: item.oldprice || item.old_price ? Number(item.oldprice || item.old_price) : undefined,
          stockQty: item.stockqty || item.stock ? Number(item.stockqty || item.stock) : 10,
          inStock: item.instock !== 'false' && item.instock !== false,
          fabric: item.fabric || '',
          badge: item.badge || '',
          rating: Number(item.rating || 5.0),
          reviews: Number(item.reviews || 0),
          colors: colorsArr.length > 0 ? colorsArr : ['Standard'],
          sizes: sizesArr.length > 0 ? sizesArr : ['Free Size'],
          image: mainImg,
          images: imagesArr.length > 0 ? imagesArr : [mainImg],
          description: item.description || ''
        });
      }
    }

    return items;
  };

  // Handle file selection for bulk upload
  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkUploadError('');
    setParsedBulkProducts([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') return;

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) {
            throw new Error('JSON file must contain an array of product objects.');
          }
          const formatted = parsed.map((item, idx) => ({
            id: item.id ? String(item.id) : `prod-${Date.now()}-${idx}`,
            name: item.name || 'Untitled Product',
            barcode: item.barcode || `AXISX-${Date.now().toString().slice(-6)}`,
            category: item.category || (categories[0]?.name || 'Sarees'),
            brand: item.brand || (brands[0]?.name || 'AxisX Originals'),
            price: Number(item.price) || 0,
            oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
            stockQty: item.stockQty !== undefined ? Number(item.stockQty) : 10,
            inStock: item.inStock !== false,
            fabric: item.fabric || '',
            badge: item.badge || '',
            rating: Number(item.rating || 5.0),
            reviews: Number(item.reviews || 0),
            colors: Array.isArray(item.colors) ? item.colors : ['Standard'],
            sizes: Array.isArray(item.sizes) ? item.sizes : ['Free Size'],
            image: item.image || (Array.isArray(item.images) && item.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1200&fit=crop',
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1200&fit=crop'],
            description: item.description || ''
          }));
          setParsedBulkProducts(formatted);
        } else {
          // Assume CSV
          const parsed = parseCSVText(content);
          if (parsed.length === 0) {
            throw new Error('No valid products found in CSV. Please verify column headers and values.');
          }
          setParsedBulkProducts(parsed);
        }
      } catch (err) {
        setBulkUploadError(err.message || 'Failed to parse file. Please verify CSV/JSON formatting.');
      }
    };

    reader.readAsText(file);
  };

  // Execute Bulk Import
  const handleExecuteBulkImport = () => {
    if (parsedBulkProducts.length === 0) {
      if (showToast) showToast('No valid products to import.', 'error');
      return;
    }

    if (bulkAddProducts) {
      bulkAddProducts(parsedBulkProducts, bulkImportMode === 'replace');
    }
    setIsBulkUploadModalOpen(false);
    setBulkFile(null);
    setParsedBulkProducts([]);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setNewImageUrl('');
    setColorInput('');
    setSizeInput('');
    setIsBrandDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const pImages = (p.images && p.images.length > 0)
      ? [...p.images]
      : (p.image ? [p.image] : []);
    const pColors = Array.isArray(p.colors) && p.colors.length > 0
      ? [...p.colors]
      : (p.colors ? String(p.colors).split(/[|,]/).map(s => s.trim()).filter(Boolean) : ['Standard']);
    const pSizes = Array.isArray(p.sizes) && p.sizes.length > 0
      ? [...p.sizes]
      : (p.sizes ? String(p.sizes).split(/[|,]/).map(s => s.trim()).filter(Boolean) : ['Free Size']);

    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand || (brands[0]?.name || 'AxisX Originals'),
      barcode: p.barcode || `AXISX-${String(p.id).padStart(6, '0')}`,
      price: p.price,
      oldPrice: p.oldPrice || '',
      fabric: p.fabric || '',
      stockQty: p.stockQty || '10',
      badge: p.badge || '',
      colors: pColors,
      sizes: pSizes,
      image: p.image || (pImages[0] || ''),
      images: pImages.length > 0 ? pImages : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92&crop=entropy'],
      description: p.description || ''
    });
    setNewImageUrl('');
    setColorInput('');
    setSizeInput('');
    setIsBrandDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Color Handlers (Typeable & Presets)
  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    const parts = colorInput.split(/[|,]/).map(s => s.trim()).filter(Boolean);
    const existing = formData.colors || [];
    const newColors = [...existing];
    parts.forEach(p => {
      if (!newColors.includes(p)) newColors.push(p);
    });
    setFormData(prev => ({ ...prev, colors: newColors }));
    setColorInput('');
  };

  const handleRemoveColor = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddPresetColor = (preset) => {
    const existing = formData.colors || [];
    if (!existing.includes(preset)) {
      setFormData(prev => ({ ...prev, colors: [...existing, preset] }));
    }
  };

  // Size Handlers (Typeable & Presets)
  const handleAddSize = () => {
    if (!sizeInput.trim()) return;
    const parts = sizeInput.split(/[|,]/).map(s => s.trim()).filter(Boolean);
    const existing = formData.sizes || [];
    const newSizes = [...existing];
    parts.forEach(p => {
      if (!newSizes.includes(p)) newSizes.push(p);
    });
    setFormData(prev => ({ ...prev, sizes: newSizes }));
    setSizeInput('');
  };

  const handleRemoveSize = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddPresetSize = (preset) => {
    const existing = formData.sizes || [];
    if (!existing.includes(preset)) {
      setFormData(prev => ({ ...prev, sizes: [...existing, preset] }));
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const updated = [...(formData.images || []), newImageUrl.trim()];
    setFormData({
      ...formData,
      image: updated[0],
      images: updated
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = (formData.images || []).filter((_, idx) => idx !== indexToRemove);
    setFormData({
      ...formData,
      image: updated[0] || '',
      images: updated
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target.result;
        const updated = [...(formData.images || []), resultUrl];
        setFormData({
          ...formData,
          image: updated[0],
          images: updated
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const validImages = (formData.images && formData.images.length > 0)
      ? formData.images
      : [formData.image].filter(Boolean);

    const primaryImage = validImages[0] || formData.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92&crop=entropy';

    const finalColors = Array.isArray(formData.colors) && formData.colors.length > 0
      ? formData.colors
      : ['Standard'];
    const finalSizes = Array.isArray(formData.sizes) && formData.sizes.length > 0
      ? formData.sizes
      : ['Free Size'];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        colors: finalColors,
        sizes: finalSizes,
        image: primaryImage,
        images: validImages,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
        stockQty: Number(formData.stockQty)
      });
    } else {
      addProduct({
        ...formData,
        colors: finalColors,
        sizes: finalSizes,
        image: primaryImage,
        images: validImages,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
        stockQty: Number(formData.stockQty)
      });
    }

    setIsModalOpen(false);
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchesSearch && matchesCat && matchesBrand;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Products & Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store's luxury textiles, sarees, fabrics, barcodes, and stock levels.
          </p>
        </div>

        {/* Action Buttons: Bulk Download Details, Bulk Upload, Add Product */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Bulk Product Details Download Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              type="button"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download Product Details (CSV/JSON)"
            >
              <Download className="w-4 h-4 text-cyan-600" />
              <span>Download Details</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-30 space-y-1 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    exportProductsToCSV(products, 'full_catalog');
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-cyan-50 text-xs text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Download All Products (CSV)</div>
                    <div className="text-[10px] text-slate-400">All {products.length} products with full specs & barcodes</div>
                  </div>
                </button>

                {filtered.length !== products.length && (
                  <button
                    type="button"
                    onClick={() => {
                      exportProductsToCSV(filtered, 'filtered');
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-cyan-50 text-xs text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">Download Filtered (CSV)</div>
                      <div className="text-[10px] text-slate-400">{filtered.length} currently searched / filtered items</div>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    exportProductsToJSON(products);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                >
                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Download Catalog (JSON)</div>
                    <div className="text-[10px] text-slate-400">Complete JSON database export</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadSampleCSVTemplate();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                >
                  <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Download Sample CSV Template</div>
                    <div className="text-[10px] text-slate-400">Blank template with sample columns</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Bulk Product Upload Button */}
          <button
            type="button"
            onClick={() => {
              setBulkFile(null);
              setParsedBulkProducts([]);
              setBulkUploadError('');
              setIsBulkUploadModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Bulk Upload Products (CSV / JSON)"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Bulk Upload</span>
          </button>

          {/* Add Single Product */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Bulk Inventory Operations Banner Card */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/10 text-cyan-300 border border-white/10 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-sm sm:text-base text-white">
                Bulk Inventory Management
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                CSV & JSON Powered
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Instantly import hundreds of products with barcodes & image galleries, or export full catalog specs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={downloadSampleCSVTemplate}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>Sample Template</span>
          </button>
          <button
            type="button"
            onClick={() => exportProductsToCSV(products, 'catalog')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Catalog (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Category:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Brand:</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Fabric</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badge</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="w-12 h-14 object-cover rounded-lg shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400">ID: {p.id}</span>
                          <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-100">
                            {p.barcode || `AXISX-${String(p.id).padStart(6, '0')}`}
                          </span>
                        </div>
                        {p.brand && (
                          <div className="mt-1">
                            {(() => {
                              const bObj = brands.find(b => b.name.toLowerCase() === p.brand.toLowerCase());
                              return (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  {bObj?.logo ? (
                                    <img src={bObj.logo} alt="" className="w-3 h-3 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <Award className="w-2.5 h-2.5 text-cyan-600" />
                                  )}
                                  <span>{p.brand}</span>
                                </span>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{p.category}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {p.fabric || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{formatPrice(p.price)}</p>
                    {p.oldPrice && (
                      <p className="text-[10px] text-slate-400 line-through">{formatPrice(p.oldPrice)}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {p.inStock ? `${p.stockQty || 10} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.badge ? (
                      <span className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.badge}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Silk Banarasi Saree"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand / Studio with Auto-Suggest and Scroll Dropdown */}
                <div className="relative" ref={brandDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Brand / Studio *
                    </label>
                    <Link
                      to="/admin/brands"
                      target="_blank"
                      className="text-[10px] text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-0.5 hover:underline"
                    >
                      <span>Manage</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>

                  <div className="relative flex items-center">
                    {/* Brand Logo / Icon Indicator */}
                    <div className="absolute left-2.5 flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 border border-slate-200 overflow-hidden pointer-events-none">
                      {(() => {
                        const matched = brands.find(b => b.name.toLowerCase() === (formData.brand || '').trim().toLowerCase());
                        if (matched?.logo) {
                          return <img src={matched.logo} alt="" className="w-full h-full object-cover" />;
                        }
                        return <Award className="w-3.5 h-3.5 text-cyan-700" />;
                      })()}
                    </div>

                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onFocus={() => setIsBrandDropdownOpen(true)}
                      onChange={e => {
                        setFormData({ ...formData, brand: e.target.value });
                        setIsBrandDropdownOpen(true);
                      }}
                      placeholder="Type or scroll brand..."
                      className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                      className="absolute right-1.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                      title="Show brand options"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBrandDropdownOpen ? 'rotate-180 text-cyan-600' : ''}`} />
                    </button>
                  </div>

                  {/* Auto-Suggest Scrollable Brand Dropdown */}
                  {isBrandDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Brands ({brands.length})</span>
                        <span className="text-[10px] text-cyan-600 font-normal">Scroll to pick</span>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {(() => {
                          const query = (formData.brand || '').trim().toLowerCase();
                          const matches = brands.filter(b =>
                            b.name.toLowerCase().includes(query) ||
                            (b.origin && b.origin.toLowerCase().includes(query))
                          );

                          if (matches.length === 0) {
                            return (
                              <div className="p-3 text-center space-y-1.5">
                                <p className="text-xs text-slate-500">No registered brand for "{formData.brand}"</p>
                                <button
                                  type="button"
                                  onClick={() => setIsBrandDropdownOpen(false)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100"
                                >
                                  Keep custom brand: "{formData.brand}"
                                </button>
                              </div>
                            );
                          }

                          return matches.map(b => {
                            const isSelected = formData.brand.trim().toLowerCase() === b.name.toLowerCase();
                            return (
                              <button
                                type="button"
                                key={b.id}
                                onClick={() => {
                                  setFormData({ ...formData, brand: b.name });
                                  setIsBrandDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2.5 transition-colors ${
                                  isSelected ? 'bg-cyan-50 text-cyan-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {b.logo ? (
                                      <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] font-bold text-cyan-700">{b.name.slice(0, 2).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold truncate leading-tight">{b.name}</p>
                                    {b.origin && (
                                      <p className="text-[10px] text-slate-400 truncate">{b.origin}</p>
                                    )}
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Horizontal Scroll Quick-Pick Brand Bar */}
                  <div className="mt-1.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                      {brands.map(b => {
                        const isSelected = formData.brand.trim().toLowerCase() === b.name.toLowerCase();
                        return (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => {
                              setFormData({ ...formData, brand: b.name });
                              setIsBrandDropdownOpen(false);
                            }}
                            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 bg-slate-200">
                              {b.logo && <img src={b.logo} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="whitespace-nowrap">{b.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={e => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Pure Silk / Linen"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Best Seller / New"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 12500"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Original Price (Strikethrough)</label>
                  <input
                    type="number"
                    value={formData.oldPrice}
                    onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQty}
                    onChange={e => setFormData({ ...formData, stockQty: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Barcode / SKU</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. AXISX-000001 (auto-generated if empty)"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Product Available Colours & Sizes (Typeable & Custom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                {/* Colours Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Available Colours ({formData.colors?.length || 0})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Type & Enter</span>
                  </div>

                  {/* Typeable Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={e => setColorInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                      placeholder="Type colour (e.g. Maroon, Gold)..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Active Colour Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-white rounded-xl border border-slate-200">
                    {(formData.colors || []).map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-cyan-50 text-cyan-900 border border-cyan-200 shadow-2xs"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-cyan-600 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove colour"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!formData.colors || formData.colors.length === 0) && (
                      <span className="text-[11px] text-slate-400 italic">No colours added yet</span>
                    )}
                  </div>

                  {/* Quick Colour Presets */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[10px] text-slate-400 mr-1">Quick Add:</span>
                    {['Red', 'Gold', 'Maroon', 'White', 'Black', 'Blue', 'Green', 'Pink'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddPresetColor(preset)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Available Sizes ({formData.sizes?.length || 0})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Type & Enter</span>
                  </div>

                  {/* Typeable Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={e => setSizeInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSize();
                        }
                      }}
                      placeholder="Type size (e.g. S, M, L, Free Size, 38)..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Active Size Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-white rounded-xl border border-slate-200">
                    {(formData.sizes || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(idx)}
                          className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove size"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!formData.sizes || formData.sizes.length === 0) && (
                      <span className="text-[11px] text-slate-400 italic">No sizes added yet</span>
                    )}
                  </div>

                  {/* Quick Size Presets */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[10px] text-slate-400 mr-1">Quick Add:</span>
                    {['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddPresetSize(preset)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Gallery Images (Multiple Angles for 70% Product View) */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Product Gallery Images ({formData.images?.length || 0})
                  </label>
                  <span className="text-[10px] text-cyan-700 font-semibold">
                    Covers 70% Product Gallery
                  </span>
                </div>

                {/* Add Image URL or File Upload */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Add Angle
                  </button>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs shrink-0">
                    <Upload className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Thumbnail strip of added images */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {(formData.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 group shadow-xs"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-cyan-700 text-white text-[8px] font-bold">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  Tip: Upload 3-4 images showing full drape, embroidery close-ups, and fabric texture.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the textile craft, weaving, and occasion..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BULK PRODUCT UPLOAD MODAL (CSV & JSON IMPORT)           */}
      {/* ======================================================== */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Bulk Product Upload
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Import multiple products at once using CSV or JSON spreadsheets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkUploadModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Download Template Callout */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                  <span>Step 1: Download Standard CSV Template</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Use our pre-configured column structure (Name, Barcode, Category, Brand, Price, Images).
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleCSVTemplate}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-600" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* Step 2: Upload Zone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 2: Upload CSV or JSON File
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-cyan-50/30">
                <input
                  type="file"
                  id="bulkFileInput"
                  accept=".csv, .json, text/csv, application/json"
                  onChange={handleBulkFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="bulkFileInput"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100/70 text-cyan-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyan-700 hover:underline">
                      Click to choose CSV/JSON file
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports .CSV spreadsheets (Excel compatible) & .JSON catalog arrays
                  </p>
                </label>
              </div>

              {bulkFile && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{bulkFile.name}</span>
                      <span className="text-slate-400 ml-2 font-mono text-[10px]">
                        ({(bulkFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {parsedBulkProducts.length} Valid Products Ready
                  </span>
                </div>
              )}

              {bulkUploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{bulkUploadError}</span>
                </div>
              )}
            </div>

            {/* Step 3: Preview Table */}
            {parsedBulkProducts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Step 3: Preview Parsed Products ({parsedBulkProducts.length} detected)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Showing first {Math.min(parsedBulkProducts.length, 5)} rows
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2">Barcode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedBulkProducts.slice(0, 5).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 font-semibold text-slate-800 flex items-center gap-2">
                            <img
                              src={p.image}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1200&fit=crop';
                              }}
                            />
                            <span className="truncate max-w-[140px]">{p.name}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{p.category}</td>
                          <td className="px-3 py-2 text-slate-600">{p.brand}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">{formatPrice(p.price)}</td>
                          <td className="px-3 py-2 text-slate-600">{p.stockQty}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-slate-400">{p.barcode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Import Mode Radio */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Step 4: Select Import Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        bulkImportMode === 'append'
                          ? 'border-cyan-500 bg-cyan-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bulkImportMode"
                        value="append"
                        checked={bulkImportMode === 'append'}
                        onChange={() => setBulkImportMode('append')}
                        className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Append to Inventory</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Adds {parsedBulkProducts.length} new items alongside existing {products.length} products.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        bulkImportMode === 'replace'
                          ? 'border-rose-400 bg-rose-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bulkImportMode"
                        value="replace"
                        checked={bulkImportMode === 'replace'}
                        onChange={() => setBulkImportMode('replace')}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-rose-900">Replace Entire Catalog</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Replaces current catalog with only the {parsedBulkProducts.length} uploaded items.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedBulkProducts.length === 0}
                onClick={handleExecuteBulkImport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 ${
                  parsedBulkProducts.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>
                  Confirm & Import {parsedBulkProducts.length > 0 ? `${parsedBulkProducts.length} Products` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
