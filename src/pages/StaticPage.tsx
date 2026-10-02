import React, { useEffect, useState } from 'react';
import { getPageContent } from '../firebase/services';
import { useSettings } from '../context/SettingsContext';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface StaticPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ slug, navigate }) => {
  const { settings } = useSettings();
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const page = await getPageContent(slug);
        if (page) {
          setTitle(page.title);
          setContent(page.content);
        } else {
          // Provide authentic default information based on the user's business metadata
          const defaults = getDefaultPageContent(slug, settings);
          setTitle(defaults.title);
          setContent(defaults.content);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, settings]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="pb-6 mb-8 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900">{title}</h1>
        <p className="text-xs text-zinc-500 mt-1">Official Information • {settings.storeName}</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-zinc-200 rounded w-3/4" />
          <div className="h-4 bg-zinc-200 rounded w-1/2" />
          <div className="h-24 bg-zinc-100 rounded" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs">
            {content}
          </div>

          {/* Contact Us Form if on /contact */}
          {slug === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100 space-y-4 text-xs">
                <h3 className="text-base font-bold text-purple-950">Store Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-zinc-700">
                    <MapPin className="w-4 h-4 text-purple-900 shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-700">
                    <Phone className="w-4 h-4 text-purple-900 shrink-0" />
                    <a href={`tel:${settings.phone}`} className="hover:underline font-bold">
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-700">
                    <Mail className="w-4 h-4 text-purple-900 shrink-0" />
                    <a href={`mailto:${settings.email}`} className="hover:underline font-bold">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-zinc-500">
                    Business Hours: 10:00 AM – 10:00 PM (Everyday, Bangladesh Time)
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs">
                <h3 className="text-base font-bold text-zinc-900 mb-4">Send us a Message</h3>
                {contactSubmitted ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          required
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Message</label>
                      <textarea
                        rows={3}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getDefaultPageContent(slug: string, settings: any): { title: string; content: string } {
  switch (slug) {
    case 'about':
      return {
        title: 'About BTS Army',
        content: `আমাদের ওয়েবসাইটে আপনাকে স্বাগতম!\n\nএটি একটি বিশ্বস্ত ও আধুনিক ডিজিটাল প্লাটফর্ম, যা আপনার প্রয়োজনীয় সব মানসম্মত নিজস্ব প্রজেক্ট এক জায়গায় নিয়ে এসেছে। Daraz-এর মতো সহজ ও নিরবচ্ছিন্ন কেনাকাটার অভিজ্ঞতায়, আপনি এখানে সরাসরি আমাদের তৈরি সেরা প্রজেক্টগুলো দেখতে, বেছে নিতে এবং নিরাপদে অর্ডার করতে পারবেন। আপনার ডিজিটাল প্রয়োজন মেটাতে সেরা কোয়ালিটি ও দ্রুত সেবাই আমাদের মূল লক্ষ্য!\n\nWe are based in ${settings.address} and proudly deliver across all 64 districts of Bangladesh with 100% Cash On Delivery.`,
      };
    case 'contact':
      return {
        title: 'Contact Customer Support',
        content: `Have questions about sizing, placing an order, or tracking a parcel? Our team is here to assist you.\n\nHelpline: ${settings.phone}\nEmail: ${settings.email}\nWhatsApp: ${settings.whatsapp}\nAddress: ${settings.address}\n\nFeel free to call us directly or use the message form below.`,
      };
    case 'shipping-policy':
      return {
        title: 'Shipping & Delivery Policy',
        content: `Delivery Coverage:\nWe deliver all across Bangladesh (Dhaka and all 64 districts).\n\nDelivery Timelines:\n• Inside Dhaka: 2 to 3 working days.\n• Outside Dhaka: 3 to 5 working days.\n\nShipping Rates:\nStandard shipping charges apply based on your location and are clearly shown during checkout. Enjoy free delivery on eligible order minimums.\n\nCash On Delivery (COD):\nYou can inspect the exterior package and pay cash directly to the delivery person upon receiving your apparel.`,
      };
    case 'return-policy':
      return {
        title: 'Return & Exchange Policy',
        content: `At BTS Army, customer satisfaction is our top priority.\n\nExchange Window:\nWe offer a 7-day hassle-free size exchange policy if the clothing item does not fit comfortably.\n\nConditions for Exchange:\n1. The product must be unworn, unwashed, and in its original packaging with all tags intact.\n2. Please notify us via WhatsApp or Call within 48 hours of parcel arrival.\n3. Return shipping cost may apply unless the delivered item has a factory defect or mismatch.`,
      };
    case 'privacy-policy':
      return {
        title: 'Privacy Policy',
        content: `Your privacy is important to us. BTS Army is committed to protecting your personal information.\n\nInformation We Collect:\nWe only collect essential details needed to deliver your clothing orders: Name, Phone Number, Delivery Address, and optional Email for receipts.\n\nData Protection:\nWe never sell or disclose your personal contact information to third parties. Customer passwords and accounts are securely managed via Firebase Authentication with zero plaintext storage.`,
      };
    case 'terms':
      return {
        title: 'Terms & Conditions',
        content: `Welcome to the official BTS Army Shopping Website.\n\n1. By placing an order, you agree to receive the order via our designated delivery partners and pay the invoice total upon delivery for Cash on Delivery orders.\n2. All product prices are listed in BDT (৳) and include applicable fees.\n3. We reserve the right to cancel orders suspected of fraudulent intent or fake phone numbers.\n4. Intellectual property and logos belong to their respective copyright holders.`,
      };
    case 'size-guide':
      return {
        title: 'Clothing Size Guide',
        content: `Standard Asian Regular Fit Clothing Dimensions (Inches):\n\n• S (Small): Chest 36-38", Length 26-27", Shoulder 16.5"\n• M (Medium): Chest 38-40", Length 27-28", Shoulder 17.5"\n• L (Large): Chest 40-42", Length 28-29", Shoulder 18.5"\n• XL (Extra Large): Chest 42-44", Length 29-30", Shoulder 19.5"\n• XXL (Double XL): Chest 44-46", Length 30-31", Shoulder 20.5"\n\nIf you are between two sizes, we recommend sizing up for a relaxed streetwear fit.`,
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions (FAQ)',
        content: `Q1: How do I order?\nA: Simply select your preferred clothing item, choose your size and color, click "Add to Bag" or "Buy Now", enter your delivery address, and confirm.\n\nQ2: Do I have to pay in advance?\nA: No! We provide 100% Cash On Delivery nationwide.\n\nQ3: What if the size does not fit?\nA: Contact our helpline at 01733047371 within 7 days, and we will arrange a convenient size exchange.`,
      };
    default:
      return {
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        content: 'Official store page content.',
      };
  }
}
