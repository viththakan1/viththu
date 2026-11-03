import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingWaybill } from '../../components/common/ShippingWaybill';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Search,
  Tag,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Building,
  CreditCard,
  Edit,
  Trash2,
  X,
  Printer,
  Barcode,
  Layers,
  ArrowUpRight,
  Calendar,
  Award,
  Palette,
  Ruler,
  Upload,
  Check,
  ChevronDown,
  HelpCircle,
  Globe,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { processImageFor4K, processImagesFor4K } from '../../utils/imageOptimizer';

export const VendorDashboard = () => {
  const {
    currentVendor,
    updateVendor,
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    formatPrice,
    categories = [],
    brands = [],
    addBrand,
    updateBrand,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'brands' | 'payouts' | 'settings'

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [waybillOrder, setWaybillOrder] = useState(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Search states
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Safe vendor fallback
  const vendor = currentVendor || {
    id: 'ven-1',
    name: 'Vendor Studio',
    address: 'Colombo, Sri Lanka',
    phone: '+94 77 123 4567',
    balance: 0,
    totalSales: 0,
    commissionRate: 15
  };

  // Products belonging to THIS vendor
  const vendorProducts = products.filter(
    p => p.vendorId === vendor.id || (!p.vendorId && vendor.id === 'ven-1')
  );

  // Orders containing this vendor's products
  const vendorOrders = orders.filter(o => {
    if (!o.products) return true;
    return o.products.some(item => vendorProducts.some(vp => vp.name === item.name));
  });

  // --------------------------------------------------------------------------
  // PRODUCT FORM STATE (Matches Admin Control Panel Add Product Form)
  // --------------------------------------------------------------------------
  const initialProductForm = {
    name: '',
    category: categories[0]?.name || '',
    brand: brands[0]?.name || '',
    barcode: '',
    price: '',
    oldPrice: '',
    fabric: '',
    stockQty: '',
    badge: '',
    colors: [],
    sizes: [],
    image: '',
    images: [],
    description: '',
    hasExpiryDate: false,
    expiryDate: '',
    inStock: true
  };

  const [formData, setFormData] = useState(initialProductForm);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef(null);

  // --------------------------------------------------------------------------
  // BRAND FORM STATE (Matches Admin Control Panel Add Brand Form)
  // --------------------------------------------------------------------------
  const initialBrandForm = {
    name: '',
    logo: '',
    banner: '',
    description: '',
    origin: '',
    featured: false,
    faqs: []
  };

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandFormData, setBrandFormData] = useState(initialBrandForm);

  // Close brand dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      ...initialProductForm,
      category: categories[0]?.name || '',
      brand: brands[0]?.name || ''
    });
    setNewImageUrl('');
    setColorInput('');
    setSizeInput('');
    setIsBrandDropdownOpen(false);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    const pColors = Array.isArray(prod.colors)
      ? prod.colors
      : (prod.colors ? String(prod.colors).split(',').map(s => s.trim()).filter(Boolean) : []);
    const pSizes = Array.isArray(prod.sizes)
      ? prod.sizes
      : (prod.sizes ? String(prod.sizes).split(',').map(s => s.trim()).filter(Boolean) : []);
    const pImages = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : (prod.image ? [prod.image] : []);

    setFormData({
      name: prod.name || '',
      category: prod.category || (categories[0]?.name || ''),
      brand: prod.brand || (brands[0]?.name || ''),
      barcode: prod.barcode || `VEN-${String(prod.id).padStart(6, '0')}`,
      price: prod.price || '',
      oldPrice: prod.oldPrice || '',
      fabric: prod.fabric || '',
      stockQty: prod.stockQty !== undefined ? String(prod.stockQty) : '',
      badge: prod.badge || '',
      colors: pColors,
      sizes: pSizes,
      image: prod.image || (pImages[0] || ''),
      images: pImages,
      description: prod.description || '',
      hasExpiryDate: Boolean(prod.hasExpiryDate && prod.expiryDate),
      expiryDate: prod.expiryDate || '',
      inStock: prod.inStock !== false
    });
    setNewImageUrl('');
    setColorInput('');
    setSizeInput('');
    setIsBrandDropdownOpen(false);
    setIsAddModalOpen(true);
  };

  // Product Image Handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setFormData(prev => ({
      ...prev,
      image: prev.image || url,
      images: [...(prev.images || []), url]
    }));
    setNewImageUrl('');
    showToast('Image angle added to gallery');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const updated = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image: updated[0] || ''
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    showToast(`Optimizing ${files.length} 4K Ultra-HD photo(s)...`);

    try {
      const processedImages = await processImagesFor4K(files, {
        maxDimension: 3840,
        quality: 0.92,
        maxFileSizeMB: 50
      });

      if (processedImages.length > 0) {
        setFormData(prev => {
          const updated = [...(prev.images || []), ...processedImages];
          return {
            ...prev,
            image: prev.image || updated[0],
            images: updated
          };
        });
        showToast(`${processedImages.length} 4K photo(s) processed and added to gallery!`);
      }
    } catch (err) {
      console.error('Error processing 4K images:', err);
      showToast('Error processing 4K image: ' + err.message, 'error');
    } finally {
      setIsProcessingImages(false);
      if (e.target) e.target.value = '';
    }
  };

  // Product Color Handlers
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

  const handleRemoveColor = (idx) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddPresetColor = (preset) => {
    const existing = formData.colors || [];
    if (!existing.includes(preset)) {
      setFormData(prev => ({ ...prev, colors: [...existing, preset] }));
    }
  };

  // Product Size Handlers
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

  const handleRemoveSize = (idx) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddPresetSize = (preset) => {
    const existing = formData.sizes || [];
    if (!existing.includes(preset)) {
      setFormData(prev => ({ ...prev, sizes: [...existing, preset] }));
    }
  };

  // Submit Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Please fill all required fields (Title and Price)', 'error');
      return;
    }

    const validImages = (formData.images && formData.images.length > 0)
      ? formData.images
      : [formData.image].filter(Boolean);

    const primaryImage = validImages[0] || formData.image || '';

    const finalColors = Array.isArray(formData.colors) && formData.colors.length > 0
      ? formData.colors
      : [];
    const finalSizes = Array.isArray(formData.sizes) && formData.sizes.length > 0
      ? formData.sizes
      : [];

    const finalHasExpiryDate = Boolean(formData.hasExpiryDate && formData.expiryDate);
    const finalExpiryDate = finalHasExpiryDate ? formData.expiryDate : '';

    const payload = {
      name: formData.name,
      category: formData.category || (categories[0]?.name || 'Sarees'),
      brand: formData.brand || (brands[0]?.name || ''),
      barcode: formData.barcode || `VEN-${String(Math.floor(100000 + Math.random() * 900000))}`,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
      stockQty: formData.stockQty !== '' ? Number(formData.stockQty) : 0,
      inStock: formData.stockQty !== '' ? Number(formData.stockQty) > 0 : Boolean(formData.inStock),
      fabric: formData.fabric || '',
      badge: formData.badge || '',
      colors: finalColors,
      sizes: finalSizes,
      image: primaryImage,
      images: validImages.length > 0 ? validImages : (primaryImage ? [primaryImage] : []),
      description: formData.description || '',
      hasExpiryDate: finalHasExpiryDate,
      expiryDate: finalExpiryDate,
      vendorId: vendor.id,
      vendorName: vendor.name
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
      setEditingProduct(null);
    } else {
      await addProduct(payload);
    }

    setIsAddModalOpen(false);
    setFormData(initialProductForm);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to remove this product from your catalog?')) {
      await deleteProduct(id);
    }
  };

  // --------------------------------------------------------------------------
  // BRAND MANAGEMENT HANDLERS (Same as AdminBrands.jsx)
  // --------------------------------------------------------------------------
  const handleOpenAddBrand = () => {
    setEditingBrand(null);
    setBrandFormData(initialBrandForm);
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (b) => {
    setEditingBrand(b);
    setBrandFormData({
      name: b.name,
      logo: b.logo || '',
      banner: b.banner || '',
      description: b.description || '',
      origin: b.origin || '',
      featured: Boolean(b.featured),
      faqs: Array.isArray(b.faqs) && b.faqs.length > 0 ? b.faqs : []
    });
    setIsBrandModalOpen(true);
  };

  const handleBrandLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast('Processing logo image...');
        const optimized = await processImageFor4K(file, {
          maxDimension: 1200,
          quality: 0.92,
          maxFileSizeMB: 25
        });
        setBrandFormData(prev => ({ ...prev, logo: optimized }));
        showToast('Brand logo uploaded and optimized!');
      } catch (err) {
        showToast(err.message || 'Error uploading logo', 'error');
      } finally {
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleBrandBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        showToast('Processing 4K banner image...');
        const optimized = await processImageFor4K(file, {
          maxDimension: 3840,
          quality: 0.90,
          maxFileSizeMB: 50
        });
        setBrandFormData(prev => ({ ...prev, banner: optimized }));
        showToast('Brand banner uploaded and optimized in 4K!');
      } catch (err) {
        showToast(err.message || 'Error uploading banner', 'error');
      } finally {
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleAddFaq = () => {
    setBrandFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { q: '', a: '' }]
    }));
  };

  const handleUpdateFaq = (index, field, value) => {
    setBrandFormData(prev => {
      const updated = [...(prev.faqs || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleRemoveFaq = (index) => {
    setBrandFormData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index)
    }));
  };

  const handleLoadDefaultFaqs = () => {
    const brandName = brandFormData.name || 'this brand';
    setBrandFormData(prev => ({
      ...prev,
      faqs: [
        {
          q: `Are all ${brandName} products authentic?`,
          a: `Yes, at haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.`
        },
        {
          q: `How do I care for ${brandName} garments?`,
          a: `We recommend gentle hand wash or professional dry cleaning with mild detergent. Keep away from harsh direct sunlight.`
        },
        {
          q: `What is the estimated delivery time for ${brandName}?`,
          a: `Islandwide delivery takes 2-4 business days with live dispatch tracking. Colombo orders arrive within 24-48 hours.`
        }
      ]
    }));
  };

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (!brandFormData.name?.trim()) {
      showToast('Please enter a brand name', 'error');
      return;
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, brandFormData);
      showToast(`Brand "${brandFormData.name}" updated!`);
      setEditingBrand(null);
    } else {
      addBrand(brandFormData);
      // Automatically select this newly added brand in product form if open
      setFormData(prev => ({ ...prev, brand: brandFormData.name }));
    }

    setIsBrandModalOpen(false);
    setBrandFormData(initialBrandForm);
  };

  // Request Payout Handler
  const handleRequestPayout = (e) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid payout amount', 'error');
      return;
    }
    if (amountNum > (vendor?.balance || 0)) {
      showToast('Payout amount exceeds your current available balance', 'error');
      return;
    }

    const newBalance = (vendor.balance || 0) - amountNum;
    updateVendor(vendor.id, { balance: newBalance });
    setPayoutModalOpen(false);
    setPayoutAmount('');
    showToast(`Payout request for ${formatPrice(amountNum)} submitted to finance team!`);
  };

  // Filtered Brands for the Brands tab
  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
    (b.origin && b.origin.toLowerCase().includes(brandSearch.toLowerCase())) ||
    (b.description && b.description.toLowerCase().includes(brandSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-cyan-200 text-xs font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Seller ID: {vendor.id}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              {vendor.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Warehouse Pickup: {vendor.address} | Contact: {vendor.phone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddBrand}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Add Brand</span>
            </button>

            <button
              type="button"
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Total Revenue
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white mt-1 block">
              {formatPrice(vendor.totalSales || 0)}
            </span>
            <span className="text-[10px] text-cyan-300 mt-0.5 block">Marketplace lifetime</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 block uppercase tracking-wider font-semibold">
              Available Balance
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400 mt-1 block">
              {formatPrice(vendor.balance || 0)}
            </span>
            <span className="text-[10px] text-emerald-200 mt-0.5 block">Ready for bank transfer</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              My Listed Items
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white mt-1 block">
              {vendorProducts.length} Products
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Live in store catalog</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              Commission Fee
            </span>
            <span className="font-mono text-lg sm:text-xl font-bold text-cyan-300 mt-1 block">
              {vendor.commissionRate || 15}%
            </span>
            <span className="text-[10px] text-slate-300 mt-0.5 block">Net vendor payout 85%</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Activity
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>My Products</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {vendorProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Orders & Waybills</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-100 text-cyan-900 font-bold">
            {vendorOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'brands'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Brand Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-900 font-bold">
            {brands.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bank Payouts
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Store Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Recent Customer Orders for Your Products
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {vendorOrders.slice(0, 4).map(o => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{o.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {o.customer} • {o.address}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {formatPrice(o.total)}
                      </span>
                      <button
                        onClick={() => setWaybillOrder(o)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                        title="Print FED Courier Waybill"
                      >
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>Waybill</span>
                      </button>
                    </div>
                  </div>
                ))}
                {vendorOrders.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">No orders received yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Bank Summary Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-heading text-sm font-bold text-slate-900">
                  Registered Payout Account
                </h4>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <p><strong>Bank:</strong> {vendor.bankName || 'Commercial Bank'}</p>
                <p><strong>Account No:</strong> {vendor.accountNumber || '8004561230'}</p>
                <p><strong>Account Name:</strong> {vendor.accountHolder || vendor.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Withdraw Balance ({formatPrice(vendor.balance || 0)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                placeholder="Search my products..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddBrand}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-indigo-600" />
                <span>+ Add Brand</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {vendorProducts
                    .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                    .map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-[10px] text-slate-400">
                                  {prod.name?.slice(0, 2).toUpperCase() || 'P'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{prod.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{prod.barcode || prod.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{prod.brand || '—'}</td>
                        <td className="py-3 px-4">{prod.category}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(prod.price)}</td>
                        <td className="py-3 px-4 font-mono">{prod.stockQty !== undefined ? prod.stockQty : '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.inStock !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {prod.inStock !== false ? 'Active' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {vendorProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No products added yet. Click "+ Add New Product" to list your first item!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & WAYBILLS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Orders for Dispatch ({vendorOrders.length})
            </h3>
            <span className="text-xs text-slate-500">
              Print official 100mm × 150mm Fardar Express Domestic labels for your warehouse pickup
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Waybill Barcode</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Waybill Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {vendorOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                        <Barcode className="w-3 h-3 text-cyan-700" />
                        <span>{order.waybillNumber || 'Pending'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{order.customer}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{order.address}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setWaybillOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Print 100mm × 150mm Shipping Waybill"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Print Waybill</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {vendorOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No customer orders placed yet for your items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BRAND CATALOG (NEW: Vendors can add brands using exact same form as admin) */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                placeholder="Search brands by name or origin..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddBrand}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Brand</span>
            </button>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrands.map((b) => {
              const totalItems = products.filter(p => p.brand?.toLowerCase() === b.name?.toLowerCase()).length;
              const vendorItems = vendorProducts.filter(p => p.brand?.toLowerCase() === b.name?.toLowerCase()).length;

              return (
                <div
                  key={b.id || b.name}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Banner header or gradient */}
                    <div className="relative h-24 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
                      {b.banner && (
                        <img
                          src={b.banner}
                          alt={b.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {b.featured && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <Award className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Logo & Name */}
                      <div className="flex items-start gap-3 -mt-8">
                        <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md bg-white overflow-hidden shrink-0 flex items-center justify-center">
                          {b.logo ? (
                            <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-indigo-700">
                              {b.name?.slice(0, 2).toUpperCase() || 'BR'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pt-4">
                          <h4 className="font-heading text-sm font-bold text-slate-900 truncate">
                            {b.name}
                          </h4>
                          {b.origin && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{b.origin}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {b.description || 'Artisanal studio partner.'}
                      </p>

                      {/* Stat chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold">
                          {totalItems} Store Items
                        </span>
                        {vendorItems > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 text-[10px] font-bold">
                            {vendorItems} of Yours
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-bold">
                          {b.faqs?.length || 0} FAQs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, brand: b.name }));
                        handleOpenAddProduct();
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product Under Brand</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditBrand(b)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredBrands.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
                No registered brands matching "{brandSearch}". Click "+ Add New Brand" to create one!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Vendor Payouts & Commission
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Earnings are credited upon parcel delivery. Market fee is automatically deducted.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPayoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Request Payout ({formatPrice(vendor.balance || 0)})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Gross Sales</span>
              <span className="font-mono text-xl font-bold text-slate-900 mt-1 block">
                {formatPrice(vendor.totalSales || 0)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Platform Commission (15%)</span>
              <span className="font-mono text-xl font-bold text-rose-600 mt-1 block">
                {formatPrice(Math.round((vendor.totalSales || 0) * 0.15))}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block uppercase">Withdrawable Net Balance</span>
              <span className="font-mono text-xl font-bold text-emerald-700 mt-1 block">
                {formatPrice(vendor.balance || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Seller Profile & Warehouse Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This address will appear as the "Pickup Details" on the Fardar Express Domestic waybill labels.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Store profile details updated!');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store / Brand Name:</label>
              <input
                type="text"
                value={vendor.name}
                onChange={e => updateVendor(vendor.id, { name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pickup Contact Phone:</label>
              <input
                type="text"
                value={vendor.phone}
                onChange={e => updateVendor(vendor.id, { phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Warehouse Pickup Address (FED Shipping):</label>
              <textarea
                rows={3}
                value={vendor.address}
                onChange={e => updateVendor(vendor.id, { address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Bank Payout Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Bank Name:</label>
                  <input
                    type="text"
                    value={vendor.bankName || ''}
                    onChange={e => updateVendor(vendor.id, { bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Account Number:</label>
                  <input
                    type="text"
                    value={vendor.accountNumber || ''}
                    onChange={e => updateVendor(vendor.id, { accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (Same as Admin Control Panel Product Form)       */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Vendor Product' : 'Add New Product to Store'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Silk Handwoven Saree"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Brand and Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand / Studio with Auto-Suggest and + Add Brand action */}
                <div className="relative" ref={brandDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Brand / Studio *
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenAddBrand}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add Brand</span>
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 border border-slate-200 overflow-hidden pointer-events-none">
                      {(() => {
                        const matched = brands.find(b => b.name.toLowerCase() === (formData.brand || '').trim().toLowerCase());
                        if (matched?.logo) {
                          return <img src={matched.logo} alt="" className="w-full h-full object-cover" />;
                        }
                        return <Award className="w-3.5 h-3.5 text-indigo-700" />;
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
                      className="w-full pl-10 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                      className="absolute right-1.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Show brand options"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBrandDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                  </div>

                  {/* Auto-Suggest Scrollable Brand Dropdown */}
                  {isBrandDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Brands ({brands.length})</span>
                        <span className="text-[10px] text-indigo-600 font-normal">Click to pick</span>
                      </div>

                      <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                        {(() => {
                          const query = (formData.brand || '').trim().toLowerCase();
                          const matches = brands.filter(b =>
                            b.name.toLowerCase().includes(query) ||
                            (b.origin && b.origin.toLowerCase().includes(query))
                          );

                          if (matches.length === 0) {
                            return (
                              <div className="p-3 text-center space-y-2">
                                <p className="text-xs text-slate-500">No brand matching "{formData.brand}"</p>
                                <button
                                  type="button"
                                  onClick={handleOpenAddBrand}
                                  className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 cursor-pointer"
                                >
                                  + Create "{formData.brand}" as New Brand
                                </button>
                              </div>
                            );
                          }

                          return matches.map(b => {
                            const isSelected = formData.brand.trim().toLowerCase() === b.name.toLowerCase();
                            return (
                              <button
                                type="button"
                                key={b.id || b.name}
                                onClick={() => {
                                  setFormData({ ...formData, brand: b.name });
                                  setIsBrandDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {b.logo ? (
                                      <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] font-bold text-indigo-700">
                                        {b.name.slice(0, 2).toUpperCase()}
                                      </span>
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
                                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Horizontal Scroll Quick-Pick Brand Bar */}
                  {brands.length > 0 && (
                    <div className="mt-1.5">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                        {brands.slice(0, 10).map(b => {
                          const isSelected = formData.brand.trim().toLowerCase() === b.name.toLowerCase();
                          return (
                            <button
                              type="button"
                              key={b.id || b.name}
                              onClick={() => {
                                setFormData({ ...formData, brand: b.name });
                                setIsBrandDropdownOpen(false);
                              }}
                              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
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
                  )}
                </div>

                {/* Category: strictly selectable, not addable by vendor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Category * (Select Only)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Store Managed</span>
                  </div>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fabric Type and Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={e => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Pure Silk / Linen"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Best Seller / New"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Price and Old Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 12500"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Original Price (Strikethrough)</label>
                  <input
                    type="number"
                    value={formData.oldPrice}
                    onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stock and Barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQty}
                    onChange={e => setFormData({ ...formData, stockQty: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Barcode / SKU</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. VEN-000001 (auto-generated if empty)"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Colours & Sizes Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                {/* Colours */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Available Colours ({formData.colors?.length || 0})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Type & Enter</span>
                  </div>

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
                      placeholder="e.g. Maroon, Gold..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-white rounded-xl border border-slate-200">
                    {(formData.colors || []).map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-indigo-600 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!formData.colors || formData.colors.length === 0) && (
                      <span className="text-[11px] text-slate-400 italic">No colours added yet</span>
                    )}
                  </div>

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

                {/* Sizes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Available Sizes ({formData.sizes?.length || 0})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Type & Enter</span>
                  </div>

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
                      placeholder="e.g. S, M, L, Free Size..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>

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
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!formData.sizes || formData.sizes.length === 0) && (
                      <span className="text-[11px] text-slate-400 italic">No sizes added yet</span>
                    )}
                  </div>

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

              {/* Product Gallery Images */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Product Gallery Images ({formData.images?.length || 0})
                  </label>
                  <span className="text-[10px] text-indigo-700 font-semibold">
                    Product Detail Gallery
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Add Angle
                  </button>
                  <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs shrink-0 ${
                    isProcessingImages
                      ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 cursor-wait'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    {isProcessingImages ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>{isProcessingImages ? 'Processing 4K...' : 'Upload 4K Photos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isProcessingImages}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {(formData.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 group shadow-xs"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-indigo-700 text-white text-[8px] font-bold">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!formData.images || formData.images.length === 0) && (
                    <p className="text-[11px] text-slate-400 italic py-2">
                      No gallery images uploaded yet. Supports 4K Ultra-HD photos up to 50MB.
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Tip: Supports 4K Ultra-HD photos up to 50MB. Upload multiple angles showing full drape, fabric texture, and details.
                </p>
              </div>

              {/* Product Expiry Date (Optional / Toggleable) */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Product Expiration Date</span>
                      <span className="text-[10px] text-slate-500">For skincare, cosmetics, or perishable goods</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.hasExpiryDate}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          hasExpiryDate: checked,
                          expiryDate: checked ? (formData.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]) : ''
                        });
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {formData.hasExpiryDate ? 'Add Expiry Date' : 'No Expiry Date (Hidden)'}
                    </span>
                  </label>
                </div>

                {formData.hasExpiryDate && (
                  <div className="pt-2 border-t border-slate-200/60 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Expiry Date *
                    </label>
                    <input
                      type="date"
                      required={formData.hasExpiryDate}
                      value={formData.expiryDate}
                      onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium"
                    />
                    <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>This date will be displayed under product heading on the customer product page.</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Description</label>
                  <span className="text-[10px] text-indigo-600 font-medium">Press Enter for new paragraph gap</span>
                </div>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the craft, fabric, and styling..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Product Changes' : 'Publish Product to Catalog'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT BRAND MODAL (Exact same form as Admin Control Panel)            */}
      {/* ========================================================================= */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
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
                onClick={() => setIsBrandModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="space-y-5 text-xs">
              {/* Brand Name & Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandFormData.name}
                    onChange={e => setBrandFormData({ ...brandFormData, name: e.target.value })}
                    placeholder="e.g. Colombo Silks"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Origin / Region
                  </label>
                  <input
                    type="text"
                    value={brandFormData.origin}
                    onChange={e => setBrandFormData({ ...brandFormData, origin: e.target.value })}
                    placeholder="e.g. Kandy, Sri Lanka"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
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
                  value={brandFormData.description}
                  onChange={e => setBrandFormData({ ...brandFormData, description: e.target.value })}
                  placeholder="Tell customers about the history, handloom methods, or signature aesthetic..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Brand Logo Upload / URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Brand Logo Image
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center shadow-xs">
                    {brandFormData.logo ? (
                      <img
                        src={brandFormData.logo}
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
                      value={brandFormData.logo}
                      onChange={e => setBrandFormData({ ...brandFormData, logo: e.target.value })}
                      placeholder="Paste image URL here..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload from PC</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBrandLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Header Banner (35% page banner) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Brand Page Header Banner (Displays across 35% height)
                </label>
                <div className="space-y-3">
                  {brandFormData.banner && (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img
                        src={brandFormData.banner}
                        alt="Brand Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={brandFormData.banner}
                    onChange={e => setBrandFormData({ ...brandFormData, banner: e.target.value })}
                    placeholder="https://example.com/brand-banner.jpg"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload Banner from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBrandBannerUpload}
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
                  checked={brandFormData.featured}
                  onChange={e => setBrandFormData({ ...brandFormData, featured: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
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
                        Displayed on this brand's dedicated landing page.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleLoadDefaultFaqs}
                      className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
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
                  {brandFormData.faqs?.map((faq, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          Question & Answer #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Remove Q&A"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={faq.q}
                          onChange={e => handleUpdateFaq(index, 'q', e.target.value)}
                          placeholder="e.g. Are all products authentic and verified?"
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={faq.a}
                          onChange={e => handleUpdateFaq(index, 'a', e.target.value)}
                          placeholder="e.g. Yes, we guarantee 100% genuine craftsmanship..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-600"
                        />
                      </div>
                    </div>
                  ))}

                  {(!brandFormData.faqs || brandFormData.faqs.length === 0) && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                      <p>No FAQs added. Click "+ Add Q&A" or "Fill Standard Q&A" to add helpful questions for customers.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{editingBrand ? 'Save Brand Updates' : 'Add Brand to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REQUEST PAYOUT MODAL                                                      */}
      {/* ========================================================================= */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Request Vendor Payout
              </h3>
              <button onClick={() => setPayoutModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Current Available:</span>
                <span className="font-mono text-base font-bold text-emerald-900">
                  {formatPrice(vendor.balance || 0)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payout Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  max={vendor.balance || 0}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  placeholder={`Max: ${vendor.balance || 0}`}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                <p>Transfer destination:</p>
                <p><strong>{vendor.bankName || 'Commercial Bank'}</strong> - {vendor.accountNumber || '8004561230'}</p>
                <p>{vendor.accountHolder || vendor.name}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Confirm Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WAYBILL PRINT MODAL                                                       */}
      {/* ========================================================================= */}
      {waybillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-6">
            <ShippingWaybill
              order={{
                ...waybillOrder,
                vendorPickupName: vendor.name,
                vendorPickupAddress: vendor.address,
                vendorPickupPhone: vendor.phone
              }}
              onClose={() => setWaybillOrder(null)}
              showAdminControls={true}
              onUpdateStatus={(orderId, status) => {
                updateOrderStatus(orderId, status);
                setWaybillOrder(prev => (prev ? { ...prev, status } : null));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
