import React from 'react';
import { Send, Plus, MessageSquare, Calendar, Edit3 } from 'lucide-react';
import { RECENT_ACTIVITIES } from '../data/mockData';

export default function RecentActivity({ activities }) {
  const displayActivities = activities && activities.length > 0 ? activities : RECENT_ACTIVITIES;

  const getIcon = (type) => {
    switch (type) {
      case 'send':
        return <Send size={13} />;
      case 'plus':
        return <Plus size={14} />;
      case 'message':
        return <MessageSquare size={13} />;
      case 'calendar':
        return <Calendar size={13} />;
      case 'edit':
        return <Edit3 size={13} />;
      default:
        return <Send size={13} />;
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header-flex">
        <h2 className="card-heading">Recent Activity</h2>
      </div>

      <div className="activity-list">
        {displayActivities.map((act) => (
          <div key={act.id} className="activity-item">
            <div
              className="activity-icon-badge"
              style={{
                backgroundColor: act.iconBg,
                color: act.iconColor,
              }}
            >
              {getIcon(act.icon)}
            </div>

            <div>
              <div className="activity-title">{act.text}</div>
              <div className="activity-time">{act.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
