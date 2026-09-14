import React from 'react';
import {
  FileText,
  Send,
  MessageSquare,
  Star,
  User,
  ArrowUp
} from 'lucide-react';

export default function KpiMetrics({ stats = {} }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Leads',
      value: stats.total ?? 124,
      trend: '12%',
      subtext: 'All time leads',
      icon: FileText,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      id: 'contacted',
      title: 'Contacted',
      value: stats.contacted ?? 38,
      trend: '8%',
      subtext: 'Messages sent',
      icon: Send,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      id: 'replied',
      title: 'Replied',
      value: stats.replied ?? 12,
      trend: '20%',
      subtext: 'Positive responses',
      icon: MessageSquare,
      iconBg: '#ecfdf5',
      iconColor: '#10b981',
    },
    {
      id: 'interested',
      title: 'Interested',
      value: stats.interested ?? 9,
      trend: '50%',
      subtext: 'Potential clients',
      icon: Star,
      iconBg: '#fffbeb',
      iconColor: '#f59e0b',
    },
    {
      id: 'clients',
      title: 'Clients',
      value: stats.clients ?? 7,
      trend: '40%',
      subtext: 'Projects won',
      icon: User,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
    }
  ];

  return (
    <div className="kpi-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className="kpi-card">
            <div className="kpi-card-header-flex">
              <div
                className="kpi-icon-box"
                style={{ backgroundColor: c.iconBg, color: c.iconColor }}
              >
                <Icon size={19} />
              </div>
              <div className="kpi-content-block">
                <div className="kpi-title">{c.title}</div>
                <div className="kpi-number-row">
                  <span className="kpi-big-number">{c.value}</span>
                  <span className="kpi-trend">
                    <ArrowUp size={12} strokeWidth={2.5} />
                    {c.trend}
                  </span>
                </div>
              </div>
            </div>

            <div className="kpi-subtext">{c.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}
