/*
  # Bibliothèque juridique et base de connaissances

  1. New Tables
    - `legal_texts` - Textes juridiques (lois, décrets, etc.)
    - `legal_articles` - Articles spécifiques des textes
    - `jurisprudence` - Décisions de justice
    - `legal_references` - Références croisées entre textes
    - `user_bookmarks` - Favoris des utilisateurs

  2. Security
    - Public read access for legal content
    - Admin-only write access
    - User-specific bookmarks

  3. Features
    - Full-text search capabilities
    - Cross-references between legal texts
    - User bookmarking system
    - Version tracking for legal updates
*/

-- Create legal texts table
CREATE TABLE IF NOT EXISTS legal_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_domain_id uuid REFERENCES legal_domains(id) ON DELETE SET NULL,
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  short_title text,
  type text NOT NULL CHECK (type IN ('law', 'decree', 'ordinance', 'uniform_act', 'regulation', 'directive')),
  number text, -- Numéro officiel (ex: "2012-487")
  publication_date date,
  effective_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'repealed', 'amended', 'draft')),
  summary text,
  full_text text,
  source_url text,
  official_journal_ref text,
  language text DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  metadata jsonb DEFAULT '{}',
  search_vector tsvector, -- For full-text search
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legal articles table
CREATE TABLE IF NOT EXISTS legal_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_text_id uuid REFERENCES legal_texts(id) ON DELETE CASCADE,
  article_number text NOT NULL,
  title text,
  content text NOT NULL,
  section text, -- Section/Chapitre
  subsection text, -- Sous-section
  paragraph_number text,
  is_repealed boolean DEFAULT false,
  amendment_history jsonb DEFAULT '[]',
  cross_references text[], -- References to other articles
  keywords text[] DEFAULT '{}',
  search_vector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(legal_text_id, article_number)
);

-- Create jurisprudence table
CREATE TABLE IF NOT EXISTS jurisprudence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_domain_id uuid REFERENCES legal_domains(id) ON DELETE SET NULL,
  court_name text NOT NULL,
  court_level text NOT NULL CHECK (court_level IN ('supreme', 'appeal', 'first_instance', 'commercial', 'administrative', 'ccja')),
  case_number text NOT NULL,
  decision_date date NOT NULL,
  decision_type text CHECK (decision_type IN ('judgment', 'order', 'ruling', 'advisory')),
  parties text NOT NULL, -- Parties au procès
  subject text NOT NULL,
  summary text,
  full_text text,
  legal_principles text[], -- Principes juridiques dégagés
  cited_articles uuid[], -- References to legal_articles
  keywords text[] DEFAULT '{}',
  publication_status text DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  source_url text,
  search_vector tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legal references table (cross-references)
CREATE TABLE IF NOT EXISTS legal_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('legal_text', 'legal_article', 'jurisprudence')),
  source_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('legal_text', 'legal_article', 'jurisprudence')),
  target_id uuid NOT NULL,
  reference_type text NOT NULL CHECK (reference_type IN ('cites', 'amends', 'repeals', 'implements', 'interprets')),
  context text, -- Context of the reference
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id, reference_type)
);

-- Create user bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('legal_text', 'legal_article', 'jurisprudence')),
  content_id uuid NOT NULL,
  title text NOT NULL, -- User-defined title for the bookmark
  notes text, -- User notes
  tags text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create legal search history table
CREATE TABLE IF NOT EXISTS legal_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  filters jsonb DEFAULT '{}',
  results_count integer DEFAULT 0,
  clicked_results uuid[], -- IDs of results clicked
  search_duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE legal_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisprudence ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_search_history ENABLE ROW LEVEL SECURITY;

-- Public read policies for legal content
CREATE POLICY "Public can read active legal texts"
  ON legal_texts FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Public can read legal articles"
  ON legal_articles FOR SELECT
  TO public
  USING (NOT is_repealed);

CREATE POLICY "Public can read published jurisprudence"
  ON jurisprudence FOR SELECT
  TO public
  USING (publication_status = 'published');

