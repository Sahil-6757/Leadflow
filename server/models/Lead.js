const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Please provide business name'],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      trim: true,
      default: 'Dental Clinic',
    },
    typeColor: {
      type: String,
      default: 'dental',
    },
    location: {
      type: String,
      trim: true,
      default: 'India',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Replied', 'Interested', 'Message Ready', 'Won', 'Lost', 'No Response'],
      default: 'New',
    },
    statusColor: {
      type: String,
      default: 'new',
    },
    nextFollowUp: {
      type: String,
      default: () => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      },
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    avatarBg: {
      type: String,
      default: '#3b82f6',
    },
    avatarText: {
      type: String,
      default: '',
    },
    isIcon: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
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

// Index for full text search across leads
LeadSchema.index({
  businessName: 'text',
  contactPerson: 'text',
  location: 'text',
  type: 'text',
  status: 'text',
});

module.exports = mongoose.model('Lead', LeadSchema);
