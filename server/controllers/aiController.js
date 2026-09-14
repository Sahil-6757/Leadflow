const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const { computeDueInfo } = require('../utils/followUpUtils');

// @desc    Generate tailored outreach message using AI engine
// @route   POST /api/ai/generate-message
exports.generateMessage = async (req, res) => {
  try {
    const { leadName = 'Business', goal = 'Website Redesign Pitch', tone = 'Professional & Friendly', contactPerson } = req.body;

    const salutation = contactPerson ? `Hi ${contactPerson}` : `Hi ${leadName} team`;

    let bodyText = '';
    if (goal === 'Website Redesign Pitch') {
      if (tone === 'Direct & Value-Focused') {
        bodyText = `${salutation},\n\nI reviewed ${leadName}'s website and identified 3 key conversion bottlenecks that are causing mobile visitors to drop off before booking.\n\nI prepared a quick 3-point action plan that could increase direct enquiries by 25-40%.\n\nCan I send over the link or share a quick 2-minute video?\n\nBest regards,\nSahil Khan`;
      } else if (tone === 'Casual & Conversational') {
        bodyText = `${salutation},\n\nHope you're having an awesome week! Came across ${leadName} and really loved your offerings.\n\nI noticed a couple of easy tweaks for your mobile site that could make scheduling appointments so much smoother for your clients.\n\nHappy to share a quick preview if you're open to checking it out!\n\nCheers,\nSahil Khan`;
      } else {
        bodyText = `${salutation},\n\nI was reviewing your online presence and spotted several quick tweaks to speed up mobile loading and boost appointment bookings by 25-35%.\n\nI built a free interactive demo showing how patients and customers can book appointments with zero friction. Would you like me to send you the link?\n\nBest regards,\nSahil Khan`;
      }
    } else if (goal === 'SEO & Local Ranking Improvement') {
      bodyText = `${salutation},\n\nI noticed that ${leadName} is ranking well locally, but competitors are currently outranking your page on high-intent local search queries.\n\nWith just a few schema and keyword adjustments, we can help ${leadName} secure top 3 map-pack positions and drive consistent organic inquiries.\n\nWould you like a free 1-page local SEO audit for your business?\n\nBest regards,\nSahil Khan`;
    } else if (goal === 'Quick Demo Offer') {
      bodyText = `${salutation},\n\nI put together a quick mockup preview showing how your landing page could look with a modern refresh, instant WhatsApp chat button, and faster load times.\n\nWould you be open to taking a look over a brief 5-minute coffee chat?\n\nBest regards,\nSahil Khan`;
    } else {
      // Follow-up after no response
      bodyText = `${salutation},\n\nHope you're having a productive week! Just floating this back to the top of your inbox in case it got buried.\n\nI understand how hectic managing ${leadName} can be. If you're interested in the free conversion improvements demo whenever time permits, feel free to let me know!\n\nBest regards,\nSahil Khan`;
    }

    res.status(200).json({
      success: true,
      data: {
        message: bodyText,
        leadName,
        goal,
        tone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating message',
      error: error.message,
    });
  }
};

// @desc    Chat with AI Assistant (database-aware)
// @route   POST /api/ai/chat
exports.chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    const queryLower = message.toLowerCase();

    // Fetch live summary context from MongoDB
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const contactedLeads = await Lead.countDocuments({ status: 'Contacted' });

    // Fetch active follow-ups and evaluate real-time due status
    const pendingFollowUps = await FollowUp.find({ completed: { $ne: true } })
      .populate('leadId')
      .sort({ dueDate: 1 });

    const dueTodayItems = [];
    const overdueItems = [];
    const dueTomorrowItems = [];

    pendingFollowUps.forEach((item) => {
      const info = computeDueInfo(item.dueDate, item.completed);
      if (info.badgeType === 'today') {
        dueTodayItems.push({ item, info });
      } else if (info.badgeType === 'overdue') {
        overdueItems.push({ item, info });
      } else if (info.badgeType === 'tomorrow') {
        dueTomorrowItems.push({ item, info });
      }
    });

    let reply = '';

    if (queryLower.includes('how many') || queryLower.includes('count') || queryLower.includes('stats')) {
      reply = `You currently have ${totalLeads} total leads in your database. Among them, ${newLeads} are brand new and ${contactedLeads} have been contacted. You have ${dueTodayItems.length} follow-up(s) due today and ${overdueItems.length} overdue.`;
    } else if (
      queryLower.includes('follow') ||
      queryLower.includes('today') ||
      queryLower.includes('due') ||
      queryLower.includes('urgent') ||
      queryLower.includes('overdue')
    ) {
      if (dueTodayItems.length > 0 || overdueItems.length > 0) {
        const sections = [];
        if (dueTodayItems.length > 0) {
          const names = dueTodayItems.map((d) => d.item.title).join(', ');
          sections.push(`📅 **Due Today (${dueTodayItems.length})**: ${names}`);
        }
        if (overdueItems.length > 0) {
          const names = overdueItems.map((d) => `${d.item.title} (${d.info.badge})`).join(', ');
          sections.push(`⚠️ **Overdue (${overdueItems.length})**: ${names}`);
        }
        if (dueTomorrowItems.length > 0) {
          const names = dueTomorrowItems.map((d) => d.item.title).join(', ');
          sections.push(`⏳ **Due Tomorrow (${dueTomorrowItems.length})**: ${names}`);
        }
        reply = `Here is your live follow-up status from real data:\n\n${sections.join('\n\n')}\n\nWould you like me to prepare a quick follow-up message template or email for any of them?`;
      } else if (dueTomorrowItems.length > 0) {
        const names = dueTomorrowItems.map((d) => d.item.title).join(', ');
        reply = `You have no overdue follow-ups or follow-ups due today! However, you have follow-up(s) scheduled for tomorrow: ${names}. Would you like to review their details?`;
      } else {
        reply = `You're all caught up on urgent follow-ups! You currently have 0 follow-ups due today or overdue. Would you like to review leads in 'Message Ready' status next?`;
      }
    } else if (queryLower.includes('template') || queryLower.includes('pitch') || queryLower.includes('message')) {
      reply = `I can help you craft high-converting outreach! Try using the "Quick Demo Offer" or "Initial Outreach" templates, or use the AI Message Generator button to produce a personalized pitch for any clinic or business.`;
    } else if (queryLower.includes('lead') || queryLower.includes('dr.') || queryLower.includes('mahale')) {
      const mahale = await Lead.findOne({ businessName: /Mahale/i });
      if (mahale) {
        reply = `Dr. Mahale Dental Clinic is currently marked as '${mahale.status}'. Their next follow-up date is ${mahale.nextFollowUp}. You can reach them at ${mahale.phone} or ${mahale.email}.`;
      } else {
        reply = `I searched your database and found ${totalLeads} leads. Would you like me to find a specific lead by business name or location?`;
      }
    } else {
      reply = `I analyzed your CRM pipeline! You have ${totalLeads} leads in your database. You have ${dueTodayItems.length} follow-up(s) due today and ${overdueItems.length} overdue. Would you like to reach out to any of them now?`;
    }

    res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing chat message',
      error: error.message,
    });
  }
};
