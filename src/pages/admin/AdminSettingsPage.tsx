import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { updateSiteSettings } from '../../firebase/services';
import { SiteSettings } from '../../firebase/types';
import { Save, CheckCircle2, Store, Phone, Globe, Sparkles } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await updateSiteSettings(form);
      await refreshSettings();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Store & Business Settings
        </h1>
        <p className="text-xs text-zinc-500">
          Manage contact info, social accounts, and announcements for BTS Army
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully and updated across the entire website!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* General Store Identity */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-900" />
            <span>Store Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Store Name</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Logo URL</label>
              <input
                type="text"
                value={form.logoUrl || ''}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="/logo.jpg"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-zinc-700 uppercase mb-1">
                Official Bengali Store Description
              </label>
              <textarea
                rows={4}
                value={form.storeDescription}
                onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Contact & Physical Location */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-900" />
            <span>Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Business Phone</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">WhatsApp Number</label>
              <input
                type="text"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Business Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Store Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-900" />
            <span>Social Media Channels</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Facebook Page Link</label>
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">TikTok Account Link</label>
              <input
                type="url"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">YouTube Channel Link</label>
              <input
                type="url"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Announcement Header Bar */}
        <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-900" />
              <span>Top Announcement Bar</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
              <input
                type="checkbox"
                checked={form.announcementActive}
                onChange={(e) => setForm({ ...form, announcementActive: e.target.checked })}
                className="w-4 h-4 accent-purple-900"
              />
              <span>Show Banner</span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 uppercase mb-1">Announcement Text</label>
            <input
              type="text"
              value={form.announcement || ''}
              onChange={(e) => setForm({ ...form, announcement: e.target.value })}
              placeholder="e.g. Free Delivery on orders over ৳3,000 across Bangladesh!"
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
