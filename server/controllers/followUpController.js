const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { computeDueInfo, parseDateInput } = require('../utils/followUpUtils');

// @desc    Get all follow-ups (enriched with real-time due status)
// @route   GET /api/followups
exports.getFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find().populate('leadId').sort({ dueDate: 1, createdAt: -1 });

    // Dynamically calculate live badge & status for every follow-up based on current date
    const enriched = followUps.map((item) => {
      const dueInfo = computeDueInfo(item.dueDate, item.completed);
      const json = item.toJSON();
      return {
        ...json,
        badge: dueInfo.badge,
        badgeType: dueInfo.badgeType,
        dotColor: dueInfo.dotColor,
        diffDays: dueInfo.diffDays,
        isOverdue: dueInfo.isOverdue,
        urgencyRank: dueInfo.urgencyRank,
      };
    });

    // Sort: Overdue first, then Today, Tomorrow, Upcoming, and Completed last
    enriched.sort((a, b) => {
      if (a.urgencyRank !== b.urgencyRank) {
        return a.urgencyRank - b.urgencyRank;
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving follow-ups',
      error: error.message,
    });
  }
};

// @desc    Create follow-up
// @route   POST /api/followups
exports.createFollowUp = async (req, res) => {
  try {
    const { title, subtitle, dueDate, leadId, notes, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const parsedDue = parseDateInput(dueDate);
    const dueInfo = computeDueInfo(parsedDue, false);

    const followUp = await FollowUp.create({
      title: title.trim(),
      subtitle: subtitle || 'Follow-up #1',
      badge: dueInfo.badge,
      badgeType: dueInfo.badgeType,
      dotColor: dueInfo.dotColor,
      dueDate: parsedDue,
      leadId: leadId || undefined,
      notes: notes || '',
      priority: priority || 'medium',
      completed: false,
    });

    // Sync corresponding lead's nextFollowUp if leadId is linked
    if (leadId) {
      const formattedDate = parsedDue.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      await Lead.findByIdAndUpdate(leadId, { nextFollowUp: formattedDate });
    }

    await Activity.create({
      icon: 'calendar',
      iconBg: '#fff1f2',
      iconColor: '#f43f5e',
      text: `Follow-up scheduled for ${title} (${dueInfo.badge})`,
      time: 'Just now',
    });

    const enriched = {
      ...followUp.toJSON(),
      ...dueInfo,
    };

    res.status(201).json({
      success: true,
      data: enriched,
      message: 'Follow-up created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create follow-up',
      error: error.message,
    });
  }
};

// @desc    Update follow-up
// @route   PATCH /api/followups/:id
exports.updateFollowUp = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.dueDate) {
      updates.dueDate = parseDateInput(updates.dueDate);
      const dueInfo = computeDueInfo(updates.dueDate, updates.completed);
      updates.badge = dueInfo.badge;
      updates.badgeType = dueInfo.badgeType;
      updates.dotColor = dueInfo.dotColor;
    } else if (typeof updates.completed === 'boolean') {
      const existing = await FollowUp.findById(req.params.id);
      if (existing) {
        const dueInfo = computeDueInfo(existing.dueDate, updates.completed);
        updates.badge = dueInfo.badge;
        updates.badgeType = dueInfo.badgeType;
        updates.dotColor = dueInfo.dotColor;
      }
    }

    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('leadId');

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found',
      });
    }

    // Sync corresponding lead's nextFollowUp if linked
    if (followUp.leadId) {
      const leadId = typeof followUp.leadId === 'object' ? followUp.leadId._id : followUp.leadId;
      if (followUp.completed) {
        await Lead.findByIdAndUpdate(leadId, { nextFollowUp: 'Completed' });
      } else if (followUp.dueDate) {
        const formattedDate = new Date(followUp.dueDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        await Lead.findByIdAndUpdate(leadId, { nextFollowUp: formattedDate });
      }
    }

    const dueInfo = computeDueInfo(followUp.dueDate, followUp.completed);
    const enriched = {
      ...followUp.toJSON(),
      ...dueInfo,
    };

    res.status(200).json({
      success: true,
      data: enriched,
      message: 'Follow-up updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update follow-up',
      error: error.message,
    });
  }
};

// @desc    Delete follow-up
// @route   DELETE /api/followups/:id
exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndDelete(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Follow-up removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete follow-up',
      error: error.message,
    });
  }
};

