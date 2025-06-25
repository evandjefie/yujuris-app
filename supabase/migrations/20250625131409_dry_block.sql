/*
  # Système de chat et IA

  1. New Tables
    - `chat_conversations` - Conversations des utilisateurs
    - `chat_messages` - Messages individuels
    - `ai_queries` - Requêtes IA avec métadonnées
    - `ai_responses` - Réponses IA avec sources
    - `query_usage_tracking` - Suivi de l'utilisation des requêtes

  2. Security
    - Users can only access their own conversations
    - Usage tracking for plan limits
    - Audit trail for AI interactions

  3. Features
    - Conversation management
    - AI response tracking with sources
    - Usage analytics
    - Query optimization
*/

-- Create chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_archived boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create AI queries table
CREATE TABLE IF NOT EXISTS ai_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE SET NULL,
  message_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  query_text text NOT NULL,
  query_type text DEFAULT 'legal_question' CHECK (query_type IN ('legal_question', 'document_analysis', 'template_generation', 'legal_research')),
  context jsonb DEFAULT '{}', -- Additional context for the query
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_time_ms integer,
  ai_model text DEFAULT 'gemini-pro',
  tokens_used integer,
  cost_fcfa decimal(10,2),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create AI responses table
CREATE TABLE IF NOT EXISTS ai_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES ai_queries(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  confidence_score decimal(3,2), -- 0.00 to 1.00
  sources jsonb DEFAULT '[]', -- Array of legal sources
  metadata jsonb DEFAULT '{}',
  quality_rating integer CHECK (quality_rating BETWEEN 1 AND 5),
  user_feedback text,
  created_at timestamptz DEFAULT now()
);

-- Create query usage tracking table
CREATE TABLE IF NOT EXISTS query_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  query_count integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  cost_fcfa decimal(10,2) DEFAULT 0,
  plan_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create AI model configurations table
CREATE TABLE IF NOT EXISTS ai_model_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text UNIQUE NOT NULL,
  provider text NOT NULL, -- 'gemini', 'openai', 'deepseek'
  version text NOT NULL,
  max_tokens integer NOT NULL,
  cost_per_token decimal(10,6) NOT NULL,
  is_active boolean DEFAULT true,
  capabilities text[] DEFAULT '{}', -- ['legal_analysis', 'document_generation', etc.]
  configuration jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legal source citations table
CREATE TABLE IF NOT EXISTS legal_source_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES ai_responses(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('legal_text', 'legal_article', 'jurisprudence', 'external')),
  source_id uuid, -- References to legal_texts, legal_articles, or jurisprudence
  title text NOT NULL,
  article_number text,
  code_reference text,
  url text,
  excerpt text,
  relevance_score decimal(3,2), -- 0.00 to 1.00
  citation_context text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_source_citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can manage their conversations"
  ON chat_conversations FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Users can manage their messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for ai_queries
CREATE POLICY "Users can view their queries"
  ON ai_queries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage all queries"
  ON ai_queries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ai_responses
