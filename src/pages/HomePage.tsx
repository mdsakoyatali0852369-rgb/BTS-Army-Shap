import React, { useEffect, useState } from 'react';
import { getActiveProducts, getCategories, getBanners } from '../firebase/services';
import { Product, Category, Banner } from '../firebase/types';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { useSettings } from '../context/SettingsContext';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  Award,
  Flame,
  Clock,
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList, banList] = await Promise.all([
          getActiveProducts(24),
          getCategories(),
          getBanners(),
        ]);
        setProducts(prodList);
        setCategories(catList.filter((c) => c.active));
        setBanners(banList);
      } catch (e) {
        console.warn('Error loading homepage data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.newArrival);
  const bestSellers = products.filter((p) => p.bestSeller);

  // Top Banner
  const activeHeroBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120625] via-[#1e0b3c] to-[#0c0419] text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl border border-purple-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.25),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/70 border border-purple-700/60 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL CLOTHING STORE BANGLADESH</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              {activeHeroBanner?.title || 'Elevate Your Style with BTS Army Official Merch'}
            </h1>

            <p className="text-sm sm:text-base text-purple-200/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {activeHeroBanner?.subtitle ||
                'Premium quality t-shirts, hoodies, panjabi, and streetwear delivered right to your doorstep across Bangladesh. 100% Cash on delivery guaranteed.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-sm transition-all shadow-lg hover:shadow-amber-400/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{activeHeroBanner?.buttonText || 'Explore Collections'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/shop?filter=newArrival')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-white font-bold text-sm transition-all border border-purple-700/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-purple-300" />
                <span>New Arrivals</span>
              </button>
            </div>

            {/* Quick mini trust pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-purple-200/80">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>64 Districts Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Cash On Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Premium Fabric</span>
              </div>
            </div>
          </div>

          {/* Hero Visual / Logo Presentation */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl p-3 bg-gradient-to-br from-purple-800/40 to-purple-950/80 border border-purple-700/50 shadow-2xl flex items-center justify-center group">
              <img
                src={activeHeroBanner?.image || '/logo.jpg'}
                alt="BTS Army Official Logo Banner"
                className="w-full h-full object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-1">
              Top Collections
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs sm:text-sm font-semibold text-purple-900 hover:text-purple-700 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories configured yet"
            description="Categories will appear here once added in the Admin Panel."
            actionText="Browse All Products"
            onAction={() => navigate('/shop')}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-4 hover:border-purple-600 hover:shadow-lg transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center overflow-hidden"
              >
                <div className="w-14 h-14 rounded-full bg-purple-50 group-hover:bg-purple-900 group-hover:text-white text-purple-900 flex items-center justify-center mb-3 transition-colors">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-800 group-hover:text-purple-900 truncate w-full">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs sm:text-sm font-semibold text-purple-900 hover:text-purple-700 flex items-center gap-1 hover:underline"
          >
            <span>See more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (featuredProducts.length > 0 ? featuredProducts : products).length === 0 ? (
          <EmptyState
            title="No products available yet"
            description="Our clothing catalog will be updated shortly with authentic premium pieces."
            actionText="Check Categories"
            onAction={() => navigate('/shop')}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(featuredProducts.length > 0 ? featuredProducts : products).slice(0, 8).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onClick={() => navigate(`/product/${prod.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Trending Now</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                Best Sellers in Bangladesh
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?filter=bestSeller')}
              className="text-xs sm:text-sm font-semibold text-purple-900 hover:text-purple-700 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onClick={() => navigate(`/product/${prod.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Fresh Off the Line</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                New Arrivals
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?filter=newArrival')}
              className="text-xs sm:text-sm font-semibold text-purple-900 hover:text-purple-700 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onClick={() => navigate(`/product/${prod.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trust & Guarantee Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-zinc-900 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Need assistance with sizing or ordering?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Our customer happiness team in Rangpur, Bangladesh is ready to assist you on WhatsApp or Direct Call anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href={`tel:${settings.phone}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Headphones className="w-4 h-4 text-purple-900" />
              <span>Call {settings.phone}</span>
            </a>
            <a
              href={`https://wa.me/88${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
