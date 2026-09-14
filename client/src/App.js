import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GreetingBar from './components/GreetingBar';
import KpiMetrics from './components/KpiMetrics';
import RecentLeadsTable from './components/RecentLeadsTable';
import FollowupsDue from './components/FollowupsDue';
import QuickActions from './components/QuickActions';
import MessageTemplateCard from './components/MessageTemplateCard';
import LeadsDonutChart from './components/LeadsDonutChart';
import AddLeadModal from './components/AddLeadModal';
import EditLeadModal from './components/EditLeadModal';
import LeadsPage from './components/LeadsPage';
import MessagesPage from './components/MessagesPage';
import FollowUpsPage from './components/FollowUpsPage';
import CalendarPage from './components/CalendarPage';
import AiMessageModal from './components/AiMessageModal';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import ChatAssistantWidget from './components/ChatAssistantWidget';
import { INITIAL_LEADS, STATUS_STATS, FOLLOW_UPS } from './data/mockData';
import { CheckCircle2 } from 'lucide-react';
import { leadsAPI, followUpsAPI, activitiesAPI, templatesAPI, analyticsAPI, authAPI } from './services/api';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [followups, setFollowups] = useState(FOLLOW_UPS);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Website Redesign Demo - Dr. Mahale',
      eventType: 'call',
      date: new Date(2026, 8, 14),
      time: '14:30',
      duration: '45m',
      priority: 'high',
      notes: 'Demonstrate new clinic website speed, booking engine, and SEO ranking comparison.',
      completed: false,
      dotColor: '#2563eb',
    },
    {
      id: 2,
      title: 'Menu QR & Web Portal Pitch - Tasty Bites',
      eventType: 'meeting',
      date: new Date(2026, 8, 15),
      time: '11:00',
      duration: '30m',
      priority: 'medium',
      notes: 'Review restaurant digital ordering menu and WhatsApp integration.',
      completed: false,
      dotColor: '#10b981',
    },
    {
      id: 3,
      title: 'Cloud Migration Architecture Review - ABC Software',
      eventType: 'proposal',
      date: new Date(2026, 8, 15),
      time: '16:00',
      duration: '1h',
      priority: 'high',
      notes: 'Discuss scope of work and pricing model for DevOps migration.',
      completed: false,
      dotColor: '#f59e0b',
    },
    {
      id: 4,
      title: 'Fitness Studio Onboarding Call - FitLife Gym',
      eventType: 'call',
      date: new Date(2026, 8, 16),
      time: '10:00',
      duration: '30m',
      priority: 'normal',
      notes: 'Verify gym member signup webhook and automated WhatsApp follow-ups.',
      completed: false,
      dotColor: '#2563eb',
    },
    {
      id: 5,
      title: 'Dental Booking Engine Milestone Review',
      eventType: 'milestone',
      date: new Date(2026, 8, 18),
      time: '15:00',
      duration: '30m',
      priority: 'medium',
      notes: 'Milestone checkpoint for custom dental appointment scheduling.',
      completed: true,
      dotColor: '#8b5cf6',
    },
  ]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    kpi: { total: 124, contacted: 38, replied: 12, interested: 9, clients: 7 },
    statusBreakdown: STATUS_STATS,
  });
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedLeadForAi, setSelectedLeadForAi] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [user, setUser] = useState(() => {
    if (authAPI.isAuthenticated()) {
      return authAPI.getUser();
    }
    return null;
  });

  // Calculate live dynamic KPI metrics from leads whenever available
  const dynamicKpi = useMemo(() => {
    if (Array.isArray(leads) && leads.length > 0) {
      const total = leads.length;
      const contacted = leads.filter((l) => l.status === 'Contacted').length;
      const replied = leads.filter((l) => l.status === 'Replied').length;
      const interested = leads.filter((l) => l.status === 'Interested').length;
      const clients = leads.filter((l) => l.status === 'Won').length;
      return { total, contacted, replied, interested, clients };
    }
    return stats.kpi;
  }, [leads, stats.kpi]);

  const handleSelectStatusFromChart = (status) => {
    setLeadStatusFilter(status);
    setActiveTab('leads');
  };

  // Handle Theme Switch
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const res = await authAPI.getMe();
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Session check failed or expired:', err.message);
          await authAPI.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // Show Temporary Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Auth Handlers
  const handleLogin = async (credentials) => {
    const data = await authAPI.login(credentials);
    if (data && data.user) {
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}! 👋`);
      refreshData();
    }
    return data;
  };

  const handleRegister = async (userData) => {
    const data = await authAPI.register(userData);
    if (data && data.user) {
      setUser(data.user);
      showToast(`Account created! Welcome, ${data.user.name}! 🎉`);
      refreshData();
    }
    return data;
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    showToast('Logged out successfully');
  };

  // Load live data from MongoDB backend API
  const refreshData = useCallback(async () => {
    try {
      const [leadsRes, followUpsRes, tempsRes, statsRes] = await Promise.allSettled([
        leadsAPI.getAll(),
        followUpsAPI.getAll(),
        templatesAPI.getAll(),
        analyticsAPI.getStats(),
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        setLeads(leadsRes.value.data);
      }
      if (followUpsRes.status === 'fulfilled' && followUpsRes.value.data) {
        setFollowups(followUpsRes.value.data);
      }
      if (tempsRes.status === 'fulfilled' && tempsRes.value.data) {
        setTemplates(tempsRes.value.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.warn('Backend unavailable, using initial data:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [user, refreshData]);

  // Add new lead handler (persists to backend)
  const handleAddNewLead = async (leadData) => {
    try {
      const res = await leadsAPI.create(leadData);
      if (res.data) {
        setLeads((prev) => [res.data, ...prev]);
        showToast(`Lead saved: ${res.data.businessName}`);
      } else {
        setLeads((prev) => [{ id: Date.now(), ...leadData }, ...prev]);
        showToast(`Lead added: ${leadData.businessName}`);
      }
      // Refresh analytics and activities in background
      refreshData();
    } catch (err) {
      console.error('Error creating lead:', err);
      setLeads((prev) => [{ id: Date.now(), ...leadData }, ...prev]);
      showToast(`Lead saved locally: ${leadData.businessName}`);
    }
  };

  // Update lead status handler (persists to backend)
  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      await leadsAPI.updateStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId || l._id === leadId ? { ...l, status: newStatus } : l))
      );
      showToast(`Status updated to ${newStatus}`);
      refreshData();
    } catch (err) {
      console.error('Error updating status:', err);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      showToast(`Status updated: ${newStatus}`);
    }
  };

  // Delete lead handler (persists to backend)
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadsAPI.delete(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId && l._id !== leadId));
      showToast('Lead removed');
      refreshData();
    } catch (err) {
      console.error('Error deleting lead:', err);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      showToast('Lead removed');
    }
  };

  // Full lead update handler (persists to backend)
  const handleUpdateLead = async (leadId, updatedData) => {
    try {
      const res = await leadsAPI.update(leadId, updatedData);
      if (res.data) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId || l._id === leadId ? res.data : l))
        );
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId || l._id === leadId ? { ...l, ...updatedData } : l))
        );
      }
      showToast('Lead details updated successfully');
      refreshData();
    } catch (err) {
      console.error('Error updating lead:', err);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId || l._id === leadId ? { ...l, ...updatedData } : l))
      );
      showToast('Lead details updated locally');
    }
  };

  // Bulk status update handler
  const handleBulkUpdateStatus = async (ids, newStatus) => {
    try {
      await Promise.allSettled(ids.map((id) => leadsAPI.updateStatus(id, newStatus)));
      setLeads((prev) =>
        prev.map((l) => (ids.includes(l.id) || ids.includes(l._id) ? { ...l, status: newStatus } : l))
      );
      showToast(`Updated status for ${ids.length} leads`);
      refreshData();
    } catch (err) {
      console.error('Error in bulk status update:', err);
      setLeads((prev) =>
        prev.map((l) => (ids.includes(l.id) || ids.includes(l._id) ? { ...l, status: newStatus } : l))
      );
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async (ids) => {
    try {
      await Promise.allSettled(ids.map((id) => leadsAPI.delete(id)));
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id) && !ids.includes(l._id)));
      showToast(`Deleted ${ids.length} leads`);
      refreshData();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id) && !ids.includes(l._id)));
    }
  };

  // Trigger AI message generation for a specific lead
  const handleOpenAiModal = (lead = null) => {
    setSelectedLeadForAi(lead);
    setIsAiModalOpen(true);
  };

  // Template CRUD Handlers
  const handleSaveTemplate = async (templateData) => {
    try {
      if (templateData.id && !String(templateData.id).startsWith('mock-')) {
        const res = await templatesAPI.update(templateData.id, templateData);
        if (res.data) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === templateData.id || t._id === templateData.id ? res.data : t))
          );
        }
      } else {
        const res = await templatesAPI.create(templateData);
        if (res.data) {
          setTemplates((prev) => [res.data, ...prev]);
        }
      }
      showToast('Template saved to library');
      refreshData();
    } catch (err) {
      console.error('Error saving template:', err);
      if (templateData.id) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateData.id ? { ...t, ...templateData } : t))
        );
      } else {
        setTemplates((prev) => [{ id: `tpl-${Date.now()}`, ...templateData }, ...prev]);
      }
      showToast('Template saved locally');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await templatesAPI.delete(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId && t._id !== templateId));
      showToast('Template deleted');
      refreshData();
    } catch (err) {
      console.error('Error deleting template:', err);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      showToast('Template removed');
    }
  };

  // Outreach dispatch tracker
  const handleSendOutreach = async (channel, lead, message) => {
    try {
      await activitiesAPI.create({
        icon: 'send',
        iconBg: channel === 'WhatsApp' ? '#ecfdf5' : '#eff6ff',
        iconColor: channel === 'WhatsApp' ? '#10b981' : '#2563eb',
        text: `${channel} outreach sent to ${lead.businessName}`,
        time: 'Just now',
      });
      refreshData();
    } catch (err) {
      console.warn('Could not record outreach activity:', err.message);
    }
  };

  // Follow-up CRUD Handlers
  const handleCreateFollowUp = async (followUpData) => {
    try {
      const res = await followUpsAPI.create(followUpData);
      if (res && res.data) {
        setFollowups((prev) => [res.data, ...prev]);
        showToast(`Follow-up scheduled: ${res.data.title} 📅`);
      } else {
        setFollowups((prev) => [{ id: Date.now(), ...followUpData }, ...prev]);
        showToast(`Follow-up scheduled: ${followUpData.title} 📅`);
      }
      refreshData();
    } catch (err) {
      console.error('Error creating follow-up:', err);
      setFollowups((prev) => [{ id: Date.now(), ...followUpData }, ...prev]);
      showToast(`Follow-up scheduled locally: ${followUpData.title}`);
    }
  };

  const handleUpdateFollowUp = async (id, followUpData) => {
    try {
      await followUpsAPI.update(id, followUpData);
      setFollowups((prev) =>
        prev.map((f) => (f.id === id || f._id === id ? { ...f, ...followUpData } : f))
      );
      showToast('Follow-up updated successfully!');
      refreshData();
    } catch (err) {
      console.error('Error updating follow-up:', err);
      setFollowups((prev) =>
        prev.map((f) => (f.id === id || f._id === id ? { ...f, ...followUpData } : f))
      );
      showToast('Follow-up updated locally');
    }
  };

  const handleToggleCompleteFollowUp = async (id) => {
    const item = followups.find((f) => f.id === id || f._id === id);
    if (!item) return;
    const nextCompleted = !item.completed;

    setFollowups((prev) =>
      prev.map((f) => (f.id === id || f._id === id ? { ...f, completed: nextCompleted } : f))
    );

    try {
      await followUpsAPI.update(id, { completed: nextCompleted });
      showToast(nextCompleted ? `Completed follow-up for ${item.title} 🎉` : 'Follow-up marked active');
      refreshData();
    } catch (err) {
      console.error('Error toggling follow-up completion:', err);
    }
  };

  const handleDeleteFollowUp = async (id) => {
    try {
      await followUpsAPI.delete(id);
      setFollowups((prev) => prev.filter((f) => f.id !== id && f._id !== id));
      showToast('Follow-up reminder removed');
      refreshData();
    } catch (err) {
      console.error('Error deleting follow-up:', err);
      setFollowups((prev) => prev.filter((f) => f.id !== id && f._id !== id));
      showToast('Follow-up removed locally');
    }
  };

  // Calendar Event Handlers
  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: Date.now(),
      ...eventData,
    };
    setEvents((prev) => [newEvent, ...prev]);
    showToast(`Event scheduled: ${eventData.title} 📅`);
  };

  const handleUpdateEvent = (id, eventData) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id || e._id === id ? { ...e, ...eventData } : e))
    );
    showToast('Event updated successfully!');
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    showToast('Event removed from calendar');
  };

  const handleToggleEventComplete = (id) => {
    if (typeof id === 'string' && id.startsWith('fu-')) {
      const originalFuId = id.replace('fu-', '');
      handleToggleCompleteFollowUp(isNaN(originalFuId) ? originalFuId : Number(originalFuId));
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === id || e._id === id ? { ...e, completed: !e.completed } : e))
    );
    showToast('Event status updated');
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (lead.businessName && lead.businessName.toLowerCase().includes(q)) ||
      (lead.contactPerson && lead.contactPerson.toLowerCase().includes(q)) ||
      (lead.location && lead.location.toLowerCase().includes(q)) ||
      (lead.type && lead.type.toLowerCase().includes(q)) ||
      (lead.status && lead.status.toLowerCase().includes(q))
    );
  });

  // Action button handlers
  const handleWhatsApp = (lead) => {
    const text = encodeURIComponent(
      `Hi ${lead.contactPerson || lead.businessName}, I came across ${lead.businessName} and would love to share some web design insights!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmail = (lead) => {
    const subject = encodeURIComponent(`Growth & Website Opportunities for ${lead.businessName}`);
    const body = encodeURIComponent(
      `Hi ${lead.contactPerson || lead.businessName},\n\nI was reviewing your website and noticed several opportunities to improve conversion and customer bookings.\n\nBest regards,\nSahil Khan`
    );
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  const handleUseTemplate = (templateText) => {
    setIsAiModalOpen(true);
    showToast('Template loaded in message generator');
  };

  const handleImportLeads = () => {
    showToast('Import Leads: Ready to parse CSV/Excel files.');
  };

  const handleUpgradeClick = () => {
    showToast('LeadFlow Pro: Unlimited AI messages, automated CRM workflows, and team access!');
  };

  // Auth Guard: If not logged in, redirect & display dedicated LoginPage
  if (!user) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        {toastMessage && (
          <div className="toast-notice">
            <CheckCircle2 size={16} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpgradeClick={handleUpgradeClick}
        user={user}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          theme={theme}
          toggleTheme={toggleTheme}
          onNotifClick={() => showToast('3 unread follow-up notifications')}
          leads={leads}
          user={user}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content: Switch between Leads Page, Messages Page, and Dashboard Body */}
        {activeTab === 'messages' ? (
          <main className="dashboard-body" style={{ maxWidth: '1480px' }}>
            <MessagesPage
              leads={leads}
              templates={templates}
              user={user}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onSendOutreach={handleSendOutreach}
              onShowToast={showToast}
              initialLead={selectedLeadForAi}
            />
          </main>
        ) : activeTab === 'leads' ? (
          <main className="dashboard-body" style={{ maxWidth: '1480px' }}>
            <LeadsPage
              leads={leads}
              initialStatusFilter={leadStatusFilter}
              onAddNewLead={() => setIsAddModalOpen(true)}
              onEditLead={(lead) => {
                setEditingLead(lead);
                setIsEditModalOpen(true);
              }}
              onUpdateStatus={handleUpdateStatus}
              onDeleteLead={handleDeleteLead}
              onBulkDelete={handleBulkDelete}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onOpenAiModal={handleOpenAiModal}
              onShowToast={showToast}
            />
          </main>
        ) : activeTab === 'follow-ups' ? (
          <main className="dashboard-body" style={{ maxWidth: '1480px' }}>
            <FollowUpsPage
              followups={followups}
              leads={leads}
              onCreateFollowUp={handleCreateFollowUp}
              onUpdateFollowUp={handleUpdateFollowUp}
              onToggleComplete={handleToggleCompleteFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
              onOpenAiModal={handleOpenAiModal}
              onShowToast={showToast}
              onSendOutreach={handleSendOutreach}
            />
          </main>
        ) : activeTab === 'calendar' ? (
          <main className="dashboard-body" style={{ maxWidth: '1480px' }}>
            <CalendarPage
              events={events}
              followups={followups}
              leads={leads}
              onCreateEvent={handleCreateEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onToggleCompleteEvent={handleToggleEventComplete}
              onOpenAiModal={handleOpenAiModal}
              onShowToast={showToast}
              onSendOutreach={handleSendOutreach}
            />
          </main>
        ) : (
          /* Dashboard Body */
          <main className="dashboard-body">
            {/* Greeting & Quick Primary CTA */}
            <GreetingBar
              onAddLead={() => setIsAddModalOpen(true)}
              userName={user?.name ? user.name.split(' ')[0] : 'there'}
            />

            {/* KPI Metrics Row (5 Cards) */}
            <KpiMetrics stats={dynamicKpi} />

            {/* Middle Grid: Recent Leads Table (Left) + Side Panels (Right) */}
            <div className="middle-grid">
              {/* Recent Leads Table Card */}
              <RecentLeadsTable
                leads={filteredLeads}
                onSelectLead={(lead) => showToast(`Lead selected: ${lead.businessName}`)}
                onWhatsAppClick={handleWhatsApp}
                onEmailClick={handleEmail}
                onViewAll={() => setActiveTab('leads')}
                onUpdateStatus={handleUpdateStatus}
                onDeleteLead={handleDeleteLead}
              />

              {/* Right Column Stack */}
              <div className="side-stack">
                {/* Follow-ups Due */}
                <FollowupsDue
                  followups={followups}
                  leads={leads}
                  onToggleComplete={handleToggleCompleteFollowUp}
                  onWhatsAppClick={handleWhatsApp}
                  onEmailClick={handleEmail}
                  onViewAll={() => setActiveTab('follow-ups')}
                />
              </div>
            </div>

            {/* Bottom Grid: Quick Actions, Message Template, Leads by Status */}
            <div className="bottom-grid">
              {/* Quick Actions Card */}
              <QuickActions
                onAddLead={() => setIsAddModalOpen(true)}
                onGenerateMessage={() => setActiveTab('messages')}
                onViewFollowups={() => setActiveTab('follow-ups')}
                onImportLeads={handleImportLeads}
              />

              {/* Message Template Card */}
              <MessageTemplateCard
                templates={templates}
                onUseTemplate={handleUseTemplate}
                onShowToast={showToast}
                onViewAll={() => setActiveTab('messages')}
              />

              {/* Leads by Status Donut Chart Card */}
              <LeadsDonutChart
                leads={leads}
                stats={stats.statusBreakdown}
                onSelectStatus={handleSelectStatusFromChart}
              />
            </div>
          </main>
        )}
      </div>

      {/* Floating Chat/AI Assistant Widget */}
      <ChatAssistantWidget />

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddNewLead}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        lead={editingLead}
        onSave={handleUpdateLead}
      />

      <AiMessageModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setSelectedLeadForAi(null);
        }}
        onShowToast={showToast}
        targetLead={selectedLeadForAi}
      />

      {/* Login & Register Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
