import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Building, PhoneCall, MessageSquare, Handshake, FileText, Target } from 'lucide-react';

export default function ScheduleEventModal({
  isOpen,
  onClose,
  onSave,
  leads = [],
  editingEvent = null,
  initialDate = null,
}) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('call'); // 'call' | 'followup' | 'meeting' | 'proposal' | 'milestone'
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30m');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date helper
  const formatDateForInput = (d) => {
    const dt = new Date(d);
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${month}-${day}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setEventType(editingEvent.eventType || 'call');
      setDate(editingEvent.date ? formatDateForInput(editingEvent.date) : formatDateForInput(new Date()));
      setTime(editingEvent.time || '10:00');
      setDuration(editingEvent.duration || '30m');
      setPriority(editingEvent.priority || 'medium');
      setNotes(editingEvent.notes || '');

      if (editingEvent.leadId) {
        const id = typeof editingEvent.leadId === 'object' ? editingEvent.leadId._id : editingEvent.leadId;
        setSelectedLeadId(id || '');
      } else {
        const matched = leads.find((l) => (l.businessName || '').toLowerCase() === (editingEvent.title || '').toLowerCase());
        setSelectedLeadId(matched ? matched.id || matched._id : '');
      }
    } else {
      setSelectedLeadId('');
      setTitle('');
      setEventType('call');
      setDate(initialDate ? formatDateForInput(initialDate) : formatDateForInput(new Date(2026, 8, 14)));
      setTime('10:00');
      setDuration('30m');
      setPriority('medium');
      setNotes('');
    }
  }, [isOpen, editingEvent, initialDate, leads]);

  if (!isOpen) return null;

  const handleLeadSelect = (e) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);
    if (leadId) {
      const lead = leads.find((l) => String(l.id || l._id) === String(leadId));
      if (lead) {
        if (!title || title.trim() === '') {
          setTitle(`${eventType === 'call' ? 'Demo Call with' : 'Meeting with'} ${lead.businessName}`);
        }
        if (lead.notes && !notes) {
          setNotes(`Context: ${lead.notes.slice(0, 120)}`);
        }
      }
    }
  };

  const getEventBadgeColor = (type) => {
    switch (type) {
      case 'call':
        return { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' };
      case 'followup':
        return { bg: '#fee2e2', color: '#ef4444', dot: '#ef4444' };
      case 'meeting':
        return { bg: '#ecfdf5', color: '#10b981', dot: '#10b981' };
      case 'proposal':
        return { bg: '#fef3c7', color: '#d97706', dot: '#f59e0b' };
      case 'milestone':
        return { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6' };
      default:
        return { bg: '#f1f5f9', color: '#475569', dot: '#64748b' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      const colors = getEventBadgeColor(eventType);
      const payload = {
        title: title.trim(),
        eventType,
        date: new Date(date),
        time,
        duration,
        priority,
        notes: notes.trim(),
        leadId: selectedLeadId || undefined,
        dotColor: colors.dot,
        completed: editingEvent?.completed || false,
      };

      await onSave(payload, editingEvent?.id || editingEvent?._id);
      onClose();
    } catch (err) {
      console.error('Failed to save event:', err);
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
                {editingEvent ? 'Edit Calendar Event' : 'Schedule New Event / Call'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)' }}>
                Set dates, demo pitches, client meetings, or pipeline touchpoints
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Event Type Pills */}
          <div className="form-group">
            <label className="form-label">Event Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                className={`quick-filter-btn ${eventType === 'call' ? 'active' : ''}`}
                onClick={() => setEventType('call')}
                style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PhoneCall size={13} />
                <span>Demo Call</span>
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${eventType === 'followup' ? 'active' : ''}`}
                onClick={() => setEventType('followup')}
                style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <MessageSquare size={13} />
                <span>Follow-up</span>
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${eventType === 'meeting' ? 'active' : ''}`}
                onClick={() => setEventType('meeting')}
                style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Handshake size={13} />
                <span>Meeting</span>
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${eventType === 'proposal' ? 'active' : ''}`}
                onClick={() => setEventType('proposal')}
                style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FileText size={13} />
                <span>Proposal</span>
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${eventType === 'milestone' ? 'active' : ''}`}
                onClick={() => setEventType('milestone')}
                style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Target size={13} />
                <span>Milestone</span>
              </button>
            </div>
          </div>

          {/* Associate with Lead */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="var(--primary-blue)" />
              Related Lead (Optional)
            </label>
            <select
              className="form-input form-select"
              value={selectedLeadId}
              onChange={handleLeadSelect}
            >
              <option value="">-- Associate with a Lead or enter custom title below --</option>
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

          {/* Event Title */}
          <div className="form-group">
            <label className="form-label">
              Event Title <span style={{ color: '#ef4444' }}>*</span>
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
                placeholder="e.g. Website Pitch Call with Dr. Mahale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="form-group">
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label className="form-label">Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Duration</label>
                <select
                  className="form-input form-select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="15m">15 mins</option>
                  <option value="30m">30 mins</option>
                  <option value="45m">45 mins</option>
                  <option value="1h">1 hour</option>
                  <option value="2h">2 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="priority"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>High Urgency</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginLeft: '12px' }}>
                <input
                  type="radio"
                  name="priority"
                  checked={priority === 'medium'}
                  onChange={() => setPriority('medium')}
                />
                <span style={{ color: '#d97706', fontWeight: 600 }}>Medium</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginLeft: '12px' }}>
                <input
                  type="radio"
                  name="priority"
                  checked={priority === 'normal'}
                  onChange={() => setPriority('normal')}
                />
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>Normal</span>
              </label>
            </div>
          </div>

          {/* Agenda / Notes */}
          <div className="form-group">
            <label className="form-label">Agenda / Key Topics (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Review current Google business listing, propose website redesign & SEO package, discuss timeline."
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
              disabled={isSubmitting || !title.trim() || !date}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Clock size={15} />
                  <span>{editingEvent ? 'Update Event' : 'Schedule Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