CREATE POLICY "Public can read legal references"
  ON legal_references FOR SELECT
  TO public
  USING (true);

-- Admin policies for content management
CREATE POLICY "Service role can manage legal texts"
  ON legal_texts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage legal articles"
  ON legal_articles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage jurisprudence"
  ON jurisprudence FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage legal references"
  ON legal_references FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User bookmark policies
CREATE POLICY "Users can manage their bookmarks"
  ON user_bookmarks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Search history policies
CREATE POLICY "Users can manage their search history"
  ON legal_search_history FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_legal_texts_domain ON legal_texts(legal_domain_id);
CREATE INDEX idx_legal_texts_type ON legal_texts(type);
CREATE INDEX idx_legal_texts_status ON legal_texts(status);
CREATE INDEX idx_legal_texts_search ON legal_texts USING gin(search_vector);
CREATE INDEX idx_legal_texts_publication_date ON legal_texts(publication_date DESC);

CREATE INDEX idx_legal_articles_text_id ON legal_articles(legal_text_id);
CREATE INDEX idx_legal_articles_number ON legal_articles(article_number);
CREATE INDEX idx_legal_articles_search ON legal_articles USING gin(search_vector);
CREATE INDEX idx_legal_articles_keywords ON legal_articles USING gin(keywords);

CREATE INDEX idx_jurisprudence_domain ON jurisprudence(legal_domain_id);
CREATE INDEX idx_jurisprudence_court ON jurisprudence(court_name, court_level);
CREATE INDEX idx_jurisprudence_date ON jurisprudence(decision_date DESC);
CREATE INDEX idx_jurisprudence_search ON jurisprudence USING gin(search_vector);
CREATE INDEX idx_jurisprudence_keywords ON jurisprudence USING gin(keywords);

CREATE INDEX idx_legal_references_source ON legal_references(source_type, source_id);
CREATE INDEX idx_legal_references_target ON legal_references(target_type, target_id);

CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_content ON user_bookmarks(content_type, content_id);
CREATE INDEX idx_user_bookmarks_tags ON user_bookmarks USING gin(tags);

CREATE INDEX idx_legal_search_history_user ON legal_search_history(user_id);
CREATE INDEX idx_legal_search_history_created ON legal_search_history(created_at DESC);

-- Create functions for full-text search
CREATE OR REPLACE FUNCTION update_legal_text_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.short_title, '') || ' ' ||
    COALESCE(NEW.summary, '') || ' ' ||
    COALESCE(NEW.full_text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_legal_article_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.content, '') || ' ' ||
    array_to_string(NEW.keywords, ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_jurisprudence_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french',
    COALESCE(NEW.subject, '') || ' ' ||
    COALESCE(NEW.summary, '') || ' ' ||
    COALESCE(NEW.full_text, '') || ' ' ||
    COALESCE(NEW.parties, '') || ' ' ||
    array_to_string(NEW.keywords, ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for search vectors
CREATE TRIGGER update_legal_texts_search_vector
  BEFORE INSERT OR UPDATE ON legal_texts
  FOR EACH ROW EXECUTE FUNCTION update_legal_text_search_vector();

CREATE TRIGGER update_legal_articles_search_vector
  BEFORE INSERT OR UPDATE ON legal_articles
  FOR EACH ROW EXECUTE FUNCTION update_legal_article_search_vector();

CREATE TRIGGER update_jurisprudence_search_vector
  BEFORE INSERT OR UPDATE ON jurisprudence
  FOR EACH ROW EXECUTE FUNCTION update_jurisprudence_search_vector();

-- Update triggers for timestamps
CREATE TRIGGER update_legal_texts_updated_at
  BEFORE UPDATE ON legal_texts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_articles_updated_at
  BEFORE UPDATE ON legal_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jurisprudence_updated_at
  BEFORE UPDATE ON jurisprudence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bookmarks_updated_at
  BEFORE UPDATE ON user_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();