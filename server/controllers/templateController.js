const Template = require('../models/Template');

// @desc    Get all message templates
// @route   GET /api/templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving templates',
      error: error.message,
    });
  }
};

// @desc    Create new message template
// @route   POST /api/templates
exports.createTemplate = async (req, res) => {
  try {
    const { title, content, category, isDefault } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const template = await Template.create({
      title,
      content,
      category: category || 'Outreach',
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create template',
      error: error.message,
    });
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
      message: 'Template updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update template',
      error: error.message,
    });
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Template deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message,
    });
  }
};
