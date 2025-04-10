import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode, toggleDarkMode }) => {
  const [password, setPassword] = useState<string>('');
  const [isCreatingVault, setIsCreatingVault] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isUsingHardwareKey, setIsUsingHardwareKey] = useState<boolean>(false);
  
  // Handle form submission for login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isCreatingVault) {
        // Create a new vault
        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
        
        // Create an empty vault - simplified for demo
        const emptyVault = { 
          passwordEntries: [],
          createdAt: Date.now()
        };
        
        // Save the encrypted vault
        const saveResult = await window.titaniumAPI.saveVault(JSON.stringify({
          data: JSON.stringify(emptyVault),
          password: password // In a real app, we'd use proper encryption in the main process
        }));
        
        if (saveResult.success) {
          onLogin();
        } else {
          throw new Error(saveResult.message || 'Failed to create vault');
        }
      } else {
        // Log in to existing vault
        const loadResult = await window.titaniumAPI.loadVault();
        
        if (!loadResult.success || !loadResult.data) {
          throw new Error(loadResult.message || 'No vault found');
        }
        
        // Simplified auth - in a real app, decrypt would happen in main process
        const vaultData = JSON.parse(loadResult.data);
        if (vaultData.password === password) {
          onLogin();
        } else {
          setError('Incorrect password');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  // Handle hardware key authentication
  const handleHardwareKeyAuth = async () => {
    setError(null);
    setIsAuthenticating(true);
    
    try {
      const result = await window.titaniumAPI.unlockWithHardwareKey('yubikey');
      
      if (result.success) {
        onLogin();
      } else {
        setError(result.message || 'Hardware key authentication failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return '';
    if (password.length < 8) return 'strength-weak';
    if (password.length < 10) return 'strength-fair';
    if (password.length < 12) return 'strength-good';
    return 'strength-strong';
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h1 className="auth-title">Titanium Manager</h1>
          <p className="auth-subtitle">
            {isCreatingVault ? 'Create a new secure vault' : 'Enter your master password to unlock'}
          </p>
        </div>
        
        {error && (
          <div className="error-message" style={{ 
            color: 'var(--danger-color)', 
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.375rem',
            border: '1px solid var(--danger-color)'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="master-password" className="form-label">
              Master Password
            </label>
            <input
              type="password"
              id="master-password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            
            {isCreatingVault && password && (
              <div className="password-strength">
                <div className={`password-strength-meter ${getPasswordStrength()}`}></div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {isCreatingVault ? 'Create Vault' : 'Unlock'}
            </button>
          </div>
        </form>
        
        <div className="auth-divider" style={{ 
          textAlign: 'center', 
          margin: '1rem 0', 
          position: 'relative',
          borderTop: '1px solid var(--border-color)'
        }}>
          <span style={{ 
            position: 'relative', 
            top: '-10px', 
            background: 'var(--surface-color)', 
            padding: '0 10px' 
          }}>
            OR
          </span>
        </div>
        
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginBottom: '1rem', position: 'relative' }}
          onClick={handleHardwareKeyAuth}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <>
              <div className="loading-spinner" style={{ 
                width: '20px', 
                height: '20px',
                borderWidth: '2px',
                position: 'absolute',
                left: '20px'
              }}></div>
              Authenticating...
            </>
          ) : 'Authenticate with Hardware Key'}
        </button>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '1rem' 
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsCreatingVault(!isCreatingVault)}
            style={{ marginBottom: '1rem' }}
          >
            {isCreatingVault ? 'Back to Login' : 'Create New Vault'}
          </button>
          
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
            <span className="toggle-label">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className="dark-mode-toggle" onClick={toggleDarkMode}>
              <div className="toggle-handle">
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;