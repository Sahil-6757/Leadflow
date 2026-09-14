import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CheckSquare,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Crown,
  MoreVertical,
  LogIn,
  LogOut
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onUpgradeClick,
  user = null,
  onOpenLogin,
  onLogout,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'follow-ups', label: 'Follow-ups', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-wrap">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="leadflow-grad1" x1="2" y1="4" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="45%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <path
              d="M12 6C7.58172 6 4 9.58172 4 14V22C4 28.6274 9.37258 34 16 34H26C30.4183 34 34 30.4183 34 26C34 22.5 31.5 19.8 28 19.2V19C28 15.5 25.5 12.5 22 12.1H18C15.7909 12.1 14 10.3091 14 8.1V6H12Z"
              fill="url(#leadflow-grad1)"
            />
            <path
              d="M12 7C9.23858 7 7 9.23858 7 12V24C7 28.4183 10.5817 32 15 32H25C27.7614 32 30 29.7614 30 27C30 24.2386 27.7614 22 25 22H18C14.6863 22 12 19.3137 12 16V7Z"
              fill="white"
              fillOpacity="0.28"
            />
            <circle cx="27" cy="11" r="3.5" fill="#38bdf8" />
          </svg>
        </div>
        <div>
          <div className="brand-title">LeadFlow</div>
          <div className="brand-tagline">Find. Reach. Grow.</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upgrade to Pro Card */}
      <div className="upgrade-card">
        <div className="upgrade-icon-wrap">
          <Crown size={17} />
        </div>
        <div className="upgrade-title">Upgrade to Pro</div>
        <div className="upgrade-desc">
          Get AI message generation, advanced analytics and more.
        </div>
        <button className="upgrade-btn" onClick={onUpgradeClick}>
          Upgrade Now
        </button>
      </div>

      {/* User Profile / Auth Action */}
      {user ? (
        <div style={{ position: 'relative' }}>
          <div
            className="sidebar-user"
            onClick={() => setShowMenu((prev) => !prev)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="user-badge-avatar"
              style={{
                width: '36px',
                height: '36px',
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              {user.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
            <button
              className="sidebar-user-dots"
              title="User Options"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* User Popover Menu */}
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '12px',
                right: '12px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
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
        <div style={{ padding: '0 16px 16px' }}>
          <button
            type="button"
            className="primary-add-btn"
            onClick={onOpenLogin}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 600,
              gap: '6px',
            }}
          >
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}
    </aside>
  );
}
