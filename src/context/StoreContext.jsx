import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_BANNERS,
  INITIAL_MESSAGES,
  INITIAL_VENDORS,
  INITIAL_DROPSHIPPERS
} from '../data/initialData';
import { optimizeProductImage } from '../utils/imageOptimizer';
import { api } from '../services/api';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const safeStorageGet = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

export const StoreProvider = ({ children }) => {
  const navigate = useNavigate();

  // Products
  const [products, setProducts] = useState(() => {
    try {
      const saved = safeStorageGet('axisx_products', null);
      if (saved !== null && Array.isArray(saved)) {
        return saved.map((p) => {
          const init = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
          const pImages = (p.images && p.images.length > 1) ? p.images : (init?.images || (p.image ? [p.image] : []));
          const rawMain = p.image || init?.image || (pImages.length > 0 ? pImages[0] : '');
          const enhancedMain = optimizeProductImage(rawMain, 1600, 92);
          const enhancedGallery = (pImages.length > 0 ? pImages : [enhancedMain]).map(img => optimizeProductImage(img, 1600, 92));

          return {
            ...p,
            barcode: p.barcode || init?.barcode || `AXISX-${String(p.id).padStart(6, '0')}`,
            image: enhancedMain,
            images: enhancedGallery,
            hasExpiryDate: Boolean(p.hasExpiryDate && p.expiryDate),
            expiryDate: p.expiryDate || ''
          };
        });
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories
  const [categories, setCategories] = useState(() => {
    const saved = safeStorageGet('axisx_categories', null);
    if (saved !== null && Array.isArray(saved)) return saved;
    return INITIAL_CATEGORIES;
  });

  // Brands
  const [brands, setBrands] = useState(() => {
    try {
      const saved = safeStorageGet('axisx_brands', null);
      if (saved !== null && Array.isArray(saved)) {
        return saved.map((b) => {
          const init = INITIAL_BRANDS.find(
            (ib) => ib.id === b.id || ib.name?.toLowerCase() === b.name?.toLowerCase()
          );
          return {
            ...b,
            banner: b.banner || init?.banner || '',
            faqs: Array.isArray(b.faqs) && b.faqs.length > 0 ? b.faqs : (init?.faqs || [])
          };
        });
      }
      return INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = safeStorageGet('axisx_settings', null);
      const base = saved && typeof saved === 'object' ? saved : {};
      return {
        ...INITIAL_SETTINGS,
        ...base,
        name: 'HAVEITALL',
        storeName: 'HAVEITALL',
        tagline: 'Beauty and Lifestyle',
        bankDetails: {
          ...(INITIAL_SETTINGS.bankDetails || {}),
          ...(base.bankDetails || {}),
          accountName: 'HAVEITALL (Pvt) Ltd'
        }
      };
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Banners
  const [banners, setBanners] = useState(() => {
    const saved = safeStorageGet('axisx_banners', null);
    if (saved !== null && Array.isArray(saved)) return saved;
    return INITIAL_BANNERS;
  });

  // Slider Timing Settings (Interval & Transit Time)
  const [sliderSettings, setSliderSettings] = useState(() => {
    const saved = safeStorageGet('axisx_slider_settings', null);
    return (saved && typeof saved === 'object') ? saved : { interval: 5, transitionDuration: 2 };
  });

  // Waybill Barcode Sticker Sequence Settings (Couriers physical sticker sync)
  const [waybillSettings, setWaybillSettings] = useState(() => {
    const saved = safeStorageGet('axisx_waybill_settings', null);
    if (saved && typeof saved === 'object') {
      return saved;
    }
    return {
      startNumber: 18666200,
      endNumber: 18667000,
      currentNumber: 18666233,
      autoIncrement: true
    };
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    let seq = 18666230;
    try {
      const saved = safeStorageGet('axisx_orders', null);
      if (!Array.isArray(saved) || saved.length === 0) {
        return INITIAL_ORDERS.map(o => ({
          ...o,
          waybillNumber: o.waybillNumber || String(seq++),
          trackingNumber: o.trackingNumber || String(seq)
        }));
      }
      return saved.map(o => ({
        ...o,
        waybillNumber: (o.waybillNumber && /^\d{7,8}$/.test(o.waybillNumber)) ? o.waybillNumber : String(seq++)
      }));
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Messages / Inquiries
  const [messages, setMessages] = useState(() => {
    const saved = safeStorageGet('axisx_messages', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_MESSAGES;
  });

  // Reviews & Comments
  const [reviews, setReviews] = useState(() => {
    const saved = safeStorageGet('axisx_reviews', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_REVIEWS;
  });

  // Cart: [{ product, size, color, quantity }]
  const [cart, setCart] = useState(() => {
    const saved = safeStorageGet('axisx_cart', []);
    return Array.isArray(saved) ? saved : [];
  });

  // Wishlist: array of product IDs
  const [wishlist, setWishlist] = useState(() => {
    const saved = safeStorageGet('axisx_wishlist', ['1', '5']);
    return Array.isArray(saved) ? saved : ['1', '5'];
  });

  // Multi-Vendor State
  const [vendors, setVendors] = useState(() => {
    const saved = safeStorageGet('axisx_vendors', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_VENDORS;
  });

  const [currentVendor, setCurrentVendor] = useState(() => {
    return safeStorageGet('axisx_current_vendor', null);
  });

  // Dropshipper State
  const [dropshippers, setDropshippers] = useState(() => {
    const saved = safeStorageGet('axisx_dropshippers', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_DROPSHIPPERS;
  });

  const [currentDropshipper, setCurrentDropshipper] = useState(() => {
    return safeStorageGet('axisx_current_dropshipper', null);
  });

  // UI state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Sync data from MongoDB Atlas Backend on load
  useEffect(() => {
    let isMounted = true;
    const syncFromAtlas = async () => {
      try {
        // Fast single-roundtrip bootstrap
        const bootstrap = await api.getBootstrap().catch(() => null);
        if (bootstrap && isMounted) {
          setBackendConnected(true);
          if (Array.isArray(bootstrap.products)) setProducts(bootstrap.products);
          if (Array.isArray(bootstrap.categories)) setCategories(bootstrap.categories);
          if (Array.isArray(bootstrap.brands)) setBrands(bootstrap.brands);
          if (Array.isArray(bootstrap.banners)) setBanners(bootstrap.banners);
          if (Array.isArray(bootstrap.orders)) setOrders(bootstrap.orders);
          if (Array.isArray(bootstrap.messages)) setMessages(bootstrap.messages);
          if (Array.isArray(bootstrap.reviews)) setReviews(bootstrap.reviews);
          if (Array.isArray(bootstrap.vendors)) setVendors(bootstrap.vendors);
          if (Array.isArray(bootstrap.dropshippers)) setDropshippers(bootstrap.dropshippers);
          if (bootstrap.settings) {
            setSettings(prev => ({
              ...INITIAL_SETTINGS,
              ...prev,
              ...bootstrap.settings,
              name: 'HAVEITALL',
              storeName: 'HAVEITALL',
              tagline: 'Beauty and Lifestyle',
              bankDetails: {
                ...(INITIAL_SETTINGS.bankDetails || {}),
                ...(prev.bankDetails || {}),
                ...(bootstrap.settings.bankDetails || {}),
                accountName: 'HAVEITALL (Pvt) Ltd'
              }
            }));
          }
          return;
        }

        const health = await api.checkHealth();
        if (health?.status === 'ok' && isMounted) {
          setBackendConnected(true);

          const [
            prodRes,
            catRes,
            brandRes,
            orderRes,
            bannerRes,
            msgRes,
            setRes,
            venRes,
            dropRes,
            revRes
          ] = await Promise.allSettled([
            api.getProducts(),
            api.getCategories(),
            api.getBrands(),
            api.getOrders(),
            api.getBanners(),
            api.getMessages(),
            api.getSettings(),
            api.getVendors(),
            api.getDropshippers(),
            api.getReviews()
          ]);

          if (isMounted) {
            if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
              setProducts(prodRes.value);
            }
            if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) {
              setCategories(catRes.value);
            }
            if (brandRes.status === 'fulfilled' && Array.isArray(brandRes.value)) {
              setBrands(brandRes.value);
            }
            if (orderRes.status === 'fulfilled' && Array.isArray(orderRes.value)) {
              setOrders(orderRes.value);
            }
            if (bannerRes.status === 'fulfilled' && Array.isArray(bannerRes.value)) {
              setBanners(bannerRes.value);
            }
            if (msgRes.status === 'fulfilled' && Array.isArray(msgRes.value) && msgRes.value.length > 0) {
              setMessages(msgRes.value);
            }
            if (setRes.status === 'fulfilled' && setRes.value) {
              setSettings(prev => ({
                ...INITIAL_SETTINGS,
                ...prev,
                ...setRes.value,
                name: 'HAVEITALL',
                storeName: 'HAVEITALL',
                tagline: 'Beauty and Lifestyle',
                bankDetails: {
                  ...(INITIAL_SETTINGS.bankDetails || {}),
                  ...(prev.bankDetails || {}),
                  ...(setRes.value?.bankDetails || {}),
                  accountName: 'HAVEITALL (Pvt) Ltd'
                }
              }));
            }
            if (venRes.status === 'fulfilled' && Array.isArray(venRes.value) && venRes.value.length > 0) {
              setVendors(venRes.value);
            }
            if (dropRes.status === 'fulfilled' && Array.isArray(dropRes.value) && dropRes.value.length > 0) {
              setDropshippers(dropRes.value);
            }
            if (revRes.status === 'fulfilled' && Array.isArray(revRes.value) && revRes.value.length > 0) {
              setReviews(revRes.value);
            }
          }
        }
      } catch (err) {
        if (isMounted) setBackendConnected(false);
      }
    };

    syncFromAtlas();
    return () => { isMounted = false; };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('axisx_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('axisx_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('axisx_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('axisx_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('axisx_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('axisx_slider_settings', JSON.stringify(sliderSettings));
  }, [sliderSettings]);

  useEffect(() => {
    localStorage.setItem('axisx_waybill_settings', JSON.stringify(waybillSettings));
  }, [waybillSettings]);

  useEffect(() => {
    localStorage.setItem('axisx_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('axisx_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('axisx_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('axisx_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('axisx_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('axisx_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    if (currentVendor) {
      localStorage.setItem('axisx_current_vendor', JSON.stringify(currentVendor));
    } else {
      localStorage.removeItem('axisx_current_vendor');
    }
  }, [currentVendor]);

  useEffect(() => {
    localStorage.setItem('axisx_dropshippers', JSON.stringify(dropshippers));
  }, [dropshippers]);

  useEffect(() => {
    if (currentDropshipper) {
      localStorage.setItem('axisx_current_dropshipper', JSON.stringify(currentDropshipper));
    } else {
      localStorage.removeItem('axisx_current_dropshipper');
    }
  }, [currentDropshipper]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Currency Formatter
  const formatPrice = (amount) => {
    const num = Number(amount) || 0;
    return `LKR ${num.toLocaleString('en-US')}`;
  };

  // Cart operations
  const addToCart = (product, size, color, quantity = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Free Size';
    const chosenColor = color || (product.colors && product.colors[0]) || 'Default';

    setCart(prev => {
      const index = prev.findIndex(item =>
        item.product.id === product.id &&
        item.size === chosenSize &&
        item.color === chosenColor
      );

      if (index > -1) {
        const next = [...prev];
        next[index].quantity += quantity;
        return next;
      } else {
        return [...prev, { product, size: chosenSize, color: chosenColor, quantity }];
      }
    });

    showToast(`Added "${product.name}" to your cart!`);

    // On desktop: show cart in dedicated new page (/cart) not side drawer
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsCartOpen(false);
      navigate('/cart');
    } else {
      setIsCartOpen(true);
    }
  };

  const updateCartQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const next = [...prev];
      next[index].quantity = newQuantity;
      return next;
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => {
      const item = prev[index];
      if (item) {
        showToast(`Removed "${item.product.name}" from cart`, 'info');
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Wishlist operations
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed item from your wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added item to your wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Order creation with Sequential Waybill Number (+1 auto-increment)
  const createOrder = async (orderData) => {
    // Current waybill number from courier sticker sequence (e.g. 18666233)
    const assignedWaybill = String(waybillSettings.currentNumber || 18666233);

    // Auto increment by +1 for the next order
    if (waybillSettings.autoIncrement !== false) {
      const nextNum = (Number(waybillSettings.currentNumber) || 18666233) + 1;
      setWaybillSettings(prev => ({
        ...prev,
        currentNumber: nextNum
      }));
    }

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      waybillNumber: assignedWaybill,
      trackingNumber: assignedWaybill,
      courierPartner: 'Fardar Express Domestic (FED)',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: orderData.paymentMethod === 'Bank Transfer' ? 'Payment Review' : 'Processing',
      ...orderData
    };

    setOrders(prev => [newOrder, ...prev]);
    api.createOrder(newOrder).catch(err => console.warn('Atlas dropship order sync:', err.message));
    clearCart();

    try {
      await api.createOrder(newOrder);
      showToast(`Order #${newOrder.id} confirmed and saved to MongoDB Atlas!`, 'success');
    } catch (err) {
      console.warn('Atlas order sync:', err.message);
      showToast(`Order #${newOrder.id} saved locally`, 'info');
    }

    return newOrder;
  };

  // Waybill barcode sticker sequence controls
  const updateWaybillSettings = (newSettings) => {
    setWaybillSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        startNumber: Number(newSettings.startNumber ?? prev.startNumber),
        endNumber: Number(newSettings.endNumber ?? prev.endNumber),
        currentNumber: Number(newSettings.currentNumber ?? prev.currentNumber),
        autoIncrement: newSettings.autoIncrement ?? prev.autoIncrement
      };
      localStorage.setItem('axisx_waybill_settings', JSON.stringify(updated));
      return updated;
    });
    showToast('Waybill sticker sequence saved successfully!');
  };

  const incrementWaybillNumber = (step = 1) => {
    setWaybillSettings(prev => {
      const nextNum = (Number(prev.currentNumber) || 18666233) + step;
      const updated = { ...prev, currentNumber: nextNum };
      localStorage.setItem('axisx_waybill_settings', JSON.stringify(updated));
      return updated;
    });
    showToast(`Waybill counter incremented by +${step}`);
  };

  const assignWaybillToOrder = (orderId, newWaybill) => {
    const cleanNum = String(newWaybill).trim();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, waybillNumber: cleanNum, trackingNumber: cleanNum } : o));
    api.updateOrder(orderId, { waybillNumber: cleanNum, trackingNumber: cleanNum }).catch(() => {});
    showToast(`Assigned Waybill #${cleanNum} to Order ${orderId}`);
  };

  const syncUnassignedOrdersWithWaybills = () => {
    let nextNum = Number(waybillSettings.currentNumber) || 18666233;
    let count = 0;
    setOrders(prev => prev.map(o => {
      const isPureNumeric = o.waybillNumber && /^\d{7,8}$/.test(o.waybillNumber);
      if (!isPureNumeric) {
        const assigned = String(nextNum++);
        count++;
        api.updateOrder(o.id, { waybillNumber: assigned, trackingNumber: assigned }).catch(() => {});
        return { ...o, waybillNumber: assigned, trackingNumber: assigned };
      }
      return o;
    }));
    setWaybillSettings(prev => ({
      ...prev,
      currentNumber: nextNum
    }));
    showToast(`Assigned sequential waybill numbers to ${count} orders!`);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} updated to "${newStatus}" in MongoDB Atlas!`, 'success');
    } catch (err) {
      console.warn('Atlas order status sync:', err.message);
      showToast(`Order ${orderId} updated to ${newStatus}`);
    }
  };

  // Multi-Vendor Authentication & Management
  const vendorLogin = (email, password) => {
    const found = vendors.find(
      v => v.email?.toLowerCase() === email.trim().toLowerCase() && v.password === password
    );
    if (!found) {
      showToast('Invalid vendor email or password', 'error');
      return { success: false, error: 'Invalid credentials' };
    }
    if (found.status === 'Pending') {
      showToast('Account awaiting admin approval', 'warning');
      return {
        success: false,
        pending: true,
        error: 'Your vendor account is pending admin approval. You can log in once an administrator approves your application.'
      };
    }
    if (found.status === 'Suspended' || found.status === 'Rejected') {
      showToast('Vendor account is deactivated or rejected', 'error');
      return {
        success: false,
        error: 'Your vendor account has been deactivated or rejected. Please contact store administration.'
      };
    }
    setCurrentVendor(found);
    showToast(`Welcome back, ${found.name}!`);
    return { success: true, vendor: found };
  };

  const vendorRegister = (vendorData) => {
    const existing = vendors.find(v => v.email?.toLowerCase() === vendorData.email.trim().toLowerCase());
    if (existing) {
      showToast('A vendor with this email already exists', 'error');
      return { success: false, error: 'Email already registered' };
    }
    const newVendor = {
      id: `ven-${Date.now().toString().slice(-4)}`,
      name: vendorData.name,
      storeSlug: (vendorData.storeSlug || vendorData.name).toLowerCase().replace(/[^a-z0-9]/g, '-'),
      email: vendorData.email.trim(),
      password: vendorData.password,
      phone: vendorData.phone || '0770000000',
      address: vendorData.address || 'Sri Lanka',
      status: 'Pending', // New vendor applications start as Pending until approved by admin
      commissionRate: 15,
      totalSales: 0,
      balance: 0,
      bankName: vendorData.bankName || 'Commercial Bank',
      accountNumber: vendorData.accountNumber || '',
      accountHolder: vendorData.accountHolder || vendorData.name,
      createdAt: new Date().toISOString().split('T')[0],
      logo: vendorData.logo || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&h=120&fit=crop'
    };

    setVendors(prev => [newVendor, ...prev]);
    // Note: Do NOT setCurrentVendor; user remains unauthenticated until approved by admin
    api.createVendor(newVendor).catch(err => console.warn('Atlas vendor sync:', err.message));
    showToast(`Application submitted! Awaiting store admin approval.`, 'info');
    return { success: true, pending: true, vendor: newVendor };
  };

  const vendorLogout = () => {
    setCurrentVendor(null);
    showToast('Logged out of Vendor Portal', 'info');
  };

  const updateVendor = (id, updates) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    if (currentVendor?.id === id) {
      setCurrentVendor(prev => ({ ...prev, ...updates }));
    }
    api.updateVendor(id, updates).catch(err => console.warn('Atlas vendor update sync:', err.message));
    showToast('Vendor profile updated');
  };

  const approveVendor = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Active' } : v));
    if (currentVendor?.id === id) {
      setCurrentVendor(prev => ({ ...prev, status: 'Active' }));
    }
    api.updateVendor(id, { status: 'Active' }).catch(err => console.warn('Atlas vendor approve sync:', err.message));
    showToast('Vendor approved and activated!', 'success');
  };

  const rejectVendor = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Rejected' } : v));
    if (currentVendor?.id === id) {
      setCurrentVendor(null);
    }
    api.updateVendor(id, { status: 'Rejected' }).catch(err => console.warn('Atlas vendor reject sync:', err.message));
    showToast('Vendor application rejected', 'warning');
  };

  // Dropshipper Authentication & Management
  const dropshipperLogin = (email, password) => {
    const found = dropshippers.find(
      d => d.email?.toLowerCase() === email.trim().toLowerCase() && d.password === password
    );
    if (!found) {
      showToast('Invalid dropshipper email or password', 'error');
      return { success: false, error: 'Invalid credentials' };
    }
    if (found.status === 'Pending') {
      showToast('Account awaiting admin approval', 'warning');
      return {
        success: false,
        pending: true,
        error: 'Your dropshipper account is pending admin approval. You can log in once an administrator approves your application.'
      };
    }
    if (found.status === 'Suspended' || found.status === 'Rejected') {
      showToast('Dropshipper account is deactivated or rejected', 'error');
      return {
        success: false,
        error: 'Your dropshipper account has been deactivated or rejected. Please contact store administration.'
      };
    }
    setCurrentDropshipper(found);
    showToast(`Welcome back, ${found.name}!`);
    return { success: true, dropshipper: found };
  };

  const dropshipperRegister = (data) => {
    const existing = dropshippers.find(d => d.email?.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      showToast('A dropshipper with this email already exists', 'error');
      return { success: false, error: 'Email already registered' };
    }
    const newDropshipper = {
      id: `drop-${Date.now().toString().slice(-4)}`,
      name: data.name,
      storeName: data.storeName || `${data.name}'s Boutique`,
      email: data.email.trim(),
      password: data.password,
      phone: data.phone || '0760000000',
      status: 'Pending', // New dropshipper applications start as Pending until approved by admin
      tier: 'Standard Reseller (15% Off)',
      discountPercentage: 15,
      walletBalance: 0,
      totalOrders: 0,
      bankName: data.bankName || 'Sampath Bank',
      accountNumber: data.accountNumber || '',
      accountHolder: data.accountHolder || data.name,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDropshippers(prev => [newDropshipper, ...prev]);
    // Note: Do NOT setCurrentDropshipper; user remains unauthenticated until approved by admin
    api.createDropshipper(newDropshipper).catch(err => console.warn('Atlas dropshipper sync:', err.message));
    showToast(`Application submitted! Awaiting store admin approval.`, 'info');
    return { success: true, pending: true, dropshipper: newDropshipper };
  };

  const dropshipperLogout = () => {
    setCurrentDropshipper(null);
    showToast('Logged out of Dropshipper Portal', 'info');
  };

  const updateDropshipper = (id, updates) => {
    setDropshippers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    if (currentDropshipper?.id === id) {
      setCurrentDropshipper(prev => ({ ...prev, ...updates }));
    }
    api.updateDropshipper(id, updates).catch(err => console.warn('Atlas dropshipper update sync:', err.message));
    showToast('Dropshipper profile updated');
  };

  const approveDropshipper = (id) => {
    setDropshippers(prev => prev.map(d => d.id === id ? { ...d, status: 'Active' } : d));
    if (currentDropshipper?.id === id) {
      setCurrentDropshipper(prev => ({ ...prev, status: 'Active' }));
    }
    api.updateDropshipper(id, { status: 'Active' }).catch(err => console.warn('Atlas dropshipper approve sync:', err.message));
    showToast('Dropshipper approved and activated!', 'success');
  };

  const rejectDropshipper = (id) => {
    setDropshippers(prev => prev.map(d => d.id === id ? { ...d, status: 'Rejected' } : d));
    if (currentDropshipper?.id === id) {
      setCurrentDropshipper(null);
    }
    api.updateDropshipper(id, { status: 'Rejected' }).catch(err => console.warn('Atlas dropshipper reject sync:', err.message));
    showToast('Dropshipper application rejected', 'warning');
  };

  // Create Dropship Order (Direct customer fulfillment with sequential Waybill)
  const createDropshipOrder = (dropshipData) => {
    const assignedWaybill = String(waybillSettings.currentNumber || 18666233);

    if (waybillSettings.autoIncrement !== false) {
      const nextNum = (Number(waybillSettings.currentNumber) || 18666233) + 1;
      setWaybillSettings(prev => ({
        ...prev,
        currentNumber: nextNum
      }));
    }

    const profit = Math.max(0, (Number(dropshipData.sellingTotal) || 0) - (Number(dropshipData.wholesaleTotal) || 0));

    const newOrder = {
      id: `DROP-${Date.now().toString().slice(-6)}`,
      waybillNumber: assignedWaybill,
      trackingNumber: assignedWaybill,
      courierPartner: 'Fardar Express Domestic (FED)',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: dropshipData.customerName,
      phone: dropshipData.customerPhone,
      address: dropshipData.customerAddress,
      total: Number(dropshipData.sellingTotal) || Number(dropshipData.wholesaleTotal),
      paymentMethod: dropshipData.paymentMethod || 'Cash on Delivery',
      notes: dropshipData.notes || `Dropshipped by ${currentDropshipper?.storeName || 'Reseller'}`,
      products: dropshipData.products || [],
      isDropship: true,
      dropshipperId: currentDropshipper?.id || 'drop-1',
      dropshipperName: currentDropshipper?.storeName || 'Reseller Partner',
      dropshipSenderPhone: currentDropshipper?.phone || '',
      wholesaleCost: dropshipData.wholesaleTotal,
      dropshipperProfit: profit
    };

    setOrders(prev => [newOrder, ...prev]);
    api.createOrder(newOrder).catch(err => console.warn('Atlas dropship order sync:', err.message));

    // Credit profit to dropshipper wallet
    if (currentDropshipper) {
      const updatedBalance = (currentDropshipper.walletBalance || 0) + profit;
      const updatedOrders = (currentDropshipper.totalOrders || 0) + 1;
      updateDropshipper(currentDropshipper.id, {
        walletBalance: updatedBalance,
        totalOrders: updatedOrders
      });
    }

    showToast(`Dropship order placed! Waybill #${assignedWaybill} generated & LKR ${profit.toLocaleString()} added to your wallet!`);
    return newOrder;
  };

  // Product management for Admin
  const addProduct = async (newProd) => {
    const generatedId = newProd.id || (Date.now()).toString();
    const product = {
      ...newProd,
      id: generatedId,
      name: newProd.name || 'Untitled Creation',
      category: newProd.category || (categories[0]?.name || 'Sarees'),
      brand: newProd.brand || (brands[0]?.name || 'HAVEITALL'),
      price: Number(newProd.price || 0),
      oldPrice: newProd.oldPrice ? Number(newProd.oldPrice) : undefined,
      stockQty: Number(newProd.stockQty || 10),
      rating: newProd.rating ? Number(newProd.rating) : 5.0,
      reviews: newProd.reviews ? Number(newProd.reviews) : 1,
      inStock: newProd.inStock !== undefined ? Boolean(newProd.inStock) : true,
      barcode: newProd.barcode || `AXISX-${Date.now().toString().slice(-6)}`
    };

    // Optimistically update React State
    setProducts(prev => [product, ...prev.filter(p => p.id !== product.id)]);

    try {
      const saved = await api.createProduct(product);
      if (saved && saved.id) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...saved } : p));
      }
      showToast(`Product "${product.name}" added and saved to MongoDB!`, 'success');
      return saved || product;
    } catch (err) {
      console.warn('Atlas product sync:', err.message);
      showToast(`Product "${product.name}" added locally (Backend offline)`, 'warning');
      return product;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedFields,
          price: Number(updatedFields.price !== undefined ? updatedFields.price : p.price),
          oldPrice: updatedFields.oldPrice ? Number(updatedFields.oldPrice) : p.oldPrice,
          stockQty: Number(updatedFields.stockQty !== undefined ? updatedFields.stockQty : p.stockQty)
        };
      }
      return p;
    }));

    try {
      await api.updateProduct(id, updatedFields);
      showToast('Product updated in MongoDB successfully!', 'success');
    } catch (err) {
      console.warn('Atlas product update sync:', err.message);
      showToast('Product updated locally (Backend offline)', 'warning');
    }
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await api.deleteProduct(id);
      showToast('Product deleted from MongoDB', 'info');
    } catch (err) {
      console.warn('Atlas product delete sync:', err.message);
      showToast('Product deleted locally (Backend offline)', 'warning');
    }
  };

  const bulkAddProducts = async (newProductsList, replaceExisting = false) => {
    if (!Array.isArray(newProductsList) || newProductsList.length === 0) return 0;
    const formatted = newProductsList.map((p, index) => {
      const rawGallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=92']);
      const optGallery = rawGallery.map(img => optimizeProductImage(img, 1600, 92));
      const optMain = optimizeProductImage(p.image || (Array.isArray(p.images) && p.images[0]) || optGallery[0], 1600, 92);

      return {
        ...p,
        id: p.id ? String(p.id) : (Date.now() + index).toString(),
        price: Number(p.price || 0),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
        stockQty: Number(p.stockQty !== undefined ? p.stockQty : 10),
        rating: Number(p.rating || 5.0),
        reviews: Number(p.reviews || 0),
        inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
        colors: Array.isArray(p.colors) ? p.colors : (p.colors ? String(p.colors).split(/[|,]/).map(s => s.trim()).filter(Boolean) : ['Standard']),
        sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? String(p.sizes).split(/[|,]/).map(s => s.trim()).filter(Boolean) : ['Free Size']),
        images: optGallery,
        image: optMain,
        barcode: p.barcode || `AXISX-${Date.now().toString().slice(-6)}`
      };
    });

    if (replaceExisting) {
      setProducts(formatted);
    } else {
      setProducts(prev => [...formatted, ...prev]);
    }

    try {
      await api.bulkCreateProducts(formatted, replaceExisting);
      showToast(`Successfully saved ${formatted.length} products to MongoDB Atlas!`, 'success');
    } catch (err) {
      console.warn('Atlas bulk products sync:', err.message);
      showToast(`Saved ${formatted.length} products locally (Backend offline)`, 'warning');
    }

    return formatted.length;
  };

  // Brand management for Admin
  const addBrand = (newBrand) => {
    const brand = {
      ...newBrand,
      id: `brand-${Date.now()}`
    };
    setBrands(prev => [brand, ...prev]);
    api.createBrand(brand).catch(err => console.warn('Atlas brand sync:', err.message));
    showToast(`Brand "${brand.name}" added successfully!`);
    return brand;
  };

  const updateBrand = (id, updatedFields) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    api.updateBrand(id, updatedFields).catch(err => console.warn('Atlas brand update sync:', err.message));
    showToast('Brand updated successfully!');
  };

  const deleteBrand = (id) => {
    setBrands(prev => prev.filter(b => b.id !== id));
    api.deleteBrand(id).catch(err => console.warn('Atlas brand delete sync:', err.message));
    showToast('Brand removed', 'info');
  };

  const bulkAddBrands = (newBrandsList, replaceExisting = false) => {
    if (!Array.isArray(newBrandsList) || newBrandsList.length === 0) {
      showToast('No valid brands found to import', 'error');
      return 0;
    }

    const formatted = newBrandsList.map((b, index) => {
      const defaultFaqs = [
        {
          q: `Are all ${b.name || 'brand'} products authentic and verified?`,
          a: `Yes, every creation under ${b.name || 'this brand'} is directly sourced from certified artisans and master workshops with stringent quality inspection.`
        },
        {
          q: `How do I care for ${b.name || 'brand'} garments?`,
          a: 'We recommend gentle hand wash in cold water or dry cleaning with mild detergent. Keep away from harsh direct sunlight.'
        },
        {
          q: 'What is the islandwide delivery timeline?',
          a: 'Orders arrive in 2-4 business days across Sri Lanka with live tracking. Colombo orders arrive within 24-48 hours.'
        }
      ];

      let parsedFaqs = [];
      if (Array.isArray(b.faqs) && b.faqs.length > 0) {
        parsedFaqs = b.faqs.map(f => ({
          q: f.q || f.question || '',
          a: f.a || f.answer || ''
        })).filter(f => f.q && f.a);
      } else if (typeof b.faqs === 'string' && b.faqs.trim()) {
        try {
          const parsed = JSON.parse(b.faqs);
          if (Array.isArray(parsed)) {
            parsedFaqs = parsed.map(f => ({
              q: f.q || f.question || '',
              a: f.a || f.answer || ''
            })).filter(f => f.q && f.a);
          }
        } catch {
          parsedFaqs = b.faqs.split(';').map(part => {
            const [q, a] = part.split('|').map(s => s.trim());
            return { q: q || '', a: a || '' };
          }).filter(f => f.q && f.a);
        }
      }

      return {
        id: b.id ? String(b.id) : `brand-${Date.now()}-${index}`,
        name: b.name || `Brand ${index + 1}`,
        logo: b.logo || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop',
        banner: b.banner || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&h=600&fit=crop',
        description: b.description || 'Exclusive artisan and luxury textile label partner.',
        origin: b.origin || 'Colombo, Sri Lanka',
        featured: Boolean(b.featured === true || b.featured === 'true'),
        faqs: parsedFaqs.length > 0 ? parsedFaqs : defaultFaqs
      };
    });

    if (replaceExisting) {
      setBrands(formatted);
      showToast(`Replaced all brands with ${formatted.length} imported brands!`);
    } else {
      setBrands(prev => [...formatted, ...prev]);
      showToast(`Successfully imported ${formatted.length} brands in bulk!`);
    }

    api.bulkCreateBrands(formatted, replaceExisting).catch(err => console.warn('Atlas bulk brands sync:', err.message));
    return formatted.length;
  };

  // Banner / Scroll Image management for Admin
  const addBanner = async (newBanner) => {
    const banner = {
      ...newBanner,
      id: `banner-${Date.now()}`
    };
    setBanners(prev => [banner, ...prev]);
    try {
      await api.createBanner(banner);
      showToast('Scroll image added & saved to MongoDB Atlas!');
    } catch (err) {
      console.warn('Atlas banner sync:', err.message);
      showToast('Scroll image added to landing page!');
    }
    return banner;
  };

  const bulkAddBanners = async (newBannersList, replaceExisting = false) => {
    if (!Array.isArray(newBannersList) || newBannersList.length === 0) {
      showToast('No valid scroll images found to import', 'error');
      return 0;
    }

    const formatted = newBannersList.map((b, index) => ({
      id: b.id ? String(b.id) : `banner-${Date.now()}-${index}`,
      title: b.title || `Scroll Image #${index + 1}`,
      link: b.link || '/shop',
      image: b.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&h=1080&fit=crop'
    }));

    if (replaceExisting) {
      setBanners(formatted);
      showToast(`Replaced landing page scroll with ${formatted.length} images!`);
    } else {
      setBanners(prev => [...prev, ...formatted]);
      showToast(`Successfully added ${formatted.length} scroll images in bulk!`);
    }

    api.bulkCreateBanners(formatted, replaceExisting).catch(err => console.warn('Atlas bulk banners sync:', err.message));
    return formatted.length;
  };

  const updateBanner = async (id, updatedFields) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    try {
      await api.updateBanner(id, updatedFields);
      showToast('Scroll image updated in MongoDB Atlas!');
    } catch (err) {
      console.warn('Atlas banner update sync:', err.message);
      showToast('Scroll image updated!');
    }
  };

  const deleteBanner = async (id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    try {
      await api.deleteBanner(id);
      showToast('Scroll image removed from MongoDB Atlas', 'info');
    } catch (err) {
      console.warn('Atlas banner delete sync:', err.message);
      showToast('Scroll image removed', 'info');
    }
  };

  const updateSliderSettings = async (newSettings) => {
    setSliderSettings(prev => ({ ...prev, ...newSettings }));
    api.updateSettings({ sliderSettings: newSettings }).catch(() => {});
    showToast('Slider timing settings saved!');
  };

  // Category Management for Admin
  const addCategory = async (catData) => {
    const cat = {
      ...catData,
      id: catData.id || `cat-${Date.now()}`,
      count: Number(catData.count || 0)
    };
    setCategories(prev => [...prev, cat]);
    try {
      await api.createCategory(cat);
      showToast(`Category "${cat.name}" saved to MongoDB Atlas!`, 'success');
    } catch (err) {
      console.warn('Atlas category sync:', err.message);
      showToast(`Category "${cat.name}" added!`, 'success');
    }
    return cat;
  };

  const updateCategory = async (id, catData) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...catData } : c));
    try {
      await api.updateCategory(id, catData);
      showToast('Category updated in MongoDB Atlas!', 'success');
    } catch (err) {
      console.warn('Atlas category update sync:', err.message);
      showToast('Category updated successfully!');
    }
  };

  const deleteCategory = async (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await api.deleteCategory(id);
      showToast('Category removed from MongoDB Atlas', 'info');
    } catch (err) {
      console.warn('Atlas category delete sync:', err.message);
      showToast('Category removed', 'info');
    }
  };

  const bulkAddCategories = async (newCategoriesList, replaceExisting = false) => {
    if (!Array.isArray(newCategoriesList) || newCategoriesList.length === 0) {
      showToast('No valid categories found to import', 'error');
      return 0;
    }

    const formatted = newCategoriesList.map((c, index) => ({
      id: c.id ? String(c.id) : `cat-${Date.now()}-${index}`,
      name: c.name || `Category ${index + 1}`,
      image: c.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
      count: Number(c.count) >= 0 ? Number(c.count) : 10,
      description: c.description || 'Exclusive curated collection for discerning clients.'
    }));

    if (replaceExisting) {
      setCategories(formatted);
      showToast(`Replaced categories with ${formatted.length} imported categories!`);
    } else {
      setCategories(prev => [...prev, ...formatted]);
      showToast(`Successfully added ${formatted.length} categories in bulk!`);
    }

    api.bulkCreateCategories(formatted, replaceExisting).catch(err => console.warn('Atlas bulk categories sync:', err.message));
    return formatted.length;
  };

  // Review & Comment Management
  const addReview = async (reviewData) => {
    const rev = {
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
      author: reviewData.author || 'Store Customer',
      rating: Number(reviewData.rating || 5),
      comment: reviewData.comment || '',
      city: reviewData.city || 'Colombo',
      avatar: (reviewData.author || 'SC').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      productId: reviewData.productId || 'general'
    };

    setReviews(prev => [rev, ...prev]);

    try {
      await api.createReview(rev);
      showToast('Thank you! Your review has been saved to MongoDB Atlas.', 'success');
    } catch (err) {
      console.warn('Atlas review sync:', err.message);
      showToast('Review submitted locally', 'info');
    }
    return rev;
  };

  const updateSettings = async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      await api.updateSettings(newSettings);
      showToast('Store settings saved to MongoDB Atlas!', 'success');
    } catch (err) {
      console.warn('Atlas settings sync:', err.message);
      showToast('Store settings updated!');
    }
  };

  // WhatsApp link generator
  const getWhatsAppProductLink = (product, size, color, quantity = 1) => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const chosenColor = color || (product.colors && product.colors[0]) || 'Default';
    const text = `Hello HAVEITALL! 👋\nI would like to order the following item:\n\n*Product:* ${product.name}\n*Price:* ${formatPrice(product.price)}\n*Size:* ${chosenSize}\n*Color:* ${chosenColor}\n*Quantity:* ${quantity}\n\nPlease confirm availability and payment details. Thank you!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppCartLink = (customerInfo = {}) => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    let text = `Hello HAVEITALL! 👋\nI would like to place an order for the items in my cart:\n\n`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. *${item.product.name}* (Size: ${item.size}, Color: ${item.color}) x ${item.quantity} = ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    text += `\n*Subtotal:* ${formatPrice(cartSubtotal)}\n`;
    if (customerInfo.name) {
      text += `\n*Customer Details:*\nName: ${customerInfo.name}\nPhone: ${customerInfo.phone || ''}\nAddress: ${customerInfo.address || ''}, ${customerInfo.city || ''}\n`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Messages & Contact Inquiry
  const addMessage = async (msg) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      ...msg
    };
    setMessages(prev => [newMsg, ...prev]);
    try {
      await api.createMessage(newMsg);
      showToast('Message sent & recorded in MongoDB Atlas! Our studio will reply shortly.', 'success');
    } catch (err) {
      console.warn('Atlas message sync:', err.message);
      showToast('Message sent! Our studio team will get back to you shortly.', 'info');
    }
    return newMsg;
  };

  const markMessageAsRead = async (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    try {
      await api.markMessageRead(id);
    } catch (err) {
      console.warn('Atlas message read sync:', err.message);
    }
  };

  const deleteMessage = async (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await api.deleteMessage(id);
      showToast('Message deleted from MongoDB Atlas', 'info');
    } catch (err) {
      console.warn('Atlas message delete sync:', err.message);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        brands,
        settings,
        banners,
        orders,
        messages,
        reviews,
        cart,
        wishlist,
        backendConnected,
        isSearchOpen,
        isCartOpen,
        toast,
        cartSubtotal,
        cartCount,
        setIsSearchOpen,
        setIsCartOpen,
        showToast,
        formatPrice,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        setProducts,
        bulkAddProducts,
        setSettings,
        updateSettings,
        setBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        bulkAddBanners,
        sliderSettings,
        setSliderSettings,
        updateSliderSettings,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        bulkAddCategories,
        setBrands,
        addBrand,
        updateBrand,
        deleteBrand,
        bulkAddBrands,
        addMessage,
        markMessageAsRead,
        deleteMessage,
        addReview,
        setReviews,
        getWhatsAppProductLink,
        getWhatsAppCartLink,
        waybillSettings,
        setWaybillSettings,
        updateWaybillSettings,
        incrementWaybillNumber,
        assignWaybillToOrder,
        syncUnassignedOrdersWithWaybills,
        vendors,
        setVendors,
        currentVendor,
        setCurrentVendor,
        vendorLogin,
        vendorRegister,
        vendorLogout,
        updateVendor,
        approveVendor,
        rejectVendor,
        dropshippers,
        setDropshippers,
        currentDropshipper,
        setCurrentDropshipper,
        dropshipperLogin,
        dropshipperRegister,
        dropshipperLogout,
        updateDropshipper,
        approveDropshipper,
        rejectDropshipper,
        createDropshipOrder
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
