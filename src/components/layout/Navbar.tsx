import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getActiveProducts, getCategories } from '../../firebase/services';
import { Product, Category } from '../../firebase/types';
import { formatPrice } from '../../utils/formatters';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { cartCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, isAdmin } = useAuth();
  const { settings } = useSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const all = await getActiveProducts(50);
        const q = searchQuery.toLowerCase().trim();
        const matched = all.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
        );
        setSearchResults(matched.slice(0, 6));
        setShowSearchDropdown(true);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeCategories = categories.filter((c) => c.active);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-zinc-700 hover:text-purple-900 rounded-lg focus:outline-hidden"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-purple-900/30 group-hover:border-purple-800 shadow-xs transition-transform group-hover:scale-105 bg-purple-950 flex items-center justify-center">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt="BTS Army Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 group-hover:text-purple-900 transition-colors">
                  BTS Army
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                  BD
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium tracking-wider hidden sm:inline">
                OFFICIAL CLOTHING STORE
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 font-medium text-sm text-zinc-700">
            <button
              onClick={() => navigate('/')}
              className={`hover:text-purple-800 transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-purple-900 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/shop')}
              className={`hover:text-purple-800 transition-colors cursor-pointer ${
                currentPath === '/shop' ? 'text-purple-900 font-semibold' : ''
              }`}
            >
              Shop All
            </button>

            {/* Categories dropdown */}
            <div className="relative" onMouseLeave={() => setIsCategoryMenuOpen(false)}>
              <button
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-1 hover:text-purple-800 transition-colors cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {activeCategories.length > 0 ? (
                    activeCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setIsCategoryMenuOpen(false);
                          navigate(`/category/${cat.slug}`);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-purple-50 hover:text-purple-900 flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-zinc-500 text-center">
                      No categories yet
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/track-order')}
              className={`hover:text-purple-800 transition-colors cursor-pointer ${
                currentPath === '/track-order' ? 'text-purple-900 font-semibold' : ''
              }`}
            >
              Track Order
            </button>
          </nav>

          {/* Search Bar Desktop */}
          <div ref={searchContainerRef} className="hidden lg:block relative flex-1 max-w-xs">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search t-shirts, hoodies, panjabi..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-100 hover:bg-zinc-150 focus:bg-white text-xs sm:text-sm rounded-full border border-transparent focus:border-purple-300 focus:outline-hidden transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </form>

            {/* Dropdown Results */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Matching Products
                    </div>
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/product/${prod.id}`);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={prod.thumbnail || prod.images[0] || '/logo.jpg'}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-purple-700 font-bold">
                            {formatPrice(prod.salePrice || prod.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center py-2 text-xs font-semibold text-purple-800 hover:bg-purple-100/60 rounded-lg transition-colors mt-1"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative p-2 text-zinc-700 hover:text-purple-900 rounded-full hover:bg-purple-50 transition-colors"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 text-zinc-700 hover:text-purple-900 rounded-full hover:bg-purple-50 transition-colors"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-purple-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account / Admin */}
            {isAdmin ? (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950 text-amber-400 hover:bg-purple-900 text-xs font-bold transition-all shadow-xs"
                title="Admin Control Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            ) : currentUser ? (
              <button
                onClick={() => navigate('/account')}
                className="p-2 text-zinc-700 hover:text-purple-900 rounded-full hover:bg-purple-50 transition-colors"
                title="Customer Account"
                aria-label="Customer Account"
              >
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/account')}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-zinc-300 hover:border-purple-800 text-zinc-700 hover:text-purple-900 text-xs font-semibold transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products in Bangladesh..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 text-xs rounded-full border border-transparent focus:border-purple-300 focus:bg-white focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/');
            }}
            className={`block w-full text-left py-2 text-sm font-medium ${
              currentPath === '/' ? 'text-purple-900 font-bold' : 'text-zinc-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/shop');
            }}
            className={`block w-full text-left py-2 text-sm font-medium ${
              currentPath === '/shop' ? 'text-purple-900 font-bold' : 'text-zinc-700'
            }`}
          >
            Shop All Collections
          </button>

          {activeCategories.length > 0 && (
            <div className="py-2 border-y border-zinc-100">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {activeCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(`/category/${c.slug}`);
                    }}
                    className="text-left text-xs py-1.5 px-2 rounded-lg bg-zinc-50 hover:bg-purple-50 text-zinc-700 hover:text-purple-900 truncate"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/track-order');
            }}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700"
          >
            Track My Order
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/wishlist');
            }}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700"
          >
            My Wishlist ({wishlistCount})
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate(currentUser ? '/account' : '/account');
            }}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700"
          >
            {currentUser ? 'My Account & Orders' : 'Sign In / Register'}
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/admin');
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-purple-950 text-amber-400 font-bold text-sm text-center flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Go to Admin Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
