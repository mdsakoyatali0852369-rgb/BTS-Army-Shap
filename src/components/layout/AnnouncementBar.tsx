import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, Phone, MapPin } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();

  if (!settings.announcementActive || !settings.announcement) {
    return null;
  }

  return (
    <div className="bg-[#140827] text-white text-xs py-2 px-4 transition-colors border-b border-purple-950/40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{settings.announcement}</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-purple-200/80 font-normal">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3 h-3 text-amber-400" />
            <a href={`tel:${settings.phone}`}>{settings.phone}</a>
          </span>
          <span className="text-purple-400/30">|</span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{settings.deliveryArea || 'Bangladesh'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
