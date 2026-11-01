# AxisX Store - Luxury Textile & Apparel E-Commerce Platform

A production-ready e-commerce web application inspired by **[AxisX Store](https://axisxstore.vercel.app/)**, built with **React 18**, **Vite**, **Tailwind CSS**, and **Lucide Icons**.

---

## ✨ Features

### 🛍️ Customer Experience
- **Hero & Curated Collections**: Luxury boutique styling with announcement banners, value propositions, and interactive category grids.
- **Full Catalog & Filtering**:
  - Live fuzzy search by title, category, fabric, or description (`Cmd+K` / `Ctrl+K` shortcut).
  - Multi-criteria filtering: Categories, Fabrics (Pure Silk, Linen, Cotton, etc.), Max Price range slider, and In-Stock toggle.
  - Sorting by Featured, Price (Low to High / High to Low), Rating, and New Arrivals.
- **Product Details**:
  - High-res image gallery with thumbnail navigation.
  - Color swatches & size selectors.
  - Quantity adjuster.
  - **Direct WhatsApp Ordering**: Automatically generates pre-formatted order text and opens WhatsApp chat with the studio.
  - Tabs for Description & Artistry, Fabric & Care Instructions, Islandwide Shipping Policy, and Customer Reviews.
- **Slide-over Cart & Full Cart**:
  - Item adjustment, quantity increment/decrement, and deletion.
  - Interactive coupon codes (`AXISX10` for 10% off, `FESTIVE20` for 20% off).
  - Free Islandwide Delivery threshold meter (unlocked at LKR 5,000+).
  - "Direct Order Cart via WhatsApp" shortcut.
- **Comprehensive Checkout**:
  - Multi-step customer address and notes capture.
  - 3 Payment Methods:
    1. **Cash on Delivery (COD)** across Sri Lanka.
    2. **Direct Bank Transfer (Bank of Ceylon)** with 1-click copy for A/C details.
    3. **Order & Pay via WhatsApp Concierge**.
  - Order confirmation screen with unique generated Order ID (`ORD-XXXXXX`).
- **Wishlist**: Bookmark favorite pieces with live header badge and instant sync.
- **Floating WhatsApp Concierge**: Instant direct chat assistance in bottom-right corner.
- **Editorial & Informational Pages**:
  - Collections Lookbook
  - About Us (Colombo studio roots, artisan partnerships, values)
  - Contact Us with interactive inquiry form & FAQ accordion
  - Shipping, Returns, Privacy Policy & Terms of Service

---

### 🛡️ Admin Studio (`/admin`)
- **1-Click Demo Login** (`admin@axisxstudio.co` / `axisx2026`).
- **Dashboard Overview**: Gross Sales (LKR), Order Metrics, Active Inventory count, and unread client inquiries.
- **Product Management**: Add, edit, delete products, adjust prices, stock quantities, and badges.
- **Category Management**: Edit banners, design counts, and categories.
- **Order Tracking**: Update statuses (`Payment Review`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) and inspect customer details.
- **Promotional Banners**: Manage hero announcements and discounts.
- **Customer Messages**: Read contact inquiries and reply directly via WhatsApp.
- **Store Settings**: Update store name, WhatsApp hotline, Colombo address, and Bank of Ceylon account information.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 2. MongoDB Atlas Configuration
Your database URI is configured in [`server/.env`](file:///server/.env):
```env
PORT=5000
MONGODB_URI=mongodb+srv://viththakan2001_db_user:VRaEHu2LvFtG9318@cluster0.4lmng0q.mongodb.net/haveitall_store?retryWrites=true&w=majority
```

### 3. Seed Initial Database (Optional)
To re-seed or populate your MongoDB Atlas cluster with products, categories, orders, and banners:
```bash
npm run seed
```

### 4. Run Frontend & Backend Concurrently
```bash
npm run dev:all
```
- **Storefront (Vite):** [http://localhost:5173/](http://localhost:5173/)
- **Backend API (Express):** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 5. Production Build
```bash
npm run build
```
