export type UserRole = 'ADMIN' | 'SUPPORT_AGENT' | 'CUSTOMER';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string;
  department?: string;
  assignedCount?: number;
  resolvedCount?: number;
  csatAvg?: number;
  createdAt: string;
}

export type TicketCategory =
  | 'Billing'
  | 'Technical Support'
  | 'Account Access'
  | 'Product Issues'
  | 'Refunds'
  | 'General Inquiry';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus = 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';

export interface TicketComment {
  id: string;
  ticketId: string;
  organizationId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole | 'AI_AGENT';
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface KnowledgeSnippet {
  documentTitle: string;
  section: string;
  page: number;
  snippet: string;
  relevance: number;
}

export interface TicketAnalysis {
  category: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentimentScore: number;
  urgency: TicketPriority;
  summary: string;
  suggestedResponse: string;
  confidenceScore: number;
  relevantKnowledgeSnippets: KnowledgeSnippet[];
}

export interface Ticket {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId: string;
  assignedAgentName: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  sentimentScore?: number;
  resolutionTimeMinutes?: number;
  csatRating?: number;
  analysis?: TicketAnalysis;
  comments?: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  organizationId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  fileSize: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  chunkCount: number;
  uploadedBy: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  organizationId: string;
  title: string;
  section: string;
  pageNumber: number;
  content: string;
  embedding?: number[];
}

export interface Citation {
  documentTitle: string;
  section: string;
  page: number;
  snippet: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  suggestedAction?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface EvaluationTestResult {
  id: string;
  query: string;
  expectedDoc: string;
  retrievedDoc: string;
  relevanceScore: number;
  grounded: boolean;
  latencyMs: number;
  status: 'PASS' | 'FAIL';
}

export interface EvaluationRecord {
  id: string;
  organizationId: string;
  runDate: string;
  totalTests: number;
  successfulRetrievals: number;
  retrievalSuccessRate: number;
  averageRelevanceScore: number;
  groundednessScore: number;
  averageLatencyMs: number;
  status: 'Completed' | 'Running' | 'Failed';
  testResults: EvaluationTestResult[];
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: string;
  createdAt: string;
}

export type ActiveView =
  | 'overview'
  | 'tickets'
  | 'assistant'
  | 'knowledge'
  | 'analytics'
  | 'evaluation'
  | 'team'
  | 'settings';
