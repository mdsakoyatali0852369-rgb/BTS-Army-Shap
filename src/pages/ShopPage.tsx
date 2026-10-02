import React, { useEffect, useState, useMemo } from 'react';
import { getActiveProducts, getCategories } from '../firebase/services';
import { Product, Category } from '../firebase/types';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import {
  Filter,
  X,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Search,
} from 'lucide-react';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
  initialCategory?: string;
  initialFilter?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  navigate,
  initialSearch = '',
  initialCategory = '',
  initialFilter = '',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Mobile filter drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prodList, catList] = await Promise.all([
          getActiveProducts(100),
          getCategories(),
        ]);
        setProducts(prodList);
        setCategories(catList.filter((c) => c.active));
      } catch (e) {
        console.warn('Error loading shop catalog:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update category / search if prop changes
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Extract all available sizes from products
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => sizeSet.add(s));
    });
    return Array.from(sizeSet);
  }, [products]);

  // Extract all available colors from products
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        if (!colorMap.has(c.name)) colorMap.set(c.name, c.hex || '#000000');
      });
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Max price for slider
  const maxCatalogPrice = useMemo(() => {
    if (products.length === 0) return 5000;
    return Math.max(...products.map((p) => p.salePrice || p.price), 5000);
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory && p.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchCat = p.category?.toLowerCase().includes(q);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchSku && !matchCat && !matchTags) return false;
        }

        // Size filter
        if (selectedSize) {
          const hasSize = p.sizes?.includes(selectedSize);
          if (!hasSize) return false;
        }

        // Color filter
        if (selectedColor) {
          const hasColor = p.colors?.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase());
          if (!hasColor) return false;
        }

        // In stock only
        if (inStockOnly && p.totalStock <= 0) {
          return false;
        }

        // Price range
        const effPrice = p.salePrice || p.price;
        if (effPrice < priceRange[0] || effPrice > priceRange[1]) {
          return false;
        }

        // Quick filter flags (newArrival, bestSeller)
        if (initialFilter === 'newArrival' && !p.newArrival) return false;
        if (initialFilter === 'bestSeller' && !p.bestSeller) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice || a.price;
        const priceB = b.salePrice || b.price;

        if (sortBy === 'price-low-high') return priceA - priceB;
        if (sortBy === 'price-high-low') return priceB - priceA;
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (sortBy === 'popularity') return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedSize,
    selectedColor,
    inStockOnly,
    priceRange,
    sortBy,
    initialFilter,
  ]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSize('');
    setSelectedColor('');
    setInStockOnly(false);
    setPriceRange([0, maxCatalogPrice]);
    setSortBy('newest');
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(searchQuery) ||
    Boolean(selectedSize) ||
    Boolean(selectedColor) ||
    inStockOnly ||
    priceRange[1] < maxCatalogPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="text-xs text-zinc-400 font-medium mb-1">
            <span onClick={() => navigate('/')} className="hover:underline cursor-pointer">
              Home
            </span>{' '}
            / <span className="text-zinc-900 font-semibold">Clothing Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {selectedCategory ? `${selectedCategory} Collection` : 'All Products'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Controls: Sort dropdown & Mobile filter button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-900" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-zinc-800 focus:outline-hidden focus:border-purple-600 shadow-2xs cursor-pointer"
            >
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="featured">Featured First</option>
              <option value="popularity">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid & Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-900" />
              <span>Filter Catalog</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Categories</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                  !selectedCategory
                    ? 'bg-purple-900 text-white font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.name
                        ? 'bg-purple-900 text-white font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-zinc-400 text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          {availableSizes.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Sizes</h4>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-purple-950 text-white border-purple-950'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {availableColors.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase();
                  return (
                    <button
                      key={color.name}
                      onClick={() =>
                        setSelectedColor(isSelected ? '' : color.name)
                      }
                      title={color.name}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'border-purple-900 bg-purple-50 text-purple-950 font-bold'
                          : 'border-zinc-200 hover:border-zinc-400 text-zinc-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Availability */}
          <div className="pt-4 border-t border-zinc-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-purple-900 focus:ring-purple-600 accent-purple-900"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title={products.length === 0 ? 'No products available yet' : 'No matching products'}
              description={
                products.length === 0
                  ? 'No items have been published to the catalog yet. Store admin can add products in the admin panel.'
                  : 'Try clearing your filters or changing your search terms to discover more items.'
              }
              actionText={hasActiveFilters ? 'Clear All Filters' : 'Refresh Catalog'}
              onAction={hasActiveFilters ? resetFilters : () => window.location.reload()}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onClick={() => navigate(`/product/${prod.id}`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Drawer (Bottom Sheet) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">Filters</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-zinc-700">Category</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    !selectedCategory
                      ? 'bg-purple-900 text-white border-purple-900'
                      : 'border-zinc-200 text-zinc-700'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      selectedCategory === c.name
                        ? 'bg-purple-900 text-white border-purple-900'
                        : 'border-zinc-200 text-zinc-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Sizes */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-zinc-700">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        selectedSize === s
                          ? 'bg-purple-900 text-white border-purple-900'
                          : 'border-zinc-200 text-zinc-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-100 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 text-xs font-bold text-zinc-700 bg-zinc-100 rounded-xl"
              >
                Clear
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-white bg-purple-950 rounded-xl"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
