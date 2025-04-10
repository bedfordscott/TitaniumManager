import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

// Initialize the secure configuration store
const store = new Store({
  encryptionKey: 'titanium-manager-secure-key',
  name: 'titanium-manager-config'
});

// Declare a global reference to the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    title: 'Titanium Manager',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      devTools: isDev, // Enable DevTools only in development mode
      spellcheck: false,
      sandbox: true // Enhance security with sandboxing
    },
    backgroundColor: '#1e1e1e', // Dark background for better UX
    show: false // Hide until ready-to-show
  });

  // Load the renderer (UI)
  const startUrl = isDev
    ? 'http://localhost:3000' // Development server URL
    : `file://${path.join(__dirname, '../renderer/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);

  // Show window when ready to avoid flickering
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      // Open developer tools automatically in development mode
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation to external URLs for security
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost:3000') && !url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url); // Open external URLs in the default browser instead
    }
  });
}

// Handle app ready event
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate the window when the dock icon is clicked
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Define IPC handlers for secure communication between main and renderer processes

// Handle unlocking the password vault with a hardware key
ipcMain.handle('unlock-with-hardware-key', async (event, deviceType) => {
  try {
    // Log authentication attempt for debugging
    console.log(`Attempting to unlock with ${deviceType}`);
    
    // In a real implementation, we would:
    // 1. Detect connected hardware keys
    // 2. Prompt user to touch/activate their key
    // 3. Verify the hardware token signature
    
    // For demo purposes, we'll simulate hardware key authentication failure
    // to prevent unauthorized access without actual hardware authentication
    return { 
      success: false, 
      message: 'No hardware key detected. Please connect your key and try again.' 
    };
  } catch (error) {
    console.error('Hardware key authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
});

// Handle saving the encrypted vault to disk
ipcMain.handle('save-vault', async (event, encryptedVault) => {
  try {
    // Save the encrypted vault to a file or the secure store
    // This is just a placeholder - in a real implementation, 
    // we would verify the encryption before storing
    store.set('encryptedVault', encryptedVault);
    return { success: true };
  } catch (error) {
    console.error('Failed to save vault:', error);
    return { success: false, message: 'Failed to save vault' };
  }
});

// Handle loading the encrypted vault from disk
ipcMain.handle('load-vault', async () => {
  try {
    const encryptedVault = store.get('encryptedVault');
    return { success: true, data: encryptedVault };
  } catch (error) {
    console.error('Failed to load vault:', error);
    return { success: false, message: 'Failed to load vault' };
  }
});

// Handle exporting the encrypted vault to a file
ipcMain.handle('export-vault', async () => {
  try {
    const encryptedVault = store.get('encryptedVault');
    
    if (!encryptedVault) {
      return { success: false, message: 'No vault to export' };
    }
    
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Encrypted Vault',
      defaultPath: 'titanium-vault.encrypted',
      filters: [{ name: 'Encrypted Vault', extensions: ['encrypted'] }]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(encryptedVault));
      return { success: true };
    }
    
    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    console.error('Failed to export vault:', error);
    return { success: false, message: 'Failed to export vault' };
  }
});

// Handle importing an encrypted vault from a file
ipcMain.handle('import-vault', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Import Encrypted Vault',
      filters: [{ name: 'Encrypted Vault', extensions: ['encrypted'] }],
      properties: ['openFile']
    });
    
    if (filePaths.length > 0) {
      const fileContent = fs.readFileSync(filePaths[0], 'utf-8');
      const importedVault = JSON.parse(fileContent);
      
      // In a real implementation, we would validate the imported vault here
      
      store.set('encryptedVault', importedVault);
      return { success: true };
    }
    
    return { success: false, message: 'Import cancelled' };
  } catch (error) {
    console.error('Failed to import vault:', error);
    return { success: false, message: 'Failed to import vault' };
  }
}); 