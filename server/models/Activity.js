const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      enum: ['send', 'plus', 'message', 'calendar', 'edit', 'check', 'trash'],
      default: 'plus',
    },
    iconBg: {
      type: String,
      default: '#eff6ff',
    },
    iconColor: {
      type: String,
      default: '#2563eb',
    },
    text: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
    },
    time: {
      type: String,
      default: 'Just now',
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

module.exports = mongoose.model('Activity', ActivitySchema);
