import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { ProductBarcode } from '../components/common/ProductBarcode';
import { optimizeProductImage, getProductSrcSet } from '../utils/imageOptimizer';
import {
  Heart,
  Star,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Share2,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  X,
  ZoomIn,
  Calendar
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    reviews = [],
    addReview,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    getWhatsAppProductLink,
    showToast
  } = useStore();

  const decodedParam = id ? decodeURIComponent(id).trim().toLowerCase() : '';

  const product = products.find((p) => {
    if (!p) return false;
    // 1. Direct ID match
    if (String(p.id).toLowerCase() === decodedParam || String(p.id) === id) return true;

    // 2. Direct Name match
    const pName = (p.name || '').trim().toLowerCase();
    if (pName && pName === decodedParam) return true;

    // 3. Match with slashes replaced by hyphens
    if (pName.replace(/\//g, '-') === decodedParam) return true;

    // 4. Hyphenated slug match
    if (pName.replace(/[\s/]+/g, '-') === decodedParam.replace(/[\s/]+/g, '-')) return true;

    return false;
  });

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Live Review / Comment Form State
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      showToast('Please enter your name and comment', 'error');
      return;
    }
    setIsSubmittingReview(true);
    await addReview({
      productId: product?.id,
      author: newReviewAuthor.trim(),
      city: newReviewCity.trim() || 'Colombo',
      rating: newReviewRating,
      comment: newReviewComment.trim()
    });
    setNewReviewAuthor('');
    setNewReviewCity('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setIsSubmittingReview(false);
  };

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setSelectedSize((product.sizes && product.sizes[0]) || 'Free Size');
      setSelectedColor((product.colors && product.colors[0]) || 'Standard');
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product, id]);

  const galleryImages = (product?.images && product.images.length > 0)
    ? product.images
    : [product?.image].filter(Boolean);

  const currentImageIndex = Math.max(0, galleryImages.indexOf(selectedImage));

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    if (galleryImages.length <= 1) return;
    const prevIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[prevIndex]);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    if (galleryImages.length <= 1) return;
    const nextIndex = (currentImageIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
  };

  // Mobile swipe handling
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Significant horizontal swipe (> 35px and more horizontal than vertical)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Keyboard navigation for image cycling & lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (galleryImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        }
      }
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex, galleryImages, isLightboxOpen]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The item you are looking for may have been moved or is unavailable.</p>
        <Link to="/shop" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleWhatsAppOrder = () => {
    const url = getWhatsAppProductLink(product, selectedSize, selectedColor, quantity);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on AxisX Store!`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
        <Link to="/" className="hover:text-cyan-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/shop" className="hover:text-cyan-700">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-cyan-700">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main Display: 50% Product Image Side + 50% Details Side */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* 50% Product Image Gallery Side */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Multi-Image Thumbnails: Hidden on mobile ('not show below the big image'), vertical bar on sm/md/lg */}
            {galleryImages.length > 1 && (
              <div className="hidden sm:flex sm:flex-col gap-2.5 sm:overflow-y-auto w-full sm:w-20 md:w-24 shrink-0 max-h-[65vh] no-scrollbar py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    onMouseEnter={() => setSelectedImage(img)}
                    className={`relative aspect-[3/4] w-16 sm:w-full rounded-md overflow-hidden border-2 transition-all shrink-0 group ${selectedImage === img
                      ? 'border-cyan-600 ring-2 ring-cyan-500/20 shadow-sm scale-102'
                      : 'border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    title={`View angle ${idx + 1}`}
                  >
                    <img
                      src={optimizeProductImage(img, 320, 90)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-cyan-600/10 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Showcase Image: 65% Height Coverage with touch swipe & side-tap support */}
            <div
              className="relative flex-1 w-full h-[65vh] min-h-[380px] max-h-[640px] rounded-lg overflow-hidden bg-slate-100 shadow-lg border border-slate-200/60 group select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={optimizeProductImage(selectedImage || product.image, 1600, 95)}
                srcSet={getProductSrcSet(selectedImage || product.image)}
                sizes="(max-width: 1024px) 100vw, 55vw"
                alt={product.name}
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102 sm:cursor-zoom-in"
                style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
                onClick={() => {
                  if (window.innerWidth >= 640) {
                    setIsLightboxOpen(true);
                  }
                }}
              />

              {/* Mobile Side-Tap Navigation Zones: Tap left for previous, right for next (No cursor symbol needed on mobile) */}
              {galleryImages.length > 1 && (
                <div className="sm:hidden absolute inset-0 z-10 flex">
                  <div
                    onClick={handlePrevImage}
                    className="w-1/2 h-full cursor-pointer active:bg-black/5 transition-colors"
                    aria-label="Previous photo"
                  />
                  <div
                    onClick={handleNextImage}
                    className="w-1/2 h-full cursor-pointer active:bg-black/5 transition-colors"
                    aria-label="Next photo"
                  />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20 pointer-events-none">
                {product.badge && (
                  <span className="px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-white/95 text-cyan-900 shadow-md border border-cyan-100 backdrop-blur-xs">
                    {product.badge}
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500 text-white shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Floating Fullscreen Zoom button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-cyan-700 shadow-md backdrop-blur-md transition-all z-20 opacity-80 group-hover:opacity-100 cursor-pointer"
                title="Click to Zoom Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Next / Previous Floating Arrows: Desktop only, hidden on mobile */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20 items-center justify-center cursor-pointer"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20 items-center justify-center cursor-pointer"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-800" />
                  </button>
                </>
              )}

              {/* Floating Image Counter Badge */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider z-20 pointer-events-none">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              )}

              {/* Mobile Swipe Dot Indicators */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:hidden z-20 pointer-events-none">
                  {galleryImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Barcode Section Below the Product Image */}
          <div className="w-full">
            <ProductBarcode product={product} />
          </div>
        </div>

        {/* 50% Product Info & Actions Column (Sticky on Desktop) */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 space-y-6 self-start">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand && (
                  <Link
                    to={`/brand/${encodeURIComponent(product.brand)}`}
                    className="text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100/70 hover:bg-cyan-200/80 px-2.5 py-0.5 rounded-full transition-colors"
                  >
                    {product.brand}
                  </Link>
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {product.category}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {product.name}
            </h1>

            {/* Rating, Fabric & Expiry Date */}
            <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviews} reviews)</span>
              </div>
              {product.fabric && (
                <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                  Fabric: {product.fabric}
                </span>
              )}
              {Boolean(product.hasExpiryDate && product.expiryDate) && (
                <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Expires: <strong className="font-bold">{product.expiryDate}</strong></span>
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-xs text-emerald-700 font-semibold ml-auto">
              {product.inStock ? 'In Stock (Ready to Dispatch)' : 'Pre-order Available'}
            </span>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Color Shade: <span className="text-cyan-700">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedColor === color
                      ? 'border-cyan-600 bg-cyan-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Size: <span className="text-cyan-700">{selectedSize}</span>
                </label>
                <span className="text-[11px] text-cyan-600 hover:underline cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedSize === size
                      ? 'border-cyan-600 bg-cyan-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md hover:shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              {/* Wishlist Heart */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${isFavorited
                  ? 'border-rose-300 bg-rose-50 text-rose-500'
                  : 'border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-500 bg-white'
                  }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Direct WhatsApp Ordering */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 px-6 rounded-xl border border-emerald-500/50 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Instant Order via WhatsApp</span>
            </button>
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Islandwide 3-5 days delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>100% Authentic Products</span>
            </div>
          </div>

          {/* Product Description — shown after all action sections, all screen sizes */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              About This Product
            </h4>
            {product.description ? (
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
                {product.description
                  .split(/\r?\n/)
                  .map(line => line.trim())
                  .filter(line => line.length > 0)
                  .map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No description provided.</p>
            )}
            <p className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              Looking for genuine global brands in Sri Lanka? At haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Res Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {product.name}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                {currentImageIndex + 1} / {galleryImages.length}
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Image & Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={optimizeProductImage(selectedImage || product.image, 2400, 96)}
              srcSet={getProductSrcSet(selectedImage || product.image)}
              alt={product.name}
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-lg shadow-2xl"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />

            {galleryImages.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 ${selectedImage === img
                    ? 'border-cyan-400 scale-105 shadow-md'
                    : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                >
                  <img
                    src={optimizeProductImage(img, 240, 90)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Tabs */}
      <div className="mt-16 pt-8 border-t border-slate-200">
        <div className="flex gap-6 border-b border-slate-200 overflow-x-auto pb-2">
          {[
            { id: 'description', label: 'Artistry & Details' },
            { id: 'care', label: 'Fabric & Care' },
            { id: 'shipping', label: 'Islandwide Shipping' },
            { id: 'reviews', label: `Reviews (${product.reviews})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === tab.id
                ? 'text-cyan-700'
                : 'text-slate-400 hover:text-slate-700'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-slate-600 leading-relaxed max-w-3xl">
          {activeTab === 'description' && (
            <div className="space-y-4">
              {product.description ? (
                <div className="text-sm text-slate-600 leading-relaxed space-y-3.5">
                  {product.description
                    .split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No detailed description available.</p>
              )}
              <p className="pt-2 text-xs text-slate-500 border-t border-slate-100">
                Looking for genuine global brands in Sri Lanka? At haveitall.lk, we buy directly from official brand websites across the globe—so you never have to worry about fakes. Enjoy 100% authentic products with reliable islandwide delivery.
              </p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Care Instructions for {product.fabric || 'Textiles'}:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>Professional dry clean recommended for all silk and heavily embroidered garments.</li>
                <li>Store in breathable muslin or cotton covers away from direct dampness.</li>
                <li>For linen shirts and cotton fabrics: Gentle cold water machine wash or hand wash with mild detergent.</li>
                <li>Warm iron on reverse side; never steam directly on zari or delicate stone embroidery.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Sri Lanka Islandwide Delivery Policy</h4>
              <p className="text-xs">
                We deliver to all districts in Sri Lanka including Colombo, Kandy, Galle, Jaffna, Gampaha, and Kurunegala within 3 to 5 business days.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Free Shipping:</strong> On all orders totaling LKR 5,000 or more.</li>
                <li><strong>Standard Flat Rate:</strong> LKR 450 for smaller parcels.</li>
                <li><strong>Cash on Delivery (COD):</strong> Available at checkout across most major postal codes.</li>
                <li><strong>WhatsApp Tracking:</strong> Receive live courier waybill tracking updates on WhatsApp.</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-50/50">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-slate-900">{product.rating}</span>
                  <div className="flex text-amber-400 mt-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500">Overall Rating</span>
                </div>
                <div className="h-10 w-px bg-cyan-200" />
                <p className="text-xs text-slate-600">
                  100% of customers recommend this item for special occasions, festive gatherings, and gifting.
                </p>
              </div>

              {/* Review List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer Reviews ({reviews.filter(r => !r.productId || r.productId === product.id || r.productId === 'general').length})
                </h4>
                <div className="space-y-3">
                  {reviews
                    .filter(r => !r.productId || r.productId === product.id || r.productId === 'general')
                    .map((rev, idx) => (
                      <div key={rev.id || idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-[10px]">
                              {rev.avatar || rev.author?.slice(0, 2).toUpperCase() || 'CU'}
                            </span>
                            <span className="font-bold text-slate-800">{rev.author}</span>
                            <span className="text-slate-400 text-[11px]">({rev.city || 'Sri Lanka'})</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{rev.date}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Interactive Write a Review / Comment Form */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Leave a Review or Comment</h4>
                <p className="text-xs text-slate-500 mb-4">Share your feedback on quality, fabric, and styling.</p>

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-700">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600"
                    />
                    <input
                      type="text"
                      placeholder="City / District (e.g. Colombo, Kandy)"
                      value={newReviewCity}
                      onChange={(e) => setNewReviewCity(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write your review or comment about this item... *"
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-600 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>{isSubmittingReview ? 'Saving to MongoDB...' : 'Submit Review'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-cyan-700">More From</span>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mt-0.5">{product.category}</h3>
            </div>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold text-cyan-700 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
