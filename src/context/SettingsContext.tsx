import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings, DeliveryZone } from '../firebase/types';
import { getSiteSettings, getDeliveryZones, DEFAULT_SITE_SETTINGS } from '../firebase/services';

interface SettingsContextType {
  settings: SiteSettings;
  deliveryZones: DeliveryZone[];
  loadingSettings: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const [fetchedSettings, fetchedZones] = await Promise.all([
        getSiteSettings(),
        getDeliveryZones(),
      ]);
      setSettings(fetchedSettings);
      setDeliveryZones(fetchedZones);
    } catch (e) {
      console.warn('Error loading settings:', e);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        deliveryZones,
        loadingSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
