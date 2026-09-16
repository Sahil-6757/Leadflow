import React from 'react';
import {
  MapPin,
  Mail,
  MoreHorizontal,
  ArrowRight,
  MessageCircle,
  Trash2,
  ChevronDown
} from 'lucide-react';

export default function RecentLeadsTable({
  leads = [],
  onSelectLead,
  onWhatsAppClick,
  onEmailClick,
  onViewAll,
  onUpdateStatus,
  onDeleteLead,
}) {
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
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Contacted':
        return { backgroundColor: 'var(--badge-contacted-bg)', color: 'var(--badge-contacted-text)' };
      case 'New':
        return { backgroundColor: 'var(--badge-new-bg)', color: 'var(--badge-new-text)' };
      case 'Replied':
        return { backgroundColor: 'var(--badge-replied-bg)', color: 'var(--badge-replied-text)' };
      case 'Message Ready':
        return { backgroundColor: 'var(--badge-ready-bg)', color: 'var(--badge-ready-text)' };
      case 'No Response':
        return { backgroundColor: 'var(--badge-no-resp-bg)', color: 'var(--badge-no-resp-text)' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const renderAvatarIcon = (lead) => {
    if (lead.type === 'Dental Clinic') {
      return (
        <div
          className="biz-avatar"
          style={{
            backgroundColor: lead.id === 1 ? '#ecfdf5' : '#f1f5f9',
            border: lead.id === 1 ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
            color: lead.id === 1 ? '#059669' : '#334155'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 3C4.5 3 3 5 3 8C3 12 5 15 7 21C7.8 23 9.5 20.5 12 16.5C14.5 20.5 16.2 23 17 21C19 15 21 12 21 8C21 5 19.5 3 17 3C14.5 3 13.5 4.5 12 4.5C10.5 4.5 9.5 3 7 3Z" />
          </svg>
        </div>
      );
    }
    if (lead.type === 'IT Services') {
      return (
        <div
          className="biz-avatar"
          style={{ backgroundColor: '#1e293b', color: '#60a5fa' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
      );
    }
    if (lead.type === 'Restaurant') {
      return (
        <div
          className="biz-avatar"
          style={{ backgroundColor: '#b91c1c', color: '#ffffff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/>
            <path d="M15 2v20"/>
            <path d="M6 2v20"/>
            <path d="M6 8a4 4 0 0 0 4-4"/>
          </svg>
        </div>
      );
    }
    if (lead.type === 'Fitness') {
      return (
        <div
          className="biz-avatar"
          style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2"/>
            <path d="m9 20 3-6 3 2 3-5"/>
            <path d="m6 8 6 2 5-2"/>
          </svg>
        </div>
      );
    }
    return (
      <div className="biz-avatar" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
        {lead.businessName.charAt(0)}
      </div>
    );
  };

  return (
    <div className="dashboard-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-heading">Recent Leads</h2>
          <p className="card-subheading">Your latest leads and their current status.</p>
        </div>
        <button className="card-link-btn" onClick={onViewAll}>
          <span>View All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="table-responsive">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Next Follow-up</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              return (
                <tr key={lead.id}>
                  <td>
                    <div className="business-col">
                      {renderAvatarIcon(lead)}
                      <div>
                        <div className="biz-name">{lead.businessName}</div>
                        <div className="biz-contact">{lead.contactPerson}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge" style={getTypeBadgeStyle(lead.type)}>
                      {lead.type}
                    </span>
                  </td>
                  <td>
                    <div className="location-cell">
                      <MapPin size={13} color="var(--text-light)" />
                      <span>{lead.location}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateStatus && onUpdateStatus(lead.id, e.target.value)}
                        className="status-badge"
                        style={{
                          ...getStatusBadgeStyle(lead.status),
                          border: 'none',
                          cursor: 'pointer',
                          paddingRight: '22px',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          outline: 'none',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                        }}
                        title="Click to change status"
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
                      <ChevronDown
                        size={11}
                        style={{
                          position: 'absolute',
                          right: '7px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {lead.nextFollowUp}
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        className="action-icon-btn whatsapp"
                        title={`Send WhatsApp message to ${lead.contactPerson}`}
                        onClick={() => onWhatsAppClick && onWhatsAppClick(lead)}
                      >
                        <MessageCircle size={15} strokeWidth={2.2} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title={`Send Email to ${lead.email}`}
                        onClick={() => onEmailClick && onEmailClick(lead)}
                      >
                        <Mail size={14} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Delete Lead"
                        style={{ color: '#ef4444' }}
                        onClick={() => onDeleteLead && onDeleteLead(lead.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="More Options"
                        onClick={() => onSelectLead && onSelectLead(lead)}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
