import React, { useState, useMemo } from 'react';
import { STATUS_STATS } from '../data/mockData';

// Standard status palette and configurations
const STATUS_CONFIGS = [
  { label: 'New', color: '#3b82f6' },
  { label: 'Contacted', color: '#2563eb' },
  { label: 'Replied', color: '#10b981' },
  { label: 'Interested', color: '#8b5cf6' },
  { label: 'Message Ready', color: '#ec4899' },
  { label: 'Won', color: '#f59e0b' },
  { label: 'Lost', color: '#ef4444' },
  { label: 'No Response', color: '#94a3b8' },
];

const FALLBACK_COLORS = ['#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function LeadsDonutChart({
  leads = null,
  stats = null,
  onSelectStatus = null,
}) {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Compute dynamic stats from `leads` if provided, otherwise fallback to `stats` prop or mock data
  const { total, items } = useMemo(() => {
    if (Array.isArray(leads)) {
      const totalCount = leads.length;
      const countMap = {};

      leads.forEach((l) => {
        const rawStatus = l && l.status ? String(l.status).trim() : 'New';
        countMap[rawStatus] = (countMap[rawStatus] || 0) + 1;
      });

      // Map standard statuses
      const mapped = STATUS_CONFIGS.map((cfg) => {
        const count = countMap[cfg.label] || 0;
        const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return {
          label: cfg.label,
          count,
          percent,
          color: cfg.color,
        };
      });

      // Check for any unconfigured status that exists in leads
      let colorIdx = 0;
      Object.keys(countMap).forEach((stKey) => {
        if (!STATUS_CONFIGS.some((c) => c.label.toLowerCase() === stKey.toLowerCase())) {
          const count = countMap[stKey];
          const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          mapped.push({
            label: stKey,
            count,
            percent,
            color: FALLBACK_COLORS[colorIdx % FALLBACK_COLORS.length],
          });
          colorIdx++;
        }
      });

      // If there are statuses with count > 0, show active ones plus primary pipeline stages with count >= 0
      const withCounts = mapped.filter((item) => item.count > 0);
      let finalItems;
      if (withCounts.length > 0) {
        // Show all statuses that have leads, plus key pipeline stages if list is short
        const activeLabels = new Set(withCounts.map((i) => i.label));
        const keyStages = ['New', 'Contacted', 'Replied', 'Interested', 'Won'].filter((k) => !activeLabels.has(k));
        const supplemental = mapped.filter((i) => keyStages.includes(i.label));
        finalItems = [...withCounts, ...supplemental.slice(0, Math.max(0, 6 - withCounts.length))];
      } else {
        finalItems = mapped.filter((item) => ['New', 'Contacted', 'Replied', 'Interested', 'Won', 'Lost'].includes(item.label));
      }

      return {
        total: totalCount,
        items: finalItems,
      };
    }

    // If leads not provided, use stats prop or default mock
    const fallbackStats = stats || STATUS_STATS;
    const computedTotal = fallbackStats.reduce((acc, curr) => acc + (curr.count || 0), 0);
    return {
      total: computedTotal,
      items: fallbackStats,
    };
  }, [leads, stats]);

  // SVG Donut dimensions
  const size = 135;
  const strokeWidth = 17;
  const radius = (size - strokeWidth) / 2; // ~59
  const circumference = 2 * Math.PI * radius;

  // Active slices with count > 0
  const activeSlices = items.filter((item) => item.count > 0);

  // Accumulated offset for donut slices
  let accumulated = 0;

  // Determine currently active hover item
  const hoveredItem = hoveredStatus ? items.find((i) => i.label === hoveredStatus) : null;

  return (
    <div className="dashboard-card leads-by-status-card">
      <div className="card-header-flex" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="card-heading">Leads by Status</h2>
          <span className="live-status-pill" title="Dynamic real-time leads breakdown">
            <span className="live-status-dot" />
            Live
          </span>
        </div>
        {onSelectStatus && (
          <button
            type="button"
            className="chart-view-all-btn"
            onClick={() => onSelectStatus('All')}
            title="View all leads"
          >
            View All →
          </button>
        )}
      </div>

      <div className="donut-chart-container">
        {/* SVG Donut Chart */}
        <div className="donut-chart-svg-wrap">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle track when 0 leads or subtle base ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--donut-track, #e2e8f0)"
              strokeWidth={strokeWidth}
              opacity={total === 0 ? 0.8 : 0.25}
            />

            {total > 0 && (
              <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                {activeSlices.map((item) => {
                  const slicePercent = item.count / total;
                  const sliceLength = slicePercent * circumference;
                  const gap = activeSlices.length > 1 ? 1.5 : 0;
                  const visibleLength = Math.max(0, sliceLength - gap);
                  const strokeDasharray = `${visibleLength} ${circumference - visibleLength}`;
                  const strokeDashoffset = -accumulated;
                  accumulated += sliceLength;

                  const isHovered = hoveredStatus === item.label;

                  return (
                    <circle
                      key={item.label}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      onMouseEnter={() => setHoveredStatus(item.label)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      onClick={() => onSelectStatus && onSelectStatus(item.label)}
                      style={{
                        transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                        cursor: 'pointer',
                        opacity: hoveredStatus && !isHovered ? 0.45 : 1,
                      }}
                    >
                      <title>{`${item.label}: ${item.count} (${item.percent}%) - Click to filter`}</title>
                    </circle>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Center Label (Dynamic & Interactive) */}
          <div className="donut-center-label">
            <div
              className="donut-center-num"
              style={{
                color: hoveredItem ? hoveredItem.color : 'var(--text-primary)',
                transition: 'color 0.2s ease',
              }}
            >
              {hoveredItem ? hoveredItem.count : total}
            </div>
            <div className="donut-center-sub">
              {hoveredItem ? `${hoveredItem.label} (${hoveredItem.percent}%)` : 'Total Leads'}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {items.map((item) => {
            const isHovered = hoveredStatus === item.label;
            return (
              <div
                key={item.label}
                className={`legend-item ${isHovered ? 'legend-item-hovered' : ''}`}
                onMouseEnter={() => setHoveredStatus(item.label)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => onSelectStatus && onSelectStatus(item.label)}
                title={`Click to filter leads by ${item.label}`}
                style={{
                  cursor: onSelectStatus ? 'pointer' : 'default',
                  opacity: hoveredStatus && !isHovered ? 0.5 : 1,
                  transition: 'opacity 0.2s ease, background-color 0.15s ease',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  backgroundColor: isHovered ? 'var(--bg-subtle, rgba(0,0,0,0.04))' : 'transparent',
                }}
              >
                <div className="legend-left">
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: isHovered ? `0 0 6px ${item.color}` : 'none',
                      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  />
                  <span style={{ fontWeight: isHovered ? 600 : 400 }}>{item.label}</span>
                </div>
                <span className="legend-val">
                  {item.count}{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px' }}>
                    ({item.percent}%)
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
