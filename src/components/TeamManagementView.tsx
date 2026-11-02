import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Ticket as TicketIcon,
  CheckCircle2,
  Star,
  Mail,
  Building,
  X,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const TeamManagementView: React.FC = () => {
  const { users, tickets, inviteMember } = useData();
  const { isAdmin } = useAuth();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('SUPPORT_AGENT');
  const [newDepartment, setNewDepartment] = useState('Tier 2 Technical Support');
  const [isInviting, setIsInviting] = useState(false);

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    setIsInviting(true);
    try {
      await inviteMember({
        email: newEmail,
        displayName: newName,
        role: newRole,
        department: newDepartment,
      });

      setNewEmail('');
      setNewName('');
      setInviteModalOpen(false);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E4E2DA] pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#879B87] uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B]" />
            <span>Operations Team & Role-Based Access Control</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-[#252A26] tracking-tight">
            Team Management & Workload
          </h1>
          <p className="text-sm text-[#777D75] mt-1">
            Manage organization members, assign operational roles, and monitor individual resolution throughput.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34] transition-all shadow-xs self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-[#879B87] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E4E2DA] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#252A26] placeholder-[#777D75] focus:outline-none focus:border-[#879B87]"
          />
        </div>

        <span className="font-mono text-xs text-[#879B87]">
          Showing {filteredUsers.length} members
        </span>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-[#E4E2DA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3EE] border-b border-[#E4E2DA] text-[#777D75] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Member</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Active Workload</th>
                <th className="py-3 px-5">Resolved Total</th>
                <th className="py-3 px-5">Avg CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DA]">
              {filteredUsers.map((member) => {
                const assignedTickets = tickets.filter((t) => t.assignedAgentId === member.id && t.status !== 'Resolved' && t.status !== 'Closed');
                const resolvedTickets = tickets.filter((t) => t.assignedAgentId === member.id && (t.status === 'Resolved' || t.status === 'Closed'));

                const roleStyles: Record<UserRole, string> = {
                  ADMIN: 'bg-[#202522] text-[#C7F36B] border border-[#2F3B34]',
                  SUPPORT_AGENT: 'bg-[#879B87]/20 text-[#252A26] border border-[#879B87]/30',
                  CUSTOMER: 'bg-[#F5F3EE] text-[#777D75] border border-[#E4E2DA]',
                };

                return (
                  <tr key={member.id} className="hover:bg-[#F5F3EE]/60 transition-colors">
                    <td className="py-3.5 px-5 flex items-center space-x-3">
                      <img src={member.avatarUrl} alt={member.displayName} className="w-8 h-8 rounded-full object-cover border border-[#E4E2DA]" />
                      <div>
                        <p className="font-heading font-bold text-xs text-[#252A26]">{member.displayName}</p>
                        <p className="text-[11px] font-mono text-[#777D75]">{member.email}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${roleStyles[member.role]}`}>
                        {member.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-[#777D75]">
                      {member.department || 'Operations'}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="font-bold text-[#252A26]">{assignedTickets.length}</span>
                        <span className="text-[#879B87] text-[11px]">active cases</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[#79A88A] font-bold">
                      {member.resolvedCount || resolvedTickets.length}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-1 font-mono font-bold text-[#252A26]">
                        <Star className="w-3.5 h-3.5 fill-[#E9A23B] text-[#E9A23B]" />
                        <span>{member.csatAvg ? member.csatAvg.toFixed(1) : '4.9'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVITE TEAM MEMBER MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E2DA] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E2DA] pb-3">
              <h3 className="font-heading font-bold text-base text-[#252A26]">Invite Team Member</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 text-[#777D75] hover:text-[#252A26] rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jennifer Thorne"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="jennifer@supportiq.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none focus:border-[#879B87]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none"
                  >
                    <option value="SUPPORT_AGENT">Support Agent</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#777D75] mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-[#F5F3EE] border border-[#E4E2DA] rounded-xl px-3 py-2 text-xs text-[#252A26] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E4E2DA]">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#777D75] hover:bg-[#F5F3EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 rounded-xl bg-[#202522] text-[#C7F36B] hover:bg-[#2A312D] text-xs font-heading font-bold border border-[#2F3B34]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
