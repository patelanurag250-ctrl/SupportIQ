import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Ticket,
  KnowledgeDocument,
  DocumentChunk,
  User,
  Conversation,
  EvaluationRecord,
  Organization,
  ChatMessage,
  TicketPriority,
  TicketCategory,
  TicketStatus,
  UserRole,
} from '../types';

interface DataContextType {
  tickets: Ticket[];
  documents: KnowledgeDocument[];
  chunks: DocumentChunk[];
  users: User[];
  conversations: Conversation[];
  evaluations: EvaluationRecord[];
  organization: Organization;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  createTicket: (data: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    customerName: string;
    customerEmail: string;
  }) => Promise<Ticket>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  addTicketComment: (ticketId: string, content: string, isInternal: boolean, author: User) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  analyzeTicket: (ticketId: string) => Promise<void>;
  sendChatMessage: (query: string, conversationId?: string, userId?: string) => Promise<{ message: ChatMessage; conversationId: string }>;
  uploadDocument: (data: { title: string; fileName: string; fileType: 'pdf' | 'docx' | 'txt' | 'md'; rawContent: string; summary?: string; uploadedBy?: string }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  runEvaluation: () => Promise<EvaluationRecord>;
  inviteMember: (data: { email: string; displayName: string; role: UserRole; department: string }) => Promise<void>;
  exportCSV: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [organization, setOrganization] = useState<Organization>({
    id: 'org-apex-01',
    name: 'Apex Global Technologies',
    domain: 'apexglobal.com',
    plan: 'Enterprise Operations Tier',
    createdAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTickets(json.data.tickets || []);
          setDocuments(json.data.documents || []);
          setChunks(json.data.chunks || []);
          setUsers(json.data.users || []);
          setConversations(json.data.conversations || []);
          setEvaluations(json.data.evaluations || []);
          if (json.data.organizations && json.data.organizations[0]) {
            setOrganization(json.data.organizations[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createTicket = async (data: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    customerName: string;
    customerEmail: string;
  }): Promise<Ticket> => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed creating ticket');

    const createdTicket: Ticket = result.ticket;

    // Trigger AI Ticket Intelligence analysis
    fetch('/api/ticket/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: createdTicket.id,
        subject: createdTicket.subject,
        description: createdTicket.description,
        category: createdTicket.category,
      }),
    })
      .then((r) => r.json())
      .then(() => refreshData())
      .catch((e) => console.warn('Background ticket analysis failed:', e));

    await refreshData();
    return createdTicket;
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed updating ticket');
    }
    await refreshData();
  };

  const addTicketComment = async (ticketId: string, content: string, isInternal: boolean, author: User) => {
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: author.id,
        authorName: author.displayName,
        authorRole: author.role,
        content,
        isInternal,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed adding comment');
    }
    await refreshData();
  };

  const deleteTicket = async (id: string) => {
    const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed deleting ticket');
    }
    await refreshData();
  };

  const analyzeTicket = async (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;
    const res = await fetch('/api/ticket/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: target.id,
        subject: target.subject,
        description: target.description,
        category: target.category,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed analyzing ticket');
    }
    await refreshData();
  };

  const sendChatMessage = async (
    query: string,
    conversationId?: string,
    userId?: string
  ): Promise<{ message: ChatMessage; conversationId: string }> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, conversationId, userId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Chat request failed');
    await refreshData();
    return { message: json.message, conversationId: json.conversationId };
  };

  const uploadDocument = async (data: {
    title: string;
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'md';
    rawContent: string;
    summary?: string;
    uploadedBy?: string;
  }) => {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed uploading document');
    }
    await refreshData();
  };

  const deleteDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed deleting document');
    }
    await refreshData();
  };

  const runEvaluation = async (): Promise<EvaluationRecord> => {
    const res = await fetch('/api/evaluation/run', { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed running evaluation');
    await refreshData();
    return json.evaluation;
  };

  const inviteMember = async (data: { email: string; displayName: string; role: UserRole; department: string }) => {
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed inviting member');
    }
    await refreshData();
  };

  const exportCSV = () => {
    window.location.href = '/api/analytics/export-csv';
  };

  return (
    <DataContext.Provider
      value={{
        tickets,
        documents,
        chunks,
        users,
        conversations,
        evaluations,
        organization,
        isLoading,
        refreshData,
        createTicket,
        updateTicket,
        addTicketComment,
        deleteTicket,
        analyzeTicket,
        sendChatMessage,
        uploadDocument,
        deleteDocument,
        runEvaluation,
        inviteMember,
        exportCSV,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
