import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  UploadCloud,
  FileText,
  AlertCircle,
  Check,
  Search,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

export const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, bulkAddCategories, showToast } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    count: 10,
    description: ''
  });

  // Bulk Upload & Download States
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedBulkCategories, setParsedBulkCategories] = useState([]);
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

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
      count: 10,
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      image: cat.image,
      count: cat.count || 10,
      description: cat.description || ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image file too large (max 3MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target.result }));
        showToast('Category cover image uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Please enter a category name', 'error');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  // Export categories to CSV
  const exportCategoriesToCSV = (categoryList = categories) => {
    const headers = ['id', 'name', 'image', 'count', 'description'];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = categoryList.map((c) => [
      escapeCSV(c.id || ''),
      escapeCSV(c.name || ''),
      escapeCSV(c.image || ''),
      escapeCSV(c.count !== undefined ? c.count : 10),
      escapeCSV(c.description || '')
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_categories_catalog_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${categoryList.length} categories to CSV!`);
  };

  // Export categories to JSON
  const exportCategoriesToJSON = (categoryList = categories) => {
    const jsonContent = JSON.stringify(categoryList, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_categories_catalog_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${categoryList.length} categories to JSON!`);
  };

  // Download Sample CSV Template
  const downloadSampleCSVTemplate = () => {
    const headers = ['name', 'image', 'count', 'description'];

    const sampleRows = [
      [
        '"Sarees"',
        '"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop"',
        '"45"',
        '"Authentic Banarasi, Kanjivaram & Designer Handloom Sarees"'
      ].join(','),
      [
        '"Men\'s Wear"',
        '"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"',
        '"32"',
        '"Pure Linen Shirts, Kurtas, Bundis & Royal Sherwanis"'
      ].join(','),
      [
        '"Women\'s Wear"',
        '"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop"',
        '"58"',
        '"Embroidered Suits, Stoles, Kurtis & Daily Elegance"'
      ].join(','),
      [
        '"Fabrics & Textiles"',
        '"https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop"',
        '"24"',
        '"Artisanal Handloom Fabric Rolls & Raw Silks"'
      ].join(',')
    ];

    const content = '\uFEFF' + [headers.join(','), ...sampleRows].join('\r\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'axisx_bulk_category_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast('Sample category upload template downloaded!');
  };

  // CSV parser for Categories
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
      throw new Error('CSV must have a header row and at least one category row.');
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
        items.push({
          id: item.id ? String(item.id) : `cat-${Date.now()}-${r}`,
          name: item.name,
          image: item.image || item.img || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
          count: item.count !== undefined && item.count !== '' ? Number(item.count) : 10,
          description: item.description || 'Exclusive curated collection for discerning clients.'
        });
      }
    }

    return items;
  };

  // Handle file selection (CSV or JSON)
  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkUploadError('');
    setParsedBulkCategories([]);

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          const rawList = Array.isArray(json) ? json : (json.categories || []);
          if (!Array.isArray(rawList) || rawList.length === 0) {
            throw new Error('JSON file must contain an array of category objects.');
          }

          const sanitized = rawList
            .filter(c => c && c.name)
            .map((c, idx) => ({
              id: c.id ? String(c.id) : `cat-${Date.now()}-${idx}`,
              name: c.name,
              image: c.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
              count: c.count !== undefined ? Number(c.count) : 10,
              description: c.description || 'Exclusive curated collection for discerning clients.'
            }));

          if (sanitized.length === 0) {
            throw new Error('No valid categories with a "name" property found in JSON.');
          }

          setParsedBulkCategories(sanitized);
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
            throw new Error('No valid categories found in CSV. Make sure each row includes a category "name".');
          }
          setParsedBulkCategories(items);
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
    if (parsedBulkCategories.length === 0) {
      showToast('No parsed categories to import.', 'error');
      return;
    }

    bulkAddCategories(parsedBulkCategories, bulkImportMode === 'replace');
    setIsBulkUploadModalOpen(false);
    setBulkFile(null);
    setParsedBulkCategories([]);
    setBulkUploadError('');
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Category Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize customer collections, navigation filters, and showcase banners.
          </p>
        </div>

        {/* Action Buttons: Export, Bulk Upload, Add Category */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Categories</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    exportCategoriesToCSV();
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
                    exportCategoriesToJSON();
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
              setParsedBulkCategories([]);
              setBulkUploadError('');
              setIsBulkUploadModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-cyan-600" />
            <span>Bulk Upload Categories</span>
          </button>

          {/* Add Category Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Layers className="w-4 h-4 text-cyan-600" />
          <span>Showing {filteredCategories.length} of {categories.length} categories</span>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-white font-heading font-bold text-lg drop-shadow-xs">{c.name}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {c.description || 'Exclusive curated collection for discerning clients.'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-semibold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full text-[11px]">
                  {c.count}+ Designs
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
            No categories found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No categories match your search term "{searchTerm}".
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarees, Men's Wear, Bridal"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cover Image URL + Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-800">Cover Image</label>
                {formData.image && (
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
                <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Designs Count</label>
                <input
                  type="number"
                  value={formData.count}
                  onChange={e => setFormData({ ...formData, count: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary for shop category cards and meta descriptions..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Categories Modal */}
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
                    Bulk Upload Categories
                  </h3>
                  <p className="text-xs text-slate-500">
                    Import multiple store product categories via CSV or JSON spreadsheet.
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
                  Verified columns: name, image, count, description.
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
                    {parsedBulkCategories.length} Categories Ready
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
            {parsedBulkCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Step 3: Preview Parsed Categories ({parsedBulkCategories.length} detected)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Showing first {Math.min(parsedBulkCategories.length, 6)} rows
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Designs Count</th>
                        <th className="px-3 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedBulkCategories.slice(0, 6).map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 font-semibold text-slate-800 flex items-center gap-2">
                            <img
                              src={c.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop';
                              }}
                            />
                            <span className="truncate max-w-[140px]">{c.name}</span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-cyan-800">
                            {c.count}+ Designs
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-[11px] truncate max-w-[200px]">
                            {c.description}
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
                        name="bulkCategoryImportMode"
                        value="append"
                        checked={bulkImportMode === 'append'}
                        onChange={() => setBulkImportMode('append')}
                        className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Append to Categories</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Adds {parsedBulkCategories.length} new categories alongside current {categories.length} categories.
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
                        name="bulkCategoryImportMode"
                        value="replace"
                        checked={bulkImportMode === 'replace'}
                        onChange={() => setBulkImportMode('replace')}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-rose-900">Replace Entire Category List</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Replaces current categories with only the {parsedBulkCategories.length} uploaded items.
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
                disabled={parsedBulkCategories.length === 0}
                onClick={handleExecuteBulkImport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 ${
                  parsedBulkCategories.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  Confirm & Import {parsedBulkCategories.length > 0 ? `${parsedBulkCategories.length} Categories` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
