interface Window {
  titaniumAPI: {
    unlockWithHardwareKey: (deviceType: string) => Promise<{ success: boolean; message?: string }>;
    saveVault: (encryptedVault: string) => Promise<{ success: boolean; message?: string }>;
    loadVault: () => Promise<{ success: boolean; data?: any; message?: string }>;
    exportVault: () => Promise<{ success: boolean; message?: string }>;
    importVault: () => Promise<{ success: boolean; message?: string }>;
  };
} 