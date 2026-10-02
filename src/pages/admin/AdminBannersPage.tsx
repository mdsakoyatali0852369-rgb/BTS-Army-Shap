import React, { useEffect, useState } from 'react';
import {
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../firebase/services';
import { Banner } from '../../firebase/types';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Check, PackageOpen } from 'lucide-react';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [buttonText, setButtonText] = useState('Shop Collection');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getAllBannersAdmin();
      setBanners(list);
    } catch (e) {
      console.warn('Error loading banners:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('/logo.jpg');
    setButtonText('Explore Collections');
    setButtonLink('/shop');
    setSortOrder(banners.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setImage(b.image);
    setButtonText(b.buttonText || '');
    setButtonLink(b.buttonLink || '');
    setSortOrder(b.sortOrder || 0);
    setActive(b.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim()) return;
    setSaving(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          image: image.trim(),
          buttonText: buttonText.trim(),
          buttonLink: buttonLink.trim(),
          sortOrder: Number(sortOrder),
          active,
        });
      } else {
        await createBanner({
          title: title.trim(),
          subtitle: subtitle.trim(),
          image: image.trim(),
          buttonText: buttonText.trim(),
          buttonLink: buttonLink.trim(),
          sortOrder: Number(sortOrder),
          active,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving banner:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error('Error deleting banner:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Homepage Banners ({banners.length})
          </h1>
          <p className="text-xs text-zinc-500">
            Control the visual banners and promotional announcements on the homepage
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-16/9 bg-zinc-100 overflow-hidden">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                    b.active ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {b.active ? 'Active' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">{b.title || 'Untitled Banner'}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{b.subtitle || '—'}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
                <span className="font-mono text-zinc-400">Order: #{b.sortOrder}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-zinc-500 hover:text-purple-900 rounded-lg hover:bg-purple-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Headline Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elevate Your Style with BTS Army Official Merch"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Subtitle / Message</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 100% Cash On Delivery across Bangladesh"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="e.g. /logo.jpg or web url"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Explore Collections"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Button Link</label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/shop"
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
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
