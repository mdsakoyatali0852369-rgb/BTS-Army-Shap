import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
  const { settings } = useSettings();

  if (!settings.whatsapp) return null;

  const cleanNum = settings.whatsapp.replace(/[^0-9]/g, '');
  const link = `https://wa.me/88${cleanNum}?text=${encodeURIComponent(
    'Hello BTS Army! I have an inquiry about clothing products.'
  )}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-none" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs pl-0 group-hover:pl-2">
        WhatsApp Order
      </span>
    </a>
  );
};
