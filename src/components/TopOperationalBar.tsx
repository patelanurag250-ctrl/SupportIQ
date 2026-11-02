import React, { useState } from 'react';
import {
  Search,
  Bell,
  Check,
  ChevronDown,
  Building2,
  LogIn,
  LogOut,
  UserCheck,
  Radio,
  FileCheck2,
  Flame,
} from 'lucide-react';
import { ActiveView, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface TopOperationalBarProps {
  activeView: ActiveView;
  onOpenSearch: () => void;
  onOpenNewTicket?: () => void;
}

export const TopOperationalBar: React.FC<TopOperationalBarProps> = ({
  activeView,
  onOpenSearch,
  onOpenNewTicket,
}) => {
  const { user, loginWithOAuth, logout, switchDemoRole, isCustomer, isSupabaseConnected } = useAuth();
  const { organization, tickets } = useData();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Critical Ticket Escalated',
      desc: 'TCK-8901 SAML 403 Callback Failure flagged by Elena Rodriguez',
      time: '12m ago',
      icon: Flame,
      color: 'text-[#E66B5B]',
    },
    {
      id: 'notif-2',
      title: 'Knowledge Index Synchronized',
      desc: 'Security Access Policy 2026 indexed into 6 semantic chunks',
      time: '1h ago',
      icon: FileCheck2,
      color: 'text-[#C7F36B]',
    },
    {
      id: 'notif-3',
      title: 'AI Evaluation Benchmark Completed',
      desc: '100% retrieval pass rate across 8 test suites (avg 382ms)',
      time: '2h ago',
      icon: Check,
      color: 'text-[#79A88A]',
    },
  ];

  const viewTitles: Record<ActiveView, string> = {
    overview: 'Operations Overview',
    tickets: 'Support Priority Queues',
    assistant: 'AI Support Intelligence',
    knowledge: 'Knowledge Intelligence Library',
    analytics: 'Performance & Resolution Analytics',
    evaluation: 'RAG Quality Benchmark',
    team: 'Operations Team & Workload',
    settings: 'Organization Settings',
  };

  return (
    <header className="h-14 bg-[#F5F3EE] border-b border-[#E4E2DA] px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Breadcrumbs & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 font-medium text-[#777D75]">
            <Building2 className="w-3.5 h-3.5 text-[#879B87]" />
            <span className="font-heading font-semibold text-[#252A26]">{organization.name}</span>
          </div>
          <span className="text-[#C5C2B8]">/</span>
          <span className="font-mono text-[#777D75] uppercase tracking-wider text-[11px] font-semibold">
            {viewTitles[activeView]}
          </span>
        </div>

        {/* Live Operational Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#EAE8E0] border border-[#DBD8CE]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#79A88A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#79A88A]"></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#252A26]">
            SYSTEM OPERATIONAL • 99.98% SLA
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Quick New Ticket for Customer or Agent */}
        {onOpenNewTicket && (
          <button
            onClick={onOpenNewTicket}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34] transition-all shadow-sm"
          >
            <span>+</span>
            <span>{isCustomer ? 'Submit Ticket' : 'Create Ticket'}</span>
          </button>
        )}

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2DA] hover:border-[#879B87] text-xs text-[#777D75] transition-colors shadow-2xs group"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#879B87] group-hover:text-[#252A26]" />
          <span className="hidden sm:inline">Search tickets, knowledge...</span>
          <kbd className="hidden sm:inline font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#F5F3EE] border border-[#E4E2DA] text-[#777D75]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileDropdownOpen(false);
            }}
            className="p-2 rounded-lg bg-white border border-[#E4E2DA] hover:border-[#879B87] text-[#252A26] relative transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E66B5B] ring-2 ring-[#F5F3EE]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E2DA] rounded-xl shadow-xl z-50 p-3 overflow-hidden animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DA]">
                <span className="text-xs font-heading font-bold text-[#252A26]">Operational Alerts</span>
                <span className="text-[10px] font-mono text-[#879B87]">Live feed</span>
              </div>
              <div className="divide-y divide-[#E4E2DA]/60 mt-1">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start space-x-2.5 hover:bg-[#F5F3EE] px-1 rounded-md transition-colors">
                    <n.icon className={`w-4 h-4 shrink-0 mt-0.5 ${n.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-semibold text-[#252A26] leading-tight">{n.title}</p>
                        <span className="text-[9px] font-mono text-[#777D75]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#777D75] mt-0.5 line-clamp-2">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-2 pl-1 pr-2.5 py-1 rounded-lg bg-white border border-[#E4E2DA] hover:border-[#879B87] transition-all shadow-2xs"
          >
            <img src={user.avatarUrl} alt={user.displayName} className="w-6 h-6 rounded-md object-cover border border-[#E4E2DA]" />
            <div className="text-left hidden md:block">
              <p className="text-xs font-heading font-bold text-[#252A26] leading-none line-clamp-1">{user.displayName}</p>
              <p className="text-[9px] font-mono text-[#879B87] uppercase tracking-wider mt-0.5">
                {user.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#777D75]" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E4E2DA] rounded-xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-1">
              {/* Profile Details */}
              <div className="pb-3 border-b border-[#E4E2DA]">
                <div className="flex items-center space-x-2.5">
                  <img src={user.avatarUrl} alt={user.displayName} className="w-10 h-10 rounded-lg object-cover border border-[#E4E2DA]" />
                  <div className="overflow-hidden">
                    <h4 className="font-heading font-bold text-xs text-[#252A26] truncate">{user.displayName}</h4>
                    <p className="text-[11px] font-mono text-[#777D75] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#202522] text-[#C7F36B]">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Role Testing Switcher */}
              <div className="py-2.5 border-b border-[#E4E2DA]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#879B87] mb-1.5 font-bold">
                  Instant Role Switcher (RBAC Test)
                </p>
                <div className="space-y-1">
                  {(['ADMIN', 'SUPPORT_AGENT', 'CUSTOMER'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchDemoRole(role);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        user.role === role ? 'bg-[#202522] text-[#C7F36B]' : 'hover:bg-[#F5F3EE] text-[#252A26]'
                      }`}
                    >
                      <span>
                        {role === 'ADMIN' ? 'Admin (Root Ops)' : role === 'SUPPORT_AGENT' ? 'Support Agent (Sarah)' : 'Customer (Elena)'}
                      </span>
                      {user.role === role && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supabase Authentication */}
              <div className="pt-2 flex flex-col space-y-1">
                <button
                  onClick={() => {
                    loginWithOAuth('google');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#252A26] hover:bg-[#F5F3EE] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#879B87]" />
                  <span>Supabase OAuth Sign-In</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#E66B5B] hover:bg-[#FDF2F1] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
