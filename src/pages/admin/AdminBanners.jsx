import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Clock,
  Sliders,
  Check,
  Sparkles,
  Download,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  UploadCloud,
  FileText,
  AlertCircle,
  Layers,
  FolderPlus
} from 'lucide-react';

export const AdminBanners = () => {
  const {
    banners = [],
    setBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    sliderSettings = { interval: 5, transitionDuration: 2 },
    updateSliderSettings,
    bulkAddBanners,
    showToast
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Bulk Upload & Download States
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedBulkBanners, setParsedBulkBanners] = useState([]);
  const [bulkUploadError, setBulkUploadError] = useState('');
  const [bulkImportMode, setBulkImportMode] = useState('append'); // 'append' | 'replace'
  const [uploadTab, setUploadTab] = useState('file'); // 'file' | 'images'
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
    title: '',
    link: '/shop',
    image: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      link: '/shop',
      image: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || 'Scroll Image',
      link: b.link || '',
      image: b.image || ''
    });
    setIsModalOpen(true);
  };

  // Upload image from computer or phone file picker
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file too large (max 5MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target.result }));
      showToast('Scroll image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Export all scroll images to CSV
  const exportBannersToCSV = (bannerList = banners) => {
    const headers = ['id', 'title', 'image', 'link'];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = bannerList.map((b, idx) => [
      escapeCSV(b.id || `banner-${idx + 1}`),
      escapeCSV(b.title || `Scroll Image #${idx + 1}`),
      escapeCSV(b.image || ''),
      escapeCSV(b.link || '/shop')
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_scroll_images_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${bannerList.length} scroll images to CSV!`);
  };

  // Export to JSON
  const exportBannersToJSON = (bannerList = banners) => {
    const jsonContent = JSON.stringify(bannerList, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `axisx_scroll_images_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Exported ${bannerList.length} scroll images to JSON!`);
  };

  // Download Sample CSV Template
  const downloadSampleCSVTemplate = () => {
    const headers = ['title', 'image', 'link'];

    const content = '\uFEFF' + headers.join(',') + '\r\n';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'axisx_bulk_scroll_images_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast('Scroll images template downloaded!');
  };

  // CSV parser for Banners
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
      throw new Error('CSV must have a header row and at least one image row.');
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

      const imgUrl = item.image || item.url || item.banner || '';
      if (imgUrl) {
        items.push({
          id: item.id ? String(item.id) : `banner-${Date.now()}-${r}`,
          title: item.title || `Scroll Image #${r}`,
          image: imgUrl,
          link: item.link || '/shop'
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
    setParsedBulkBanners([]);

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          const rawList = Array.isArray(json) ? json : (json.banners || json.slides || json.images || []);
          if (!Array.isArray(rawList) || rawList.length === 0) {
            throw new Error('JSON file must contain an array of slide objects.');
          }

          const sanitized = rawList
            .filter(b => b && (b.image || b.url || b.banner))
            .map((b, idx) => ({
              id: b.id ? String(b.id) : `banner-${Date.now()}-${idx}`,
              title: b.title || `Scroll Image #${idx + 1}`,
              image: b.image || b.url || b.banner,
              link: b.link || '/shop'
            }));

          if (sanitized.length === 0) {
            throw new Error('No valid slide items with "image" property found in JSON.');
          }

          setParsedBulkBanners(sanitized);
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
            throw new Error('No valid images found in CSV. Make sure each row includes an "image" URL.');
          }
          setParsedBulkBanners(items);
        } catch (err) {
          setBulkUploadError(`CSV Parse Error: ${err.message}`);
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      setBulkUploadError('Please upload a valid .csv or .json file.');
    }
  };

  // Handle batch selection of multiple image files directly from disk
  const handleMultiImageFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBulkUploadError('');
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Skipped "${file.name}" (exceeds 5MB limit)`, 'warning');
        continue;
      }

      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          newItems.push({
            id: `banner-${Date.now()}-${i}`,
            title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            image: evt.target.result,
            link: '/shop'
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    if (newItems.length > 0) {
      setParsedBulkBanners(prev => [...prev, ...newItems]);
      showToast(`Loaded ${newItems.length} images for bulk preview!`);
    } else {
      setBulkUploadError('No valid image files could be processed.');
    }
  };

  // Execute bulk import
  const handleExecuteBulkImport = () => {
    if (parsedBulkBanners.length === 0) {
      showToast('No parsed images to import.', 'error');
      return;
    }

    bulkAddBanners(parsedBulkBanners, bulkImportMode === 'replace');
    setIsBulkUploadModalOpen(false);
    setBulkFile(null);
    setParsedBulkBanners([]);
    setBulkUploadError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      showToast('Please upload an image or provide an image URL', 'error');
      return;
    }

    const finalTitle = formData.title.trim() || `Scroll Image #${banners.length + 1}`;

    if (editingBanner) {
      updateBanner(editingBanner.id, { ...formData, title: finalTitle });
    } else {
      addBanner({ ...formData, title: finalTitle });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Remove "${title || 'this image'}" from landing page scroll?`)) {
      deleteBanner(id);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setBanners(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === banners.length - 1) return;
    setBanners(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Landing Page Scroll Images
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
              {banners.length} Active Slides
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pure plain images auto-scrolling on your landing page covering 75% of screen height with a 5-second gap (no overlay text).
          </p>
        </div>

        {/* Action Buttons: Export, Bulk Upload, Add Single Image */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Scroll Images</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    exportBannersToCSV();
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
                    exportBannersToJSON();
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
                    <div className="text-[10px] text-slate-400">CSV template for bulk upload</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Bulk Upload Button */}
          <button
            onClick={() => {
              setBulkFile(null);
              setParsedBulkBanners([]);
              setBulkUploadError('');
              setIsBulkUploadModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-cyan-600" />
            <span>Bulk Upload Images</span>
          </button>

          {/* Upload New Scroll Image Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Scroll Image</span>
          </button>
        </div>
      </div>

      {/* Info Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>
              Mode: Plain Image Slider • {sliderSettings.interval}s Image Change • {sliderSettings.transitionDuration}s Transit Crossfade
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            The landing page displays 100% plain, high-resolution photography without any text overlays. Use the controls below to customize speed or reorder slides.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors border border-white/20"
          >
            <span>View Live Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
          </a>
        </div>
      </div>

      {/* Manual Speed & Transit Time Adjustment Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900">
                Slider Timing & Transit Speed Controls
              </h2>
              <p className="text-xs text-slate-500">
                Manually adjust how long each image stays on screen and how slowly or smoothly it fades to the next.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
              <Check className="w-3.5 h-3.5" />
              <span>Live Synced to Landing Page</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Control 1: Image Change Time (Interval) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Image Change Time (Interval)</span>
                </label>
                <p className="text-[11px] text-slate-500">Time each image remains on screen</p>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-cyan-600 text-white shadow-xs">
                {sliderSettings.interval} Seconds
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={sliderSettings.interval}
              onChange={(e) => updateSliderSettings({ interval: Number(e.target.value) })}
              className="w-full accent-cyan-600 cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Quick Presets:</span>
              {[2, 3, 5, 8, 10, 15].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => updateSliderSettings({ interval: sec })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all ${
                    sliderSettings.interval === sec
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Control 2: Transit Time (Crossfade Duration) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Transit Time (Crossfade Duration)</span>
                </label>
                <p className="text-[11px] text-slate-500">How slow/smooth the transition fade is</p>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-xs">
                {sliderSettings.transitionDuration}s Fade
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={sliderSettings.transitionDuration}
              onChange={(e) => updateSliderSettings({ transitionDuration: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Quick Presets:</span>
              {[
                { sec: 0.5, label: '0.5s Fast' },
                { sec: 1.0, label: '1.0s Smooth' },
                { sec: 2.0, label: '2.0s Soft' },
                { sec: 3.0, label: '3.0s Slow' },
                { sec: 4.0, label: '4.0s Dreamy' }
              ].map(({ sec, label }) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => updateSliderSettings({ transitionDuration: sec })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all ${
                    sliderSettings.transitionDuration === sec
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Images List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b, index) => (
          <div
            key={b.id || index}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
          >
            {/* Plain Image Container */}
            <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden flex items-center justify-center">
              {b.image ? (
                <img
                  src={b.image}
                  alt={b.title || `Slide ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  {b.title || `Slide #${index + 1}`}
                </div>
              )}
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20 shadow-xs">
                  Slide {index + 1} of {banners.length}
                </span>
              </div>
            </div>

            {/* Bottom details & controls */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate">
                  {b.title || `Slide #${index + 1}`}
                </span>
                {b.link ? (
                  <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded font-mono truncate max-w-[120px]">
                    {b.link}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">No Link</span>
                )}
              </div>

              {/* Order buttons + Edit/Delete */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {/* Order controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-20 disabled:pointer-events-none rounded hover:bg-slate-100 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === banners.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-20 disabled:pointer-events-none rounded hover:bg-slate-100 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-400 hover:text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors"
                    title="Edit Slide"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">No Scroll Images Uploaded</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload 3 to 4 plain images to showcase as a 75% screen height auto-scrolling slider on your landing page.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload First Scroll Image</span>
          </button>
        </div>
      )}

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {editingBanner ? 'Edit Scroll Image' : 'Upload Plain Scroll Image'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    This plain image will scroll on the landing page for 5 seconds without any overlay text
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slide Image *
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-cyan-400 rounded-2xl p-4 bg-slate-50/60 transition-colors text-center space-y-3">
                  {formData.image ? (
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No image selected</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload from Device / Phone</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <span className="text-[11px] text-slate-400">or paste image URL:</span>
                  </div>

                  <input
                    type="url"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/banner-slide.jpg"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Optional Label (for admin identification only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Label (Optional - Not shown on landing page)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Banarasi Promo / Bridal Silk"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Optional Destination Link when clicked */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Click Destination URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop or /shop?category=Sarees (leave empty for unclickable)"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Actions */}
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
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{editingBanner ? 'Save Changes' : 'Upload to Landing Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Scroll Images Modal */}
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
                    Bulk Upload Landing Page Scroll Images
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add multiple auto-scrolling images via CSV/JSON or direct multi-image file selection.
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
                  <span>Step 1: Download Scroll Images Template</span>
                </div>
                <p className="text-[11px] text-cyan-800/80">
                  Standard format: title, image (URL), link (/shop or category link).
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

            {/* Step 2: Upload Method Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Step 2: Choose Upload Method
                </label>
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setUploadTab('file')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      uploadTab === 'file'
                        ? 'bg-white text-cyan-800 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    CSV / JSON File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTab('images')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      uploadTab === 'images'
                        ? 'bg-white text-cyan-800 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Select Multiple Images
                  </button>
                </div>
              </div>

              {uploadTab === 'file' ? (
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
                        Click to upload CSV or JSON file
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accepts .csv with columns (title, image, link) or .json array
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-2xl p-6 text-center transition-colors bg-cyan-50/30">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultiImageFiles}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md">
                      <FolderPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cyan-950">
                        Select multiple image files at once from device
                      </span>
                      <p className="text-[11px] text-cyan-700 mt-0.5">
                        Hold Ctrl or Shift to select multiple photos (JPG, PNG, WebP)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {bulkFile && uploadTab === 'file' && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="truncate">{bulkFile.name}</span>
                    <span className="text-slate-400 text-[11px]">
                      ({(bulkFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {parsedBulkBanners.length} Images Ready
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
            {parsedBulkBanners.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Step 3: Preview Scroll Images ({parsedBulkBanners.length} detected)
                  </label>
                  <button
                    type="button"
                    onClick={() => setParsedBulkBanners([])}
                    className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Image Preview</th>
                        <th className="px-3 py-2">Label / Title</th>
                        <th className="px-3 py-2">Click Destination Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedBulkBanners.slice(0, 8).map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2 font-semibold text-slate-800 flex items-center gap-2">
                            {b.image ? (
                              <img
                                src={b.image}
                                alt=""
                                className="w-12 h-8 rounded-lg object-cover shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                #{idx + 1}
                              </div>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-800 truncate max-w-[180px]">
                            {b.title}
                          </td>
                          <td className="px-3 py-2 text-slate-600 font-mono text-[11px] truncate max-w-[180px]">
                            {b.link || '/shop'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedBulkBanners.length > 8 && (
                  <p className="text-[11px] text-slate-400 text-right">
                    And {parsedBulkBanners.length - 8} more images...
                  </p>
                )}

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
                        name="bulkBannerImportMode"
                        value="append"
                        checked={bulkImportMode === 'append'}
                        onChange={() => setBulkImportMode('append')}
                        className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Append to Current Scroll Sequence</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Adds {parsedBulkBanners.length} new slides to existing {banners.length} slides.
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
                        name="bulkBannerImportMode"
                        value="replace"
                        checked={bulkImportMode === 'replace'}
                        onChange={() => setBulkImportMode('replace')}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-rose-900">Replace Entire Carousel</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Replaces current landing page slides with only the {parsedBulkBanners.length} uploaded images.
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
                disabled={parsedBulkBanners.length === 0}
                onClick={handleExecuteBulkImport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 ${
                  parsedBulkBanners.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  Confirm & Import {parsedBulkBanners.length > 0 ? `${parsedBulkBanners.length} Scroll Images` : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