CREATE POLICY "Users can view responses to their queries"
  ON ai_responses FOR SELECT
  TO authenticated
  USING (
    query_id IN (
      SELECT id FROM ai_queries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feedback on their responses"
  ON ai_responses FOR UPDATE
  TO authenticated
  USING (
    query_id IN (
      SELECT id FROM ai_queries WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    query_id IN (
      SELECT id FROM ai_queries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all responses"
  ON ai_responses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for query_usage_tracking
CREATE POLICY "Users can view their usage"
  ON query_usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage usage tracking"
  ON query_usage_tracking FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ai_model_configs
CREATE POLICY "Public can read active model configs"
  ON ai_model_configs FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage model configs"
  ON ai_model_configs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for legal_source_citations
CREATE POLICY "Users can view citations for their responses"
  ON legal_source_citations FOR SELECT
  TO authenticated
  USING (
    response_id IN (
      SELECT ar.id FROM ai_responses ar
      JOIN ai_queries aq ON ar.query_id = aq.id
      WHERE aq.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all citations"
  ON legal_source_citations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_updated ON chat_conversations(last_message_at DESC);
CREATE INDEX idx_chat_conversations_archived ON chat_conversations(is_archived);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

CREATE INDEX idx_ai_queries_user ON ai_queries(user_id);
CREATE INDEX idx_ai_queries_conversation ON ai_queries(conversation_id);
CREATE INDEX idx_ai_queries_status ON ai_queries(processing_status);
CREATE INDEX idx_ai_queries_type ON ai_queries(query_type);
CREATE INDEX idx_ai_queries_created ON ai_queries(created_at DESC);

CREATE INDEX idx_ai_responses_query ON ai_responses(query_id);
CREATE INDEX idx_ai_responses_confidence ON ai_responses(confidence_score DESC);
CREATE INDEX idx_ai_responses_rating ON ai_responses(quality_rating);

CREATE INDEX idx_query_usage_user_date ON query_usage_tracking(user_id, date);
CREATE INDEX idx_query_usage_date ON query_usage_tracking(date DESC);

CREATE INDEX idx_ai_model_configs_active ON ai_model_configs(is_active);
CREATE INDEX idx_ai_model_configs_provider ON ai_model_configs(provider);

CREATE INDEX idx_legal_source_citations_response ON legal_source_citations(response_id);
CREATE INDEX idx_legal_source_citations_source ON legal_source_citations(source_type, source_id);
CREATE INDEX idx_legal_source_citations_relevance ON legal_source_citations(relevance_score DESC);

-- Create functions for usage tracking
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id uuid,
  p_tokens_used integer DEFAULT 1,
  p_cost_fcfa decimal DEFAULT 0
)
RETURNS void AS $$
DECLARE
  user_plan text;
BEGIN
  -- Get user plan
  SELECT plan INTO user_plan FROM profiles WHERE id = p_user_id;
  
  -- Insert or update daily usage
  INSERT INTO query_usage_tracking (user_id, date, query_count, tokens_used, cost_fcfa, plan_type)
  VALUES (p_user_id, CURRENT_DATE, 1, p_tokens_used, p_cost_fcfa, user_plan)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    query_count = query_usage_tracking.query_count + 1,
    tokens_used = query_usage_tracking.tokens_used + p_tokens_used,
    cost_fcfa = query_usage_tracking.cost_fcfa + p_cost_fcfa,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check query limits
CREATE OR REPLACE FUNCTION check_query_limit(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_plan text;
  daily_count integer;
  remaining_queries integer;
BEGIN
  -- Get user plan and remaining queries
  SELECT plan, remaining_queries INTO user_plan, remaining_queries FROM profiles WHERE id = p_user_id;
  
  -- Premium users have unlimited queries
  IF user_plan = 'premium' THEN
    RETURN true;
  END IF;
  
  -- Check remaining queries for free users
  RETURN remaining_queries > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_query_usage_tracking_updated_at
  BEFORE UPDATE ON query_usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_model_configs_updated_at
  BEFORE UPDATE ON ai_model_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default AI model configurations
INSERT INTO ai_model_configs (model_name, provider, version, max_tokens, cost_per_token, capabilities, configuration) VALUES
('gemini-pro', 'gemini', '1.0', 32768, 0.0001, ARRAY['legal_analysis', 'document_generation', 'legal_research'], '{"temperature": 0.3, "top_p": 0.95, "top_k": 40}'),
('gemini-pro-vision', 'gemini', '1.0', 16384, 0.0002, ARRAY['document_analysis', 'image_analysis'], '{"temperature": 0.2, "top_p": 0.9}'),
('gpt-4-turbo', 'openai', 'gpt-4-turbo-preview', 128000, 0.0003, ARRAY['legal_analysis', 'document_generation', 'legal_research'], '{"temperature": 0.3, "max_tokens": 4096}'),
('deepseek-chat', 'deepseek', 'deepseek-chat', 32768, 0.00005, ARRAY['legal_analysis', 'legal_research'], '{"temperature": 0.3, "top_p": 0.95}');