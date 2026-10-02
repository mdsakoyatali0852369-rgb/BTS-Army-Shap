import React, { useEffect, useState } from 'react';
import {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from '../../firebase/services';
import { DeliveryZone } from '../../firebase/types';
import { formatPrice } from '../../utils/formatters';
import { Truck, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

export const AdminDeliveryPage: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [name, setName] = useState('');
  const [charge, setCharge] = useState<number>(70);
  const [minOrderFree, setMinOrderFree] = useState<number | undefined>(3000);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getDeliveryZones();
      setZones(list);
    } catch (e) {
      console.warn('Error loading delivery zones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingZone(null);
    setName('');
    setCharge(70);
    setMinOrderFree(3000);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (z: DeliveryZone) => {
    setEditingZone(z);
    setName(z.name);
    setCharge(z.charge);
    setMinOrderFree(z.minOrderFree);
    setActive(z.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingZone) {
        await updateDeliveryZone(editingZone.id, {
          name: name.trim(),
          charge: Number(charge),
          minOrderFree: minOrderFree ? Number(minOrderFree) : undefined,
          active,
        });
      } else {
        await createDeliveryZone({
          name: name.trim(),
          charge: Number(charge),
          minOrderFree: minOrderFree ? Number(minOrderFree) : undefined,
          active,
          isDefault: false,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving delivery zone:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeliveryZone(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (e) {
      console.error('Error deleting zone:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Shipping & Delivery Rates ({zones.length})
          </h1>
          <p className="text-xs text-zinc-500">
            Configure delivery fees across Dhaka and all Bangladesh districts
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Delivery Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="p-5 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    zone.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {zone.active ? 'Active' : 'Disabled'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(zone)}
                    className="p-1 text-zinc-400 hover:text-purple-900 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(zone.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-zinc-900">{zone.name}</h3>
              <p className="text-xl font-black text-purple-950 mt-1">
                {formatPrice(zone.charge)}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-500">
              {zone.minOrderFree ? (
                <span className="text-emerald-700 font-semibold">
                  Free delivery for orders above {formatPrice(zone.minOrderFree)}
                </span>
              ) : (
                <span>Flat rate on all orders</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">
                {editingZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">
                  Zone / Area Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Inside Dhaka, Outside Dhaka, Rangpur"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">
                    Charge (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={charge}
                    onChange={(e) => setCharge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">
                    Free Over (৳)
                  </label>
                  <input
                    type="number"
                    value={minOrderFree || ''}
                    onChange={(e) =>
                      setMinOrderFree(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="3000"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
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
                  {saving ? 'Saving...' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
