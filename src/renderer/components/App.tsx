import React, { useState, useEffect } from 'react';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

// Define the states of the application
enum AppState {
  LOADING = 'loading',
  LOGIN = 'login',
  UNLOCKED = 'unlocked'
}

const App: React.FC = () => {
  // Application state
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Check if vault exists and set initial state
  useEffect(() => {
    const initApp = async () => {
      try {
        // Check if a vault exists by trying to load it
        const result = await window.titaniumAPI.loadVault();
        
        // If a vault exists, go to login page, otherwise stay in loading state
        // We'll add UI for creating a new vault later
        if (result.success && result.data) {
          setAppState(AppState.LOGIN);
        } else {
          // No vault found, but still go to login where user can create one
          setAppState(AppState.LOGIN);
        }
        
        // Check user's preferred color scheme
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDarkMode);
        
        // Apply dark mode if preferred
        if (prefersDarkMode) {
          document.body.classList.add('dark-mode');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppState(AppState.LOGIN);
      }
    };
    
    initApp();
    
    // Listen for OS theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    
    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    
    if (newDarkModeState) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save the preference in localStorage for persistence
    localStorage.setItem('darkMode', newDarkModeState ? 'true' : 'false');
  };
  
  // Handle successful login
  const handleLogin = () => {
    setAppState(AppState.UNLOCKED);
  };
  
  // Handle logging out
  const handleLogout = () => {
    setAppState(AppState.LOGIN);
  };
  
  // Render the appropriate component based on app state
  return (
    <div className="app-container">
      {appState === AppState.LOADING && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Titanium Manager...</div>
        </div>
      )}
      
      {appState === AppState.LOGIN && (
        <Login 
          onLogin={handleLogin} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      )}
      
      {appState === AppState.UNLOCKED && (
        <Dashboard 
          onLogout={handleLogout} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      )}
    </div>
  );
};

export default App; 