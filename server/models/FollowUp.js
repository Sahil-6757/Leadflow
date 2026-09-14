const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide title or lead name'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: 'Follow-up #1',
    },
    badge: {
      type: String,
      default: 'Upcoming',
    },
    badgeType: {
      type: String,
      enum: ['today', 'tomorrow', 'date', 'overdue'],
      default: 'date',
    },
    dotColor: {
      type: String,
      default: '#3b82f6',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
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

module.exports = mongoose.model('FollowUp', FollowUpSchema);
