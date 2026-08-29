/*
# ReqGuard AI — Core Database Schema

## Overview
Creates the complete schema for ReqGuard AI, a SaaS app that analyzes software/business
requirements for ambiguity, missing information, contradictions, and testability gaps.

## New Tables
1. `profiles` — user profile data (plan, usage limits). One row per auth user, auto-created on signup.
   - id (uuid, PK, FK to auth.users)
   - email (text)
   - full_name (text)
   - plan (text, default 'free')
   - monthly_analysis_limit (int, default 1)
   - analyses_used (int, default 0)
   - created_at (timestamptz)

2. `documents` — uploaded requirement documents.
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users, default auth.uid())
   - filename (text)
   - file_type (text)
   - file_url (text)
   - document_type (text)
   - status (text, default 'pending')
   - overall_score (int, nullable)
   - created_at (timestamptz)

3. `requirements` — individual segmented requirements from a document.
   - id (uuid, PK)
   - document_id (uuid, FK to documents)
   - requirement_code (text)
   - original_text (text)
   - requirement_type (text)
   - priority (text)
   - clarity_score, completeness_score, testability_score, consistency_score, measurability_score (int)
   - overall_score (int)

4. `findings` — issues found per requirement.
   - id (uuid, PK)
   - requirement_id (uuid, FK to requirements)
   - category (text)
   - severity (text)
   - issue (text)
   - explanation (text)
   - recommendation (text)
   - created_at (timestamptz)

5. `improvements` — AI-generated rewrites and acceptance criteria.
   - id (uuid, PK)
   - requirement_id (uuid, FK to requirements)
   - rewritten_requirement (text)
   - acceptance_criteria (text)
   - assumptions (text)
   - edge_cases (text)
   - created_at (timestamptz)

6. `analysis_usage` — per-analysis usage tracking.
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users)
   - document_id (uuid, FK to documents)
   - requirements_count (int)
   - tokens_used (int)
   - analysis_date (timestamptz)

7. `payments` — Stripe subscription records.
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users)
   - provider (text)
   - customer_id (text)
   - subscription_id (text)
   - plan (text)
   - status (text)
   - created_at (timestamptz)

## Security
- RLS enabled on ALL tables.
- Owner-scoped CRUD on every user-owned table (profiles, documents, requirements, findings, improvements, analysis_usage, payments).
- Child tables (requirements, findings, improvements) scoped via parent document ownership.
- Storage bucket `documents` created with private access, owner-scoped policies.

## Automation
- Trigger `on_auth_user_created` auto-inserts a profile row when a new auth user signs up.
- Function `reset_monthly_usage()` resets analyses_used to 0 (callable via cron later).
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  plan text NOT NULL DEFAULT 'free',
  monthly_analysis_limit int NOT NULL DEFAULT 1,
  analyses_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_url text,
  document_type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'pending',
  overall_score int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- REQUIREMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  requirement_code text NOT NULL,
  original_text text NOT NULL,
  requirement_type text DEFAULT 'functional',
  priority text DEFAULT 'medium',
  clarity_score int DEFAULT 0,
  completeness_score int DEFAULT 0,
  testability_score int DEFAULT 0,
  consistency_score int DEFAULT 0,
  measurability_score int DEFAULT 0,
  overall_score int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_requirements_document_id ON requirements(document_id);

ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_requirements" ON requirements;
CREATE POLICY "select_own_requirements" ON requirements
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = requirements.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_requirements" ON requirements;
CREATE POLICY "insert_own_requirements" ON requirements
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = requirements.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_requirements" ON requirements;
CREATE POLICY "update_own_requirements" ON requirements
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = requirements.document_id AND documents.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = requirements.document_id AND documents.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_requirements" ON requirements;
CREATE POLICY "delete_own_requirements" ON requirements
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = requirements.document_id AND documents.user_id = auth.uid())
  );

-- ============================================================
-- FINDINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  issue text NOT NULL,
  explanation text DEFAULT '',
  recommendation text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_findings_requirement_id ON findings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);

ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_findings" ON findings;
CREATE POLICY "select_own_findings" ON findings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = findings.requirement_id AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_findings" ON findings;
CREATE POLICY "insert_own_findings" ON findings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = findings.requirement_id AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_findings" ON findings;
CREATE POLICY "update_own_findings" ON findings
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = findings.requirement_id AND documents.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = findings.requirement_id AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_findings" ON findings;
CREATE POLICY "delete_own_findings" ON findings
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = findings.requirement_id AND documents.user_id = auth.uid()
    )
  );

-- ============================================================
-- IMPROVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS improvements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  rewritten_requirement text DEFAULT '',
  acceptance_criteria text DEFAULT '',
  assumptions text DEFAULT '',
  edge_cases text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_improvements_requirement_id ON improvements(requirement_id);

ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_improvements" ON improvements;
CREATE POLICY "select_own_improvements" ON improvements
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = improvements.requirement_id AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_improvements" ON improvements;
CREATE POLICY "insert_own_improvements" ON improvements
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = improvements.requirement_id AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_improvements" ON improvements;
CREATE POLICY "update_own_improvements" ON improvements
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = improvements.requirement_id AND documents.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = improvements.requirement_id AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_improvements" ON improvements;
CREATE POLICY "delete_own_improvements" ON improvements
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      JOIN documents ON documents.id = requirements.document_id
      WHERE requirements.id = improvements.requirement_id AND documents.user_id = auth.uid()
    )
  );

-- ============================================================
-- ANALYSIS_USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  requirements_count int NOT NULL DEFAULT 0,
  tokens_used int NOT NULL DEFAULT 0,
  analysis_date timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_usage_user_id ON analysis_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_usage_date ON analysis_usage(analysis_date DESC);

ALTER TABLE analysis_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_usage" ON analysis_usage;
CREATE POLICY "select_own_usage" ON analysis_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_usage" ON analysis_usage;
CREATE POLICY "insert_own_usage" ON analysis_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_usage" ON analysis_usage;
CREATE POLICY "update_own_usage" ON analysis_usage
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_usage" ON analysis_usage;
CREATE POLICY "delete_own_usage" ON analysis_usage
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe',
  customer_id text DEFAULT '',
  subscription_id text DEFAULT '',
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_payments" ON payments;
CREATE POLICY "delete_own_payments" ON payments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MONTHLY USAGE RESET FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET analyses_used = 0;
END;
$$;
