import React, { useState, useEffect } from 'react';

// Define the VaultEntry type locally instead of importing from crypto/vault
interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

interface DashboardProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, isDarkMode, toggleDarkMode }) => {
  const [passwords, setPasswords] = useState<VaultEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Load the decrypted vault on component mount
  // This would be connected to the actual vault in a real implementation
  useEffect(() => {
    // Mock data for now
    const demoPasswords: VaultEntry[] = [
      {
        id: '1',
        title: 'Gmail',
        username: 'user@example.com',
        password: 'strongpassword123',
        url: 'https://mail.google.com',
        category: 'Email',
        tags: ['work', 'personal'],
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      },
      {
        id: '2',
        title: 'GitHub',
        username: 'developer',
        password: 'verySecureGitHubPass!123',
        url: 'https://github.com',
        category: 'Development',
        tags: ['work', 'coding'],
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      },
      {
        id: '3',
        title: 'AWS Console',
        username: 'admin@company.com',
        password: 'awsAdminPasswordComplex!',
        url: 'https://aws.amazon.com/console',
        category: 'Cloud Services',
        tags: ['work', 'infrastructure'],
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      }
    ];
    
    setPasswords(demoPasswords);
  }, []);
  
  // Filter passwords based on search query
  const filteredPasswords = passwords.filter(entry => {
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.username.toLowerCase().includes(query) ||
      entry.url.toLowerCase().includes(query) ||
      (entry.category && entry.category.toLowerCase().includes(query)) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });
  
  // Handle password item selection
  const handleSelectEntry = (entry: VaultEntry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setShowPassword(false);
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Create a new password entry
  const handleCreateNew = () => {
    const newEntry: VaultEntry = {
      id: `entry-${Date.now()}`,
      title: 'New Entry',
      username: '',
      password: '',
      url: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setPasswords([...passwords, newEntry]);
    setSelectedEntry(newEntry);
    setIsEditing(true);
  };
  
  // Clean up sensitive data when component unmounts
  useEffect(() => {
    return () => {
      setPasswords([]);
      setSelectedEntry(null);
    };
  }, []);
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">Titanium Manager</div>
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
            <span className="toggle-label">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className="dark-mode-toggle" onClick={toggleDarkMode}>
              <div className="toggle-handle">
                {isDarkMode ? '🌙' : '☀️'}
              </div>
            </div>
          </div>
          <button className="btn btn-danger" onClick={onLogout}>
            Lock Vault
          </button>
        </div>
      </header>
      
      <main className="app-content">
        <aside className="sidebar">
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>
          
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            onClick={handleCreateNew}
          >
            Add New Password
          </button>
          
          <div className="password-list">
            {filteredPasswords.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
                {searchQuery ? 'No matching passwords found' : 'No passwords saved yet'}
              </div>
            ) : (
              filteredPasswords.map(entry => (
                <div
                  key={entry.id}
                  className={`password-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                  onClick={() => handleSelectEntry(entry)}
                >
                  <div style={{ fontWeight: 'bold' }}>{entry.title}</div>
                  <div className="item-username">{entry.username}</div>
                </div>
              ))
            )}
          </div>
        </aside>
        
        <div className="main-content">
          {selectedEntry ? (
            <div className="password-details card">
              {isEditing ? (
                // Edit mode
                <div className="edit-form">
                  <h2>Edit Password</h2>
                  <form>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedEntry.title}
                        onChange={(e) => setSelectedEntry({ ...selectedEntry, title: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedEntry.username}
                        onChange={(e) => setSelectedEntry({ ...selectedEntry, username: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div style={{ display: 'flex' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-input"
                          value={selectedEntry.password}
                          onChange={(e) => setSelectedEntry({ ...selectedEntry, password: e.target.value })}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ marginLeft: '0.5rem' }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">URL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedEntry.url}
                        onChange={(e) => setSelectedEntry({ ...selectedEntry, url: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedEntry.category || ''}
                        onChange={(e) => setSelectedEntry({ ...selectedEntry, category: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          // In a real app we'd save to the encrypted vault here
                          const updatedEntry = { ...selectedEntry, updatedAt: Date.now() };
                          const updatedPasswords = passwords.map(p => 
                            p.id === updatedEntry.id ? updatedEntry : p
                          );
                          setPasswords(updatedPasswords);
                          setSelectedEntry(updatedEntry);
                          setIsEditing(false);
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // View mode
                <div className="view-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>{selectedEntry.title}</h2>
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          // In a real app we'd update the encrypted vault here
                          setPasswords(passwords.filter(p => p.id !== selectedEntry.id));
                          setSelectedEntry(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="detail-item" style={{ marginBottom: '1rem' }}>
                    <div className="detail-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Username</div>
                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center' }}>
                      <span>{selectedEntry.username}</span>
                      <button
                        className="btn btn-secondary copy-btn"
                        onClick={(event) => {
                          navigator.clipboard.writeText(selectedEntry.username);
                          // Add copied class to animate
                          const btn = event?.currentTarget;
                          if (btn) {
                            btn.classList.add('copied');
                            setTimeout(() => btn.classList.remove('copied'), 1000);
                          }
                        }}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="detail-item" style={{ marginBottom: '1rem' }}>
                    <div className="detail-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Password</div>
                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center' }}>
                      <span>{showPassword ? selectedEntry.password : '••••••••••'}</span>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="btn btn-secondary copy-btn"
                        onClick={(event) => {
                          navigator.clipboard.writeText(selectedEntry.password);
                          // Add copied class to animate
                          const btn = event?.currentTarget;
                          if (btn) {
                            btn.classList.add('copied');
                            setTimeout(() => btn.classList.remove('copied'), 1000);
                          }
                        }}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {selectedEntry.url && (
                    <div className="detail-item" style={{ marginBottom: '1rem' }}>
                      <div className="detail-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>URL</div>
                      <div className="detail-value">
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          // In a real app, we would use the Electron shell to open the URL
                          // shell.openExternal(selectedEntry.url);
                        }}>
                          {selectedEntry.url}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.category && (
                    <div className="detail-item" style={{ marginBottom: '1rem' }}>
                      <div className="detail-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Category</div>
                      <div className="detail-value">{selectedEntry.category}</div>
                    </div>
                  )}
                  
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="detail-item" style={{ marginBottom: '1rem' }}>
                      <div className="detail-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Tags</div>
                      <div className="detail-value">
                        {selectedEntry.tags.map(tag => (
                          <span
                            key={tag}
                            className="tag"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="detail-item" style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div>Created: {formatDate(selectedEntry.createdAt)}</div>
                    <div>Last Modified: {formatDate(selectedEntry.updatedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <h2>No Password Selected</h2>
              <p>Select a password from the list or create a new one.</p>
              <button
                className="btn btn-primary"
                onClick={handleCreateNew}
                style={{ marginTop: '1rem' }}
              >
                Create New Password
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 