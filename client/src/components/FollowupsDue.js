import React, { useMemo } from 'react';
import { Check, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { computeDueInfo } from '../utils/dateUtils';

export default function FollowupsDue({
  followups = [],
  leads = [],
  onToggleComplete,
  onViewAll,
  onWhatsAppClick,
  onEmailClick,
}) {
  // Compute active follow-up dues dynamically from real data
  const activeDues = useMemo(() => {
    let rawItems = [];

    if (followups && followups.length > 0) {
      // Filter out completed follow-ups
      rawItems = followups.filter((f) => !f.completed);
    } else if (leads && leads.length > 0) {
      // Fallback: derive follow-ups directly from real leads
      rawItems = leads
        .filter((l) => l.nextFollowUp && l.status !== 'Won' && l.status !== 'Lost')
        .map((l) => ({
          id: l.id || l._id,
          title: l.businessName,
          subtitle: `${l.contactPerson || l.type}`,
          dueDate: l.nextFollowUp,
          completed: false,
          leadId: l,
        }));
    }

    // Enrich each item with real-time due status
    const enriched = rawItems.map((item) => {
      const dueInfo = computeDueInfo(item.dueDate, item.completed);
      // Link with lead if available
      let matchedLead = null;
      if (item.leadId && typeof item.leadId === 'object') {
        matchedLead = item.leadId;
      } else if (item.leadId && leads.length > 0) {
        matchedLead = leads.find((l) => String(l.id || l._id) === String(item.leadId));
      } else if (leads.length > 0) {
        matchedLead = leads.find(
          (l) => (l.businessName || '').trim().toLowerCase() === (item.title || '').trim().toLowerCase()
        );
      }

      return {
        ...item,
        badge: dueInfo.badge,
        badgeType: dueInfo.badgeType,
        dotColor: dueInfo.dotColor,
        urgencyRank: dueInfo.urgencyRank,
        matchedLead,
      };
    });

    // Sort by urgency: Overdue (1), Due Today (2), Tomorrow (3), Upcoming (4)
    enriched.sort((a, b) => {
      if (a.urgencyRank !== b.urgencyRank) {
        return a.urgencyRank - b.urgencyRank;
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return enriched;
  }, [followups, leads]);

  const overdueCount = activeDues.filter((d) => d.badgeType === 'overdue').length;
  const todayCount = activeDues.filter((d) => d.badgeType === 'today').length;

  return (
    <div className="dashboard-card">
      <div className="card-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="card-heading">Follow-ups Due</h2>
          {activeDues.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '12px',
                backgroundColor: overdueCount > 0 ? '#fee2e2' : todayCount > 0 ? '#fef3c7' : 'var(--bg-subtle)',
                color: overdueCount > 0 ? '#ef4444' : todayCount > 0 ? '#d97706' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              {activeDues.length}
            </span>
          )}
        </div>
        <button className="card-link-btn" onClick={onViewAll}>
          <span>View All</span>
          <ArrowRight size={13} style={{ marginLeft: '3px' }} />
        </button>
      </div>

      {activeDues.length === 0 ? (
        <div
          style={{
            padding: '28px 16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            All caught up!
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', maxWidth: '220px' }}>
            No follow-ups due right now. You're on top of all your scheduled touches.
          </div>
          <button
            className="btn btn-outline"
            style={{ marginTop: '8px', fontSize: '11.5px', padding: '5px 12px' }}
            onClick={onViewAll}
          >
            View Schedule
          </button>
        </div>
      ) : (
        <div className="followups-list">
          {activeDues.map((item) => {
            const itemId = item.id || item._id;
            const lead = item.matchedLead;

            return (
              <div key={itemId} className="followup-item">
                <div className="followup-left">
                  <span
                    className="dot-indicator"
                    style={{ backgroundColor: item.dotColor }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="followup-name" title={item.title}>
                      {item.title}
                    </div>
                    <div className="followup-sub">
                      {lead ? (
                        <span>
                          {lead.contactPerson ? `${lead.contactPerson} • ` : ''}
                          {lead.type || item.subtitle}
                        </span>
                      ) : (
                        item.subtitle
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span className={`due-pill ${item.badgeType}`}>
                    {item.badge}
                  </span>

                  {/* Quick Action: WhatsApp */}
                  {onWhatsAppClick && lead && (
                    <button
                      className="followup-quick-btn whatsapp"
                      title={`Send WhatsApp message to ${item.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onWhatsAppClick(lead);
                      }}
                    >
                      <MessageCircle size={13} />
                    </button>
                  )}

                  {/* Quick Action: Mark Done */}
                  {onToggleComplete && (
                    <button
                      className="followup-quick-btn complete"
                      title="Mark follow-up completed"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(itemId);
                      }}
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
