import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  ExternalLink,
} from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#100720] text-zinc-300 border-t border-purple-950/60 mt-16 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-purple-900/40">
          <div className="flex items-center gap-4 bg-purple-950/40 p-4 rounded-2xl border border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-900/60 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Fast Delivery Across Bangladesh</h4>
              <p className="text-xs text-zinc-400">Dhaka & all 64 districts nationwide delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-purple-950/40 p-4 rounded-2xl border border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-900/60 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Cash On Delivery</h4>
              <p className="text-xs text-zinc-400">Check product at doorstep before payment</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-purple-950/40 p-4 rounded-2xl border border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-900/60 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Easy Exchange Policy</h4>
              <p className="text-xs text-zinc-400">Hassle-free 7-day size exchange guarantee</p>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Store Description */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-700 bg-purple-950 shadow-md">
                <img
                  src={settings.logoUrl || '/logo.jpg'}
                  alt="BTS Army Store Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  {settings.storeName}
                </span>
                <p className="text-xs text-purple-300 font-medium tracking-wide">
                  SHOPPING WEBSITE BANGLADESH
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 text-justify">
              {settings.storeDescription}
            </p>

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                Follow Us Online
              </p>
              <div className="flex flex-wrap gap-2.5">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-xs text-white flex items-center gap-1.5 transition-colors border border-purple-800/40"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
                {settings.tiktok && (
                  <a
                    href={settings.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-xs text-white flex items-center gap-1.5 transition-colors border border-purple-800/40"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
                {settings.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-xs text-white flex items-center gap-1.5 transition-colors border border-purple-800/40"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/88${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-xs text-emerald-300 flex items-center gap-1.5 transition-colors border border-emerald-800/40"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop')}
                  className="hover:text-amber-400 transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop?filter=newArrival')}
                  className="hover:text-amber-400 transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop?filter=bestSeller')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/track-order')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/wishlist')}
                  className="hover:text-amber-400 transition-colors"
                >
                  My Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Policies & Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  About BTS Army
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/size-guide')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Clothing Size Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shipping-policy')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/return-policy')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Return & Exchange
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy-policy')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/faq')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-amber-400">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-amber-400 break-all">
                  {settings.email}
                </a>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full py-2 px-3 text-center rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white font-medium transition-colors border border-purple-800/40 text-xs"
                >
                  Customer Support Form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-purple-300/80">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Bangladesh Fashion Lovers</span>
          </div>
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Merchant Access
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
