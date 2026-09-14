import React, { useState, useEffect, useMemo } from 'react';
import './MessagesPage.css';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Plus,
  Search,
  Trash2,
  Edit3,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  BookOpen,
  History,
} from 'lucide-react';
import { aiAPI } from '../services/api';
import CreateTemplateModal from './CreateTemplateModal';
import { TEMPLATES } from '../data/mockData';

export default function MessagesPage({
  leads = [],
  templates = [],
  user = null,
  onSaveTemplate,
  onDeleteTemplate,
  onSendOutreach,
  onShowToast,
  initialLead = null,
}) {
  const [activeSubTab, setActiveSubTab] = useState('composer'); // 'composer' | 'library' | 'history'

  // Composer State
  const [selectedLeadId, setSelectedLeadId] = useState(() => {
    if (initialLead) return initialLead.id || initialLead._id;
    return leads.length > 0 ? leads[0].id || leads[0]._id : '';
  });

  const [goal, setGoal] = useState('Website Redesign Pitch');
  const [tone, setTone] = useState('Professional & Friendly');
  const [customHighlight, setCustomHighlight] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Template Library State
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // History State
  const [outreachHistory, setOutreachHistory] = useState([
    {
      id: 1,
      leadName: 'Dr. Mahale Dental Clinic',
      channel: 'WhatsApp',
      time: '2 hours ago',
      excerpt: 'Hi Dr. Mahale, I came across your clinic website and prepared a quick mobile demo...',
    },
    {
      id: 2,
      leadName: 'ABC Software Solutions',
      channel: 'Email',
      time: '6 hours ago',
      excerpt: 'Growth & Website Opportunities for ABC Software Solutions...',
    },
    {
      id: 3,
      leadName: 'Tasty Bites Restaurant',
      channel: 'WhatsApp',
      time: '1 day ago',
      excerpt: 'Hi Amit, following up on your digital menu and website reservations...',
    },
  ]);

  // Selected Lead Object
  const currentLead = useMemo(() => {
    return leads.find((l) => (l.id === selectedLeadId || l._id === selectedLeadId)) || leads[0] || null;
  }, [leads, selectedLeadId]);

  // Normalized Templates
  const allTemplates = useMemo(() => {
    const list = [];
    if (templates && Array.isArray(templates) && templates.length > 0) {
      templates.forEach((t) => {
        list.push({
          id: t.id || t._id,
          title: t.title,
          category: t.category || 'Outreach',
          content: t.content,
          isDefault: t.isDefault,
        });
      });
    }

    // Merge mock data templates if not duplicated
    Object.entries(TEMPLATES).forEach(([title, content], idx) => {
      if (!list.some((item) => item.title === title)) {
        list.push({
          id: `mock-${idx}`,
          title,
          category: title.includes('Follow-up') ? 'Follow-up' : 'Initial Outreach',
          content,
          isDefault: idx === 0,
        });
      }
    });

    return list;
  }, [templates]);

  // Auto-generate initial pitch on mount if empty
  useEffect(() => {
    if (!messageText && currentLead) {
      generatePitch(currentLead);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLead]);

  // AI Generator Function
  const generatePitch = async (targetLead = currentLead) => {
    if (!targetLead) return;
    setIsGenerating(true);

    const leadName = targetLead.businessName || 'Business';
    const contactPerson = targetLead.contactPerson || '';
    const senderName = user?.name ? user.name.split(' ')[0] : 'Sahil';

    try {
      const res = await aiAPI.generateMessage({
        leadName,
        contactPerson,
        goal,
        tone,
      });

      if (res.data && res.data.message) {
        let text = res.data.message;
        if (customHighlight.trim()) {
          text = text.replace(
            `Best regards,\n${senderName}`,
            `Specifically, I noticed: ${customHighlight.trim()}.\n\nBest regards,\n${senderName}`
          );
        }
        setMessageText(text);
      }
    } catch (err) {
      // Fallback generator
      const greeting = contactPerson ? `Hi ${contactPerson}` : `Hi ${leadName} team`;
      let fallbackBody = '';

      if (goal === 'Website Redesign Pitch') {
        fallbackBody = `${greeting},\n\nI was reviewing ${leadName}'s online presence and identified 3 high-impact opportunities to speed up page loading and turn more visitors into direct inquiries.\n\nI built a quick preview mockup showing how customers can book services seamlessly with zero friction. Would you like me to send you the link?\n\nBest regards,\n${senderName}`;
      } else if (goal === 'SEO & Local Ranking Improvement') {
        fallbackBody = `${greeting},\n\nI noticed ${leadName} has great reviews, but competitors are currently outranking you on high-intent local search queries.\n\nWith a few targeted schema and local SEO adjustments, we can help ${leadName} capture the top map positions.\n\nWould you like a free 1-page local SEO audit?\n\nBest regards,\n${senderName}`;
      } else if (goal === 'Quick Demo Offer') {
        fallbackBody = `${greeting},\n\nI prepared a quick interactive demo showing how a modern refresh and instant WhatsApp booking button can increase appointment conversions by 25-35% for ${leadName}.\n\nAre you open to a brief 5-minute overview this week?\n\nBest regards,\n${senderName}`;
      } else {
        fallbackBody = `${greeting},\n\nHope you're having a productive week! Following up briefly on my previous note regarding ${leadName}'s website.\n\nI put together a short video breakdown showing conversion improvements for your landing page. Would you like me to share it?\n\nBest regards,\n${senderName}`;
      }

      if (customHighlight.trim()) {
        fallbackBody = fallbackBody.replace(
          `Best regards,\n${senderName}`,
          `P.S. I specifically noted: ${customHighlight.trim()}.\n\nBest regards,\n${senderName}`
        );
      }

      setMessageText(fallbackBody);
    } finally {
      setIsGenerating(false);
    }
  };

  // Replace variable placeholders with current lead's info
  const resolvedMessage = useMemo(() => {
    if (!currentLead) return messageText;
    const sender = user?.name ? user.name.split(' ')[0] : 'Sahil';
    return messageText
      .replace(/{{name}}/g, currentLead.contactPerson || currentLead.businessName || 'there')
      .replace(/{{businessName}}/g, currentLead.businessName || 'your company')
      .replace(/{{location}}/g, currentLead.location || 'your area')
      .replace(/{{senderName}}/g, sender);
  }, [messageText, currentLead, user]);

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedMessage);
    setCopied(true);
    onShowToast && onShowToast('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Dispatch via WhatsApp
  const handleSendWhatsApp = () => {
    if (!currentLead) return;
    const phone = currentLead.phone ? currentLead.phone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(resolvedMessage);
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');

    // Record history
    const record = {
      id: Date.now(),
      leadName: currentLead.businessName,
      channel: 'WhatsApp',
      time: 'Just now',
      excerpt: resolvedMessage.slice(0, 80) + '...',
    };
    setOutreachHistory((prev) => [record, ...prev]);

    if (onSendOutreach) {
      onSendOutreach('WhatsApp', currentLead, resolvedMessage);
    }
    onShowToast && onShowToast(`Outreach sent to ${currentLead.businessName} via WhatsApp!`);
  };

  // Dispatch via Email
  const handleSendEmail = () => {
    if (!currentLead) return;
    const subject = encodeURIComponent(`Growth & Website Opportunities for ${currentLead.businessName}`);
    const body = encodeURIComponent(resolvedMessage);
    window.location.href = `mailto:${currentLead.email || ''}?subject=${subject}&body=${body}`;

    const record = {
      id: Date.now(),
      leadName: currentLead.businessName,
      channel: 'Email',
      time: 'Just now',
      excerpt: resolvedMessage.slice(0, 80) + '...',
    };
    setOutreachHistory((prev) => [record, ...prev]);

    if (onSendOutreach) {
      onSendOutreach('Email', currentLead, resolvedMessage);
    }
    onShowToast && onShowToast(`Email drafted for ${currentLead.businessName}!`);
  };

  // Load template into composer
  const handleLoadTemplateIntoComposer = (templateContent) => {
    setMessageText(templateContent);
    setActiveSubTab('composer');
    onShowToast && onShowToast('Template loaded into AI Pitch Studio!');
  };

  // Save Template Handler
  const handleSaveTemplateSubmit = async (templateData) => {
    if (onSaveTemplate) {
      await onSaveTemplate(templateData);
    }
    onShowToast && onShowToast('Template saved to library!');
  };

  // Filtered Templates for Library
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }
      if (templateSearch.trim()) {
        const q = templateSearch.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTemplates, selectedCategory, templateSearch]);

  // Reading stats
  const charCount = resolvedMessage.length;
  const wordCount = resolvedMessage.trim() ? resolvedMessage.trim().split(/\s+/).length : 0;
  const estReadTime = Math.max(1, Math.round((wordCount / 200) * 60));

  return (
    <div className="messages-page">
      {/* Top Header Card */}
      <div className="messages-header-section">
        <div className="messages-title-row">
          <div className="messages-title-area">
            <h1>
              <span>Outreach & Message Hub</span>
              <span className="messages-badge">
                <Sparkles size={13} />
                <span>AI-Powered</span>
              </span>
            </h1>
            <p>Generate hyper-personalized pitches, manage battle-tested outreach templates, and dispatch direct WhatsApp and Email proposals.</p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="messages-nav-tabs">
            <button
              type="button"
              className={`messages-nav-tab ${activeSubTab === 'composer' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('composer')}
            >
              <Sparkles size={15} />
              <span>AI Pitch Studio</span>
            </button>
            <button
              type="button"
              className={`messages-nav-tab ${activeSubTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('library')}
            >
              <BookOpen size={15} />
              <span>Template Library</span>
            </button>
            <button
              type="button"
              className={`messages-nav-tab ${activeSubTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('history')}
            >
              <History size={15} />
              <span>Sent History</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="messages-kpi-bar">
        <div className="messages-kpi-card">
          <div className="messages-kpi-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Sparkles size={20} />
          </div>
          <div className="messages-kpi-info">
            <span className="messages-kpi-value">{allTemplates.length}</span>
            <span className="messages-kpi-label">Active Templates</span>
          </div>
        </div>

        <div className="messages-kpi-card">
          <div className="messages-kpi-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <MessageSquare size={20} />
          </div>
          <div className="messages-kpi-info">
            <span className="messages-kpi-value">{outreachHistory.length}</span>
            <span className="messages-kpi-label">Dispatches Tracked</span>
          </div>
        </div>

        <div className="messages-kpi-card">
          <div className="messages-kpi-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div className="messages-kpi-info">
            <span className="messages-kpi-value">34%</span>
            <span className="messages-kpi-label">Avg. Response Rate</span>
          </div>
        </div>

        <div className="messages-kpi-card">
          <div className="messages-kpi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="messages-kpi-info">
            <span className="messages-kpi-value">{leads.length}</span>
            <span className="messages-kpi-label">Available Leads</span>
          </div>
        </div>
      </div>

      {/* TAB 1: AI PITCH STUDIO */}
      {activeSubTab === 'composer' && (
        <div className="studio-grid">
          {/* Left Panel: Configuration & Lead Selector */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title">
                <Sparkles size={16} color="var(--purple-accent)" />
                <span>Pitch Parameters</span>
              </div>
            </div>

            <div className="studio-card-body">
              {/* Target Lead Selector */}
              <div className="form-group">
                <label className="form-label">Select Target Lead *</label>
                <select
                  className="form-input"
                  value={selectedLeadId}
                  onChange={(e) => {
                    setSelectedLeadId(e.target.value);
                    const chosen = leads.find((l) => (l.id === e.target.value || l._id === e.target.value));
                    if (chosen) generatePitch(chosen);
                  }}
                >
                  {leads.map((lead) => (
                    <option key={lead.id || lead._id} value={lead.id || lead._id}>
                      {lead.businessName} ({lead.type} - {lead.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Details Chip */}
              {currentLead && (
                <div className="lead-select-badge-row">
                  <div
                    className="lead-select-avatar"
                    style={{ backgroundColor: currentLead.avatarBg || '#2563eb' }}
                  >
                    {currentLead.avatarText || currentLead.businessName?.charAt(0) || 'L'}
                  </div>
                  <div className="lead-select-details">
                    <div className="lead-select-name">{currentLead.businessName}</div>
                    <div className="lead-select-sub">
                      {currentLead.contactPerson ? `${currentLead.contactPerson} • ` : ''}
                      {currentLead.phone || currentLead.email || currentLead.location}
                    </div>
                  </div>
                </div>
              )}

              {/* Outreach Goal */}
              <div className="form-group">
                <label className="form-label">Outreach Goal</label>
                <select
                  className="form-input"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option value="Website Redesign Pitch">Website Redesign & Conversion Pitch</option>
                  <option value="SEO & Local Ranking Improvement">SEO & Local Google Maps Ranking</option>
                  <option value="Quick Demo Offer">Free Interactive Demo Mockup</option>
                  <option value="Follow-up after no response">Follow-up #1 (Gentle Check-in)</option>
                  <option value="Speed & Conversion Audit">Speed & Mobile Audit Findings</option>
                </select>
              </div>

              {/* Tone */}
              <div className="form-group">
                <label className="form-label">Communication Tone</label>
                <select
                  className="form-input"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Professional & Friendly">Professional & Friendly</option>
                  <option value="Direct & Value-Focused">Direct & Value-Focused (Executive)</option>
                  <option value="Casual & Conversational">Casual & Conversational</option>
                  <option value="Urgency & Growth-Oriented">Urgency & Growth-Oriented</option>
                </select>
              </div>

              {/* Custom Value Observation */}
              <div className="form-group">
                <label className="form-label">Custom Observation (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile page takes 4.2s to load; booking button missing"
                  value={customHighlight}
                  onChange={(e) => setCustomHighlight(e.target.value)}
                />
              </div>

              {/* Generate CTA */}
              <button
                type="button"
                className="composer-generate-btn"
                onClick={() => generatePitch(currentLead)}
                disabled={isGenerating}
              >
                <Sparkles size={16} />
                <span>{isGenerating ? 'Drafting Custom Pitch...' : 'Generate AI Pitch'}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Editor & Dispatch */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title">
                <MessageSquare size={16} color="var(--primary-blue)" />
                <span>Live Outreach Editor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="card-link-btn"
                  onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="studio-card-body">
              {/* Variable Chips */}
              <div className="variable-chips-row">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick Variables:</span>
                <button
                  type="button"
                  className="var-chip"
                  onClick={() => setMessageText((prev) => prev + ' {{name}}')}
                >
                  {'{{name}}'}
                </button>
                <button
                  type="button"
                  className="var-chip"
                  onClick={() => setMessageText((prev) => prev + ' {{businessName}}')}
                >
                  {'{{businessName}}'}
                </button>
                <button
                  type="button"
                  className="var-chip"
                  onClick={() => setMessageText((prev) => prev + ' {{senderName}}')}
                >
                  {'{{senderName}}'}
                </button>
              </div>

              {/* Textarea */}
              <div className="pitch-output-wrap">
                <textarea
                  className="pitch-textarea"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Your generated message will appear here..."
                />
                <div className="pitch-meta-bar">
                  <span>{charCount} characters • {wordCount} words</span>
                  <span>~{estReadTime} sec read</span>
                </div>
              </div>

              {/* Direct Outreach Dispatch Grid */}
              <div style={{ marginTop: '8px' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>
                  Direct Outreach Channels
                </label>
                <div className="dispatch-actions-grid">
                  <button
                    type="button"
                    className="dispatch-btn whatsapp"
                    onClick={handleSendWhatsApp}
                  >
                    <Phone size={15} />
                    <span>Send via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    className="dispatch-btn email"
                    onClick={handleSendEmail}
                  >
                    <Mail size={15} />
                    <span>Send via Email</span>
                  </button>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    className="dispatch-btn secondary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setEditingTemplate({
                        title: `${currentLead?.businessName || 'Lead'} Outreach`,
                        category: 'Custom Pitch',
                        content: messageText,
                      });
                      setIsTemplateModalOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>Save as Reusable Template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATE LIBRARY */}
      {activeSubTab === 'library' && (
        <div>
          {/* Controls Bar */}
          <div className="templates-library-controls">
            {/* Search & Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="leads-search-box" style={{ width: '280px' }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                />
              </div>

              <select
                className="leads-filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Initial Outreach">Initial Outreach</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Quick Demo Offer">Quick Demo Offer</option>
                <option value="SEO & Audits">SEO & Audits</option>
                <option value="Custom Pitch">Custom Pitch</option>
              </select>
            </div>

            {/* Create CTA */}
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <Plus size={16} />
              <span>Create New Template</span>
            </button>
          </div>

          {/* Templates Grid */}
          <div className="templates-grid">
            {filteredTemplates.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  No templates found
                </div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  Try changing category filter or create a new template.
                </div>
              </div>
            ) : (
              filteredTemplates.map((item) => (
                <div key={item.id} className="template-card-modern">
                  <div>
                    <div className="template-card-top">
                      <div className="template-card-title">{item.title}</div>
                      <span className="template-category-badge">{item.category}</span>
                    </div>

                    <div className="template-preview-box">
                      {item.content}
                    </div>
                  </div>

                  <div className="template-card-footer">
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: '11.5px', padding: '6px 12px', gap: '5px' }}
                      onClick={() => handleLoadTemplateIntoComposer(item.content)}
                    >
                      <Sparkles size={12} />
                      <span>Use in Studio</span>
                    </button>

                    <div className="template-footer-actions">
                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Copy Template"
                        onClick={() => {
                          navigator.clipboard.writeText(item.content);
                          onShowToast && onShowToast('Template copied!');
                        }}
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Edit Template"
                        onClick={() => {
                          setEditingTemplate(item);
                          setIsTemplateModalOpen(true);
                        }}
                      >
                        <Edit3 size={13} />
                      </button>

                      {onDeleteTemplate && !String(item.id).startsWith('mock-') && (
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Delete Template"
                          style={{ color: '#ef4444' }}
                          onClick={() => onDeleteTemplate(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OUTREACH HISTORY */}
      {activeSubTab === 'history' && (
        <div className="history-card">
          <div className="studio-card-header">
            <div className="studio-card-title">
              <History size={16} color="var(--primary-blue)" />
              <span>Recent Dispatches & Communication Log</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {outreachHistory.length} events recorded
            </span>
          </div>

          <div className="history-list">
            {outreachHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-left">
                  <div
                    className="history-item-icon"
                    style={{
                      backgroundColor: item.channel === 'WhatsApp' ? 'rgba(37, 211, 102, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                      color: item.channel === 'WhatsApp' ? '#16a34a' : '#2563eb',
                    }}
                  >
                    {item.channel === 'WhatsApp' ? <Phone size={18} /> : <Mail size={18} />}
                  </div>
                  <div className="history-item-content">
                    <div className="history-item-title">
                      {item.leadName}
                    </div>
                    <div className="history-item-sub">
                      Sent via {item.channel}: "{item.excerpt}"
                    </div>
                  </div>
                </div>

                <div className="history-item-time">
                  <Clock size={12} />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Template Modal */}
      <CreateTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplateSubmit}
        template={editingTemplate}
      />
    </div>
  );
}
