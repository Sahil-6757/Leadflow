import React, { useState, useMemo } from 'react';
import './FollowUpsPage.css';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Table as TableIcon,
  Columns3,
  MessageCircle,
  Mail,
  Sparkles,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import ScheduleFollowUpModal from './ScheduleFollowUpModal';
import { computeDueInfo } from '../utils/dateUtils';

export default function FollowUpsPage({
  followups = [],
  leads = [],
  onCreateFollowUp,
  onUpdateFollowUp,
  onToggleComplete,
  onDeleteFollowUp,
  onOpenAiModal,
  onShowToast,
  onSendOutreach,
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'board'
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all' | 'today' | 'tomorrow' | 'upcoming' | 'completed' | 'overdue'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [activeSnoozeMenuId, setActiveSnoozeMenuId] = useState(null);

  // Helper to match a follow-up item with its lead details
  const getMatchedLead = (item) => {
    if (item.leadId) {
      const id = typeof item.leadId === 'object' ? item.leadId._id || item.leadId.id : item.leadId;
      const found = leads.find((l) => String(l.id || l._id) === String(id));
      if (found) return found;
    }
    return leads.find(
      (l) => (l.businessName || '').trim().toLowerCase() === (item.title || '').trim().toLowerCase()
    );
  };

  // Dynamically enrich follow-ups with live due status based on real date
  const enrichedFollowups = useMemo(() => {
    return followups.map((item) => {
      const dueInfo = computeDueInfo(item.dueDate, item.completed);
      return {
        ...item,
        badge: dueInfo.badge,
        badgeType: dueInfo.badgeType,
        dotColor: dueInfo.dotColor,
        isOverdue: dueInfo.isOverdue,
        urgencyRank: dueInfo.urgencyRank,
      };
    });
  }, [followups]);

  // KPI Calculations from real data
  const kpiStats = useMemo(() => {
    const today = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'today').length;
    const tomorrow = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'tomorrow').length;
    const overdue = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'overdue').length;
    const upcoming = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'date').length;
    const completed = enrichedFollowups.filter((f) => f.completed).length;
    const total = enrichedFollowups.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { today, tomorrow, overdue, upcoming, completed, completionRate, total };
  }, [enrichedFollowups]);

  // Distinct business types from leads for category filter
  const businessTypes = useMemo(() => {
    const types = new Set(['All']);
    leads.forEach((l) => {
      if (l.type) types.add(l.type);
    });
    return Array.from(types);
  }, [leads]);

  // Filter & Search Logic
  const filteredFollowups = useMemo(() => {
    return enrichedFollowups.filter((item) => {
      // Filter tab
      if (activeFilterTab === 'today') {
        if (item.completed || item.badgeType !== 'today') return false;
      } else if (activeFilterTab === 'tomorrow') {
        if (item.completed || item.badgeType !== 'tomorrow') return false;
      } else if (activeFilterTab === 'upcoming') {
        if (item.completed || (item.badgeType !== 'date' && item.badgeType !== 'upcoming')) return false;
      } else if (activeFilterTab === 'completed') {
        if (!item.completed) return false;
      } else if (activeFilterTab === 'overdue') {
        if (item.completed || item.badgeType !== 'overdue') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchedLead = getMatchedLead(item);
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchSubtitle = (item.subtitle || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        const matchContact = matchedLead?.contactPerson?.toLowerCase().includes(q);
        const matchLocation = matchedLead?.location?.toLowerCase().includes(q);

        if (!matchTitle && !matchSubtitle && !matchNotes && !matchContact && !matchLocation) {
          return false;
        }
      }

      // Business Type Filter
      if (selectedType !== 'All') {
        const matchedLead = getMatchedLead(item);
        if (!matchedLead || matchedLead.type !== selectedType) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedFollowups, activeFilterTab, searchTerm, selectedType, leads]);

  // Grouped items for Board View
  const boardColumns = useMemo(() => {
    const overdueItems = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'overdue');
    const todayItems = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'today');
    const tomorrowItems = enrichedFollowups.filter((f) => !f.completed && f.badgeType === 'tomorrow');
    const upcomingItems = enrichedFollowups.filter(
      (f) => !f.completed && f.badgeType !== 'today' && f.badgeType !== 'tomorrow' && f.badgeType !== 'overdue'
    );
    const completedItems = enrichedFollowups.filter((f) => f.completed);

    const cols = [];
    if (overdueItems.length > 0) {
      cols.push({ id: 'overdue', title: 'Overdue Dues', dot: '#ef4444', items: overdueItems });
    }
    cols.push(
      { id: 'today', title: 'Due Today', dot: '#ef4444', items: todayItems },
      { id: 'tomorrow', title: 'Due Tomorrow', dot: '#f59e0b', items: tomorrowItems },
      { id: 'upcoming', title: 'Upcoming Later', dot: '#3b82f6', items: upcomingItems },
      { id: 'completed', title: 'Completed', dot: '#10b981', items: completedItems }
    );
    return cols;
  }, [enrichedFollowups]);

  // WhatsApp Outreach Handler
  const handleWhatsApp = (item) => {
    const matchedLead = getMatchedLead(item);
    const phone = matchedLead?.phone || '';
    const name = matchedLead?.contactPerson || item.title;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const defaultMsg = `Hi ${name}, this is regarding our follow-up for ${item.title}. I wanted to check in and see if you have any questions or if this week works for a quick chat!`;
    const targetPhone = cleanPhone || '919876543210';
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(defaultMsg)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (onSendOutreach && matchedLead) {
      onSendOutreach('WhatsApp', matchedLead, defaultMsg);
    }
    if (onShowToast) {
      onShowToast(`Opening WhatsApp follow-up for ${item.title} 💬`);
    }
  };

  // Email Outreach Handler
  const handleEmail = (item) => {
    const matchedLead = getMatchedLead(item);
    const email = matchedLead?.email || 'contact@example.com';
    const name = matchedLead?.contactPerson || item.title;

    const subject = `Following up: ${item.title} - LeadFlow`;
    const body = `Hi ${name},\n\nHope your week is going well. I'm following up on our previous conversation regarding ${item.subtitle || 'next steps'}.\n\nWould you have 10 minutes for a brief call this week?\n\nBest regards,\nSahil Khan`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    if (onSendOutreach && matchedLead) {
      onSendOutreach('Email', matchedLead, body);
    }
    if (onShowToast) {
      onShowToast(`Email client opened for ${item.title} ✉️`);
    }
  };

  // AI Message Draft Handler
  const handleAiDraft = (item) => {
    const matchedLead = getMatchedLead(item) || {
      businessName: item.title,
      type: 'General',
      id: item.id || item._id,
      notes: item.notes || item.subtitle,
    };
    if (onOpenAiModal) {
      onOpenAiModal(matchedLead);
    }
  };

  // Snooze / Reschedule Handler
  const handleSnooze = async (item, days) => {
    setActiveSnoozeMenuId(null);
    const currentDue = item.dueDate ? new Date(item.dueDate) : new Date();
    const newDate = new Date(currentDue);
    newDate.setDate(newDate.getDate() + days);

    let newBadgeType = 'date';
    let newBadge = newDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    let newDot = '#3b82f6';

    if (days === 1) {
      newBadgeType = 'tomorrow';
      newBadge = 'Tomorrow';
      newDot = '#f59e0b';
    }

    try {
      if (onUpdateFollowUp) {
        await onUpdateFollowUp(item.id || item._id, {
          dueDate: newDate,
          badgeType: newBadgeType,
          badge: newBadge,
          dotColor: newDot,
        });
      }
      if (onShowToast) {
        onShowToast(`Rescheduled ${item.title} by +${days} day(s) ⏰`);
      }
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  return (
    <div className="followups-page-container">
      {/* Page Header */}
      <div className="followups-header">
        <div className="followups-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 500 }}>
              Dashboard &bull; Pipeline
            </span>
          </div>
          <h1 className="followups-title">
            Follow-up Reminders
            <span className="followups-title-badge">{followups.length} Total</span>
          </h1>
          <p className="followups-subtitle">
            Stay on top of scheduled lead touchpoints, direct dispatches, and never let high-value opportunities go cold.
          </p>
        </div>

        <div className="followups-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingFollowUp(null);
              setIsScheduleModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Highlights */}
      <div className="followups-kpi-grid">
        <div className="followup-kpi-card today">
          <div className="followup-kpi-icon">
            <Clock size={22} />
          </div>
          <div className="followup-kpi-content">
            <span className="followup-kpi-value">{kpiStats.today}</span>
            <span className="followup-kpi-label">Due Today</span>
            <span className="followup-kpi-meta">Requires urgent outreach</span>
          </div>
        </div>

        <div className="followup-kpi-card tomorrow">
          <div className="followup-kpi-icon">
            <Calendar size={22} />
          </div>
          <div className="followup-kpi-content">
            <span className="followup-kpi-value">{kpiStats.tomorrow}</span>
            <span className="followup-kpi-label">Due Tomorrow</span>
            <span className="followup-kpi-meta">Prepare drafts & offers</span>
          </div>
        </div>

        <div className="followup-kpi-card upcoming">
          <div className="followup-kpi-icon">
            <AlertCircle size={22} />
          </div>
          <div className="followup-kpi-content">
            <span className="followup-kpi-value">{kpiStats.upcoming}</span>
            <span className="followup-kpi-label">Upcoming</span>
            <span className="followup-kpi-meta">Scheduled this month</span>
          </div>
        </div>

        <div className="followup-kpi-card completed">
          <div className="followup-kpi-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="followup-kpi-content">
            <span className="followup-kpi-value">{kpiStats.completed}</span>
            <span className="followup-kpi-label">Completed ({kpiStats.completionRate}%)</span>
            <span className="followup-kpi-meta">Touchpoints accomplished</span>
          </div>
        </div>
      </div>

      {/* Controls: Filter Tabs, Search & View Switcher */}
      <div className="followups-controls-card">
        <div className="followups-controls-row">
          {/* Status Tabs */}
          <div className="followups-filter-tabs">
            <button
              className={`followups-filter-tab ${activeFilterTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('all')}
            >
              All Reminders
              <span className="followups-tab-count">{followups.length}</span>
            </button>
            {kpiStats.overdue > 0 && (
              <button
                className={`followups-filter-tab ${activeFilterTab === 'overdue' ? 'active' : ''}`}
                onClick={() => setActiveFilterTab('overdue')}
                style={{ color: '#ef4444' }}
              >
                Overdue
                <span className="followups-tab-count" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                  {kpiStats.overdue}
                </span>
              </button>
            )}
            <button
              className={`followups-filter-tab ${activeFilterTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('today')}
            >
              Due Today
              <span className="followups-tab-count">{kpiStats.today}</span>
            </button>
            <button
              className={`followups-filter-tab ${activeFilterTab === 'tomorrow' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('tomorrow')}
            >
              Tomorrow
              <span className="followups-tab-count">{kpiStats.tomorrow}</span>
            </button>
            <button
              className={`followups-filter-tab ${activeFilterTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('upcoming')}
            >
              Upcoming
              <span className="followups-tab-count">{kpiStats.upcoming}</span>
            </button>
            <button
              className={`followups-filter-tab ${activeFilterTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('completed')}
            >
              Completed
              <span className="followups-tab-count">{kpiStats.completed}</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="followups-view-switch">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={14} />
              <span>List View</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              <Columns3 size={14} />
              <span>Pipeline Board</span>
            </button>
          </div>
        </div>

        {/* Search and Business Type Row */}
        <div className="followups-search-bar">
          <div className="followups-search-input-wrap">
            <Search size={15} />
            <input
              type="text"
              className="followups-search-input"
              placeholder="Search by lead name, contact person, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-light)" />
            <select
              className="form-input form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ minWidth: '150px', padding: '7px 10px', fontSize: '12.5px' }}
            >
              {businessTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Industries' : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Board View */}
      {viewMode === 'table' ? (
        <div className="followups-table-card">
          <div className="followups-table-responsive">
            <table className="followups-table">
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>Done</th>
                  <th>Lead & Business</th>
                  <th>Follow-up Stage</th>
                  <th>Due Date</th>
                  <th>Contact Info</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowups.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="followups-empty-state">
                        <div className="empty-icon-wrap">
                          <CheckCircle2 size={26} />
                        </div>
                        <h4 className="empty-title">No follow-ups found</h4>
                        <p className="empty-desc">
                          {searchTerm || activeFilterTab !== 'all' || selectedType !== 'All'
                            ? 'Try clearing your search or switching filter tabs.'
                            : 'All caught up! Click "+ Schedule Follow-up" to plan your next outreach.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFollowups.map((item) => {
                    const matchedLead = getMatchedLead(item);
                    const isDone = !!item.completed;

                    return (
                      <tr key={item.id || item._id} className={isDone ? 'completed-row' : ''}>
                        {/* Completion Checkbox */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={`custom-checkbox-btn ${isDone ? 'checked' : ''}`}
                            onClick={() => onToggleComplete && onToggleComplete(item.id || item._id)}
                            title={isDone ? 'Mark Incomplete' : 'Mark as Completed'}
                          >
                            <Check size={14} />
                          </button>
                        </td>

                        {/* Lead & Business Info */}
                        <td>
                          <div className="followup-lead-cell">
                            <span
                              className="followup-dot"
                              style={{ backgroundColor: isDone ? '#10b981' : item.dotColor || '#3b82f6' }}
                            />
                            <div>
                              <div className="followup-lead-name">{item.title}</div>
                              <div className="followup-lead-sub">
                                {matchedLead?.type && (
                                  <span className={`type-badge type-${matchedLead.type.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {matchedLead.type}
                                  </span>
                                )}
                                {matchedLead?.location && <span>📍 {matchedLead.location}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Sequence / Stage */}
                        <td>
                          <span className="followup-sequence-pill">
                            <Clock size={12} />
                            {item.subtitle || 'Follow-up #1'}
                          </span>
                        </td>

                        {/* Due Date & Badge */}
                        <td>
                          <span
                            className={`followup-due-badge ${
                              isDone ? 'completed' : item.badgeType || 'date'
                            }`}
                          >
                            {isDone ? '✓ Done' : item.badge || 'Upcoming'}
                          </span>
                        </td>

                        {/* Contact Person */}
                        <td>
                          <div style={{ fontSize: '12.5px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {matchedLead?.contactPerson || 'Decision Maker'}
                            </div>
                            <div style={{ color: 'var(--text-light)', fontSize: '11px' }}>
                              {matchedLead?.phone || matchedLead?.email || 'No contact listed'}
                            </div>
                          </div>
                        </td>

                        {/* Notes */}
                        <td style={{ maxWidth: '240px' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={item.notes || 'No extra notes'}
                          >
                            {item.notes || '—'}
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td>
                          <div className="followup-actions-wrap" style={{ justifyContent: 'flex-end' }}>
                            {/* WhatsApp Button */}
                            <button
                              type="button"
                              className="followup-act-btn whatsapp"
                              onClick={() => handleWhatsApp(item)}
                              title="Send WhatsApp Follow-up"
                            >
                              <MessageCircle size={14} />
                            </button>

                            {/* Email Button */}
                            <button
                              type="button"
                              className="followup-act-btn email"
                              onClick={() => handleEmail(item)}
                              title="Send Email Follow-up"
                            >
                              <Mail size={14} />
                            </button>

                            {/* AI Message Draft Shortcut */}
                            <button
                              type="button"
                              className="followup-act-btn ai"
                              onClick={() => handleAiDraft(item)}
                              title="Generate AI Follow-up Message"
                            >
                              <Sparkles size={14} />
                            </button>

                            {/* Snooze / Reschedule Menu */}
                            <div className="snooze-menu-container">
                              <button
                                type="button"
                                className="followup-act-btn"
                                onClick={() =>
                                  setActiveSnoozeMenuId(
                                    activeSnoozeMenuId === (item.id || item._id) ? null : item.id || item._id
                                  )
                                }
                                title="Reschedule / Postpone"
                              >
                                <Calendar size={13} />
                              </button>

                              {activeSnoozeMenuId === (item.id || item._id) && (
                                <div className="snooze-dropdown">
                                  <div
                                    style={{
                                      fontSize: '10.5px',
                                      fontWeight: 700,
                                      color: 'var(--text-light)',
                                      padding: '4px 8px',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    Quick Reschedule
                                  </div>
                                  <button
                                    type="button"
                                    className="snooze-option-btn"
                                    onClick={() => handleSnooze(item, 1)}
                                  >
                                    +1 Day (Tomorrow)
                                  </button>
                                  <button
                                    type="button"
                                    className="snooze-option-btn"
                                    onClick={() => handleSnooze(item, 3)}
                                  >
                                    +3 Days
                                  </button>
                                  <button
                                    type="button"
                                    className="snooze-option-btn"
                                    onClick={() => handleSnooze(item, 7)}
                                  >
                                    Next Week (+7 Days)
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Edit Modal Button */}
                            <button
                              type="button"
                              className="followup-act-btn"
                              onClick={() => {
                                setEditingFollowUp(item);
                                setIsScheduleModalOpen(true);
                              }}
                              title="Edit Follow-up"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              className="followup-act-btn danger"
                              onClick={() => onDeleteFollowUp && onDeleteFollowUp(item.id || item._id)}
                              title="Delete Follow-up"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="followups-board-grid">
          {boardColumns.map((col) => (
            <div key={col.id} className="followups-board-col">
              <div className="board-col-header">
                <div className="board-col-title-wrap">
                  <span className="board-col-dot" style={{ backgroundColor: col.dot }} />
                  <span>{col.title}</span>
                </div>
                <span className="board-col-count">{col.items.length}</span>
              </div>

              <div className="board-card-stack">
                {col.items.length === 0 ? (
                  <div
                    style={{
                      padding: '30px 10px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: 'var(--text-light)',
                    }}
                  >
                    No follow-ups in this stage
                  </div>
                ) : (
                  col.items.map((item) => {
                    const matchedLead = getMatchedLead(item);
                    const isDone = !!item.completed;

                    return (
                      <div
                        key={item.id || item._id}
                        className={`followup-board-card ${isDone ? 'is-completed' : ''}`}
                      >
                        <div className="board-card-top">
                          <div>
                            <div className="board-card-lead-title">{item.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                              {matchedLead?.contactPerson || 'Lead Contact'} &bull; {item.subtitle}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`custom-checkbox-btn ${isDone ? 'checked' : ''}`}
                            onClick={() => onToggleComplete && onToggleComplete(item.id || item._id)}
                            title={isDone ? 'Mark Incomplete' : 'Mark as Done'}
                          >
                            <Check size={13} />
                          </button>
                        </div>

                        {item.notes && <div className="board-card-notes">{item.notes}</div>}

                        <div className="board-card-footer">
                          <span
                            className={`followup-due-badge ${isDone ? 'completed' : item.badgeType || 'date'}`}
                            style={{ fontSize: '10.5px', padding: '2px 7px' }}
                          >
                            {isDone ? 'Completed' : item.badge}
                          </span>

                          <div className="followup-actions-wrap">
                            <button
                              type="button"
                              className="followup-act-btn whatsapp"
                              style={{ width: '25px', height: '25px' }}
                              onClick={() => handleWhatsApp(item)}
                              title="WhatsApp"
                            >
                              <MessageCircle size={12} />
                            </button>
                            <button
                              type="button"
                              className="followup-act-btn email"
                              style={{ width: '25px', height: '25px' }}
                              onClick={() => handleEmail(item)}
                              title="Email"
                            >
                              <Mail size={12} />
                            </button>
                            <button
                              type="button"
                              className="followup-act-btn ai"
                              style={{ width: '25px', height: '25px' }}
                              onClick={() => handleAiDraft(item)}
                              title="AI Draft"
                            >
                              <Sparkles size={12} />
                            </button>
                            <button
                              type="button"
                              className="followup-act-btn"
                              style={{ width: '25px', height: '25px' }}
                              onClick={() => {
                                setEditingFollowUp(item);
                                setIsScheduleModalOpen(true);
                              }}
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule / Edit Follow-up Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingFollowUp(null);
        }}
        onSave={async (payload, id) => {
          if (id) {
            if (onUpdateFollowUp) await onUpdateFollowUp(id, payload);
          } else {
            if (onCreateFollowUp) await onCreateFollowUp(payload);
          }
        }}
        leads={leads}
        editingFollowUp={editingFollowUp}
      />
    </div>
  );
}
