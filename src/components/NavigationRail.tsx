import React, { useState } from 'react';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  BotMessageSquare,
  BookOpen,
  BarChart3,
  FlaskConical,
  Users,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { ActiveView } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface NavigationRailProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  ticketPriorityFilter?: string;
  setTicketPriorityFilter?: (priority: string) => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeView,
  setActiveView,
  ticketPriorityFilter = 'ALL',
  setTicketPriorityFilter,
}) => {
  const [secondaryCollapsed, setSecondaryCollapsed] = useState(false);
  const { tickets, documents, evaluations } = useData();
  const { user, isCustomer } = useAuth();

  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress');
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed');

  const navItems = [
    { id: 'overview' as ActiveView, label: 'Overview', icon: LayoutDashboard },
    { id: 'tickets' as ActiveView, label: 'Tickets', icon: TicketIcon, badge: openTickets.length },
    { id: 'assistant' as ActiveView, label: 'AI Assistant', icon: BotMessageSquare, highlight: true },
    { id: 'knowledge' as ActiveView, label: 'Knowledge Base', icon: BookOpen, badge: documents.length },
    { id: 'analytics' as ActiveView, label: 'Analytics', icon: BarChart3 },
    { id: 'evaluation' as ActiveView, label: 'AI Evaluation', icon: FlaskConical },
    { id: 'team' as ActiveView, label: 'Team', icon: Users, hideForCustomer: true },
    { id: 'settings' as ActiveView, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen shrink-0 z-30 select-none">
      {/* Primary Rail: Narrow Midnight Charcoal */}
      <div className="w-18 bg-[#171C19] border-r border-[#2C3530] flex flex-col items-center py-4 justify-between">
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* Brand Mark */}
          <div
            onClick={() => setActiveView('overview')}
            className="group relative cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200"
            title="SupportIQ Operations"
          >
            <div className="w-10 h-10 rounded-xl bg-[#202522] border border-[#2F3B34] flex items-center justify-center relative shadow-sm group-hover:border-[#C7F36B]/50 transition-colors">
              <span className="font-heading font-extrabold text-[#C7F36B] text-lg tracking-tighter">IQ</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C7F36B] ring-2 ring-[#171C19] animate-pulse" />
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col space-y-2 w-full px-2">
            {navItems.map((item) => {
              if (item.hideForCustomer && isCustomer) return null;
              const isActive = activeView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`relative group w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-150 ${
                    isActive
                      ? 'bg-[#202522] text-[#C7F36B] shadow-inner border border-[#2F3B34]'
                      : 'text-[#879B87] hover:text-[#F5F3EE] hover:bg-[#202522]/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] mt-1 font-medium tracking-tight line-clamp-1">{item.label}</span>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C7F36B] rounded-r-full" />
                  )}

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && !isActive && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#2C3530] text-[#C7F36B] text-[9px] font-mono font-bold flex items-center justify-center border border-[#3E4B44]">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Indicator */}
        <div className="flex flex-col items-center space-y-2 pb-2">
          <div className="w-8 h-8 rounded-full border border-[#2F3B34] overflow-hidden bg-[#202522]">
            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
          </div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#879B87]">
            {user.role === 'ADMIN' ? 'ADM' : user.role === 'SUPPORT_AGENT' ? 'AGT' : 'CST'}
          </span>
        </div>
      </div>

      {/* Secondary Contextual Panel */}
      <div
        className={`bg-[#1D2320] border-r border-[#2C3530] text-[#F5F3EE] transition-all duration-200 overflow-hidden flex flex-col ${
          secondaryCollapsed ? 'w-0' : 'w-60'
        }`}
      >
        <div className="p-4 border-b border-[#2C3530] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#879B87]">Operations Context</p>
            <h3 className="font-heading font-bold text-sm text-[#F5F3EE] capitalize">
              {activeView === 'overview'
                ? 'Command Center'
                : activeView === 'tickets'
                ? 'Priority Triage'
                : activeView === 'assistant'
                ? 'RAG Intelligence'
                : activeView === 'knowledge'
                ? 'Knowledge Library'
                : activeView === 'analytics'
                ? 'Performance Story'
                : activeView === 'evaluation'
                ? 'RAG Quality Gate'
                : activeView === 'team'
                ? 'Team Workload'
                : 'System Settings'}
            </h3>
          </div>
          <button
            onClick={() => setSecondaryCollapsed(true)}
            className="p-1 rounded text-[#879B87] hover:text-[#F5F3EE] hover:bg-[#202522]"
            title="Collapse panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Contextual Content */}
        <div className="p-3 flex-1 overflow-y-auto dark-scroll space-y-4">
          {activeView === 'tickets' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#879B87] px-1">Triage Queues</div>
              <div className="space-y-1">
                {[
                  { id: 'ALL', label: 'All Open Tickets', count: openTickets.length, icon: FolderOpen },
                  { id: 'Critical', label: 'Critical Escaped', count: criticalTickets.length, icon: Flame, alert: true },
                  { id: 'High', label: 'High Urgency', count: tickets.filter((t) => t.priority === 'High' && t.status !== 'Resolved').length, icon: AlertTriangle },
                  { id: 'Resolved', label: 'Recently Resolved', count: tickets.filter((t) => t.status === 'Resolved').length, icon: CheckCircle2 },
                ].map((queue) => (
                  <button
                    key={queue.id}
                    onClick={() => setTicketPriorityFilter && setTicketPriorityFilter(queue.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      ticketPriorityFilter === queue.id
                        ? 'bg-[#252C28] text-[#C7F36B] border border-[#2F3B34]'
                        : 'text-[#C7CEC5] hover:bg-[#252C28]/60 hover:text-[#F5F3EE]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <queue.icon className={`w-3.5 h-3.5 ${queue.alert ? 'text-[#E66B5B]' : 'text-[#879B87]'}`} />
                      <span>{queue.label}</span>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#171C19] text-[#F5F3EE] border border-[#2C3530]">
                      {queue.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeView === 'overview' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#879B87] px-1">Live Metrics</div>
              <div className="bg-[#171C19] border border-[#2C3530] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#879B87]">SLA Compliance</span>
                  <span className="text-[#C7F36B] font-mono font-bold">98.4%</span>
                </div>
                <div className="w-full bg-[#202522] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#C7F36B] h-full rounded-full" style={{ width: '98.4%' }} />
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-[#879B87]">AI Automation</span>
                  <span className="text-[#79A88A] font-mono font-bold">42.8%</span>
                </div>
              </div>

              <div className="text-[11px] font-mono uppercase tracking-wider text-[#879B87] px-1 pt-2">Active Signals</div>
              <div className="text-xs bg-[#202522] border border-[#2F3B34] rounded-lg p-2.5 text-[#C7CEC5] space-y-1">
                <p className="font-semibold text-[#F5F3EE] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E9A23B]" /> IdP Cert Rotation Spike
                </p>
                <p className="text-[11px] text-[#879B87]">SAML auth tickets increased by 20% in the last 2 hours.</p>
              </div>
            </div>
          )}

          {activeView === 'assistant' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#879B87] px-1">RAG Parameters</div>
              <div className="bg-[#171C19] border border-[#2C3530] rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between text-[#879B87]">
                  <span>Model</span>
                  <span className="text-[#C7F36B] font-mono">gemini-3.8-flash</span>
                </div>
                <div className="flex justify-between text-[#879B87]">
                  <span>Retrieval Type</span>
                  <span className="text-[#F5F3EE]">Hybrid (BM25 + Vec)</span>
                </div>
                <div className="flex justify-between text-[#879B87]">
                  <span>Grounding Strictness</span>
                  <span className="text-[#79A88A] font-bold">High (Zero Slop)</span>
                </div>
              </div>
            </div>
          )}

          {activeView === 'knowledge' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#879B87] px-1">Pipeline Health</div>
              <div className="bg-[#171C19] border border-[#2C3530] rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between text-[#879B87]">
                  <span>Indexed Chunks</span>
                  <span className="text-[#C7F36B] font-mono font-bold">{documents.reduce((acc, d) => acc + d.chunkCount, 0)}</span>
                </div>
                <div className="flex justify-between text-[#879B87]">
                  <span>Embedding Vector Size</span>
                  <span className="text-[#F5F3EE] font-mono">768 Dim</span>
                </div>
                <div className="flex justify-between text-[#879B87]">
                  <span>Last Ingestion</span>
                  <span className="text-[#79A88A]">2 hours ago</span>
                </div>
              </div>
            </div>
          )}

          {activeView === 'evaluation' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#879B87] px-1">Latest Benchmark</div>
              <div className="bg-[#171C19] border border-[#2C3530] rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between text-[#879B87]">
                  <span>Precision</span>
                  <span className="text-[#C7F36B] font-mono font-bold">
                    {evaluations[0]?.retrievalSuccessRate || 100}%
                  </span>
                </div>
                <div className="flex justify-between text-[#879B87]">
                  <span>Avg Latency</span>
                  <span className="text-[#F5F3EE] font-mono">
                    {evaluations[0]?.averageLatencyMs || 382}ms
                  </span>
                </div>
                <div className="flex justify-between text-[#879B87]">
                  <span>Groundedness</span>
                  <span className="text-[#79A88A] font-bold">
                    {evaluations[0]?.groundednessScore ? Math.round(evaluations[0].groundednessScore * 100) : 96}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expand Button when secondary is collapsed */}
      {secondaryCollapsed && (
        <button
          onClick={() => setSecondaryCollapsed(false)}
          className="absolute left-18 top-4 z-40 bg-[#171C19] border border-[#2C3530] text-[#879B87] hover:text-[#C7F36B] p-1 rounded-r-md shadow-sm"
          title="Expand operational context"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
