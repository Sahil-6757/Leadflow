const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Template title is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Outreach',
    },
    content: {
      type: String,
      required: [true, 'Template content is required'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Template', TemplateSchema);
