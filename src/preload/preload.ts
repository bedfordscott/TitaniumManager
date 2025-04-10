import { contextBridge, ipcRenderer } from 'electron';

// Define the API to expose to the renderer process
// This creates a secure bridge between the renderer and main processes
contextBridge.exposeInMainWorld('titaniumAPI', {
  // Hardware key authentication
  unlockWithHardwareKey: (deviceType: string) => {
    return ipcRenderer.invoke('unlock-with-hardware-key', deviceType);
  },
  
  // Vault operations
  saveVault: (encryptedVault: string) => {
    return ipcRenderer.invoke('save-vault', encryptedVault);
  },
  
  loadVault: () => {
    return ipcRenderer.invoke('load-vault');
  },
  
  exportVault: () => {
    return ipcRenderer.invoke('export-vault');
  },
  
  importVault: () => {
    return ipcRenderer.invoke('import-vault');
  }
});

// Define the types for the exposed API in the window object
declare global {
  interface Window {
    titaniumAPI: {
      unlockWithHardwareKey: (deviceType: string) => Promise<{ success: boolean; message?: string }>;
      saveVault: (encryptedVault: string) => Promise<{ success: boolean; message?: string }>;
      loadVault: () => Promise<{ success: boolean; data?: any; message?: string }>;
      exportVault: () => Promise<{ success: boolean; message?: string }>;
      importVault: () => Promise<{ success: boolean; message?: string }>;
    };
  }
} 