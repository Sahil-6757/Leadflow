import React, { useState, useMemo, useEffect } from 'react';
import './LeadsPage.css';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Table as TableIcon,
  Columns3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageCircle,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  X,
  Building,
} from 'lucide-react';

export default function LeadsPage({
  leads = [],
  initialStatusFilter = 'All',
  onAddNewLead,
  onEditLead,
  onUpdateStatus,
  onDeleteLead,
  onBulkDelete,
  onBulkUpdateStatus,
  onOpenAiModal,
  onShowToast,
}) {
  // View mode: 'table' or 'kanban'
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'All');

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail drawer
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState(null);
  const [drawerNotes, setDrawerNotes] = useState('');

  // Status definitions with colors
  const PIPELINE_STATUSES = [
    { key: 'New', label: 'New Leads', color: '#3b82f6', bg: '#eff6ff' },
    { key: 'Contacted', label: 'Contacted', color: '#2563eb', bg: '#dbeafe' },
    { key: 'Replied', label: 'Replied', color: '#10b981', bg: '#dcfce7' },
    { key: 'Interested', label: 'Interested', color: '#8b5cf6', bg: '#f3e8ff' },
    { key: 'Won', label: 'Won / Client', color: '#f59e0b', bg: '#fef3c7' },
    { key: 'Lost', label: 'Lost / Closed', color: '#ef4444', bg: '#fee2e2' },
  ];

  const ALL_STATUS_TABS = [
    'All',
    'New',
    'Contacted',
    'Replied',
    'Interested',
    'Message Ready',
    'Won',
    'Lost',
    'No Response',
  ];

  const BUSINESS_TYPES = [
    'All',
    'Dental Clinic',
    'IT Services',
    'Restaurant',
    'Fitness',
    'Real Estate',
    'Retail',
    'Healthcare',
    'Education',
  ];

  // Open drawer and sync notes
  const handleOpenDrawer = (lead) => {
    setSelectedLeadForDrawer(lead);
    setDrawerNotes(lead.notes || '');
  };

  const handleCloseDrawer = () => {
    setSelectedLeadForDrawer(null);
  };

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Search Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = lead.businessName?.toLowerCase().includes(q);
          const matchContact = lead.contactPerson?.toLowerCase().includes(q);
          const matchLocation = lead.location?.toLowerCase().includes(q);
          const matchType = lead.type?.toLowerCase().includes(q);
          const matchEmail = lead.email?.toLowerCase().includes(q);
          const matchPhone = lead.phone?.toLowerCase().includes(q);
          if (!matchName && !matchContact && !matchLocation && !matchType && !matchEmail && !matchPhone) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter !== 'All' && lead.status !== statusFilter) {
          return false;
        }

        // Type Filter
        if (typeFilter !== 'All' && lead.type !== typeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'name-asc') {
          return (a.businessName || '').localeCompare(b.businessName || '');
        }
        if (sortBy === 'name-desc') {
          return (b.businessName || '').localeCompare(a.businessName || '');
        }
        return 0;
      });
  }, [leads, searchTerm, statusFilter, typeFilter, sortBy]);

  // Bulk selection toggles
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id || l._id));
    }
  };

  const handleToggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk status update
  const handleBulkStatusChange = (status) => {
    if (!selectedIds.length) return;
    if (onBulkUpdateStatus) {
      onBulkUpdateStatus(selectedIds, status);
    } else {
      selectedIds.forEach((id) => onUpdateStatus && onUpdateStatus(id, status));
    }
    onShowToast && onShowToast(`Updated status for ${selectedIds.length} leads to ${status}`);
    setSelectedIds([]);
  };

  // Bulk delete
  const handleBulkDeleteAction = () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected leads?`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedIds);
      } else {
        selectedIds.forEach((id) => onDeleteLead && onDeleteLead(id));
      }
      onShowToast && onShowToast(`Deleted ${selectedIds.length} leads`);
      setSelectedIds([]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const listToExport = selectedIds.length > 0
      ? leads.filter((l) => selectedIds.includes(l.id || l._id))
      : filteredLeads;

    if (listToExport.length === 0) {
      onShowToast && onShowToast('No leads available to export');
      return;
    }

    const headers = ['Business Name', 'Contact Person', 'Type', 'Location', 'Status', 'Phone', 'Email', 'Next Follow Up', 'Notes'];
    const rows = listToExport.map((l) => [
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${(l.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(l.type || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.nextFollowUp || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadFlow_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast && onShowToast(`Exported ${listToExport.length} leads to CSV`);
  };

  // WhatsApp helper
  const handleWhatsApp = (e, lead) => {
    e.stopPropagation();
    const phoneNum = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `Hi ${lead.contactPerson || lead.businessName}, I came across ${lead.businessName} and noticed key opportunities to enhance your website and boost online conversions. Would you be open to a quick demo?`
    );
    const url = phoneNum ? `https://wa.me/${phoneNum}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Email helper
  const handleEmail = (e, lead) => {
    e.stopPropagation();
    const subject = encodeURIComponent(`Growth & Website Opportunities for ${lead.businessName}`);
    const body = encodeURIComponent(
      `Hi ${lead.contactPerson || lead.businessName},\n\nI was reviewing your website and noticed several opportunities to improve customer engagement and direct booking conversions.\n\nBest regards,\nSahil Khan`
    );
    window.location.href = `mailto:${lead.email || ''}?subject=${subject}&body=${body}`;
  };

  // Quick next stage progression
  const handleAdvanceStage = (e, lead) => {
    e.stopPropagation();
    const stageFlow = ['New', 'Contacted', 'Replied', 'Interested', 'Won'];
    const currentIndex = stageFlow.indexOf(lead.status);
    if (currentIndex >= 0 && currentIndex < stageFlow.length - 1) {
      const nextStage = stageFlow[currentIndex + 1];
      onUpdateStatus && onUpdateStatus(lead.id || lead._id, nextStage);
      onShowToast && onShowToast(`${lead.businessName} moved to ${nextStage}`);
    }
  };

  // Save drawer notes
  const handleSaveNotes = () => {
    if (!selectedLeadForDrawer) return;
    const leadId = selectedLeadForDrawer.id || selectedLeadForDrawer._id;
    if (onEditLead) {
      onEditLead(leadId, { ...selectedLeadForDrawer, notes: drawerNotes });
    }
    setSelectedLeadForDrawer((prev) => ({ ...prev, notes: drawerNotes }));
    onShowToast && onShowToast('Notes saved successfully');
  };

  // Type styling
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Dental Clinic':
        return { backgroundColor: 'var(--badge-dental-bg)', color: 'var(--badge-dental-text)' };
      case 'IT Services':
        return { backgroundColor: 'var(--badge-it-bg)', color: 'var(--badge-it-text)' };
      case 'Restaurant':
        return { backgroundColor: 'var(--badge-restaurant-bg)', color: 'var(--badge-restaurant-text)' };
      case 'Fitness':
        return { backgroundColor: 'var(--badge-fitness-bg)', color: 'var(--badge-fitness-text)' };
      default:
        return { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' };
    }
  };

  // Status styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Contacted':
        return { backgroundColor: 'var(--badge-contacted-bg)', color: 'var(--badge-contacted-text)' };
      case 'New':
        return { backgroundColor: 'var(--badge-new-bg)', color: 'var(--badge-new-text)' };
      case 'Replied':
        return { backgroundColor: 'var(--badge-replied-bg)', color: 'var(--badge-replied-text)' };
      case 'Interested':
        return { backgroundColor: 'var(--purple-accent-light)', color: 'var(--purple-accent-text)' };
      case 'Won':
        return { backgroundColor: '#fef3c7', color: '#b45309' };
      case 'Lost':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'Message Ready':
        return { backgroundColor: 'var(--badge-ready-bg)', color: 'var(--badge-ready-text)' };
      case 'No Response':
        return { backgroundColor: 'var(--badge-no-resp-bg)', color: 'var(--badge-no-resp-text)' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  // KPI Metrics Calculation
  const totalLeadsCount = leads.length;
  const contactedCount = leads.filter((l) => l.status === 'Contacted' || l.status === 'Replied' || l.status === 'Interested' || l.status === 'Won').length;
  const interestedCount = leads.filter((l) => l.status === 'Interested').length;
  const wonCount = leads.filter((l) => l.status === 'Won').length;
  const contactedRate = totalLeadsCount ? Math.round((contactedCount / totalLeadsCount) * 100) : 0;

  return (
    <div className="leads-page">
      {/* Top Header Card */}
      <div className="leads-header-section">
        <div className="leads-title-row">
          <div className="leads-title-area">
            <h1>
              <span>Leads Management</span>
              <span className="leads-count-badge">{filteredLeads.length} leads</span>
            </h1>
            <p>Track, nurture, and close potential business clients across every pipeline stage.</p>
          </div>

          {/* Right Action Controls */}
          <div className="leads-top-actions">
            {/* View Mode Switcher */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <TableIcon size={15} />
                <span>Table</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <Columns3 size={15} />
                <span>Pipeline</span>
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
              title="Export leads to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            {/* Primary Add Lead CTA */}
            <button
              type="button"
              className="btn-primary"
              onClick={onAddNewLead}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <Plus size={16} />
              <span>Add New Lead</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sort */}
        <div className="leads-toolbar">
          {/* Live Search */}
          <div className="leads-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by business, contact, location, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter & Sort */}
          <div className="leads-filters-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                className="leads-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by Business Type"
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Categories' : type}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="leads-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort Leads"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name-asc">Sort: Business A-Z</option>
              <option value="name-desc">Sort: Business Z-A</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips Scroll */}
        <div className="status-chips-scroll">
          {ALL_STATUS_TABS.map((status) => {
            const count = status === 'All'
              ? leads.length
              : leads.filter((l) => l.status === status).length;
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                className={`status-chip ${isActive ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                <span>{status}</span>
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metrics Highlight Bar */}
      <div className="leads-kpi-bar">
        <div className="leads-kpi-card">
          <div className="leads-kpi-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <Users size={20} />
          </div>
          <div className="leads-kpi-info">
            <span className="leads-kpi-value">{totalLeadsCount}</span>
            <span className="leads-kpi-label">Total Leads</span>
          </div>
        </div>

        <div className="leads-kpi-card">
          <div className="leads-kpi-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div className="leads-kpi-info">
            <span className="leads-kpi-value">{contactedRate}%</span>
            <span className="leads-kpi-label">Outreach Rate</span>
          </div>
        </div>

        <div className="leads-kpi-card">
          <div className="leads-kpi-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Sparkles size={20} />
          </div>
          <div className="leads-kpi-info">
            <span className="leads-kpi-value">{interestedCount}</span>
            <span className="leads-kpi-label">High-Intent Leads</span>
          </div>
        </div>

        <div className="leads-kpi-card">
          <div className="leads-kpi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="leads-kpi-info">
            <span className="leads-kpi-value">{wonCount}</span>
            <span className="leads-kpi-label">Won Clients</span>
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar (Shown when leads are selected) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-count">
            <CheckCircle2 size={18} color="#38bdf8" />
            <span>{selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="bulk-btn-group">
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => handleBulkStatusChange('Contacted')}
            >
              Mark as Contacted
            </button>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => handleBulkStatusChange('Interested')}
            >
              Mark as Interested
            </button>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => handleBulkStatusChange('Won')}
            >
              Mark as Won
            </button>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={handleExportCSV}
            >
              <Download size={13} />
              <span>Export Selected</span>
            </button>
            <button
              type="button"
              className="bulk-action-btn danger"
              onClick={handleBulkDeleteAction}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => setSelectedIds([])}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="leads-table-container">
          <div className="leads-table-wrap">
            <table className="leads-data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th>Business & Contact</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Pipeline Status</th>
                  <th>Contact Info</th>
                  <th>Follow-up</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      <Users size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                        No leads found matching your criteria
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>
                        Try clearing search keywords or changing category filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const leadId = lead.id || lead._id;
                    const isSelected = selectedIds.includes(leadId);

                    return (
                      <tr
                        key={leadId}
                        className={isSelected ? 'selected' : ''}
                        onClick={() => handleOpenDrawer(lead)}
                      >
                        {/* Checkbox */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="table-checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(leadId)}
                          />
                        </td>

                        {/* Business & Contact Person */}
                        <td>
                          <div className="lead-biz-cell">
                            <div
                              className="lead-avatar-bubble"
                              style={{
                                backgroundColor: lead.avatarBg || '#e0e7ff',
                                color: lead.avatarBg ? '#ffffff' : '#3730a3',
                              }}
                            >
                              {lead.avatarText || lead.businessName?.charAt(0) || 'B'}
                            </div>
                            <div>
                              <div className="lead-name-text">
                                <span>{lead.businessName}</span>
                              </div>
                              <div className="lead-person-text">
                                {lead.contactPerson || 'Decision Maker'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category Type */}
                        <td>
                          <span className="type-badge" style={getTypeBadgeStyle(lead.type)}>
                            {lead.type || 'General'}
                          </span>
                        </td>

                        {/* Location */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                            <MapPin size={13} color="var(--text-muted)" />
                            <span>{lead.location || 'India'}</span>
                          </div>
                        </td>

                        {/* Status Select Badge */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="status-select-wrap">
                            <select
                              value={lead.status}
                              onChange={(e) => onUpdateStatus && onUpdateStatus(leadId, e.target.value)}
                              className="status-select-badge"
                              style={getStatusBadgeStyle(lead.status)}
                              title="Click to change pipeline stage"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Replied">Replied</option>
                              <option value="Interested">Interested</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                              <option value="Message Ready">Message Ready</option>
                              <option value="No Response">No Response</option>
                            </select>
                            <ChevronDown size={11} className="status-select-chevron" />
                          </div>
                        </td>

                        {/* Phone / Email Link */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="lead-phone-email-cell">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="lead-email-link"
                                title={lead.email}
                              >
                                <Mail size={12} />
                                <span>{lead.email}</span>
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>No email</span>
                            )}
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                className="lead-phone-link"
                                title={lead.phone}
                              >
                                <Phone size={12} />
                                <span>{lead.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Next Follow Up */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <Calendar size={13} color="var(--text-muted)" />
                            <span>{lead.nextFollowUp || 'Upcoming'}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions-group">
                            <button
                              type="button"
                              className="action-icon-btn whatsapp"
                              title="Send WhatsApp outreach pitch"
                              onClick={(e) => handleWhatsApp(e, lead)}
                            >
                              <MessageCircle size={15} strokeWidth={2.2} />
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn"
                              title="Compose email"
                              onClick={(e) => handleEmail(e, lead)}
                            >
                              <Mail size={14} />
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn"
                              title="Generate AI Message for this lead"
                              style={{ color: '#8b5cf6' }}
                              onClick={() => onOpenAiModal && onOpenAiModal(lead)}
                            >
                              <Sparkles size={14} />
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn"
                              title="Edit Lead"
                              onClick={() => onEditLead && onEditLead(lead)}
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn"
                              title="Delete Lead"
                              style={{ color: '#ef4444' }}
                              onClick={() => onDeleteLead && onDeleteLead(leadId)}
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
        /* Kanban Pipeline Board View */
        <div className="kanban-board-container">
          {PIPELINE_STATUSES.map((column) => {
            const columnLeads = filteredLeads.filter((l) => l.status === column.key);

            return (
              <div key={column.key} className="kanban-column">
                <div className="kanban-col-header">
                  <div className="kanban-col-title">
                    <span className="kanban-col-dot" style={{ backgroundColor: column.color }} />
                    <span>{column.label}</span>
                  </div>
                  <span className="kanban-col-count">{columnLeads.length}</span>
                </div>

                <div className="kanban-cards-stack">
                  {columnLeads.length === 0 ? (
                    <div className="kanban-empty-col">No leads in {column.key}</div>
                  ) : (
                    columnLeads.map((lead) => {
                      const leadId = lead.id || lead._id;
                      return (
                        <div
                          key={leadId}
                          className="kanban-card"
                          onClick={() => handleOpenDrawer(lead)}
                        >
                          <div className="kanban-card-top">
                            <div>
                              <div className="kanban-biz-name">{lead.businessName}</div>
                              <div className="kanban-contact-name">
                                {lead.contactPerson || 'Contact Person'}
                              </div>
                            </div>
                            <span className="type-badge" style={getTypeBadgeStyle(lead.type)}>
                              {lead.type}
                            </span>
                          </div>

                          <div className="kanban-card-meta">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} color="var(--text-muted)" />
                              <span>{lead.location || 'India'}</span>
                            </div>
                            {lead.nextFollowUp && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} color="var(--text-muted)" />
                                <span>{lead.nextFollowUp}</span>
                              </div>
                            )}
                          </div>

                          <div className="kanban-card-footer">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="action-icon-btn whatsapp"
                                title="WhatsApp"
                                onClick={(e) => handleWhatsApp(e, lead)}
                              >
                                <MessageCircle size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="Email"
                                onClick={(e) => handleEmail(e, lead)}
                              >
                                <Mail size={13} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="Generate AI Outreach"
                                style={{ color: '#8b5cf6' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAiModal && onOpenAiModal(lead);
                                }}
                              >
                                <Sparkles size={13} />
                              </button>
                            </div>

                            {/* Advance Stage Shortcut */}
                            {column.key !== 'Won' && column.key !== 'Lost' && (
                              <button
                                type="button"
                                className="kanban-stage-btn"
                                title="Advance to next pipeline stage"
                                onClick={(e) => handleAdvanceStage(e, lead)}
                              >
                                <span>Next</span>
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Lead Detail Drawer */}
      {selectedLeadForDrawer && (
        <div className="lead-drawer-overlay" onClick={handleCloseDrawer}>
          <div className="lead-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="var(--primary-blue)" />
                <h3 className="card-heading">Lead Profile</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Hero Banner */}
              <div className="drawer-lead-hero">
                <div
                  className="drawer-avatar"
                  style={{
                    backgroundColor: selectedLeadForDrawer.avatarBg || '#2563eb',
                    color: '#ffffff',
                  }}
                >
                  {selectedLeadForDrawer.avatarText || selectedLeadForDrawer.businessName?.charAt(0) || 'L'}
                </div>
                <div>
                  <div className="drawer-lead-title">{selectedLeadForDrawer.businessName}</div>
                  <div className="drawer-lead-person">
                    {selectedLeadForDrawer.contactPerson ? `Contact: ${selectedLeadForDrawer.contactPerson}` : 'No contact specified'}
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                    <span className="type-badge" style={getTypeBadgeStyle(selectedLeadForDrawer.type)}>
                      {selectedLeadForDrawer.type}
                    </span>
                    <span className="status-badge" style={getStatusBadgeStyle(selectedLeadForDrawer.status)}>
                      {selectedLeadForDrawer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pipeline Stepper */}
              <div>
                <div className="drawer-stepper-title">Pipeline Stage Progression</div>
                <div className="drawer-stepper">
                  {['New', 'Contacted', 'Replied', 'Interested', 'Won'].map((stage) => {
                    const isActive = selectedLeadForDrawer.status === stage;
                    return (
                      <div
                        key={stage}
                        className={`stepper-step ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          const leadId = selectedLeadForDrawer.id || selectedLeadForDrawer._id;
                          onUpdateStatus && onUpdateStatus(leadId, stage);
                          setSelectedLeadForDrawer((prev) => ({ ...prev, status: stage }));
                          onShowToast && onShowToast(`Status updated to ${stage}`);
                        }}
                      >
                        <span className="step-dot" />
                        <span className="step-label">{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="drawer-actions-grid">
                <button
                  type="button"
                  className="drawer-action-btn whatsapp"
                  onClick={(e) => handleWhatsApp(e, selectedLeadForDrawer)}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Pitch</span>
                </button>

                <button
                  type="button"
                  className="drawer-action-btn email"
                  onClick={(e) => handleEmail(e, selectedLeadForDrawer)}
                >
                  <Mail size={16} />
                  <span>Send Email</span>
                </button>

                <button
                  type="button"
                  className="drawer-action-btn ai"
                  onClick={() => {
                    handleCloseDrawer();
                    onOpenAiModal && onOpenAiModal(selectedLeadForDrawer);
                  }}
                >
                  <Sparkles size={16} />
                  <span>Generate AI Pitch for this Business</span>
                </button>
              </div>

              {/* Lead Information Card */}
              <div className="drawer-info-list">
                <div className="drawer-info-item">
                  <span className="drawer-info-label">
                    <Phone size={14} /> Phone Number
                  </span>
                  <span className="drawer-info-val">
                    {selectedLeadForDrawer.phone || 'Not provided'}
                  </span>
                </div>

                <div className="drawer-info-item">
                  <span className="drawer-info-label">
                    <Mail size={14} /> Email Address
                  </span>
                  <span className="drawer-info-val">
                    {selectedLeadForDrawer.email || 'Not provided'}
                  </span>
                </div>

                <div className="drawer-info-item">
                  <span className="drawer-info-label">
                    <MapPin size={14} /> Location
                  </span>
                  <span className="drawer-info-val">
                    {selectedLeadForDrawer.location || 'India'}
                  </span>
                </div>

                <div className="drawer-info-item">
                  <span className="drawer-info-label">
                    <Calendar size={14} /> Next Scheduled Follow-up
                  </span>
                  <span className="drawer-info-val">
                    {selectedLeadForDrawer.nextFollowUp || 'Not scheduled'}
                  </span>
                </div>
              </div>

              {/* Notes & Interaction Log */}
              <div className="drawer-notes-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="drawer-stepper-title" style={{ margin: 0 }}>
                    Notes & Action Items
                  </label>
                  <button
                    type="button"
                    className="card-link-btn"
                    onClick={handleSaveNotes}
                    style={{ fontSize: '11.5px', fontWeight: 600 }}
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  className="drawer-notes-textarea"
                  placeholder="Record customer objections, website audit takeaways, or scheduled demo dates..."
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <button
                type="button"
                className="btn-secondary"
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  const leadId = selectedLeadForDrawer.id || selectedLeadForDrawer._id;
                  handleCloseDrawer();
                  onDeleteLead && onDeleteLead(leadId);
                }}
              >
                <Trash2 size={14} style={{ marginRight: '6px' }} />
                <span>Delete Lead</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const leadToEdit = selectedLeadForDrawer;
                  handleCloseDrawer();
                  onEditLead && onEditLead(leadToEdit);
                }}
              >
                <Edit2 size={14} style={{ marginRight: '6px' }} />
                <span>Edit Lead Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
