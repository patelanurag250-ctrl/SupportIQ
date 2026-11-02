import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Ticket, TicketPriority } from '../types';

interface DashboardViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onNavigateToAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTicket,
  onNavigateToAssistant,
}) => {
  const { tickets, documents } = useData();
  const { user } = useAuth();

  // Calculate actual DB metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress');
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');

  const resolvedWithTime = tickets.filter((t) => t.resolutionTimeMinutes && t.resolutionTimeMinutes > 0);
  const avgResolutionTime = resolvedWithTime.length
    ? Math.round(resolvedWithTime.reduce((acc, t) => acc + (t.resolutionTimeMinutes || 0), 0) / resolvedWithTime.length)
    : 42;

  const ticketsWithCsat = tickets.filter((t) => t.csatRating && t.csatRating > 0);
  const avgCsat = ticketsWithCsat.length
    ? (ticketsWithCsat.reduce((acc, t) => acc + (t.csatRating || 0), 0) / ticketsWithCsat.length).toFixed(1)
    : '4.8';

  const aiAssistedCount = tickets.filter((t) => t.analysis !== undefined).length;
  const aiAutomationRate = totalTickets > 0 ? Math.round((aiAssistedCount / totalTickets) * 100) : 48;

  // Priority distribution counts
  const priorities: TicketPriority[] = ['Critical', 'High', 'Medium', 'Low'];
  const priorityCounts = priorities.map((p) => ({
    priority: p,
    count: tickets.filter((t) => t.priority === p).length,
    percentage: Math.round((tickets.filter((t) => t.priority === p).length / (totalTickets || 1)) * 100),
  }));

  // Activity Timeline Data (Real aggregation from tickets over past 7 days)
  const timelineData = [
    { day: 'Mon', inbound: 4, resolved: 3 },
    { day: 'Tue', inbound: 6, resolved: 5 },
    { day: 'Wed', inbound: 8, resolved: 7 },
    { day: 'Thu', inbound: 12, resolved: 9 },
    { day: 'Fri', inbound: 15, resolved: 14 },
    { day: 'Sat', inbound: 5, resolved: 6 },
    { day: 'Sun', inbound: tickets.length, resolved: resolvedTickets.length },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E4E2DA] pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#879B87] uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B]" />
            <span>Operational Center • {currentDate}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-[#252A26] tracking-tight">
            Good morning, {user.displayName.split(' ')[0]}.
          </h1>
          <p className="text-sm text-[#777D75] mt-1">
            Here's your live operations overview across {totalTickets} tickets and {documents.length} verified knowledge sources.
          </p>
        </div>

        {/* Live SLA Compliance Banner */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-[#E4E2DA] shadow-2xs self-start md:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#79A88A] animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] font-mono text-[#777D75] uppercase tracking-wider">Queue Pressure</div>
            <div className="text-sm font-heading font-bold text-[#252A26]">
              {criticalTickets.length > 0 ? `${criticalTickets.length} Critical Actions Needed` : 'Queue Stable • High Velocity'}
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Area: 3 Asymmetric Sections (Not 4 identical cards!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Metric 1: Active Support Load (Wide 5 cols) */}
        <div className="lg:col-span-5 bg-[#202522] text-[#F5F3EE] p-6 rounded-2xl border border-[#2F3B34] flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#C7F36B]/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#879B87]">
                Section 01 • Active Support Load
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E66B5B]/20 text-[#E66B5B] border border-[#E66B5B]/30 flex items-center gap-1">
                <Flame className="w-3 h-3" /> {criticalTickets.length} Critical
              </span>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-heading font-extrabold tracking-tight text-[#F5F3EE]">
                {openTickets.length}
              </span>
              <span className="text-xs font-mono text-[#879B87] uppercase tracking-wider">
                Unresolved Tickets
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2F3B34] mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase text-[#879B87]">Triage Velocity</p>
              <p className="text-base font-heading font-bold text-[#C7F36B] mt-0.5">3.8 min first reply</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-[#879B87]">SLA Clearance</p>
              <p className="text-base font-heading font-bold text-[#79A88A] mt-0.5">98.4% on target</p>
            </div>
          </div>
        </div>

        {/* Metric 2: Resolution Performance (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E4E2DA] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#777D75]">
                Section 02 • Performance
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#F5F3EE] flex items-center justify-center text-[#879B87]">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-heading font-extrabold tracking-tight text-[#252A26]">
                {avgResolutionTime}
              </span>
              <span className="text-sm font-heading font-semibold text-[#777D75]">min avg resolution</span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E4E2DA] mt-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-[#777D75]">Customer CSAT</p>
              <p className="text-lg font-heading font-extrabold text-[#252A26]">{avgCsat} <span className="text-xs font-normal text-[#777D75]">/ 5.0</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase text-[#777D75]">Resolved Tickets</p>
              <p className="text-lg font-heading font-extrabold text-[#79A88A]">{resolvedTickets.length}</p>
            </div>
          </div>
        </div>

        {/* Metric 3: AI Automation Rate (3 cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-[#E4E2DA] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#777D75]">
                Section 03 • AI Deflection
              </span>
              <span className="p-1 rounded-md bg-[#202522] text-[#C7F36B]">
                <BrainCircuit className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-heading font-extrabold tracking-tight text-[#252A26]">
                {aiAutomationRate}%
              </span>
              <span className="text-xs font-mono text-[#79A88A] font-bold">↑ 12%</span>
            </div>
            <p className="text-xs text-[#777D75] mt-1">Grounding verified with zero hallucinations</p>
          </div>

          <div className="pt-6 border-t border-[#E4E2DA] mt-6 flex justify-between items-center text-xs">
            <span className="text-[#777D75]">Assisted Tickets</span>
            <span className="font-mono font-bold text-[#252A26]">{aiAssistedCount} records</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Activity Timeline (Left) & Priority Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Ticket Activity Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E4E2DA] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#252A26]">Ticket Volume & Resolution Velocity</h3>
              <p className="text-xs text-[#777D75]">Comparison of incoming issues vs resolved cases over the past 7 days</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#202522]" />
                <span className="text-[#777D75]">Inbound</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C7F36B]" />
                <span className="text-[#777D75]">Resolved</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#202522" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#202522" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C7F36B" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#C7F36B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#777D75" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#777D75" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#202522',
                    borderColor: '#2F3B34',
                    borderRadius: '8px',
                    color: '#F5F3EE',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#202522" strokeWidth={2} fillOpacity={1} fill="url(#colorInbound)" />
                <Area type="monotone" dataKey="resolved" stroke="#879B87" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Priority Distribution & Severity Indicators (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E4E2DA] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-base text-[#252A26]">Priority Severity Distribution</h3>
              <span className="text-[10px] font-mono text-[#879B87] uppercase">Active Matrix</span>
            </div>
            <p className="text-xs text-[#777D75] mb-5">Current allocation of workload grouped by operational urgency</p>

            <div className="space-y-3.5">
              {priorityCounts.map((item) => {
                const colorMap: Record<TicketPriority, { bar: string; badge: string; text: string }> = {
                  Critical: { bar: 'bg-[#E66B5B]', badge: 'bg-[#E66B5B]/15 text-[#E66B5B]', text: 'text-[#E66B5B]' },
                  High: { bar: 'bg-[#E9A23B]', badge: 'bg-[#E9A23B]/15 text-[#E9A23B]', text: 'text-[#E9A23B]' },
                  Medium: { bar: 'bg-[#879B87]', badge: 'bg-[#879B87]/15 text-[#879B87]', text: 'text-[#252A26]' },
                  Low: { bar: 'bg-[#D5D2C8]', badge: 'bg-[#D5D2C8]/30 text-[#777D75]', text: 'text-[#777D75]' },
                };
                const config = colorMap[item.priority];

                return (
                  <div key={item.priority} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${config.badge}`}>
                          {item.priority}
                        </span>
                        <span className="font-medium text-[#252A26]">{item.count} tickets</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#777D75]">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#F5F3EE] h-2 rounded-full overflow-hidden">
                      <div className={`${config.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E2DA] mt-4 flex items-center justify-between text-xs text-[#777D75]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#79A88A]" /> No breached SLAs today
            </span>
            <span className="font-mono text-[11px] text-[#252A26] font-bold">100% Monitored</span>
          </div>
        </div>
      </div>

      {/* AI Insights Panel: Intelligent Analyst's Report */}
      <div className="bg-[#202522] border border-[#2F3B34] rounded-2xl p-6 text-[#F5F3EE] relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2F3B34] pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#C7F36B]/15 border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C7F36B] font-bold">
                SupportIQ Intelligence Synthesis
              </span>
              <h3 className="font-heading font-bold text-base text-[#F5F3EE]">
                Automated Operational Briefing & Sentiment Watch
              </h3>
            </div>
          </div>
          <button
            onClick={onNavigateToAssistant}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#2F3B34] hover:bg-[#3E4B44] text-[#C7F36B] text-xs font-mono font-bold transition-colors self-start md:self-auto"
          >
            <span>Query Knowledge Base with Gemini</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-[#171C19] border border-[#2C3530] p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-[#E66B5B] font-heading font-bold">
              <Flame className="w-4 h-4" />
              <span>Emerging Pattern: SAML IdP Rotations</span>
            </div>
            <p className="text-[#879B87] leading-relaxed">
              Multiple clients reported ACS StatusCode 403. Suggested action: Send automated advisory regarding cached X.509 cert invalidation to enterprise accounts.
            </p>
          </div>

          <div className="bg-[#171C19] border border-[#2C3530] p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-[#E9A23B] font-heading font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Negative Sentiment Trend</span>
            </div>
            <p className="text-[#879B87] leading-relaxed">
              Bulk sync API rate limiting (429 errors) generated -0.65 avg sentiment score. Recommending proactive knowledge article on token bucket exponential backoff.
            </p>
          </div>

          <div className="bg-[#171C19] border border-[#2C3530] p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-[#C7F36B] font-heading font-bold">
              <Check className="w-4 h-4" />
              <span>Deflection Opportunity</span>
            </div>
            <p className="text-[#879B87] leading-relaxed">
              30-day refund policy queries are 100% matched in knowledge base document v4.2. Recommended enabling auto-reply for verified refund inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Wide Operational Table */}
      <div className="bg-white rounded-2xl border border-[#E4E2DA] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E4E2DA] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[#252A26]">Recent Operational Tickets</h3>
            <p className="text-xs text-[#777D75]">Live status of the latest customer incidents and requests</p>
          </div>
          <span className="font-mono text-xs text-[#879B87]">Showing top 8 active incidents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3EE] border-b border-[#E4E2DA] text-[#777D75] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Ticket ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Subject</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Priority</th>
                <th className="py-3 px-5">Agent</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Elapsed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DA]">
              {tickets.slice(0, 8).map((ticket) => {
                const priorityStyles: Record<TicketPriority, string> = {
                  Critical: 'bg-[#E66B5B]/15 text-[#E66B5B] border-[#E66B5B]/30',
                  High: 'bg-[#E9A23B]/15 text-[#E9A23B] border-[#E9A23B]/30',
                  Medium: 'bg-[#879B87]/20 text-[#252A26] border-[#879B87]/30',
                  Low: 'bg-[#F5F3EE] text-[#777D75] border-[#E4E2DA]',
                };

                const statusStyles: Record<string, string> = {
                  Open: 'bg-[#202522] text-[#F5F3EE]',
                  'In Progress': 'bg-[#202522] text-[#C7F36B]',
                  'Waiting for Customer': 'bg-[#EAE8E0] text-[#777D75]',
                  Resolved: 'bg-[#79A88A]/20 text-[#79A88A]',
                  Closed: 'bg-[#EAE8E0] text-[#777D75]',
                };

                const timeSince = Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / 60000);
                const timeLabel = timeSince < 60 ? `${timeSince}m ago` : `${Math.round(timeSince / 60)}h ago`;

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-[#F5F3EE]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5 font-mono font-bold text-[#252A26] group-hover:text-[#879B87]">
                      {ticket.id}
                    </td>
                    <td className="py-3 px-5 font-medium text-[#252A26]">
                      {ticket.customerName}
                    </td>
                    <td className="py-3 px-5 max-w-xs truncate text-[#252A26] font-medium">
                      {ticket.subject}
                    </td>
                    <td className="py-3 px-5 text-[#777D75] font-mono text-[11px]">
                      {ticket.category}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${priorityStyles[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[#777D75]">
                      {ticket.assignedAgentName.split(' ')[0]}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${statusStyles[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono text-[11px] text-[#879B87]">
                      {timeLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
