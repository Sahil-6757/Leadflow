const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const Template = require('../models/Template');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { computeDueInfo } = require('./followUpUtils');

const getRelativeDate = (offsetDays, hour = 11, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const formatDateStr = (d) => {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Compute dynamic relative dates
const dateToday = getRelativeDate(0, 14, 0);       // Due today
const dateTomorrow = getRelativeDate(1, 11, 30);   // Due tomorrow
const dateYesterday = getRelativeDate(-1, 16, 0);  // 1d overdue
const date2DaysAgo = getRelativeDate(-2, 10, 0);   // 2d overdue
const dateUpcoming = getRelativeDate(2, 12, 0);    // Upcoming in 2 days

const INITIAL_LEADS = [
  {
    businessName: 'ABC Software Solutions',
    contactPerson: 'Rahul Mehta',
    type: 'IT Services',
    typeColor: 'it',
    location: 'Pune, MH',
    status: 'Replied',
    statusColor: 'replied',
    nextFollowUp: formatDateStr(dateToday),
    phone: '+91 99001 87654',
    email: 'rahul@abcsoftware.io',
    avatarBg: '#1e3a8a',
    avatarText: '💻',
    isIcon: true,
  },
  {
    businessName: 'Dr. Mahale Dental Clinic',
    contactPerson: 'Dr. Mahale',
    type: 'Dental Clinic',
    typeColor: 'dental',
    location: 'Nashik, MH',
    status: 'Contacted',
    statusColor: 'contacted',
    nextFollowUp: formatDateStr(dateTomorrow),
    phone: '+91 98765 43210',
    email: 'contact@mahaledental.com',
    avatarBg: '#0d9488',
    avatarText: '🦷',
    isIcon: true,
  },
  {
    businessName: 'Tasty Bites Restaurant',
    contactPerson: 'Amit Patel',
    type: 'Restaurant',
    typeColor: 'restaurant',
    location: 'Surat, GJ',
    status: 'Message Ready',
    statusColor: 'ready',
    nextFollowUp: formatDateStr(dateYesterday),
    phone: '+91 98790 55443',
    email: 'amit@tastybites.co.in',
    avatarBg: '#dc2626',
    avatarText: '🍽️',
    isIcon: true,
  },
  {
    businessName: 'Shree Dental Clinic',
    contactPerson: 'Dr. Sharma',
    type: 'Dental Clinic',
    typeColor: 'dental',
    location: 'Mumbai, MH',
    status: 'New',
    statusColor: 'new',
    nextFollowUp: formatDateStr(date2DaysAgo),
    phone: '+91 98220 12345',
    email: 'info@shreedental.in',
    avatarBg: '#334155',
    avatarText: '🦷',
    isIcon: true,
  },
  {
    businessName: 'FitLife Gym',
    contactPerson: 'Vikram Singh',
    type: 'Fitness',
    typeColor: 'fitness',
    location: 'Delhi, DL',
    status: 'No Response',
    statusColor: 'no-resp',
    nextFollowUp: formatDateStr(dateUpcoming),
    phone: '+91 98112 33445',
    email: 'vikram@fitlifegym.in',
    avatarBg: '#18181b',
    avatarText: '🏃',
    isIcon: true,
  },
];

const buildFollowUpsForLeads = (createdLeads) => {
  return createdLeads.map((lead) => {
    let dueDate;
    let subtitle = 'Follow-up #1';

    if (lead.businessName.includes('ABC Software')) {
      dueDate = dateToday;
      subtitle = 'Follow-up #2 • Proposal Review';
    } else if (lead.businessName.includes('Mahale')) {
      dueDate = dateTomorrow;
      subtitle = 'Follow-up #1 • Demo Offer';
    } else if (lead.businessName.includes('Tasty Bites')) {
      dueDate = dateYesterday;
      subtitle = 'Follow-up #1 • Menu Portal Pitch';
    } else if (lead.businessName.includes('Shree Dental')) {
      dueDate = date2DaysAgo;
      subtitle = 'Follow-up #1 • Initial Outreach';
    } else {
      dueDate = dateUpcoming;
      subtitle = 'Follow-up #1 • Onboarding Call';
    }

    const dueInfo = computeDueInfo(dueDate, false);

    return {
      title: lead.businessName,
      subtitle,
      badge: dueInfo.badge,
      badgeType: dueInfo.badgeType,
      dotColor: dueInfo.dotColor,
      completed: false,
      dueDate,
      leadId: lead._id,
      notes: `Touchpoint for ${lead.contactPerson || lead.businessName}`,
    };
  });
};

const INITIAL_FOLLOW_UPS = [];

const INITIAL_ACTIVITIES = [
  {
    icon: 'send',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    text: 'Message sent to Dr. Mahale Dental Clinic',
    time: '2 hours ago',
  },
  {
    icon: 'plus',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    text: 'Lead added: Shree Dental Clinic',
    time: '4 hours ago',
  },
  {
    icon: 'message',
    iconBg: '#eef2ff',
    iconColor: '#4f46e5',
    text: 'Received a reply from ABC Software',
    time: '6 hours ago',
  },
  {
    icon: 'calendar',
    iconBg: '#fff1f2',
    iconColor: '#f43f5e',
    text: 'Follow-up scheduled for Tasty Bites',
    time: '8 hours ago',
  },
  {
    icon: 'edit',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    text: 'Lead status updated to Contacted',
    time: '1 day ago',
  },
];

const INITIAL_TEMPLATES = [
  {
    title: 'Initial Outreach (Friendly & Direct)',
    category: 'Outreach',
    isDefault: true,
    content: `Hi {contactPerson},

I came across {businessName} and was really impressed by your online presence.

I noticed a couple of opportunities to streamline patient bookings and improve mobile site conversion.

Would you be open to a quick 5-minute chat this week?

Best regards,
Sahil Khan`,
  },
  {
    title: 'Follow-up #1 (Gentle Check-in)',
    category: 'Follow-up',
    isDefault: false,
    content: `Hi {contactPerson},

Hope you're having a great week! Just following up on my previous note regarding your website. 

We recently helped a similar business in {location} increase their online bookings by 35%.

Would love to share a few ideas if you're interested.

Best regards,
Sahil Khan`,
  },
  {
    title: 'Quick Demo Offer',
    category: 'Demo',
    isDefault: false,
    content: `Hi {contactPerson},

I put together a quick mockup preview showing how your landing page could look with a modern refresh and faster load times.

Would you be open to taking a look over a brief 5-minute coffee chat?

Best regards,
Sahil Khan`,
  },
];

const seedDatabase = async (force = false) => {
  try {
    const leadCount = await Lead.countDocuments();
    const followUpCount = await FollowUp.countDocuments();

    if (leadCount === 0 || followUpCount === 0 || force) {
      if (force || leadCount === 0 || followUpCount === 0) {
        await Lead.deleteMany({});
        await FollowUp.deleteMany({});
        await Activity.deleteMany({});
        await Template.deleteMany({});
        console.log('[Seed] Cleared existing collections for fresh real-data seeding.');
      }

      const createdLeads = await Lead.insertMany(INITIAL_LEADS);
      const followUpsToInsert = buildFollowUpsForLeads(createdLeads);
      await FollowUp.insertMany(followUpsToInsert);
      await Activity.insertMany(INITIAL_ACTIVITIES);
      await Template.insertMany(INITIAL_TEMPLATES);

      console.log('[Seed] MongoDB successfully seeded with real connected leads & follow-ups!');
    } else {
      console.log(`[Seed] MongoDB already has ${leadCount} leads and ${followUpCount} follow-ups. Skipping auto-seed.`);
    }

    // Seed demo user and workspace if no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0 || force) {
      if (force) {
        await User.deleteMany({});
        await Workspace.deleteMany({});
      }

      let workspace = await Workspace.findOne({ name: "Sahil's Leads" });
      if (!workspace) {
        workspace = await Workspace.create({
          name: "Sahil's Leads",
          description: 'Primary workspace for lead generation & tracking',
        });
      }

      const demoUser = await User.create({
        name: 'Sahil Khan',
        email: 'sahil@leadflow.io',
        password: 'password123',
        role: 'admin',
        workspace: workspace._id,
      });

      workspace.owner = demoUser._id;
      await workspace.save();

      console.log('[Seed] Default demo user created: sahil@leadflow.io / password123');
    }

    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase,
  INITIAL_LEADS,
  INITIAL_FOLLOW_UPS,
  INITIAL_ACTIVITIES,
  INITIAL_TEMPLATES,
};
