import React, { useEffect, useState } from 'react';
import { getAllProductsAdmin, deleteProduct, updateProduct } from '../../firebase/services';
import { Product } from '../../firebase/types';
import { formatPrice } from '../../utils/formatters';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shirt,
  Sparkles,
} from 'lucide-react';

interface AdminProductsPageProps {
  onAddNew: () => void;
  onEdit: (product: Product) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  onAddNew,
  onEdit,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getAllProductsAdmin();
      setProducts(prods);
    } catch (e) {
      console.warn('Error loading admin products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { active: !product.active });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
      );
    } catch (e) {
      console.error('Error toggling product status:', e);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filtered = products.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      return matchName || matchSku;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Clothing Products ({products.length})
          </h1>
          <p className="text-xs text-zinc-500">
            Manage your clothing inventory, sizes, colors, and prices
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">
            Loading products catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-900 flex items-center justify-center mx-auto">
              <Shirt className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No products found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {products.length === 0
                ? 'Your clothing catalog is empty. Click below to add your first authentic product!'
                : 'No products matched your search or category filter.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={onAddNew}
                className="px-6 py-2.5 rounded-full bg-purple-950 text-white font-bold text-xs"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price / Sale</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* Item Thumbnail & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnail || prod.images[0] || '/logo.jpg'}
                          alt={prod.name}
                          className="w-12 h-14 object-cover rounded-lg bg-zinc-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate max-w-xs">{prod.name}</p>
                          <div className="flex gap-1.5 mt-1">
                            {prod.featured && (
                              <span className="text-[9px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {prod.newArrival && (
                              <span className="text-[9px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                                New
                              </span>
                            )}
                            {prod.bestSeller && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                                Best
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-600 font-medium">
                      {prod.category}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {prod.sku || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">
                        {formatPrice(prod.salePrice || prod.price)}
                      </div>
                      {prod.salePrice && (
                        <div className="text-[10px] text-zinc-400 line-through">
                          {formatPrice(prod.price)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          prod.totalStock <= 0
                            ? 'bg-rose-100 text-rose-800'
                            : prod.totalStock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.totalStock} in stock
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                          prod.active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                      >
                        {prod.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(prod)}
                          className="p-1.5 text-zinc-500 hover:text-purple-900 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(prod.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-zinc-900">Delete this clothing item?</h3>
              <p className="text-xs text-zinc-500">
                This action is permanent and will remove the item from your store.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 font-bold text-xs text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
