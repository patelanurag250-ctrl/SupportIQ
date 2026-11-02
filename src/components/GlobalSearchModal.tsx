import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Ticket as TicketIcon,
  BookOpen,
  User as UserIcon,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ActiveView, Ticket } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  onNavigate: (view: ActiveView) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTicket,
  onNavigate,
}) => {
  const { tickets, documents, users } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.subject.toLowerCase().includes(query.toLowerCase()) ||
      t.customerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const matchedDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.summary.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const matchedUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl border border-[#E4E2DA] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input */}
        <div className="p-4 border-b border-[#E4E2DA] flex items-center space-x-3">
          <Search className="w-5 h-5 text-[#879B87]" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tickets, verified knowledge, agents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm text-[#252A26] placeholder-[#777D75] focus:outline-none"
          />
          <kbd className="font-mono text-[10px] bg-[#F5F3EE] px-2 py-0.5 rounded border border-[#E4E2DA] text-[#777D75]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Tickets */}
          {matchedTickets.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777D75] font-bold px-2">
                Tickets ({matchedTickets.length})
              </span>
              {matchedTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTicket(t);
                    onNavigate('tickets');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#F5F3EE] flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-[#202522] text-[#C7F36B] flex items-center justify-center font-mono text-xs font-bold">
                      {t.priority === 'Critical' ? <Flame className="w-4 h-4 text-[#E66B5B]" /> : <TicketIcon className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#252A26] group-hover:text-[#879B87]">{t.subject}</p>
                      <p className="text-[10px] text-[#777D75] font-mono">{t.id} • {t.customerName} • {t.status}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#879B87] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {matchedDocs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777D75] font-bold px-2">
                Knowledge Base ({matchedDocs.length})
              </span>
              {matchedDocs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onNavigate('knowledge');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#F5F3EE] flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-[#F5F3EE] border border-[#E4E2DA] flex items-center justify-center text-[#252A26]">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#252A26]">{d.title}</p>
                      <p className="text-[10px] text-[#777D75] font-mono">{d.chunkCount} chunks • {d.fileType.toUpperCase()}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#879B87] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Members */}
          {matchedUsers.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777D75] font-bold px-2">
                Team ({matchedUsers.length})
              </span>
              {matchedUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onNavigate('team');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#F5F3EE] flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <img src={u.avatarUrl} alt={u.displayName} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-[#252A26]">{u.displayName}</p>
                      <p className="text-[10px] text-[#777D75] font-mono">{u.email} • {u.role}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#879B87] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {matchedTickets.length === 0 && matchedDocs.length === 0 && matchedUsers.length === 0 && (
            <div className="py-8 text-center text-xs text-[#777D75]">
              No results found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
