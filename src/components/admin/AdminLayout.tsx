import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Truck,
  Image,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  navigate,
  children,
}) => {
  const { logout, currentUser } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Shirt },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'delivery', label: 'Delivery Zones', icon: Truck },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'pages', label: 'Pages & Content', icon: FileText },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row text-zinc-900 font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#120722] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-purple-900/60 text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm tracking-tight">BTS Army Admin</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-amber-400 hover:text-white flex items-center gap-1 font-bold"
        >
          <span>Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#120722] text-zinc-300 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand header */}
          <div className="p-6 border-b border-purple-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-600 bg-purple-950 shrink-0">
              <img src="/logo.jpg" alt="Admin Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-white text-sm tracking-tight truncate">
                BTS Army
              </h2>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Control Panel</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-900 text-white font-bold shadow-md'
                      : 'text-zinc-400 hover:bg-purple-950/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions: View Live Store & Logout */}
          <div className="p-4 border-t border-purple-900/50 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-xs font-medium text-purple-200 flex items-center justify-center gap-2 transition-colors border border-purple-800/40"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Storefront</span>
            </button>

            <button
              onClick={logout}
              className="w-full py-2 px-3 rounded-xl hover:bg-rose-950/50 text-xs font-medium text-rose-400 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Admin</span>
            </button>

            <div className="pt-2 text-center text-[10px] text-zinc-500 truncate">
              {currentUser?.email}
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Main Admin Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top desktop breadcrumb bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-800">Admin</span>
            <span>/</span>
            <span className="text-purple-950 font-bold capitalize">{currentTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 rounded-full border border-zinc-200 text-xs font-semibold hover:bg-zinc-50 flex items-center gap-1.5 text-zinc-700"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold bg-purple-100 text-purple-950 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin Online</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>

    </div>
  );
};
