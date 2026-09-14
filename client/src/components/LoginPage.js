import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Briefcase,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage({
  onLogin,
  onRegister,
  theme,
  toggleTheme,
}) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    workspaceName: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  // 1-Click Demo Login as Sahil Khan
  const handleQuickDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await onLogin({
        email: 'sahil@leadflow.io',
        password: 'password123',
      });
    } catch (err) {
      setError(err.message || 'Demo login failed. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        if (!formData.email || !formData.password) {
          throw new Error('Please enter both email and password.');
        }
        await onLogin({
          email: formData.email.trim(),
          password: formData.password,
        });
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Please provide name, email, and password.');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await onRegister({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          workspaceName: formData.workspaceName.trim(),
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Background Decorative Gradient Orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Top Floating Theme Switcher */}
      <div className="login-top-bar">
        <button
          className="header-action-btn theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Central Login Container */}
      <div className="login-container">
        {/* Left Hero Showcase Banner (Desktop) */}
        <div className="login-hero-panel">
          <div className="hero-brand">
            <div className="brand-logo-wrap" style={{ width: '42px', height: '42px' }}>
              <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lf-login-grad" x1="2" y1="4" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="45%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 6C7.58172 6 4 9.58172 4 14V22C4 28.6274 9.37258 34 16 34H26C30.4183 34 34 30.4183 34 26C34 22.5 31.5 19.8 28 19.2V19C28 15.5 25.5 12.5 22 12.1H18C15.7909 12.1 14 10.3091 14 8.1V6H12Z"
                  fill="url(#lf-login-grad)"
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
              <div className="hero-brand-title">LeadFlow CRM</div>
              <div className="hero-brand-subtitle">High-Velocity Lead Engine</div>
            </div>
          </div>

          <div className="hero-main-copy">
            <h1 className="hero-heading">
              Turn cold leads into <span className="hero-gradient-text">loyal clients</span> in record time.
            </h1>
            <p className="hero-subtext">
              Track multi-channel outreach, manage follow-up pipelines, and leverage intelligent AI templates to close deals faster.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="hero-feature-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                <Zap size={18} />
              </div>
              <div>
                <div className="hero-feature-title">AI Message Generation</div>
                <div className="hero-feature-desc">Generate hyper-personalized pitches for Dental, IT & Local clinics.</div>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="hero-feature-title">Pipeline Tracking & KPIs</div>
                <div className="hero-feature-desc">Monitor Contacted, Replied, Interested & Won leads in real time.</div>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a855f7' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="hero-feature-title">Secure JWT Authentication</div>
                <div className="hero-feature-desc">Role-based permissions with isolated team workspaces and MongoDB storage.</div>
              </div>
            </div>
          </div>

          {/* Social Proof Badge */}
          <div className="hero-social-proof">
            <div className="hero-avatars">
              <div className="mini-avatar" style={{ background: '#3b82f6' }}>SK</div>
              <div className="mini-avatar" style={{ background: '#10b981' }}>DR</div>
              <div className="mini-avatar" style={{ background: '#f59e0b' }}>AJ</div>
            </div>
            <div className="hero-proof-text">
              <span className="stars">★★★★★</span>
              <span>Trusted by 2,400+ freelancers & growth teams</span>
            </div>
          </div>
        </div>

        {/* Right Auth Card Form */}
        <div className="login-form-panel">
          <div className="auth-form-card">
            {/* Mobile Brand Header (Visible on small screens) */}
            <div className="auth-mobile-brand">
              <div className="brand-logo-wrap" style={{ width: '36px', height: '36px' }}>
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M12 6C7.58172 6 4 9.58172 4 14V22C4 28.6274 9.37258 34 16 34H26C30.4183 34 34 30.4183 34 26C34 22.5 31.5 19.8 28 19.2V19C28 15.5 25.5 12.5 22 12.1H18C15.7909 12.1 14 10.3091 14 8.1V6H12Z"
                    fill="#2563eb"
                  />
                  <circle cx="27" cy="11" r="3.5" fill="#38bdf8" />
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px' }}>LeadFlow</span>
            </div>

            {/* Auth Title & Tabs */}
            <div className="auth-card-header">
              <h2 className="auth-card-title">
                {isLoginMode ? 'Sign In to LeadFlow' : 'Create an Account'}
              </h2>
              <p className="auth-card-subtitle">
                {isLoginMode
                  ? 'Enter your credentials to access your CRM pipeline.'
                  : 'Start tracking leads and managing your outreach.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${isLoginMode ? 'active' : ''}`}
                onClick={() => {
                  setIsLoginMode(true);
                  setError('');
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${!isLoginMode ? 'active' : ''}`}
                onClick={() => {
                  setIsLoginMode(false);
                  setError('');
                }}
              >
                <UserPlus size={15} />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Quick 1-Click Demo Login Banner */}
            <div className="quick-demo-container">
              <button
                type="button"
                className="quick-demo-btn"
                onClick={handleQuickDemoLogin}
                disabled={loading}
              >
                <div className="quick-demo-icon">
                  <Sparkles size={15} />
                </div>
                <div className="quick-demo-text">
                  <span className="quick-demo-label">1-Click Quick Demo Login</span>
                  <span className="quick-demo-sub">Sahil Khan (Admin) • password123</span>
                </div>
                <ArrowRight size={16} className="quick-demo-arrow" />
              </button>
            </div>

            <div className="auth-divider">
              <span>or enter credentials</span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="auth-error-alert">
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form-fields">
              {!isLoginMode && (
                <div className="auth-input-group">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrapper">
                    <UserIcon size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Sahil Khan"
                      value={formData.name}
                      onChange={handleChange}
                      className="auth-input"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  {isLoginMode && (
                    <span
                      className="auth-forgot-link"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          email: 'sahil@leadflow.io',
                          password: 'password123',
                        }));
                        setError('Credentials filled with demo account.');
                      }}
                    >
                      Fill Demo?
                    </span>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!isLoginMode && (
                <div className="auth-input-group">
                  <label className="auth-label">Workspace Name (Optional)</label>
                  <div className="auth-input-wrapper">
                    <Briefcase size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      name="workspaceName"
                      placeholder="e.g. Sahil's Leads"
                      value={formData.workspaceName}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-loading-spinner">Authenticating...</span>
                ) : isLoginMode ? (
                  <>
                    <LogIn size={17} />
                    <span>Sign In to Dashboard</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    <span>Create Workspace & Enter</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Mode Switch Footer */}
            <div className="auth-switch-footer">
              {isLoginMode ? (
                <span>
                  Don't have a LeadFlow account?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setIsLoginMode(false);
                      setError('');
                    }}
                  >
                    Create one now
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setIsLoginMode(true);
                      setError('');
                    }}
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>

            {/* Security Badge Note */}
            <div className="auth-security-note">
              <CheckCircle2 size={13} color="#10b981" />
              <span>256-bit SSL encrypted • JWT Secured Authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
