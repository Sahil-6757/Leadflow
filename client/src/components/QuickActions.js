import React from 'react';
import { Plus, Sparkles, Calendar, Upload } from 'lucide-react';

export default function QuickActions({
  onAddLead,
  onGenerateMessage,
  onViewFollowups,
  onImportLeads
}) {
  const actions = [
    {
      id: 'add',
      title: 'Add New Lead',
      desc: 'Save a new business lead',
      icon: Plus,
      iconBg: '#2563eb',
      iconColor: '#ffffff',
      onClick: onAddLead
    },
    {
      id: 'generate',
      title: 'Generate Message',
      desc: 'Create AI-powered message',
      icon: Sparkles,
      iconBg: '#8b5cf6',
      iconColor: '#ffffff',
      onClick: onGenerateMessage
    },
    {
      id: 'followups',
      title: 'View Follow-ups',
      desc: 'Check upcoming follow-ups',
      icon: Calendar,
      iconBg: '#10b981',
      iconColor: '#ffffff',
      onClick: onViewFollowups
    },
    {
      id: 'import',
      title: 'Import Leads',
      desc: 'Upload from CSV file',
      icon: Upload,
      iconBg: '#f59e0b',
      iconColor: '#ffffff',
      onClick: onImportLeads
    }
  ];

  return (
    <div className="dashboard-card">
      <div>
        <h2 className="card-heading">Quick Actions</h2>
        <p className="card-subheading">Common tasks to manage your outreach.</p>
      </div>

      <div className="quick-actions-grid">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              className="action-tile"
              onClick={act.onClick}
            >
              <div
                className="action-tile-icon"
                style={{ backgroundColor: act.iconBg, color: act.iconColor }}
              >
                <Icon size={17} strokeWidth={2.2} />
              </div>
              <div>
                <div className="action-tile-title">{act.title}</div>
                <div className="action-tile-desc">{act.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
