import React, { useEffect, useState } from 'react';
import {
  getCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../firebase/services';
import { Coupon } from '../../firebase/types';
import { formatPrice } from '../../utils/formatters';
import { Tag, Plus, Trash2, Edit2, X, Check, PackageOpen } from 'lucide-react';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountAmount, setDiscountAmount] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number | undefined>(1000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(500);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<number | undefined>(100);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getCouponsAdmin();
      setCoupons(list);
    } catch (e) {
      console.warn('Error loading coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountAmount(10);
    setMinOrder(1000);
    setMaxDiscount(500);
    setExpiryDate('');
    setUsageLimit(100);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountAmount <= 0) return;
    setSaving(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, {
          code: code.trim().toUpperCase(),
          discountType,
          discountAmount: Number(discountAmount),
          minOrder: minOrder ? Number(minOrder) : undefined,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          expiryDate: expiryDate || undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          active,
        });
      } else {
        await createCoupon({
          code: code.trim().toUpperCase(),
          discountType,
          discountAmount: Number(discountAmount),
          minOrder: minOrder ? Number(minOrder) : undefined,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          expiryDate: expiryDate || undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          active,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving coupon:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error('Error deleting coupon:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Promotional Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-zinc-500">
            Create discount vouchers and percentage coupons for your shoppers
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 animate-pulse">
            Loading discount coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">No active coupons configured</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Create special discounts like BTSARMY10 or WELCOMEBD for customer campaigns.
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-2.5 rounded-full bg-purple-950 text-white font-bold text-xs"
            >
              Add First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Usage Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/60">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-purple-950 bg-purple-50 px-2 py-1 rounded-md text-xs border border-purple-200">
                        {c.code}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-zinc-900">
                      {c.discountType === 'percentage'
                        ? `${c.discountAmount}% OFF`
                        : `${formatPrice(c.discountAmount)} Flat`}
                      {c.maxDiscount && (
                        <span className="text-[10px] text-zinc-400 block font-normal">
                          Max: {formatPrice(c.maxDiscount)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-zinc-600">
                      {c.minOrder ? formatPrice(c.minOrder) : 'No Minimum'}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-700">
                      {c.usedCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {c.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">Create Discount Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ARMYLOVE10"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Amount *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Min Order (৳)</label>
                  <input
                    type="number"
                    value={minOrder || ''}
                    onChange={(e) => setMinOrder(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Max Cap (৳)</label>
                  <input
                    type="number"
                    value={maxDiscount || ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-950 text-white font-bold hover:bg-purple-900 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
