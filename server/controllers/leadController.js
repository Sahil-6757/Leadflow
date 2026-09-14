const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const { computeDueInfo, parseDateInput } = require('../utils/followUpUtils');

// Helper to determine status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Contacted':
      return 'contacted';
    case 'New':
      return 'new';
    case 'Replied':
      return 'replied';
    case 'Message Ready':
      return 'ready';
    case 'No Response':
      return 'no-resp';
    case 'Interested':
      return 'interested';
    case 'Won':
      return 'won';
    case 'Lost':
      return 'lost';
    default:
      return 'new';
  }
};

// Helper to determine type color
const getTypeColor = (type) => {
  switch (type) {
    case 'Dental Clinic':
      return 'dental';
    case 'IT Services':
      return 'it';
    case 'Restaurant':
      return 'restaurant';
    case 'Fitness':
      return 'fitness';
    default:
      return 'general';
  }
};

// @desc    Get all leads with search and filter
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { search, status, type, sort = '-createdAt' } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { businessName: regex },
        { contactPerson: regex },
        { location: regex },
        { type: regex },
        { status: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    const leads = await Lead.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching leads',
      error: error.message,
    });
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving lead',
      error: error.message,
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const {
      businessName,
      contactPerson,
      type,
      location,
      status,
      nextFollowUp,
      phone,
      email,
      notes,
    } = req.body;

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: 'businessName is required',
      });
    }

    const statusVal = status || 'New';
    const typeVal = type || 'Dental Clinic';

    const newLead = await Lead.create({
      businessName,
      contactPerson: contactPerson || '',
      type: typeVal,
      typeColor: getTypeColor(typeVal),
      location: location || 'India',
      status: statusVal,
      statusColor: getStatusColor(statusVal),
      nextFollowUp: nextFollowUp || 'Upcoming',
      phone: phone || '',
      email: email || '',
      notes: notes || '',
      isIcon: true,
    });

    // Auto-create or sync follow-up record for this lead
    const parsedDue = parseDateInput(newLead.nextFollowUp);
    const dueInfo = computeDueInfo(parsedDue, false);
    await FollowUp.create({
      title: newLead.businessName,
      subtitle: `Follow-up #1 • ${newLead.type}`,
      badge: dueInfo.badge,
      badgeType: dueInfo.badgeType,
      dotColor: dueInfo.dotColor,
      dueDate: parsedDue,
      leadId: newLead._id,
      notes: newLead.notes || '',
      completed: false,
    });

    // Auto-record activity
    await Activity.create({
      icon: 'plus',
      iconBg: '#ecfdf5',
      iconColor: '#10b981',
      text: `Lead added: ${newLead.businessName}`,
      time: 'Just now',
    });

    res.status(201).json({
      success: true,
      data: newLead,
      message: 'Lead created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message,
    });
  }
};

// @desc    Update entire lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.status) {
      updateData.statusColor = getStatusColor(updateData.status);
    }
    if (updateData.type) {
      updateData.typeColor = getTypeColor(updateData.type);
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Synchronize associated follow-up if businessName or nextFollowUp changed
    if (updateData.nextFollowUp || updateData.businessName) {
      const followUpUpdates = {};
      if (updateData.businessName) {
        followUpUpdates.title = updateData.businessName;
      }
      if (updateData.nextFollowUp) {
        const parsedDue = parseDateInput(updateData.nextFollowUp);
        const dueInfo = computeDueInfo(parsedDue, false);
        followUpUpdates.dueDate = parsedDue;
        followUpUpdates.badge = dueInfo.badge;
        followUpUpdates.badgeType = dueInfo.badgeType;
        followUpUpdates.dotColor = dueInfo.dotColor;
      }
      await FollowUp.findOneAndUpdate(
        { leadId: req.params.id },
        followUpUpdates,
        { upsert: false }
      );
    }

    await Activity.create({
      icon: 'edit',
      iconBg: '#fffbeb',
      iconColor: '#f59e0b',
      text: `Lead details updated: ${updatedLead.businessName}`,
      time: 'Just now',
    });

    res.status(200).json({
      success: true,
      data: updatedLead,
      message: 'Lead updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message,
    });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status,
        statusColor: getStatusColor(status),
      },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    await Activity.create({
      icon: 'edit',
      iconBg: '#fffbeb',
      iconColor: '#f59e0b',
      text: `Status updated to ${status} for ${updatedLead.businessName}`,
      time: 'Just now',
    });

    res.status(200).json({
      success: true,
      data: updatedLead,
      message: `Lead status updated to ${status}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Clean up associated follow-up records
    await FollowUp.deleteMany({ leadId: req.params.id });

    await Activity.create({
      icon: 'trash',
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
      text: `Lead deleted: ${lead.businessName}`,
      time: 'Just now',
    });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message,
    });
  }
};
