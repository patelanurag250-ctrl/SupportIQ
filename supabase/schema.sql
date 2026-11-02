-- =====================================================================
-- SupportIQ — Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- Multi-Tenant Operations Architecture for Customer Support & Knowledge Management
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
CREATE TYPE user_role AS ENUM ('ADMIN', 'SUPPORT_AGENT', 'CUSTOMER');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed');
CREATE TYPE ticket_category AS ENUM (
  'Billing',
  'Technical Support',
  'Account Access',
  'Product Issues',
  'Refunds',
  'General Inquiry'
);
CREATE TYPE document_status AS ENUM ('Pending', 'Processing', 'Completed', 'Failed');

-- 3. ORGANIZATIONS TABLE (Tenant Root)
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Enterprise Operations Tier',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USERS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  avatar_url TEXT,
  department TEXT,
  assigned_count INT NOT NULL DEFAULT 0,
  resolved_count INT NOT NULL DEFAULT 0,
  csat_avg NUMERIC(3, 2) DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. KNOWLEDGE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT,
  status document_status NOT NULL DEFAULT 'Pending',
  chunk_count INT NOT NULL DEFAULT 0,
  uploaded_by TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DOCUMENT CHUNKS TABLE (RAG & Semantic Retrieval)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  section TEXT NOT NULL,
  page_number INT NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  token_count INT DEFAULT 0,
  embedding float8[] DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_org ON public.document_chunks(organization_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON public.document_chunks(document_id);

-- 7. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL DEFAULT 'Technical Support',
  priority ticket_priority NOT NULL DEFAULT 'Medium',
  status ticket_status NOT NULL DEFAULT 'Open',
  assigned_agent_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_agent_name TEXT NOT NULL DEFAULT 'Unassigned',
  sentiment TEXT DEFAULT 'Neutral',
  sentiment_score NUMERIC(4, 2) DEFAULT 0.0,
  resolution_time_minutes INT,
  csat_rating INT,
  analysis JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_org ON public.tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON public.tickets(customer_id);

-- 8. TICKET COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_ticket ON public.ticket_comments(ticket_id);

-- 9. AI CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT NULL,
  suggested_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);

-- 11. AI EVALUATION BENCHMARK RUNS
CREATE TABLE IF NOT EXISTS public.evaluations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  run_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_tests INT NOT NULL DEFAULT 0,
  successful_retrievals INT NOT NULL DEFAULT 0,
  retrieval_success_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  average_relevance_score NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
  groundedness_score NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
  average_latency_ms INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Completed',
  test_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user's organization
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS TEXT AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if current user is Admin or Agent
CREATE OR REPLACE FUNCTION public.is_admin_or_agent()
RETURNS BOOLEAN AS $$
  SELECT role IN ('ADMIN', 'SUPPORT_AGENT') FROM public.users WHERE id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Organizations Policies
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (id = public.current_user_org_id());

-- 2. Users Policies
CREATE POLICY "Users can view members of their organization"
  ON public.users FOR SELECT
  USING (organization_id = public.current_user_org_id());

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid()::text);

-- 3. Tickets Policies
CREATE POLICY "Agents and Admins can view all org tickets"
  ON public.tickets FOR SELECT
  USING (
    organization_id = public.current_user_org_id() AND
    (public.is_admin_or_agent() OR customer_id = auth.uid()::text)
  );

CREATE POLICY "Customers and Agents can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (organization_id = public.current_user_org_id());

CREATE POLICY "Agents and Admins can update tickets"
  ON public.tickets FOR UPDATE
  USING (organization_id = public.current_user_org_id() AND public.is_admin_or_agent());

-- 4. Ticket Comments Policies
CREATE POLICY "View ticket comments based on internal flag"
  ON public.ticket_comments FOR SELECT
  USING (
    organization_id = public.current_user_org_id() AND
    (public.is_admin_or_agent() OR is_internal = FALSE)
  );

CREATE POLICY "Insert ticket comments"
  ON public.ticket_comments FOR INSERT
  WITH CHECK (organization_id = public.current_user_org_id());

-- 5. Knowledge Base Policies
CREATE POLICY "View documents within organization"
  ON public.documents FOR SELECT
  USING (organization_id = public.current_user_org_id());

CREATE POLICY "Admins and Agents can mutate documents"
  ON public.documents FOR ALL
  USING (organization_id = public.current_user_org_id() AND public.is_admin_or_agent());

CREATE POLICY "View document chunks"
  ON public.document_chunks FOR SELECT
  USING (organization_id = public.current_user_org_id());

CREATE POLICY "Mutate document chunks"
  ON public.document_chunks FOR ALL
  USING (organization_id = public.current_user_org_id() AND public.is_admin_or_agent());

-- 6. Conversations & Messages
CREATE POLICY "Users can manage their own conversations"
  ON public.conversations FOR ALL
  USING (user_id = auth.uid()::text AND organization_id = public.current_user_org_id());

CREATE POLICY "Users can manage their own messages"
  ON public.messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()::text
    )
  );

-- 7. Evaluations Policies (Admin only)
CREATE POLICY "Admins can view and run evaluations"
  ON public.evaluations FOR ALL
  USING (
    organization_id = public.current_user_org_id() AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
  );

-- =====================================================================
-- SUPABASE STORAGE CONFIGURATION
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-documents', 'knowledge-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can read knowledge documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'knowledge-documents');

CREATE POLICY "Admins and Agents can upload knowledge documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'knowledge-documents');
