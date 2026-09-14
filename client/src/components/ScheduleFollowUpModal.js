import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Building, AlertCircle, Sparkles } from 'lucide-react';

export default function ScheduleFollowUpModal({
  isOpen,
  onClose,
  onSave,
  leads = [],
  editingFollowUp = null,
  initialLead = null,
}) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Follow-up #1');
  const [badgeType, setBadgeType] = useState('today');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format Date to YYYY-MM-DD for date picker
  const formatDateForInput = (d) => {
    const date = new Date(d);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  };

  // Helper to get formatted badge label from date
  const getBadgeFromDate = (dateStr, type) => {
    if (type === 'today') return 'Today';
    if (type === 'tomorrow') return 'Tomorrow';
    if (!dateStr) return 'Upcoming';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return 'Upcoming';
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingFollowUp) {
      setTitle(editingFollowUp.title || '');
      setSubtitle(editingFollowUp.subtitle || 'Follow-up #1');
      setBadgeType(editingFollowUp.badgeType || 'today');
      setNotes(editingFollowUp.notes || '');
      if (editingFollowUp.dueDate) {
        setDueDate(formatDateForInput(editingFollowUp.dueDate));
      } else {
        setDueDate(formatDateForInput(new Date()));
      }
      if (editingFollowUp.leadId) {
        const id = typeof editingFollowUp.leadId === 'object' ? editingFollowUp.leadId._id : editingFollowUp.leadId;
        setSelectedLeadId(id || '');
      } else {
        const matched = leads.find((l) => (l.businessName || '').toLowerCase() === (editingFollowUp.title || '').toLowerCase());
        setSelectedLeadId(matched ? matched.id || matched._id : '');
      }
    } else if (initialLead) {
      const id = initialLead.id || initialLead._id;
      setSelectedLeadId(id);
      setTitle(initialLead.businessName || '');
      setSubtitle('Follow-up #1');
      setBadgeType('today');
      setDueDate(formatDateForInput(new Date()));
      setNotes(initialLead.notes || '');
    } else {
      setSelectedLeadId('');
      setTitle('');
      setSubtitle('Follow-up #1');
      setBadgeType('today');
      setDueDate(formatDateForInput(new Date()));
      setNotes('');
    }
  }, [isOpen, editingFollowUp, initialLead, leads]);

  if (!isOpen) return null;

  // Handle lead selection change
  const handleLeadSelect = (e) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);
    if (leadId) {
      const lead = leads.find((l) => String(l.id || l._id) === String(leadId));
      if (lead) {
        setTitle(lead.businessName);
        if (lead.notes && !notes) {
          setNotes(`Follow up on: ${lead.notes.slice(0, 100)}`);
        }
      }
    }
  };

  // Quick Due Date Presets
  const applyPreset = (preset) => {
    const now = new Date();
    if (preset === 'today') {
      setBadgeType('today');
      setDueDate(formatDateForInput(now));
    } else if (preset === 'tomorrow') {
      setBadgeType('tomorrow');
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(formatDateForInput(tomorrow));
    } else if (preset === 'in3days') {
      setBadgeType('date');
      const in3 = new Date(now);
      in3.setDate(in3.getDate() + 3);
      setDueDate(formatDateForInput(in3));
    } else if (preset === 'nextweek') {
      setBadgeType('date');
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(formatDateForInput(nextWeek));
    }
  };

  const getDotColor = (type) => {
    switch (type) {
      case 'today':
        return '#ef4444';
      case 'tomorrow':
        return '#f59e0b';
      case 'overdue':
        return '#dc2626';
      default:
        return '#3b82f6';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const dotColor = getDotColor(badgeType);
      const badge = getBadgeFromDate(dueDate, badgeType);

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || 'Follow-up #1',
        badge,
        badgeType,
        dotColor,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        leadId: selectedLeadId || undefined,
        notes: notes.trim(),
        priority,
      };

      await onSave(payload, editingFollowUp?.id || editingFollowUp?._id);
      onClose();
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLead = leads.find((l) => String(l.id || l._id) === String(selectedLeadId));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '540px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                backgroundColor: 'var(--primary-blue-light, #eff6ff)',
                color: 'var(--primary-blue, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="modal-title">
                {editingFollowUp ? 'Edit Follow-up Reminder' : 'Schedule New Follow-up'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)' }}>
                Set a reminder and keep your lead pipeline active
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Quick Select from Existing Leads */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="var(--primary-blue)" />
              Select Lead (Optional)
            </label>
            <select
              className="form-input form-select"
              value={selectedLeadId}
              onChange={handleLeadSelect}
            >
              <option value="">-- Choose an existing lead or enter custom below --</option>
              {leads.map((l) => (
                <option key={l.id || l._id} value={l.id || l._id}>
                  {l.businessName} {l.contactPerson ? `(${l.contactPerson})` : ''} - {l.type || 'Lead'}
                </option>
              ))}
            </select>
            {selectedLead && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '8px 12px',
                  background: 'var(--bg-subtle, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  <strong>Contact:</strong> {selectedLead.contactPerson || 'N/A'} |{' '}
                  <strong>Phone:</strong> {selectedLead.phone || 'N/A'}
                </span>
                <span className={`status-pill status-${(selectedLead.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedLead.status}
                </span>
              </div>
            )}
          </div>

          {/* Follow-up Title / Business Name */}
          <div className="form-group">
            <label className="form-label">
              Follow-up Title / Lead Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Building
                size={16}
                color="var(--text-light)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="e.g. Dr. Mahale Dental Clinic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Follow-up Stage / Subtitle */}
          <div className="form-group">
            <label className="form-label">Follow-up Sequence / Objective</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <select
                className="form-input form-select"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              >
                <option value="Follow-up #1">Follow-up #1 (Initial check-in)</option>
                <option value="Follow-up #2">Follow-up #2 (Value proposition)</option>
                <option value="Follow-up #3">Follow-up #3 (Pricing / Quote)</option>
                <option value="Demo Follow-up">Demo Follow-up</option>
                <option value="Contract Review">Contract Review</option>
                <option value="Final Check-in">Final Check-in</option>
                <option value="Custom">Custom Objective...</option>
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Or custom subtitle..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          {/* Due Date & Presets */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>When is this follow-up due?</span>
              <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Quick Presets:</span>
            </label>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`quick-filter-btn ${badgeType === 'today' ? 'active' : ''}`}
                onClick={() => applyPreset('today')}
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                ⚡ Today
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${badgeType === 'tomorrow' ? 'active' : ''}`}
                onClick={() => applyPreset('tomorrow')}
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                📅 Tomorrow
              </button>
              <button
                type="button"
                className="quick-filter-btn"
                onClick={() => applyPreset('in3days')}
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                +3 Days
              </button>
              <button
                type="button"
                className="quick-filter-btn"
                onClick={() => applyPreset('nextweek')}
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                Next Week
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              <input
                type="date"
                required
                className="form-input"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  const now = new Date().toISOString().split('T')[0];
                  if (e.target.value === now) {
                    setBadgeType('today');
                  } else {
                    setBadgeType('date');
                  }
                }}
              />
              <select
                className="form-input form-select"
                value={badgeType}
                onChange={(e) => setBadgeType(e.target.value)}
              >
                <option value="today">Urgent (Today)</option>
                <option value="tomorrow">Medium (Tomorrow)</option>
                <option value="date">Scheduled Date</option>
              </select>
            </div>
          </div>

          {/* Notes & Context */}
          <div className="form-group">
            <label className="form-label">Notes & Context (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Inquired about website speed and SEO redesign; send sample case studies."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Clock size={15} />
                  <span>{editingFollowUp ? 'Update Reminder' : 'Save Follow-up'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
