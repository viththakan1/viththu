import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { ToastContainer } from './components/common/ToastContainer';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { BrandsPage } from './pages/BrandsPage';
import { BrandPage } from './pages/BrandPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminBrands } from './pages/admin/AdminBrands';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminVendors } from './pages/admin/AdminVendors';
import { AdminDropshippers } from './pages/admin/AdminDropshippers';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminSettings } from './pages/admin/AdminSettings';

// Multi-Vendor Pages
import { VendorLogin } from './pages/vendor/VendorLogin';
import { VendorLayout } from './pages/vendor/VendorLayout';
import { VendorDashboard } from './pages/vendor/VendorDashboard';

// Dropshipper Pages
import { DropshipperLogin } from './pages/dropshipper/DropshipperLogin';
import { DropshipperLayout } from './pages/dropshipper/DropshipperLayout';
import { DropshipperDashboard } from './pages/dropshipper/DropshipperDashboard';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  const location = useLocation();
  const isPortalRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/dropshipper');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fcfe] text-[#0c182c]">
      <ScrollToTop />

      {/* Show Storefront Navbar & Footer only for customer routes */}
      {!isPortalRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Storefront Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/brand/:brandName" element={<BrandPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/return-policy" element={<PoliciesPage />} />
          <Route path="/privacy-policy" element={<PoliciesPage />} />
          <Route path="/terms-of-service" element={<PoliciesPage />} />

          {/* Multi-Vendor Routes */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboard />} />
            <Route path="products" element={<VendorDashboard />} />
            <Route path="orders" element={<VendorDashboard />} />
            <Route path="payouts" element={<VendorDashboard />} />
            <Route path="settings" element={<VendorDashboard />} />
          </Route>

          {/* Dropshipper Routes */}
          <Route path="/dropshipper/login" element={<DropshipperLogin />} />
          <Route path="/dropshipper" element={<DropshipperLayout />}>
            <Route index element={<DropshipperDashboard />} />
            <Route path="orders" element={<DropshipperDashboard />} />
            <Route path="wallet" element={<DropshipperDashboard />} />
            <Route path="settings" element={<DropshipperDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="dropshippers" element={<AdminDropshippers />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="scroll-images" element={<AdminBanners />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {!isPortalRoute && <Footer />}

      {/* Global Interactive Overlays */}
      {!isPortalRoute && (
        <>
          <CartDrawer />
          <WhatsAppFloatingButton />
        </>
      )}
      <ToastContainer />
      <Analytics />
    </div>
  );
}

export default App;
