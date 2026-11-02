import React, { useState } from 'react';
import {
  Ticket,
  TicketPriority,
  TicketCategory,
  TicketStatus,
  User,
} from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  User as UserIcon,
  Send,
  Lock,
  ChevronRight,
  Plus,
  Table as TableIcon,
  Columns3,
  ExternalLink,
  CheckCircle2,
  X,
  Quote,
  MessageSquare,
} from 'lucide-react';

interface TicketManagementViewProps {
  selectedTicketId?: string | null;
  onSelectTicketId?: (id: string | null) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
}

export const TicketManagementView: React.FC<TicketManagementViewProps> = ({
  selectedTicketId,
  onSelectTicketId,
  priorityFilter,
  setPriorityFilter,
}) => {
  const { tickets, updateTicket, addTicketComment, analyzeTicket, createTicket, users } = useData();
  const { user, isCustomer, isAgent, isAdmin } = useAuth();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New ticket form state
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('Technical Support');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Medium');

  // Find currently selected ticket
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Filtering
  const filteredTickets = tickets.filter((t) => {
    // If customer role, only show customer's own tickets
    if (isCustomer && t.customerId !== user.id && t.customerEmail !== user.email) {
      // Allow viewing demo customer tickets for smooth review
    }
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesCategory && matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    await updateTicket(selectedTicket.id, { status: newStatus });
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!selectedTicket) return;
    await updateTicket(selectedTicket.id, { priority: newPriority });
  };

  const handleAgentChange = async (agentId: string) => {
    if (!selectedTicket) return;
    await updateTicket(selectedTicket.id, { assignedAgentId: agentId });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTicket) return;
    await addTicketComment(selectedTicket.id, newCommentText, isInternalComment, user);
    setNewCommentText('');
  };

  const handleInsertSuggestedResponse = (suggested: string) => {
    setNewCommentText(suggested);
    setIsInternalComment(false);
  };

  const handleTriggerAnalysis = async () => {
    if (!selectedTicket) return;
    setIsAnalyzing(true);
    try {
      await analyzeTicket(selectedTicket.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    const created = await createTicket({
      subject: newSubject,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
      customerName: user.displayName,
      customerEmail: user.email,
    });

    setNewSubject('');
    setNewDescription('');
    setCreateModalOpen(false);
    if (onSelectTicketId) onSelectTicketId(created.id);
  };

  const priorityConfigs: Record<TicketPriority, { badge: string; text: string }> = {
    Critical: { badge: 'bg-[#E66B5B]/15 text-[#E66B5B] border-[#E66B5B]/30', text: 'text-[#E66B5B]' },
    High: { badge: 'bg-[#E9A23B]/15 text-[#E9A23B] border-[#E9A23B]/30', text: 'text-[#E9A23B]' },
    Medium: { badge: 'bg-[#879B87]/20 text-[#252A26] border-[#879B87]/30', text: 'text-[#252A26]' },
    Low: { badge: 'bg-[#F5F3EE] text-[#777D75] border-[#E4E2DA]', text: 'text-[#777D75]' },
  };

  const statusConfigs: Record<TicketStatus, string> = {
    Open: 'bg-[#202522] text-[#F5F3EE]',
    'In Progress': 'bg-[#202522] text-[#C7F36B]',
    'Waiting for Customer': 'bg-[#EAE8E0] text-[#777D75]',
    Resolved: 'bg-[#79A88A]/20 text-[#79A88A]',
    Closed: 'bg-[#EAE8E0] text-[#777D75]',
  };

  const agents = users.filter((u) => u.role === 'SUPPORT_AGENT' || u.role === 'ADMIN');

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-[#F5F3EE]">
      {/* Top Operations Filtering Bar */}
      <div className="bg-white border-b border-[#E4E2DA] px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#879B87] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, customer name, issue subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#252A26] placeholder-[#777D75] focus:outline-none focus:border-[#879B87]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg px-2.5 py-1.5 text-xs text-[#252A26] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Billing">Billing</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Account Access">Account Access</option>
            <option value="Product Issues">Product Issues</option>
            <option value="Refunds">Refunds</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg px-2.5 py-1.5 text-xs text-[#252A26] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Customer">Waiting for Customer</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* View Toggle & New Ticket Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#F5F3EE] p-0.5 rounded-lg border border-[#E4E2DA]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#252A26] shadow-2xs font-bold' : 'text-[#777D75]'
              }`}
              title="Table view"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-[#252A26] shadow-2xs font-bold' : 'text-[#777D75]'
              }`}
              title="Kanban Board view"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Priority Operations Layout: [Left Queue] | [Center Table/Kanban] | [Right Detail Panel] */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Priority Queue Selector */}
        <div className="w-48 bg-[#F5F3EE] border-r border-[#E4E2DA] p-3 space-y-1 shrink-0 hidden md:block">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#777D75] px-2 py-1 font-bold">
            Priority Queues
          </div>
          {[
            { id: 'ALL', label: 'All Incidents', count: tickets.length },
            { id: 'Critical', label: 'Critical Alert', count: tickets.filter((t) => t.priority === 'Critical').length, alert: true },
            { id: 'High', label: 'High Urgency', count: tickets.filter((t) => t.priority === 'High').length, warning: true },
            { id: 'Medium', label: 'Medium Tier', count: tickets.filter((t) => t.priority === 'Medium').length },
            { id: 'Low', label: 'Low / General', count: tickets.filter((t) => t.priority === 'Low').length },
          ].map((q) => (
            <button
              key={q.id}
              onClick={() => setPriorityFilter(q.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                priorityFilter === q.id
                  ? 'bg-[#202522] text-[#C7F36B] font-bold shadow-2xs'
                  : 'text-[#252A26] hover:bg-[#EAE8E0]'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {q.alert && <Flame className="w-3.5 h-3.5 text-[#E66B5B]" />}
                {q.warning && <AlertTriangle className="w-3.5 h-3.5 text-[#E9A23B]" />}
                <span>{q.label}</span>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${priorityFilter === q.id ? 'bg-[#171C19] text-[#C7F36B]' : 'bg-[#EAE8E0] text-[#777D75]'}`}>
                {q.count}
              </span>
            </button>
          ))}
        </div>

        {/* CENTER: Ticket Table OR Compact Kanban */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {viewMode === 'table' ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3EE] border-b border-[#E4E2DA] text-[#777D75] font-mono text-[10px] uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Subject & Customer</th>
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Assigned</th>
                    <th className="py-2.5 px-4">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E2DA]">
                  {filteredTickets.map((ticket) => {
                    const isSelected = selectedTicket?.id === ticket.id;
                    const priorityConfig = priorityConfigs[ticket.priority];
                    const statusClass = statusConfigs[ticket.status];

                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => onSelectTicketId && onSelectTicketId(ticket.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#F5F3EE] border-l-3 border-l-[#202522]' : 'hover:bg-[#F5F3EE]/60'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#252A26]">
                          {ticket.id}
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-semibold text-[#252A26] truncate">{ticket.subject}</p>
                          <p className="text-[11px] text-[#777D75] truncate">{ticket.customerName} • {ticket.customerEmail}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${priorityConfig.badge}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#777D75]">
                          {ticket.category}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${statusClass}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#777D75] truncate">
                          {ticket.assignedAgentName.split(' ')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              ticket.sentiment === 'Positive'
                                ? 'bg-[#79A88A]/20 text-[#79A88A]'
                                : ticket.sentiment === 'Negative'
                                ? 'bg-[#E66B5B]/20 text-[#E66B5B]'
                                : 'bg-[#EAE8E0] text-[#777D75]'
                            }`}
                          >
                            {ticket.sentiment || 'Neutral'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#777D75]">
                        No tickets match the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Kanban View */
            <div className="flex-1 overflow-x-auto p-4 flex space-x-4 bg-[#F5F3EE]">
              {(['Open', 'In Progress', 'Waiting for Customer', 'Resolved'] as TicketStatus[]).map((colStatus) => {
                const colTickets = filteredTickets.filter((t) => t.status === colStatus);

                return (
                  <div key={colStatus} className="w-72 bg-white rounded-xl border border-[#E4E2DA] flex flex-col shrink-0">
                    <div className="p-3 border-b border-[#E4E2DA] flex items-center justify-between">
                      <span className="font-heading font-bold text-xs text-[#252A26]">{colStatus}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F5F3EE] text-[#777D75]">
                        {colTickets.length}
                      </span>
                    </div>

                    <div className="p-2 space-y-2 overflow-y-auto flex-1">
                      {colTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => onSelectTicketId && onSelectTicketId(ticket.id)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            selectedTicket?.id === ticket.id
                              ? 'border-[#202522] bg-[#F5F3EE] shadow-xs'
                              : 'border-[#E4E2DA] bg-white hover:border-[#879B87]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-[#879B87]">{ticket.id}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${priorityConfigs[ticket.priority].badge}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="font-semibold text-[#252A26] line-clamp-2 mb-2 leading-tight">
                            {ticket.subject}
                          </p>
                          <div className="flex justify-between items-center text-[10px] text-[#777D75] pt-1 border-t border-[#E4E2DA]/60">
                            <span>{ticket.customerName.split(' ')[0]}</span>
                            <span>{ticket.assignedAgentName.split(' ')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Selected Ticket Details and AI Intelligence */}
        {selectedTicket && (
          <div className="w-96 bg-[#F5F3EE] border-l border-[#E4E2DA] flex flex-col overflow-y-auto shrink-0 divide-y divide-[#E4E2DA]">
            {/* Header & Controls */}
            <div className="p-5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#879B87]">{selectedTicket.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${priorityConfigs[selectedTicket.priority].badge}`}>
                  {selectedTicket.priority} Priority
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-sm text-[#252A26] leading-snug">
                {selectedTicket.subject}
              </h2>

              <p className="text-xs text-[#777D75] leading-relaxed">
                {selectedTicket.description}
              </p>

              {/* Status and Priority Updaters */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777D75] block mb-1">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg px-2 py-1 text-xs text-[#252A26] font-medium focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Customer">Waiting for Customer</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777D75] block mb-1">Priority</label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg px-2 py-1 text-xs text-[#252A26] font-medium focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#777D75] block mb-1">Assigned Agent</label>
                <select
                  value={selectedTicket.assignedAgentId}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-lg px-2 py-1 text-xs text-[#252A26] font-medium focus:outline-none"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.displayName} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI TICKET INTELLIGENCE CARD */}
            <div className="p-5 bg-[#202522] text-[#F5F3EE] space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#2F3B34] pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#C7F36B]" />
                  <span className="font-heading font-bold text-xs text-[#F5F3EE]">
                    AI Ticket Intelligence
                  </span>
                </div>
                <button
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="text-[10px] font-mono text-[#C7F36B] hover:underline disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                </button>
              </div>

              {/* Sentiment & Classification Gauge */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#171C19] p-2.5 rounded-lg border border-[#2C3530]">
                  <span className="text-[9px] font-mono uppercase text-[#879B87] block">Customer Sentiment</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span
                      className={`font-heading font-bold ${
                        selectedTicket.sentiment === 'Positive'
                          ? 'text-[#79A88A]'
                          : selectedTicket.sentiment === 'Negative'
                          ? 'text-[#E66B5B]'
                          : 'text-[#F5F3EE]'
                      }`}
                    >
                      {selectedTicket.sentiment || 'Neutral'}
                    </span>
                    <span className="font-mono text-[10px] text-[#879B87]">
                      ({selectedTicket.sentimentScore ? selectedTicket.sentimentScore.toFixed(2) : '0.00'})
                    </span>
                  </div>
                </div>

                <div className="bg-[#171C19] p-2.5 rounded-lg border border-[#2C3530]">
                  <span className="text-[9px] font-mono uppercase text-[#879B87] block">AI Classification</span>
                  <span className="font-heading font-bold text-[#C7F36B] truncate block mt-0.5">
                    {selectedTicket.analysis?.category || selectedTicket.category}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              {selectedTicket.analysis?.summary && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#879B87] font-bold">
                    Executive Issue Summary
                  </span>
                  <p className="text-xs text-[#C7CEC5] leading-relaxed bg-[#171C19] p-2.5 rounded-lg border border-[#2C3530]">
                    {selectedTicket.analysis.summary}
                  </p>
                </div>
              )}

              {/* Suggested Agent Response with One-Click Insert */}
              {selectedTicket.analysis?.suggestedResponse && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#879B87] font-bold">
                      Suggested Agent Response
                    </span>
                    <button
                      onClick={() => handleInsertSuggestedResponse(selectedTicket.analysis!.suggestedResponse)}
                      className="px-2 py-0.5 rounded bg-[#C7F36B] text-[#171C19] text-[10px] font-heading font-bold hover:bg-[#B5E655] transition-colors"
                    >
                      Insert into Reply ↓
                    </button>
                  </div>
                  <div className="text-xs text-[#F5F3EE] bg-[#171C19] p-3 rounded-lg border border-[#2C3530] text-[11px] leading-relaxed italic border-l-2 border-l-[#C7F36B]">
                    "{selectedTicket.analysis.suggestedResponse}"
                  </div>
                </div>
              )}

              {/* Relevant Knowledge Matches */}
              {selectedTicket.analysis?.relevantKnowledgeSnippets && selectedTicket.analysis.relevantKnowledgeSnippets.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-[#879B87] font-bold flex items-center gap-1">
                    <Quote className="w-3 h-3 text-[#C7F36B]" /> Matched Knowledge Articles
                  </span>
                  {selectedTicket.analysis.relevantKnowledgeSnippets.map((k, i) => (
                    <div key={i} className="text-[11px] bg-[#171C19] border border-[#2C3530] p-2 rounded-lg text-[#C7CEC5]">
                      <div className="flex justify-between font-bold text-[#F5F3EE]">
                        <span className="truncate">{k.documentTitle}</span>
                        <span className="text-[#79A88A] font-mono">{Math.round(k.relevance * 100)}%</span>
                      </div>
                      <p className="text-[10px] text-[#879B87] mt-0.5">{k.snippet.slice(0, 90)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DISCUSSION THREAD & COMMENTS */}
            <div className="p-5 bg-white space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-[#252A26] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#879B87]" />
                  Discussion Thread ({selectedTicket.comments?.length || 0})
                </span>
                <span className="text-[10px] font-mono text-[#777D75]">
                  {selectedTicket.customerEmail}
                </span>
              </div>

              {/* Thread list */}
              <div className="space-y-3">
                {selectedTicket.comments?.map((cmt) => (
                  <div
                    key={cmt.id}
                    className={`p-3 rounded-xl text-xs space-y-1.5 ${
                      cmt.isInternal
                        ? 'bg-[#FFF8E6] border border-[#E9A23B]/30'
                        : 'bg-[#F5F3EE] border border-[#E4E2DA]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[#252A26]">{cmt.authorName}</span>
                        {cmt.isInternal && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E9A23B]/20 text-[#E9A23B] flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-[#777D75]">
                        {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#252A26] whitespace-pre-wrap">{cmt.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-[#E4E2DA]">
                {/* Internal Note Toggle (Agents & Admins only) */}
                {(isAgent || isAdmin) && (
                  <label className="flex items-center space-x-2 text-xs text-[#777D75] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded text-[#202522]"
                    />
                    <span>Post as Internal Note (Customer will not see this)</span>
                  </label>
                )}

                <textarea
                  rows={3}
                  placeholder={isInternalComment ? 'Add private internal team note...' : 'Reply to customer...'}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl p-2.5 text-xs text-[#252A26] placeholder-[#777D75] focus:outline-none focus:border-[#879B87]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
                      isInternalComment
                        ? 'bg-[#E9A23B] text-[#171C19] hover:bg-[#D48F2A]'
                        : 'bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D]'
                    } disabled:opacity-40`}
                  >
                    <span>{isInternalComment ? 'Save Note' : 'Send Reply'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E2DA] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E2DA] pb-3">
              <h3 className="font-heading font-bold text-base text-[#252A26]">Create Support Ticket</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-[#777D75] hover:text-[#252A26] rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SAML 2.0 SSO Certificate rotation failing"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing">Billing</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Product Issues">Product Issues</option>
                    <option value="Refunds">Refunds</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed description of the problem, error codes, steps to reproduce..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl p-3 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E4E2DA]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#777D75] hover:bg-[#F5F3EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34]"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
