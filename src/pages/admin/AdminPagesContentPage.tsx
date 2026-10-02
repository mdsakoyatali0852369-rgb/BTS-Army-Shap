import React, { useState, useEffect } from 'react';
import { getPageContent, savePageContent } from '../../firebase/services';
import { FileText, Save, CheckCircle2 } from 'lucide-react';

const PAGES = [
  { slug: 'about', label: 'About Us' },
  { slug: 'contact', label: 'Contact Us' },
  { slug: 'shipping-policy', label: 'Shipping & Delivery' },
  { slug: 'return-policy', label: 'Return & Exchange Policy' },
  { slug: 'size-guide', label: 'Clothing Size Guide' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'faq', label: 'Frequently Asked Questions' },
];

export const AdminPagesContentPage: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState('about');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setSavedNotice(false);
      try {
        const page = await getPageContent(activeSlug);
        if (page) {
          setTitle(page.title);
          setContent(page.content);
        } else {
          const match = PAGES.find((p) => p.slug === activeSlug);
          setTitle(match?.label || '');
          setContent('');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await savePageContent(activeSlug, title, content);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Website Content & Policy Pages
        </h1>
        <p className="text-xs text-zinc-500">
          Edit your About page, sizing guide, exchange policies, and legal pages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation list */}
        <div className="space-y-1">
          {PAGES.map((p) => (
            <button
              key={p.slug}
              onClick={() => setActiveSlug(p.slug)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeSlug === p.slug
                  ? 'bg-purple-950 text-white shadow-md'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSave}
            className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-xs space-y-4 text-xs"
          >
            {savedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Page content updated and live on customer storefront!</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Page Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">
                Body Content (Plain text or Markdown paragraphs)
              </label>
              <textarea
                rows={14}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter page content here..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white text-xs leading-relaxed font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="px-6 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{saving ? 'Saving...' : 'Save & Publish Page'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
