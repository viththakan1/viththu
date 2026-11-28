# haveitall.lk - Authentic Skincare, Cosmetics, Appliances & Lifestyle Store

A production-ready e-commerce web application for **[haveitall.lk](https://haveitall.lk/)**, built with **React 18**, **Vite**, **Tailwind CSS**, and **Express / MongoDB Atlas**. Delivering 100% authentic global skincare, cosmetics, electronics, mobile accessories, home appliances, and hardware with islandwide Cash on Delivery across Sri Lanka.

---

## ✨ Features

### 🛍️ Customer Experience
- **Dedicated Departments & Scroll Banners**: Home, Cosmetics, Appliances, and Fashion with dedicated interactive promotional hero sliders.
- **Full Catalog & Filtering**:
  - Live fuzzy search by title, category, brand, or description.
  - Multi-criteria filtering: Categories, Brands, Price range slider, and In-Stock toggle.
  - Sorting by Featured, Price (Low to High / High to Low), Rating, and New Arrivals.
- **Product Details**:
  - High-res image gallery with thumbnail navigation.
  - Color swatches & size/variant selectors.
  - Quantity adjuster.
  - **Direct WhatsApp Ordering**: Automatically generates pre-formatted order text and opens WhatsApp chat with our team.
  - Islandwide Shipping Policy, and Customer Reviews.
- **Slide-over Cart & Full Cart**:
  - Item adjustment, quantity increment/decrement, and deletion.
  - Interactive coupon codes (`HAVEITALL10` for 10% off, `WELCOME10` for 10% off).
  - Free Islandwide Delivery threshold meter (unlocked at LKR 5,000+).
  - "Direct Order Cart via WhatsApp" shortcut.
- **Comprehensive Checkout**:
  - Multi-step customer address and notes capture.
  - 3 Payment Methods:
    1. **Cash on Delivery (COD)** across Sri Lanka.
    2. **Direct Bank Transfer** with 1-click copy for account details.
    3. **Order & Pay via WhatsApp Concierge**.
  - Order confirmation screen with unique generated Order ID (`ORD-XXXXXX`).
- **Wishlist**: Bookmark favorite pieces with live header badge and instant sync.
- **Floating WhatsApp Concierge**: Instant direct chat assistance in bottom-right corner.
- **Informational Pages**:
  - About Us (Colombo roots, authenticity guarantee, islandwide COD)
  - Contact Us with interactive inquiry form & FAQ accordion
  - Shipping, Returns, Privacy Policy & Terms of Service

---

### 🛡️ Admin Studio (`/admin`)
- **Dashboard Overview**: Gross Sales (LKR), Order Metrics, Active Inventory count, and unread client inquiries.
- **Product Management**: Add, edit, delete products, adjust prices, stock quantities, barcodes, and badges.
- **Category & Brand Management**: Dedicated multi-department brand and category organization.
- **Order Tracking**: Update statuses (`Payment Review`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) and inspect customer details.
- **Scroll Image / Banner Management**: Upload department-specific scroll banners with multi-tick page assignment (`Home`, `Cosmatics`, `Applieances`, `Fashion`).
- **Customer Messages**: Read contact inquiries and reply directly via WhatsApp.
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
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.4lmng0q.mongodb.net/haveitall_store?retryWrites=true&w=majority
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
