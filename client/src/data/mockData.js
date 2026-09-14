const getRelativeDate = (offsetDays, hour = 11, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const formatDateStr = (d) => {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const dateToday = getRelativeDate(0, 14, 0);
const dateTomorrow = getRelativeDate(1, 11, 30);
const dateYesterday = getRelativeDate(-1, 16, 0);
const date2DaysAgo = getRelativeDate(-2, 10, 0);
const dateUpcoming = getRelativeDate(2, 12, 0);

export const INITIAL_LEADS = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
  }
];

export const FOLLOW_UPS = [
  {
    id: 1,
    title: 'ABC Software Solutions',
    subtitle: 'Follow-up #2 • Proposal Review',
    badge: 'Today',
    badgeType: 'today',
    dotColor: '#ef4444',
    dueDate: dateToday,
    completed: false,
  },
  {
    id: 2,
    title: 'Dr. Mahale Dental Clinic',
    subtitle: 'Follow-up #1 • Demo Offer',
    badge: 'Tomorrow',
    badgeType: 'tomorrow',
    dotColor: '#f59e0b',
    dueDate: dateTomorrow,
    completed: false,
  },
  {
    id: 3,
    title: 'Tasty Bites Restaurant',
    subtitle: 'Follow-up #1 • Menu Portal Pitch',
    badge: 'Yesterday',
    badgeType: 'overdue',
    dotColor: '#ef4444',
    dueDate: dateYesterday,
    completed: false,
  },
  {
    id: 4,
    title: 'Shree Dental Clinic',
    subtitle: 'Follow-up #1 • Initial Outreach',
    badge: '2d overdue',
    badgeType: 'overdue',
    dotColor: '#ef4444',
    dueDate: date2DaysAgo,
    completed: false,
  },
  {
    id: 5,
    title: 'FitLife Gym',
    subtitle: 'Follow-up #1 • Onboarding Call',
    badge: dateUpcoming.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    badgeType: 'date',
    dotColor: '#3b82f6',
    dueDate: dateUpcoming,
    completed: false,
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: 'send',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    text: 'Message sent to Dr. Mahale Dental Clinic',
    time: '2 hours ago'
  },
  {
    id: 2,
    icon: 'plus',
    iconBg: '#ecfdf5',
    iconColor: '#10b981',
    text: 'Lead added: Shree Dental Clinic',
    time: '4 hours ago'
  },
  {
    id: 3,
    icon: 'message',
    iconBg: '#eef2ff',
    iconColor: '#4f46e5',
    text: 'Received a reply from ABC Software',
    time: '6 hours ago'
  },
  {
    id: 4,
    icon: 'calendar',
    iconBg: '#fff1f2',
    iconColor: '#f43f5e',
    text: 'Follow-up scheduled for Tasty Bites',
    time: '8 hours ago'
  },
  {
    id: 5,
    icon: 'edit',
    iconBg: '#fffbeb',
    iconColor: '#f59e0b',
    text: 'Lead status updated to Contacted',
    time: '1 day ago'
  }
];

export const TEMPLATES = {
  'Initial Outreach (Website Improvement)': `Hi {{name}},

I came across your website and noticed a few UI/UX opportunities that could improve the overall user experience. I'm a web developer and I help businesses like yours improve their websites, increase customer engagement, and get more enquiries.

Would you be interested in seeing a quick demo of some improvements I've prepared?

Best regards,
Sahil Khan`,
  'Follow-up #1 (Gentle Check-in)': `Hi {{name}},

Hope you're having a great week! Just following up on my previous note regarding your website. 

I know how busy things get, so I put together a 2-minute video breakdown of quick conversion improvements for you. 

Would you like me to share the link?

Best regards,
Sahil Khan`,
  'Quick Demo Offer': `Hi {{name}},

I put together a quick mockup preview showing how your landing page could look with a modern refresh and faster load times.

Would you be open to taking a look over a brief 5-minute coffee chat?

Best regards,
Sahil Khan`
};

export const STATUS_STATS = [
  { label: 'New', count: 38, percent: 31, color: '#3b82f6' },
  { label: 'Contacted', count: 38, percent: 31, color: '#60a5fa' },
  { label: 'Replied', count: 12, percent: 10, color: '#34d399' },
  { label: 'Interested', count: 9, percent: 7, color: '#a78bfa' },
  { label: 'Won', count: 7, percent: 6, color: '#fbbf24' },
  { label: 'Lost', count: 20, percent: 16, color: '#f87171' },
];
