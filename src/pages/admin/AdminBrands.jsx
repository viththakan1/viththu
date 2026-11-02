import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Upload,
  Sparkles,
  Package,
  Globe,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Image as ImageIcon,
  Download,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  UploadCloud,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';

export const AdminBrands = () => {
  const { brands, setBrands, products, addBrand, updateBrand, deleteBrand, bulkAddBrands, showToast } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Bulk Upload & Download States
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedBulkBrands, setParsedBulkBrands] = useState([]);
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

  const initialForm = {
    name: '',
    logo: '',
    banner: '',
    description: '',
    origin: '',
    featured: false,
    faqs: []
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      banner: brand.banner || '',
      description: brand.description || '',
      origin: brand.origin || '',
      featured: Boolean(brand.featured),
      faqs: Array.isArray(brand.faqs) && brand.faqs.length > 0 ? brand.faqs : []
    });
    setIsModalOpen(true);
  };

  const handleAddFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { q: '', a: '' }]
    }));
  };

  const handleUpdateFaq = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.faqs || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleRemoveFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index)
    }));
  };

  const handleLoadDefaultFaqs = () => {
    const brandName = formData.name || 'this brand';
    setFormData(prev => ({
      ...prev,
      faqs: [
        {
          q: `Are all ${brandName} products 100% authentic and handpicked?`,
          a: `Yes! At haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.`
        },
        {
          q: `How should I wash and care for ${brandName} items?`,
          a: `We recommend dry cleaning or gentle hand wash in cold water with mild detergent. Keep away from harsh direct sunlight.`
        },
        {
          q: `What is the estimated delivery time for ${brandName}?`,
          a: `Islandwide delivery takes 2-4 business days. Colombo express delivery arrives within 24-48 hours.`
        },
        {
          q: `What is the return and exchange policy?`,
          a: `We provide a 7-day hassle-free exchange for unused items with original tags and packaging intact.`
        }
      ]
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file too large (max 2MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, logo: event.target.result }));
        showToast('Brand logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Banner file too large (max 3MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, banner: event.target.result }));
        showToast('Brand product banner uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Export all brands to CSV
  const exportBrandsToCSV = (brandList = brands) => {
    const headers = [
      'id',
      'name',
      'origin',
      'featured',
      'description',
      'logo',
      'banner',
      'faqs'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = brandList.map((b) => {
      // Serialize FAQs to readable string: Q1 | A1 ; Q2 | A2
      let faqsStr = '';
      if (Array.isArray(b.faqs) && b.faqs.length > 0) {
        faqsStr = b.faqs.map(f => `${f.q.replace(/[|;]/g, '-')} | ${f.a.replace(/[|;]/g, '-')}`).join(' ; ');
      }

      return [
        escapeCSV(b.id || ''),
        escapeCSV(b.name || ''),
        escapeCSV(b.origin || ''),
        escapeCSV(b.featured ? 'true' : 'false'),
        escapeCSV(b.description || ''),
        escapeCSV(b.logo || ''),
        escapeCSV(b.banner || ''),
        escapeCSV(faqsStr)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_brands_catalog_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${brandList.length} brands to CSV!`);
  };

  // Export to JSON
  const exportBrandsToJSON = (brandList = brands) => {
    const jsonContent = JSON.stringify(brandList, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_brands_catalog_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${brandList.length} brands to JSON!`);
  };

  // Download Sample CSV Template
  const downloadSampleCSVTemplate = () => {
    const headers = [
      'name',
      'origin',
      'featured',
      'description',
      'logo',
      'banner',
      'faqs'
    ];

    const content = '\uFEFF' + headers.join(',') + '\r\n';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'axisx_bulk_brand_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast('Brand upload template downloaded!');
  };

  // Robust CSV parser for Brands
  const parseCSVText = (text) => {
    const lines = [];
    let currentRow = [];
    let currentVal = '';
    let inQuotes = false;

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
      throw new Error('CSV must have a header row and at least one brand row.');
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

      if (item.name) {
        let faqsArr = [];
        if (item.faqs) {
          try {
            const parsed = JSON.parse(item.faqs);
            if (Array.isArray(parsed)) {
              faqsArr = parsed.map(f => ({ q: f.q || f.question || '', a: f.a || f.answer || '' })).filter(f => f.q && f.a);
            }
          } catch {
            faqsArr = item.faqs.split(';').map(part => {
              const [q, a] = part.split('|').map(s => s.trim());
              return { q: q || '', a: a || '' };
            }).filter(f => f.q && f.a);
          }
        }

        if (faqsArr.length === 0) {
          faqsArr = [
            {
              q: `Are all ${item.name} products authentic?`,
              a: `Yes, each creation is 100% authentic and handpicked from verified master artisans.`
            },
            {
              q: `How do I care for ${item.name} items?`,
              a: 'Gentle hand wash in cold water or dry clean with mild detergent. Keep away from harsh direct sunlight.'
            },
            {
              q: 'What is the islandwide delivery duration?',
              a: 'Islandwide delivery arrives in 2-4 business days. Colombo express delivery takes 24-48 hours.'
            }
          ];
        }

        items.push({
          id: item.id ? String(item.id) : `brand-${Date.now()}-${r}`,
          name: item.name,
          origin: item.origin || '',
          featured: item.featured === 'true' || item.featured === true,
          description: item.description || '',
          logo: item.logo || '',
          banner: item.banner || '',
          faqs: faqsArr
        });
      }
    }

    return items;
  };

  // Handle file selection for bulk brand upload
  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkUploadError('');
    setParsedBulkBrands([]);

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          const rawList = Array.isArray(json) ? json : (json.brands || []);
          if (!Array.isArray(rawList) || rawList.length === 0) {
            throw new Error('JSON file must contain an array of brand objects.');
          }

          const sanitized = rawList.map((b, idx) => ({
            id: b.id ? String(b.id) : `brand-${Date.now()}-${idx}`,
            name: b.name || `Brand #${idx + 1}`,
            origin: b.origin || '',
            featured: Boolean(b.featured),
            description: b.description || '',
            logo: b.logo || '',
            banner: b.banner || '',
            faqs: Array.isArray(b.faqs) && b.faqs.length > 0 ? b.faqs : []
          }));

          setParsedBulkBrands(sanitized);
        } catch (err) {
          setBulkUploadError(`Invalid JSON format: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else if (fileName.endsWith('.csv') || file.type === 'text/csv') {
      reader.onload = (event) => {
        try {
          const items = parseCSVText(event.target.result);
          if (items.length === 0) {
            throw new Error('No valid brands found in CSV. Make sure each row includes a brand "name".');
          }
          setParsedBulkBrands(items);
        } catch (err) {
          setBulkUploadError(`CSV Parse Error: ${err.message}`);
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      setBulkUploadError('Please upload a valid .csv or .json file.');
    }
  };

  // Execute bulk import
  const handleExecuteBulkImport = () => {
    if (parsedBulkBrands.length === 0) {
      showToast('No parsed brands to import.', 'error');
      return;
    }

    bulkAddBrands(parsedBulkBrands, bulkImportMode === 'replace');
    setIsBulkUploadModalOpen(false);
    setBulkFile(null);
    setParsedBulkBrands([]);
    setBulkUploadError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please provide a brand name', 'error');
      return;
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, formData);
    } else {
      addBrand(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    const assignedProducts = products.filter(p => p.brand === name).length;
    let message = `Are you sure you want to delete brand "${name}"?`;
    if (assignedProducts > 0) {
      message += ` Warning: ${assignedProducts} product(s) are currently linked to this brand!`;
    }
    if (window.confirm(message)) {
      deleteBrand(id);
    }
  };

  // Filtered brands
  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.origin && b.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Brand Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
              {brands.length} Brands
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your fashion labels, artisan weavers, and partner studio brand identities.
          </p>
        </div>

        {/* Action Buttons: Export, Bulk Upload, Add Brand */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Brands</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    exportBrandsToCSV();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Export to CSV (.csv)</div>
                    <div className="text-[10px] text-slate-400">Excel / Spreadsheet compatible</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportBrandsToJSON();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold">Export to JSON (.json)</div>
                    <div className="text-[10px] text-slate-400">Full backup & structured data</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    downloadSampleCSVTemplate();
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div className="font-semibold">Download CSV Template</div>
                    <div className="text-[10px] text-slate-400">Sample format for bulk upload</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Bulk Upload Button */}
          <button
            onClick={() => {
              setBulkFile(null);
              setParsedBulkBrands([]);
              setBulkUploadError('');
              setIsBulkUploadModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-cyan-600" />
            <span>Bulk Upload Brands</span>
          </button>

          {/* Add Brand Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Brand</span>
          </button>
        </div>
      </div>

      {/* Search and Stats bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search brands by name or origin..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{brands.filter(b => b.featured).length} Featured</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-cyan-600" />
            <span>{products.length} Total Inventory Products</span>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredBrands.map((brand) => {
          const productCount = products.filter(p => p.brand === brand.name).length;

          return (
            <div
              key={brand.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group overflow-hidden"
            >
              <div>
                {/* Brand Banner Preview Header */}
                {brand.banner && (
                  <div className="relative h-20 -mx-5 -mt-5 mb-4 overflow-hidden bg-slate-900 group-hover:opacity-95 transition-opacity">
                    <img
                      src={brand.banner}
                      alt={brand.name}
                      className="w-full h-full object-cover filter brightness-[0.8]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                      Banner
                    </span>
                  </div>
                )}

                {/* Logo and Name */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-slate-400 text-xs">
                        {brand.name?.slice(0, 2).toUpperCase() || 'BR'}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading text-sm font-bold text-slate-900 truncate">
                        {brand.name}
                      </h3>
                      {brand.featured && (
                        <span className="shrink-0 p-0.5 rounded-full bg-amber-100 text-amber-700" title="Featured Label">
                          <Award className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{brand.origin || 'Sri Lanka'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {brand.description || 'No description provided.'}
                </p>

                {/* Meta stats badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4 pt-3 border-t border-slate-100">
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 text-[10px] font-bold flex items-center gap-1">
                    <Package className="w-3 h-3 text-cyan-600" />
                    {productCount} Items Linked
                  </span>

                  <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-bold flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-teal-600" />
                    {brand.faqs?.length || 0} Q&As
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/brand/${encodeURIComponent(brand.name)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                >
                  <span>View Brand Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Brand & Q&A"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id, brand.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBrands.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
            No brands found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No brands match your current search criteria. Try a different keyword or create a new brand label.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand Now</span>
          </button>
        </div>
      )}

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand Label'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure identity, banner image, and customer Q&A FAQs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Brand Name & Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Colombo Silks"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Origin / Region
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={e => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g. Kandy, Sri Lanka"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Brand Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Bio / Story
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about the history, handloom methods, or signature aesthetic..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Brand Logo Upload / URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Brand Logo Image
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center shadow-xs">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-slate-300 text-xs">
                        Logo
                      </span>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={e => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="Paste image URL here..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload from PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Product Banner (35% page banner) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Brand Page Header Banner (Displays across 35% height)
                </label>
                <div className="space-y-3">
                  {formData.banner && (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img
                        src={formData.banner}
                        alt="Brand Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.banner}
                    onChange={e => setFormData({ ...formData, banner: e.target.value })}
                    placeholder="https://example.com/brand-banner.jpg"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload Banner from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Featured Brand Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900">Mark as Featured Brand</span>
                  <p className="text-[11px] text-slate-500">
                    Highlighted on the homepage Brand Showcase row with verified badge.
                  </p>
                </div>
              </label>

              {/* Brand Q&A / FAQs Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Brand Questions & Answers (FAQs)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        High visibility SEO & AEO friendly questions displayed on this brand's dedicated page.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleLoadDefaultFaqs}
                      className="px-2.5 py-1 text-[11px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Fill Standard Q&A
                    </button>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Q&A</span>
                    </button>
                  </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                  {formData.faqs?.map((faq, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          Question & Answer #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Remove Q&A"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
                          Question
                        </label>
                        <input
                          type="text"
                          value={faq.q}
                          onChange={e => handleUpdateFaq(index, 'q', e.target.value)}
                          placeholder="e.g. Are all products authentic and certified?"
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
                          Answer
                        </label>
                        <textarea
                          rows={2}
                          value={faq.a}
                          onChange={e => handleUpdateFaq(index, 'a', e.target.value)}
                          placeholder="Provide a clear, detailed, helpful answer..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  ))}

                  {(!formData.faqs || formData.faqs.length === 0) && (
                    <div className="p-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <p className="text-xs text-slate-500">No custom Q&A added yet for this brand.</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={handleAddFaq}
                          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Question & Answer
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleLoadDefaultFaqs}
                          className="text-xs font-semibold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Load Standard Q&A Set
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingBrand ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Brands Modal */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Bulk Upload Brands
                  </h3>
                  <p className="text-xs text-slate-500">
                    Import multiple fashion and weaver brands via CSV or JSON spreadsheet.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Template Download */}
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-cyan-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-700" />
                  <span>Step 1: Download Sample CSV Template</span>
                </div>
                <p className="text-[11px] text-cyan-800/80">
                  Use our verified columns: name, origin, featured, description, logo, banner, faqs.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleCSVTemplate}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template (.csv)</span>
              </button>
            </div>

            {/* Step 2: Upload File */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Step 2: Choose CSV or JSON File
              </label>

              <div className="relative border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv, .json, text/csv, application/json"
                  onChange={handleBulkFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to upload or drag & drop
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Accepts standard .csv or .json files
                    </p>
                  </div>
                </div>
              </div>

              {bulkFile && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="truncate">{bulkFile.name}</span>
                    <span className="text-slate-400 text-[11px]">
                      ({(bulkFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {parsedBulkBrands.length} Valid Brands Ready
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
            {parsedBulkBrands.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Step 3: Preview Parsed Brands ({parsedBulkBrands.length} detected)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Showing first {Math.min(parsedBulkBrands.length, 5)} rows
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Origin</th>
                        <th className="px-3 py-2">Featured</th>
                        <th className="px-3 py-2">FAQs</th>
                        <th className="px-3 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedBulkBrands.slice(0, 5).map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 font-semibold text-slate-800 flex items-center gap-2">
                            {b.logo ? (
                              <img
                                src={b.logo}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {b.name?.slice(0, 1) || 'B'}
                              </div>
                            )}
                            <span className="truncate max-w-[130px]">{b.name}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{b.origin}</td>
                          <td className="px-3 py-2">
                            {b.featured ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Featured
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Standard</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-cyan-700 font-semibold">
                            {b.faqs?.length || 0} FAQs
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px] truncate max-w-[160px]">
                            {b.description}
                          </td>
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
                        name="bulkBrandImportMode"
                        value="append"
                        checked={bulkImportMode === 'append'}
                        onChange={() => setBulkImportMode('append')}
                        className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Append to Brands</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Adds {parsedBulkBrands.length} new brands alongside current {brands.length} brands.
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
                        name="bulkBrandImportMode"
                        value="replace"
                        checked={bulkImportMode === 'replace'}
                        onChange={() => setBulkImportMode('replace')}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-rose-900">Replace Entire Brand List</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Replaces current brand directory with only the {parsedBulkBrands.length} uploaded brands.
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
                disabled={parsedBulkBrands.length === 0}
                onClick={handleExecuteBulkImport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 ${
                  parsedBulkBrands.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  Confirm & Import {parsedBulkBrands.length > 0 ? `${parsedBulkBrands.length} Brands` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
