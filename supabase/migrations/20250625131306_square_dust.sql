/*
  # Système de gestion des documents

  1. New Tables
    - `user_documents` - Documents téléchargés par les utilisateurs
    - `document_analyses` - Analyses IA des documents
    - `generated_documents` - Documents générés à partir de templates
    - `document_versions` - Versioning des documents
    - `document_shares` - Partage de documents entre utilisateurs

  2. Security
    - RLS enabled on all tables
    - Users can only access their own documents
    - Secure file storage integration

  3. Features
    - Document analysis tracking
    - Version control
    - Sharing capabilities
    - Audit trail
*/

-- Create user documents table
CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES document_subcategories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_path text NOT NULL, -- Supabase storage path
  file_hash text, -- For duplicate detection
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzing', 'analyzed', 'error')),
  is_template_generated boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document analyses table
CREATE TABLE IF NOT EXISTS document_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES user_documents(id) ON DELETE CASCADE,
  analysis_type text NOT NULL CHECK (analysis_type IN ('content', 'legal_compliance', 'risk_assessment', 'clause_extraction')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result jsonb DEFAULT '{}',
  confidence_score decimal(3,2), -- 0.00 to 1.00
  processing_time_ms integer,
  ai_model text DEFAULT 'gemini-pro',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create generated documents table
CREATE TABLE IF NOT EXISTS generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES document_subcategories(id) ON DELETE CASCADE,
  title text NOT NULL,
  form_data jsonb NOT NULL, -- User input data
  generated_content text, -- Final document content
  file_path text, -- Generated file storage path
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
  version integer DEFAULT 1,
  is_finalized boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid, -- Can reference user_documents or generated_documents
  document_type text NOT NULL CHECK (document_type IN ('uploaded', 'generated')),
  version_number integer NOT NULL,
  content_hash text NOT NULL,
  file_path text NOT NULL,
  changes_summary text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create document shares table
CREATE TABLE IF NOT EXISTS document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid, -- Can reference user_documents or generated_documents
  document_type text NOT NULL CHECK (document_type IN ('uploaded', 'generated')),
  shared_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with uuid REFERENCES profiles(id) ON DELETE CASCADE,
  permission_level text DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, document_type, shared_by, shared_with)
);

-- Create document access logs table
CREATE TABLE IF NOT EXISTS document_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('uploaded', 'generated')),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('view', 'download', 'edit', 'share', 'delete')),
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_documents
CREATE POLICY "Users can manage their own documents"
  ON user_documents FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view shared documents"
  ON user_documents FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT document_id FROM document_shares 
      WHERE document_type = 'uploaded' 
      AND shared_with = auth.uid() 
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- RLS Policies for document_analyses
CREATE POLICY "Users can view analyses of their documents"
  ON document_analyses FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM user_documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all analyses"
  ON document_analyses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for generated_documents
CREATE POLICY "Users can manage their generated documents"
  ON generated_documents FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view shared generated documents"
  ON generated_documents FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT document_id FROM document_shares 
      WHERE document_type = 'generated' 
      AND shared_with = auth.uid() 
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- RLS Policies for document_versions
CREATE POLICY "Users can view versions of accessible documents"
  ON document_versions FOR SELECT
  TO authenticated
  USING (
    (document_type = 'uploaded' AND document_id IN (
      SELECT id FROM user_documents WHERE user_id = auth.uid()
    )) OR
    (document_type = 'generated' AND document_id IN (
      SELECT id FROM generated_documents WHERE user_id = auth.uid()
    ))
  );

-- RLS Policies for document_shares
CREATE POLICY "Users can manage shares of their documents"
  ON document_shares FOR ALL
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can view shares they received"
  ON document_shares FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid());

-- RLS Policies for document_access_logs
CREATE POLICY "Users can view their own access logs"
  ON document_access_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can log all access"
  ON document_access_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_subcategory ON user_documents(subcategory_id);
CREATE INDEX idx_user_documents_status ON user_documents(status);
CREATE INDEX idx_user_documents_created_at ON user_documents(created_at DESC);

CREATE INDEX idx_document_analyses_document_id ON document_analyses(document_id);
CREATE INDEX idx_document_analyses_status ON document_analyses(status);
CREATE INDEX idx_document_analyses_type ON document_analyses(analysis_type);

CREATE INDEX idx_generated_documents_user_id ON generated_documents(user_id);
CREATE INDEX idx_generated_documents_subcategory ON generated_documents(subcategory_id);
CREATE INDEX idx_generated_documents_status ON generated_documents(status);

CREATE INDEX idx_document_versions_document ON document_versions(document_id, document_type);
CREATE INDEX idx_document_shares_shared_with ON document_shares(shared_with);
CREATE INDEX idx_document_access_logs_document ON document_access_logs(document_id, document_type);

-- Update triggers
CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON user_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();