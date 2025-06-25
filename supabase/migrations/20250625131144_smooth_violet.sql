/*
  # Création des catégories de documents juridiques

  1. New Tables
    - `document_categories`
      - Catégories principales de documents juridiques
    - `document_subcategories` 
      - Sous-catégories détaillées
    - `legal_domains`
      - Domaines juridiques (OHADA, national, etc.)

  2. Security
    - Enable RLS on all tables
    - Public read access for categories
    - Admin-only write access

  3. Data
    - Populate with comprehensive legal categories
*/

-- Create legal domains table
CREATE TABLE IF NOT EXISTS legal_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  jurisdiction text NOT NULL, -- 'OHADA', 'CI', 'FR', etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text, -- Lucide icon name
  color text DEFAULT '#aa5c2f',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document subcategories table
CREATE TABLE IF NOT EXISTS document_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES document_categories(id) ON DELETE CASCADE,
  legal_domain_id uuid REFERENCES legal_domains(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  template_structure jsonb, -- Structure des champs du template
  is_premium boolean DEFAULT false,
  complexity_level text DEFAULT 'basic' CHECK (complexity_level IN ('basic', 'intermediate', 'advanced')),
  estimated_time_minutes integer DEFAULT 30,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, code)
);

-- Enable RLS
ALTER TABLE legal_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read legal domains"
  ON legal_domains FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can read document categories"
  ON document_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can read document subcategories"
  ON document_subcategories FOR SELECT
  TO public
  USING (is_active = true);

-- Admin policies
CREATE POLICY "Service role can manage legal domains"
  ON legal_domains FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage document categories"
  ON document_categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage document subcategories"
  ON document_subcategories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert legal domains
INSERT INTO legal_domains (code, name, description, jurisdiction) VALUES
('OHADA', 'Droit OHADA', 'Organisation pour l''Harmonisation en Afrique du Droit des Affaires', 'OHADA'),
('CI_NATIONAL', 'Droit ivoirien', 'Droit national de Côte d''Ivoire', 'CI'),
('CI_LOCAL', 'Droit local ivoirien', 'Réglementations locales et municipales', 'CI'),
('UEMOA', 'Droit UEMOA', 'Union Économique et Monétaire Ouest Africaine', 'UEMOA'),
('INTERNATIONAL', 'Droit international', 'Conventions et traités internationaux', 'INTERNATIONAL');

-- Insert document categories
INSERT INTO document_categories (code, name, description, icon, color, sort_order) VALUES
('CONTRACTS', 'Contrats', 'Contrats de toute nature (vente, bail, travail, etc.)', 'FileText', '#2563eb', 1),
('OFFICIAL_ACTS', 'Actes officiels', 'Actes authentiques, sous seing privé, judiciaires', 'Stamp', '#dc2626', 2),
('LEGISLATIVE', 'Textes législatifs', 'Lois, décrets, ordonnances, actes uniformes', 'Scale', '#059669', 3),
('FAMILY_CIVIL', 'Familial & État civil', 'Mariage, naissance, divorce, testament', 'Heart', '#7c3aed', 4),
('CORPORATE', 'Documents d''entreprise', 'Statuts, bilans, PV, actes de société', 'Building2', '#ea580c', 5),
('CONFIDENTIALITY', 'Protection & Confidentialité', 'NDA, secret d''affaires, RGPD', 'Shield', '#0891b2', 6),
('PROCEDURES', 'Procédures juridiques', 'Civiles, pénales, recouvrement, injonctions', 'Gavel', '#be123c', 7),
('REAL_ESTATE', 'Baux & Immobilier', 'Locations professionnelles et privées', 'Home', '#16a34a', 8),
('DEBT_RECOVERY', 'Recouvrement', 'Mises en demeure, injonctions de payer', 'AlertTriangle', '#ca8a04', 9),
('ARBITRATION', 'Arbitrage', 'Procédures d''arbitrage OHADA', 'Users', '#9333ea', 10),
('HR_EMPLOYMENT', 'RH & Travail', 'Contrats de travail, règlements internes', 'UserCheck', '#0d9488', 11),
('BANKING_FINANCE', 'Bancaire & Financier', 'Prêts, garanties, sûretés OHADA', 'CreditCard', '#1d4ed8', 12);

-- Update trigger for categories
CREATE TRIGGER update_legal_domains_updated_at
  BEFORE UPDATE ON legal_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_categories_updated_at
  BEFORE UPDATE ON document_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_subcategories_updated_at
  BEFORE UPDATE ON document_subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();