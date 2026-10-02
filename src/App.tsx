import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';

// Components
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';

// Core Customer Pages (eager for fast above-the-fold navigation)
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';

// Lazy-loaded secondary customer pages (code-split)
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const StaticPage = lazy(() => import('./pages/StaticPage').then(m => ({ default: m.StaticPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded Admin Suite (completely separated from customer bundle)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminAccessDenied = lazy(() => import('./pages/admin/AdminAccessDenied').then(m => ({ default: m.AdminAccessDenied })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage').then(m => ({ default: m.AdminProductFormPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then(m => ({ default: m.AdminReviewsPage })));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage').then(m => ({ default: m.AdminCouponsPage })));
const AdminDeliveryPage = lazy(() => import('./pages/admin/AdminDeliveryPage').then(m => ({ default: m.AdminDeliveryPage })));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage').then(m => ({ default: m.AdminBannersPage })));
const AdminPagesContentPage = lazy(() => import('./pages/admin/AdminPagesContentPage').then(m => ({ default: m.AdminPagesContentPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
import { Product } from './firebase/types';

function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-16">
      <div className="w-10 h-10 border-3 border-purple-900 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Loading...</span>
    </div>
  );
}

function AppContent() {
  const { currentUser, isAdmin, isAuthReady } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Admin sub-state
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [adminEditingProduct, setAdminEditingProduct] = useState<Product | null>(null);
  const [adminIsProductFormOpen, setAdminIsProductFormOpen] = useState(false);
  const [adminInspectingOrderId, setAdminInspectingOrderId] = useState<string | null>(null);

  // Synchronize browser history and path changes
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wait for Firebase Auth verification
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-purple-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
          Loading BTS Army Store...
        </p>
      </div>
    );
  }

  // ================= ADMIN ROUTING =================
  if (currentPath.startsWith('/admin')) {
    // 1. If not authenticated, show Admin Login
    if (!currentUser) {
      return (
        <Suspense fallback={<RouteLoadingFallback />}>
          <AdminLoginPage navigate={navigate} />
        </Suspense>
      );
    }

    // 2. If authenticated but unauthorized, show Access Denied
    if (!isAdmin) {
      return (
        <Suspense fallback={<RouteLoadingFallback />}>
          <AdminAccessDenied navigate={navigate} />
        </Suspense>
      );
    }

    // 3. Authorized Admin: Render Admin Control Panel
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={(tab) => {
            setAdminTab(tab);
            setAdminIsProductFormOpen(false);
            setAdminEditingProduct(null);
            setAdminInspectingOrderId(null);
          }}
          navigate={navigate}
        >
          {/* Sub-view: Product Form */}
          {adminTab === 'products' && adminIsProductFormOpen ? (
            <AdminProductFormPage
              initialProduct={adminEditingProduct}
              onBack={() => {
                setAdminIsProductFormOpen(false);
                setAdminEditingProduct(null);
              }}
              onSaved={() => {
                setAdminIsProductFormOpen(false);
                setAdminEditingProduct(null);
              }}
            />
          ) : adminTab === 'products' ? (
            <AdminProductsPage
              onAddNew={() => {
                setAdminEditingProduct(null);
                setAdminIsProductFormOpen(true);
              }}
              onEdit={(prod) => {
                setAdminEditingProduct(prod);
                setAdminIsProductFormOpen(true);
              }}
            />
          ) : null}

          {/* Sub-view: Order Inspector */}
          {adminTab === 'orders' && adminInspectingOrderId ? (
            <AdminOrderDetailPage
              orderId={adminInspectingOrderId}
              onBack={() => setAdminInspectingOrderId(null)}
            />
          ) : adminTab === 'orders' ? (
            <AdminOrdersPage onOpenOrder={(id) => setAdminInspectingOrderId(id)} />
          ) : null}

          {adminTab === 'dashboard' && (
            <AdminDashboardPage
              onSelectTab={(tab) => {
                setAdminTab(tab);
                setAdminIsProductFormOpen(false);
                setAdminInspectingOrderId(null);
              }}
              onOpenOrder={(id) => {
                setAdminTab('orders');
                setAdminInspectingOrderId(id);
              }}
            />
          )}

          {adminTab === 'categories' && <AdminCategoriesPage />}
          {adminTab === 'customers' && <AdminCustomersPage />}
          {adminTab === 'reviews' && <AdminReviewsPage />}
          {adminTab === 'coupons' && <AdminCouponsPage />}
          {adminTab === 'delivery' && <AdminDeliveryPage />}
          {adminTab === 'banners' && <AdminBannersPage />}
          {adminTab === 'pages' && <AdminPagesContentPage />}
          {adminTab === 'settings' && <AdminSettingsPage />}
        </AdminLayout>
      </Suspense>
    );
  }

  // ================= CUSTOMER ROUTING =================
  const renderCustomerPage = () => {
    // Exact routes
    if (currentPath === '/') {
      return <HomePage navigate={navigate} />;
    }

    if (currentPath === '/shop') {
      const urlParams = new URLSearchParams(window.location.search);
      const search = urlParams.get('search') || '';
      const filter = urlParams.get('filter') || '';
      return <ShopPage navigate={navigate} initialSearch={search} initialFilter={filter} />;
    }

    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      return <CategoryPage slug={slug} navigate={navigate} />;
    }

    if (currentPath.startsWith('/product/')) {
      const prodId = currentPath.replace('/product/', '');
      return <ProductDetailPage productId={prodId} navigate={navigate} />;
    }

    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/order-confirmation/')) {
      const orderId = currentPath.replace('/order-confirmation/', '');
      return <OrderConfirmationPage orderId={orderId} navigate={navigate} />;
    }

    if (currentPath === '/track-order') {
      const urlParams = new URLSearchParams(window.location.search);
      const num = urlParams.get('orderNumber') || '';
      return <OrderTrackingPage navigate={navigate} initialOrderNumber={num} />;
    }

    if (currentPath === '/wishlist') {
      return <WishlistPage navigate={navigate} />;
    }

    if (currentPath === '/account') {
      return <AccountPage navigate={navigate} />;
    }

    // Static pages
    const staticSlugs = [
      'about',
      'contact',
      'privacy-policy',
      'terms',
      'shipping-policy',
      'return-policy',
      'size-guide',
      'faq',
    ];
    const matchedSlug = staticSlugs.find((s) => currentPath === `/${s}`);
    if (matchedSlug) {
      return <StaticPage slug={matchedSlug} navigate={navigate} />;
    }

    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">
        <Suspense fallback={<RouteLoadingFallback />}>
          {renderCustomerPage()}
        </Suspense>
      </main>
      <Footer navigate={navigate} />
      <CartDrawer navigate={navigate} />
      <WhatsAppFloat />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
