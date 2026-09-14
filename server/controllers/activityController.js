const Activity = require('../models/Activity');

// @desc    Get recent activities
// @route   GET /api/activities
exports.getActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving activities',
      error: error.message,
    });
  }
};

// @desc    Create activity
// @route   POST /api/activities
exports.createActivity = async (req, res) => {
  try {
    const { icon, iconBg, iconColor, text, time } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const activity = await Activity.create({
      icon: icon || 'plus',
      iconBg: iconBg || '#eff6ff',
      iconColor: iconColor || '#2563eb',
      text,
      time: time || 'Just now',
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to record activity',
      error: error.message,
    });
  }
};
