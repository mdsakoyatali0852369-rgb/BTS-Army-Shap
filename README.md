# BTS Army — Official Clothing E-Commerce Website (Bangladesh)

A complete, production-grade clothing and apparel e-commerce web application built for **BTS Army Shopping Website** in Bangladesh. Features a modern, mobile-first customer storefront, full Firebase backend integration, cash on delivery (COD) checkout, size/color variant inventory management, order tracking, and an administrative control panel (`/admin`).

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Official Branding**: Integrated BTS Army emblem logo, deep royal purple/black aesthetic, Plus Jakarta Sans typography.
- **Dynamic Catalog**: Categorized products (T-Shirts, Hoodies, Panjabi, Pants, Accessories) filtered by size, color, stock, and price.
- **Clothing Variant Matrix**: Multi-size (S, M, L, XL, XXL) & color swatch selection with real stock calculations.
- **Clothing Size Chart Guide**: Asian/Bangladesh regular fit measurements modal (Chest, Length, Shoulder).
- **100% Cash On Delivery (COD)**: Custom checkout tailored for Bangladesh with Division, District, and Upazila selection.
- **Live Search**: Instant product suggestions dropdown without downloading whole database.
- **Real-Time Order Tracking (`/track-order`)**: Order progress timeline (Pending → Confirmed → Processing → Packed → Shipped → Delivered).
- **Customer Account (`/account`)**: Authentication via Email/Password or Google, with order history and profile synchronization.
- **Persistent Cart & Wishlist**: Guest and authenticated customer synchronization.
- **Direct WhatsApp Order**: Floating button linking directly to `01733047371`.
- **Informational Pages**: About Us, Contact, Return Policy, Shipping Policy, Size Guide, Terms, and FAQ.

### 🛡️ Administrative Panel (`/admin`)
- **Strict Role-Based Authorization**:
  - Configured Administrator UID: `uIk8z325rGNlW3gj9M422JVIPwj1`
  - Configured Administrator Email: `btsarmy@lovers.bd`
  - Unauthorized visitors receive an "Access Denied" screen with no data leakage.
- **Real Data Only**: Zero fake products, fake orders, or fake statistics. Starts with clean empty states.
- **Product Management**: Full CRUD, image uploader, size chips, color swatches, automated Size × Color variant matrix with individual stock tracking.
- **Category Management**: Categories CRUD, image upload, sort ordering.
- **Order Processing & Printable Invoice**: Status updating with internal notes, customer address verification, and print-ready invoices.
- **Customer Directory**: Customer profiles, order history, spending totals, and block/unblock controls.
- **Review Moderation**: Approve, hide, or delete customer reviews before they appear publicly.
- **Coupon / Discount System**: Percentage or flat discounts, expiry dates, minimum spends, and usage limits.
- **Delivery Zone Rates**: Flexible configuration for Inside Dhaka, Outside Dhaka, and regional delivery charges.
- **Banner Management**: Homepage hero slides and promotional banners.
- **Static Content Editor**: Live markdown/text editor for store policies and about pages.
- **Site Settings**: Centralized configuration of phone, WhatsApp, email, social links, and announcement bar.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans
- **Database & Auth**: Firebase Firestore, Firebase Authentication, Firebase Storage
- **Utilities**: Canvas Confetti, Slugify, Bangladesh Geo Data

---

## ⚙️ Environment Variables (`.env`)

```env
# Firebase Client Configuration
VITE_FIREBASE_API_KEY="AIzaSyCfnawYQls0X-cCcgUVqt5eo26YEl91QXg"
VITE_FIREBASE_AUTH_DOMAIN="app-790ab.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="app-790ab"
VITE_FIREBASE_STORAGE_BUCKET="app-790ab.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="683375648460"
VITE_FIREBASE_APP_ID="1:683375648460:web:b775e3d3f6c99dad15ec69"
VITE_FIREBASE_MEASUREMENT_ID="G-ESH2E4VCL4"

# Admin Identity
VITE_ADMIN_UID="uIk8z325rGNlW3gj9M422JVIPwj1"
VITE_ADMIN_EMAIL="btsarmy@lovers.bd"
```

---

## 🗄️ Firestore Collections Architecture

1. `products` — Clothing catalog documents (name, slug, SKU, price, salePrice, sizes, colors, variants, totalStock, images, active, featured).
2. `categories` — Product categories (name, slug, image, sortOrder, active).
3. `orders` — Customer orders (orderNumber, customer shipping details, items, subtotal, deliveryCharge, discount, paymentMethod, orderStatus, statusHistory).
4. `customers` — Customer user records (uid, displayName, email, phone, address, totalOrders, totalSpent, status).
5. `reviews` — Customer product reviews (productId, customerName, rating, comment, approved, createdAt).
6. `coupons` — Promotional discount codes (code, discountType, discountAmount, minOrder, usageLimit, usedCount, active).
7. `deliveryZones` — Shipping fees (name, charge, minOrderFree, active).
8. `banners` — Hero slides (title, subtitle, image, buttonText, buttonLink, active, sortOrder).
9. `pages` — Editable page bodies (`about`, `contact`, `shipping-policy`, `return-policy`, `size-guide`, `terms`, `privacy-policy`, `faq`).
10. `settings` — Global settings document `general` (storeName, phone, email, whatsapp, social links, announcement).
11. `admins` — Admin privilege registry document per admin UID.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Compile / Lint checks
npm run lint
npm run build
```

---

## 🔒 Security Architecture
- Firestore Security Rules enforce default-deny for all unauthorized operations.
- Admin routes authenticate via Firebase Auth UID match (`uIk8z325rGNlW3gj9M422JVIPwj1`) and `/admins/{uid}` document check.
- Order prices and stock calculations are computed from real item pricing before creation.
- Zero demo data policy ensures all catalog items, orders, and stats are 100% genuine.
