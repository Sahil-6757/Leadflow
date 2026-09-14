import React, { useState, useMemo } from 'react';
import './CalendarPage.css';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Handshake,
  FileText,
  Target,
  Search,
  Filter,
  Check,
  Mail,
  Sparkles,
  Edit2,
  Trash2,
  User,
  Building,
  Columns3,
  List,
  CalendarDays,
} from 'lucide-react';
import ScheduleEventModal from './ScheduleEventModal';

export default function CalendarPage({
  events = [],
  followups = [],
  leads = [],
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onToggleCompleteEvent,
  onOpenAiModal,
  onShowToast,
  onSendOutreach,
}) {
  // Current viewed Month & Year (Default to September 2026 to match mock data)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 14));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 8, 14));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'call' | 'followup' | 'meeting' | 'proposal' | 'milestone'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date(2026, 8, 14);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Month title e.g. "September 2026"
  const monthTitle = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Combined all events: custom events + followups transformed into calendar events
  const allEvents = useMemo(() => {
    const combined = [...events];

    // Map follow-ups into calendar events if not already present
    followups.forEach((f) => {
      const existing = combined.find((e) => e.followUpId === (f.id || f._id));
      if (!existing) {
        // Parse date from follow-up
        let eventDate = new Date(2026, 8, 14);
        if (f.dueDate) {
          eventDate = new Date(f.dueDate);
        } else if (f.badgeType === 'today') {
          eventDate = new Date(2026, 8, 14);
        } else if (f.badgeType === 'tomorrow') {
          eventDate = new Date(2026, 8, 15);
        } else if (f.badge === '15 Sep') {
          eventDate = new Date(2026, 8, 15);
        } else if (f.badge === '16 Sep') {
          eventDate = new Date(2026, 8, 16);
        }

        combined.push({
          id: `fu-${f.id || f._id}`,
          followUpId: f.id || f._id,
          title: `Follow-up: ${f.title}`,
          eventType: 'followup',
          date: eventDate,
          time: '11:00',
          duration: '30m',
          notes: f.subtitle || f.notes || 'Pipeline follow-up checkpoint',
          completed: !!f.completed,
          leadId: f.leadId,
          dotColor: '#ef4444',
          isFromFollowup: true,
        });
      }
    });

    return combined;
  }, [events, followups]);

  // Filtered by event category
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return allEvents;
    return allEvents.filter((e) => e.eventType === filterType);
  }, [allEvents, filterType]);

  // KPIs
  const kpis = useMemo(() => {
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth();

    const monthEvents = allEvents.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });

    const total = monthEvents.length;
    const calls = monthEvents.filter((e) => e.eventType === 'call' || e.eventType === 'meeting').length;
    const followupsCount = monthEvents.filter((e) => e.eventType === 'followup').length;
    const completed = monthEvents.filter((e) => e.completed).length;

    return { total, calls, followupsCount, completed };
  }, [allEvents, currentDate]);

  // Generate Month Grid Matrix
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const lastDate = new Date(year, month + 1, 0).getDate(); // 30, 31, etc.
    const prevLastDate = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let x = firstDayIndex; x > 0; x--) {
      const dayDate = new Date(year, month - 1, prevLastDate - x + 1);
      days.push({
        date: dayDate,
        dayNumber: prevLastDate - x + 1,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        dayNumber: i,
        isCurrentMonth: true,
      });
    }

    // Next month leading days to complete grid (multiples of 7)
    const remainingDays = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let j = 1; j <= remainingDays; j++) {
      const dayDate = new Date(year, month + 1, j);
      days.push({
        date: dayDate,
        dayNumber: j,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Compare if two dates are the same day
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const dt1 = new Date(d1);
    const dt2 = new Date(d2);
    return (
      dt1.getFullYear() === dt2.getFullYear() &&
      dt1.getMonth() === dt2.getMonth() &&
      dt1.getDate() === dt2.getDate()
    );
  };

  // Get events for a specific day
  const getEventsForDay = (dayDate) => {
    return filteredEvents.filter((e) => isSameDay(e.date, dayDate));
  };

  // Events for selected day (in side panel)
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter((e) => isSameDay(e.date, selectedDate));
  }, [filteredEvents, selectedDate]);

  // Selected date formatted
  const selectedDateFormatted = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Helper to match lead
  const getMatchedLead = (event) => {
    if (event.leadId) {
      const id = typeof event.leadId === 'object' ? event.leadId._id || event.leadId.id : event.leadId;
      const found = leads.find((l) => String(l.id || l._id) === String(id));
      if (found) return found;
    }
    return leads.find(
      (l) =>
        (l.businessName && event.title && event.title.toLowerCase().includes(l.businessName.toLowerCase())) ||
        (event.title && l.businessName && l.businessName.toLowerCase().includes(event.title.toLowerCase()))
    );
  };

  // Direct WhatsApp Handler
  const handleWhatsApp = (event) => {
    const lead = getMatchedLead(event);
    const phone = lead?.phone || '919876543210';
    const name = lead?.contactPerson || event.title;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const defaultMsg = `Hi ${name}, confirming our scheduled ${event.eventType || 'event'} '${event.title}' on ${new Date(
      event.date
    ).toLocaleDateString('en-GB')} at ${event.time || '10:00 AM'}. Looking forward to connecting!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (onSendOutreach && lead) {
      onSendOutreach('WhatsApp', lead, defaultMsg);
    }
    if (onShowToast) {
      onShowToast(`Opening WhatsApp for ${event.title} 💬`);
    }
  };

  // Direct Email Handler
  const handleEmail = (event) => {
    const lead = getMatchedLead(event);
    const email = lead?.email || 'contact@example.com';
    const name = lead?.contactPerson || event.title;

    const subject = `Calendar Confirmation: ${event.title} - LeadFlow`;
    const body = `Hi ${name},\n\nLooking forward to our scheduled ${event.eventType || 'session'} on ${new Date(
      event.date
    ).toLocaleDateString('en-GB')} at ${event.time || '10:00 AM'}.\n\nAgenda:\n${event.notes || 'Pipeline discussion'}\n\nBest regards,\nSahil Khan`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    if (onSendOutreach && lead) {
      onSendOutreach('Email', lead, body);
    }
    if (onShowToast) {
      onShowToast(`Opening email client for ${event.title} ✉️`);
    }
  };

  // AI Message Draft Handler
  const handleAiDraft = (event) => {
    const lead = getMatchedLead(event) || {
      businessName: event.title,
      type: 'General',
      id: event.id,
      notes: event.notes,
    };
    if (onOpenAiModal) {
      onOpenAiModal(lead);
    }
  };

  const today = new Date(2026, 8, 14);

  return (
    <div className="calendar-page-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-title-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 500 }}>
              Dashboard &bull; Pipeline Schedule
            </span>
          </div>
          <h1 className="calendar-title">
            Schedule & Calendar
            <span className="calendar-title-badge">{allEvents.length} Events</span>
          </h1>
          <p className="calendar-subtitle">
            Plan outreach calls, pitch demos, client meetings, and pipeline checkpoints in one unified schedule.
          </p>
        </div>

        <div className="calendar-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingEvent(null);
              setIsScheduleModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={16} />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="calendar-kpi-grid">
        <div className="calendar-kpi-card events">
          <div className="calendar-kpi-icon">
            <CalendarIcon size={22} />
          </div>
          <div className="calendar-kpi-content">
            <span className="calendar-kpi-value">{kpis.total}</span>
            <span className="calendar-kpi-label">This Month</span>
            <span className="calendar-kpi-meta">Scheduled activities</span>
          </div>
        </div>

        <div className="calendar-kpi-card calls">
          <div className="calendar-kpi-icon">
            <PhoneCall size={22} />
          </div>
          <div className="calendar-kpi-content">
            <span className="calendar-kpi-value">{kpis.calls}</span>
            <span className="calendar-kpi-label">Calls & Demos</span>
            <span className="calendar-kpi-meta">Pitch sessions booked</span>
          </div>
        </div>

        <div className="calendar-kpi-card followups">
          <div className="calendar-kpi-icon">
            <MessageSquare size={22} />
          </div>
          <div className="calendar-kpi-content">
            <span className="calendar-kpi-value">{kpis.followupsCount}</span>
            <span className="calendar-kpi-label">Follow-ups</span>
            <span className="calendar-kpi-meta">Pending checkpoints</span>
          </div>
        </div>

        <div className="calendar-kpi-card completed">
          <div className="calendar-kpi-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="calendar-kpi-content">
            <span className="calendar-kpi-value">{kpis.completed}</span>
            <span className="calendar-kpi-label">Completed</span>
            <span className="calendar-kpi-meta">Milestones accomplished</span>
          </div>
        </div>
      </div>

      {/* Control Navigation Bar: Month Navigation + Filter Categories + View Switcher */}
      <div className="calendar-controls-card">
        {/* Month Navigation */}
        <div className="calendar-nav-group">
          <div className="calendar-month-title">{monthTitle}</div>
          <div className="calendar-nav-btns">
            <button className="calendar-nav-btn" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="calendar-nav-btn" onClick={nextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="calendar-today-btn" onClick={goToToday}>
            Today
          </button>
        </div>

        {/* Filter by Category */}
        <div className="calendar-filter-types">
          <button
            className={`calendar-type-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Categories
          </button>
          <button
            className={`calendar-type-pill ${filterType === 'call' ? 'active' : ''}`}
            onClick={() => setFilterType('call')}
          >
            <span className="calendar-pill-dot" style={{ backgroundColor: '#2563eb' }} />
            Calls / Demos
          </button>
          <button
            className={`calendar-type-pill ${filterType === 'followup' ? 'active' : ''}`}
            onClick={() => setFilterType('followup')}
          >
            <span className="calendar-pill-dot" style={{ backgroundColor: '#ef4444' }} />
            Follow-ups
          </button>
          <button
            className={`calendar-type-pill ${filterType === 'meeting' ? 'active' : ''}`}
            onClick={() => setFilterType('meeting')}
          >
            <span className="calendar-pill-dot" style={{ backgroundColor: '#10b981' }} />
            Meetings
          </button>
          <button
            className={`calendar-type-pill ${filterType === 'proposal' ? 'active' : ''}`}
            onClick={() => setFilterType('proposal')}
          >
            <span className="calendar-pill-dot" style={{ backgroundColor: '#f59e0b' }} />
            Proposals
          </button>
        </div>

        {/* View Switcher */}
        <div className="followups-view-switch">
          <button
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <CalendarDays size={14} />
            <span>Month</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <Columns3 size={14} />
            <span>Week</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'agenda' ? 'active' : ''}`}
            onClick={() => setViewMode('agenda')}
          >
            <List size={14} />
            <span>Agenda</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Calendar Main View (Left) + Day Agenda Panel (Right) */}
      <div className="calendar-split-layout">
        {/* Left Column: Calendar Views */}
        <div className="calendar-main-card">
          {viewMode === 'month' ? (
            /* Month Grid View */
            <div className="month-grid-table">
              <div className="month-weekdays-row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="weekday-header">
                    {day}
                  </div>
                ))}
              </div>

              <div className="month-days-grid">
                {monthDays.map((d, index) => {
                  const isCurrentDay = isSameDay(d.date, today);
                  const isSelected = isSameDay(d.date, selectedDate);
                  const dayEvents = getEventsForDay(d.date);

                  return (
                    <div
                      key={index}
                      className={`month-day-cell ${!d.isCurrentMonth ? 'other-month' : ''} ${
                        isCurrentDay ? 'is-today' : ''
                      } ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedDate(d.date)}
                      onDoubleClick={() => {
                        setSelectedDate(d.date);
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      <div className="day-cell-top">
                        <span className="day-number-badge">{d.dayNumber}</span>
                        {dayEvents.length > 0 && (
                          <span className="day-event-count">{dayEvents.length}</span>
                        )}
                      </div>

                      <div className="day-events-stack">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`calendar-event-pill type-${ev.eventType} ${
                              ev.completed ? 'is-completed' : ''
                            }`}
                            title={`${ev.time || '10:00'} - ${ev.title}`}
                          >
                            <span>{ev.time ? ev.time.slice(0, 5) : '10:00'}</span>
                            <span style={{ fontWeight: 500 }}>{ev.title}</span>
                          </div>
                        ))}

                        {dayEvents.length > 2 && (
                          <span className="more-events-indicator">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'week' ? (
            /* Week View */
            <div className="calendar-week-grid">
              {Array.from({ length: 7 }).map((_, i) => {
                const weekStart = new Date(selectedDate);
                weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                const dayEvents = getEventsForDay(weekStart);
                const isCurrent = isSameDay(weekStart, today);

                return (
                  <div
                    key={i}
                    className={`week-col ${isCurrent ? 'is-today' : ''}`}
                    onClick={() => setSelectedDate(weekStart)}
                  >
                    <div className="week-col-header">
                      <div className="week-col-dayname">
                        {weekStart.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="week-col-daynum">{weekStart.getDate()}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className={`calendar-event-pill type-${ev.eventType} ${
                            ev.completed ? 'is-completed' : ''
                          }`}
                          style={{ padding: '6px 8px', borderRadius: '6px' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>
                              {ev.time || '10:00'}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '11.5px' }}>{ev.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Agenda Timeline View */
            <div className="calendar-timeline-view">
              {filteredEvents.length === 0 ? (
                <div className="agenda-empty-state">
                  <CalendarIcon size={32} color="var(--text-muted)" />
                  <p>No scheduled events matching this filter.</p>
                </div>
              ) : (
                filteredEvents
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((ev) => (
                    <div key={ev.id} className="agenda-event-item">
                      <div className="agenda-event-top">
                        <span className={`agenda-event-badge type-${ev.eventType}`}>
                          {ev.eventType}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)' }}>
                          {new Date(ev.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          &bull; {ev.time || '10:00'}
                        </span>
                      </div>
                      <div className="agenda-event-title">{ev.title}</div>
                      {ev.notes && <div className="agenda-event-notes">{ev.notes}</div>}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Day Agenda Side Panel */}
        <div className="calendar-agenda-card">
          <div className="agenda-header">
            <div>
              <h3 className="agenda-date-title">{selectedDateFormatted}</h3>
              <p className="agenda-date-sub">
                {selectedDayEvents.length} event{selectedDayEvents.length === 1 ? '' : 's'} scheduled
              </p>
            </div>

            <button
              className="agenda-add-btn"
              onClick={() => {
                setEditingEvent(null);
                setIsScheduleModalOpen(true);
              }}
              title="Add event for this date"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="agenda-events-list">
            {selectedDayEvents.length === 0 ? (
              <div className="agenda-empty-state">
                <CalendarIcon size={30} color="var(--text-muted)" />
                <p style={{ margin: 0, fontWeight: 600 }}>No events scheduled</p>
                <span style={{ fontSize: '11.5px' }}>
                  Click '+' above to plan a demo call, meeting, or follow-up.
                </span>
              </div>
            ) : (
              selectedDayEvents.map((ev) => {
                const lead = getMatchedLead(ev);
                const isDone = !!ev.completed;

                return (
                  <div
                    key={ev.id}
                    className={`agenda-event-item ${isDone ? 'is-completed' : ''}`}
                  >
                    <div className="agenda-event-top">
                      <span className={`agenda-event-badge type-${ev.eventType}`}>
                        {ev.eventType}
                      </span>

                      <button
                        type="button"
                        className={`custom-checkbox-btn ${isDone ? 'checked' : ''}`}
                        style={{ width: '20px', height: '20px' }}
                        onClick={() =>
                          onToggleCompleteEvent && onToggleCompleteEvent(ev.id || ev._id)
                        }
                        title={isDone ? 'Mark Pending' : 'Mark Completed'}
                      >
                        <Check size={12} />
                      </button>
                    </div>

                    <div>
                      <div
                        className="agenda-event-title"
                        style={{ textDecoration: isDone ? 'line-through' : 'none' }}
                      >
                        {ev.title}
                      </div>
                      <div className="agenda-event-meta">
                        <Clock size={12} />
                        <span>
                          {ev.time || '10:00 AM'} ({ev.duration || '30m'})
                        </span>
                        {lead?.contactPerson && (
                          <span>&bull; {lead.contactPerson}</span>
                        )}
                      </div>
                    </div>

                    {ev.notes && <div className="agenda-event-notes">{ev.notes}</div>}

                    <div className="agenda-event-footer">
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        {lead?.businessName || 'General Event'}
                      </span>

                      <div className="followup-actions-wrap">
                        <button
                          type="button"
                          className="followup-act-btn whatsapp"
                          style={{ width: '25px', height: '25px' }}
                          onClick={() => handleWhatsApp(ev)}
                          title="WhatsApp Confirmation"
                        >
                          <MessageSquare size={12} />
                        </button>
                        <button
                          type="button"
                          className="followup-act-btn email"
                          style={{ width: '25px', height: '25px' }}
                          onClick={() => handleEmail(ev)}
                          title="Email Reminder"
                        >
                          <Mail size={12} />
                        </button>
                        <button
                          type="button"
                          className="followup-act-btn ai"
                          style={{ width: '25px', height: '25px' }}
                          onClick={() => handleAiDraft(ev)}
                          title="AI Draft"
                        >
                          <Sparkles size={12} />
                        </button>
                        <button
                          type="button"
                          className="followup-act-btn"
                          style={{ width: '25px', height: '25px' }}
                          onClick={() => {
                            setEditingEvent(ev);
                            setIsScheduleModalOpen(true);
                          }}
                          title="Edit Event"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          className="followup-act-btn danger"
                          style={{ width: '25px', height: '25px' }}
                          onClick={() => onDeleteEvent && onDeleteEvent(ev.id || ev._id)}
                          title="Delete Event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Schedule / Edit Modal */}
      <ScheduleEventModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={async (payload, id) => {
          if (id) {
            if (onUpdateEvent) await onUpdateEvent(id, payload);
          } else {
            if (onCreateEvent) await onCreateEvent(payload);
          }
        }}
        leads={leads}
        editingEvent={editingEvent}
        initialDate={selectedDate}
      />
    </div>
  );
}
