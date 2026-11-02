import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { NavigationRail } from './components/NavigationRail';
import { TopOperationalBar } from './components/TopOperationalBar';
import { DashboardView } from './components/DashboardView';
import { TicketManagementView } from './components/TicketManagementView';
import { AIAssistantView } from './components/AIAssistantView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIEvaluationView } from './components/AIEvaluationView';
import { TeamManagementView } from './components/TeamManagementView';
import { SettingsView } from './components/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ActiveView, Ticket } from './types';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>('ALL');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const { createTicket } = useData();

  const handleSelectTicketFromDashboard = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setActiveView('tickets');
  };

  const handleCreateTicketFromChat = async (subject: string, description: string) => {
    try {
      const ticket = await createTicket({
        subject,
        description,
        category: 'Technical Support',
        priority: 'High',
        customerName: 'Valued Customer',
        customerEmail: 'customer@clientcorp.io',
      });
      setSelectedTicketId(ticket.id);
      setActiveView('tickets');
    } catch (e) {
      console.error('Failed creating ticket from chat:', e);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F3EE]">
      {/* 2-Level Navigation System */}
      <NavigationRail
        activeView={activeView}
        setActiveView={setActiveView}
        ticketPriorityFilter={ticketPriorityFilter}
        setTicketPriorityFilter={setTicketPriorityFilter}
      />

      {/* Main Operational Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <TopOperationalBar
          activeView={activeView}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenNewTicket={() => {
            setActiveView('tickets');
          }}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'overview' && (
            <DashboardView
              onSelectTicket={handleSelectTicketFromDashboard}
              onNavigateToAssistant={() => setActiveView('assistant')}
            />
          )}

          {activeView === 'tickets' && (
            <TicketManagementView
              selectedTicketId={selectedTicketId}
              onSelectTicketId={setSelectedTicketId}
              priorityFilter={ticketPriorityFilter}
              setPriorityFilter={setTicketPriorityFilter}
            />
          )}

          {activeView === 'assistant' && (
            <AIAssistantView
              onCreateTicketFromChat={handleCreateTicketFromChat}
            />
          )}

          {activeView === 'knowledge' && <KnowledgeBaseView />}

          {activeView === 'analytics' && <AnalyticsView />}

          {activeView === 'evaluation' && <AIEvaluationView />}

          {activeView === 'team' && <TeamManagementView />}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTicket={handleSelectTicketFromDashboard}
        onNavigate={setActiveView}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
