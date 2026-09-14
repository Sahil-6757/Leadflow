const Lead = require('../models/Lead');

const STATUS_CONFIG = [
  { label: 'New', color: '#3b82f6' },
  { label: 'Contacted', color: '#60a5fa' },
  { label: 'Replied', color: '#34d399' },
  { label: 'Interested', color: '#a78bfa' },
  { label: 'Won', color: '#fbbf24' },
  { label: 'Lost', color: '#f87171' },
  { label: 'No Response', color: '#94a3b8' },
  { label: 'Message Ready', color: '#ec4899' },
];

// @desc    Get dashboard KPI metrics & leads status distribution directly from MongoDB
// @route   GET /api/analytics/stats
exports.getStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    // Group leads by status using MongoDB aggregation
    const statusCounts = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    statusCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const contacted = countMap['Contacted'] || 0;
    const replied = countMap['Replied'] || 0;
    const interested = countMap['Interested'] || 0;
    const clients = countMap['Won'] || 0;

    // Build status breakdown for donut chart
    const knownLabels = new Set(STATUS_CONFIG.map((conf) => conf.label));
    const statusStats = STATUS_CONFIG.map((conf) => {
      const count = countMap[conf.label] || 0;
      const percent = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
      return {
        label: conf.label,
        count,
        percent,
        color: conf.color,
      };
    });

    // Also include any custom statuses in DB not in STATUS_CONFIG
    statusCounts.forEach((item) => {
      if (item._id && !knownLabels.has(item._id)) {
        const count = item.count || 0;
        const percent = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
        statusStats.push({
          label: item._id,
          count,
          percent,
          color: '#64748b',
        });
      }
    });

    const filteredStatusStats = statusStats.filter(
      (item) => item.count > 0 || ['New', 'Contacted', 'Replied', 'Interested', 'Won', 'Lost'].includes(item.label)
    );

    res.status(200).json({
      success: true,
      data: {
        kpi: {
          total: totalLeads,
          contacted,
          replied,
          interested,
          clients,
        },
        statusBreakdown: filteredStatusStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error computing stats',
      error: error.message,
    });
  }
};
