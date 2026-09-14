import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, X, Sparkles, Filter, LogIn, LogOut, ChevronDown } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  theme,
  toggleTheme,
  onNotifClick,
  leads = [],
  user = null,
  onOpenLogin,
  onLogout,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        setIsProfileOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterChips = ['All', 'Dental Clinic', 'IT Services', 'Restaurant', 'Fitness'];

  // Quick matches preview based on search term
  const previewMatches = leads.filter((l) => {
    if (!searchTerm.trim()) return false;
    const q = searchTerm.toLowerCase();
    return (
      l.businessName?.toLowerCase().includes(q) ||
      l.contactPerson?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.type?.toLowerCase().includes(q)
    );
  }).slice(0, 4);

  return (
    <header className="top-header">
      {/* Left: Workspace & Breadcrumb Info */}
      <div className="header-left">
        <div className="header-workspace-badge">
          <span className="workspace-pulse-dot" />
          <span className="workspace-name">{user?.workspace?.name || "Sahil's Leads"}</span>
          <span className="workspace-divider">/</span>
          <span className="workspace-section">Overview</span>
        </div>
      </div>

      {/* Center: Attractive Centered Search Bar */}
      <div className="header-center" ref={dropdownRef}>
        <div className={`search-attractive-box ${isFocused ? 'focused' : ''}`}>
          <div className="search-icon-wrapper">
            <Search size={16} className={`search-icon-main ${isFocused ? 'active' : ''}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            className="search-attractive-input"
            placeholder="Search leads, businesses, locations, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />

          {/* Quick Clear Button */}
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}

          {/* Keyboard Shortcut Badge */}
          <div className="search-shortcut-pill" title="Press Ctrl+K to search">
            <span className="shortcut-key">⌘</span>
            <span className="shortcut-key">K</span>
          </div>
        </div>

        {/* Live Search Quick Popover */}
        {isFocused && (
          <div className="search-dropdown-popover">
            {/* Filter Tags */}
            <div className="search-quick-tags">
              <span className="search-tags-label">
                <Filter size={11} />
                Quick filter:
              </span>
              {filterChips.map((chip) => (
                <button
                  key={chip}
                  className={`search-chip-btn ${searchTerm === (chip === 'All' ? '' : chip) ? 'active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchTerm(chip === 'All' ? '' : chip);
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Instant matching preview if user typed something */}
            {previewMatches.length > 0 && (
              <div className="search-matches-list">
                <div className="search-matches-header">Matching leads ({previewMatches.length})</div>
                {previewMatches.map((m) => (
                  <div
                    key={m.id}
                    className="search-match-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchTerm(m.businessName);
                      setIsFocused(false);
                    }}
                  >
                    <div className="search-match-avatar">
                      {m.avatarText || m.businessName.charAt(0)}
                    </div>
                    <div className="search-match-info">
                      <div className="search-match-title">{m.businessName}</div>
                      <div className="search-match-sub">{m.contactPerson} • {m.location}</div>
                    </div>
                    <span className="search-match-badge">{m.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Search Footer info */}
            <div className="search-dropdown-footer">
              <span>Press <kbd>ESC</kbd> to close</span>
              <span><Sparkles size={11} color="var(--primary-blue)" /> Instant Real-time Filter</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="header-right">
        {/* Notification Bell */}
        <button
          className="header-action-btn notif-btn"
          title="3 Unread Notifications"
          onClick={onNotifClick}
        >
          <Bell size={17} />
          <span className="header-notif-dot" />
        </button>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          className="header-action-btn theme-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* User Pill / Login Button */}
        {user ? (
          <div style={{ position: 'relative' }} ref={profileRef}>
            <div
              className="user-profile-badge"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Click to view profile & options"
            >
              <div className="user-avatar-wrap">
                <div className="user-badge-avatar">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U'}
                </div>
                <span className="user-online-status" />
              </div>
              <div className="user-text-wrap">
                <div className="user-badge-name">{user.name}</div>
                <div className="user-badge-role">{user.role || 'Member'}</div>
              </div>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--text-muted)',
                  marginLeft: '4px',
                  transform: isProfileOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  zIndex: 100,
                  animation: 'dropdownIn 0.15s ease-out',
                }}
              >
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        color: 'var(--primary-blue)',
                      }}
                    >
                      {user.role || 'user'}
                    </span>
                    {user.workspace?.name && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        • {user.workspace.name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout && onLogout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="primary-add-btn"
            onClick={onOpenLogin}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              gap: '6px',
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
