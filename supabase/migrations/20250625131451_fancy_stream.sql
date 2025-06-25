/*
  # Système de notifications et audit

  1. New Tables
    - `notifications` - Notifications utilisateur
    - `audit_logs` - Logs d'audit système
    - `system_settings` - Paramètres système
    - `user_preferences` - Préférences utilisateur
    - `subscription_plans` - Plans d'abonnement

  2. Security
    - Users can only access their own notifications and preferences
    - Audit logs accessible to admins only
    - System settings protected

  3. Features
    - Real-time notifications
    - Comprehensive audit trail
    - User preference management
    - Subscription management
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'legal_update', 'document_ready', 'plan_limit', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata jsonb DEFAULT '{}',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  is_editable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, key)
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_fcfa decimal(10,2) NOT NULL,
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'quarterly', 'yearly')),
  features jsonb NOT NULL DEFAULT '{}',
  limits jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  auto_renew boolean DEFAULT true,
  payment_method text,
  last_payment_date timestamptz,
  next_payment_date timestamptz,
  total_paid_fcfa decimal(10,2) DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legal updates table
CREATE TABLE IF NOT EXISTS legal_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text,
  type text NOT NULL CHECK (type IN ('new_law', 'amendment', 'jurisprudence', 'regulation', 'ohada_update')),
  legal_domain_id uuid REFERENCES legal_domains(id) ON DELETE SET NULL,
  affected_articles uuid[], -- References to legal_articles
  importance text DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  publication_date date NOT NULL,
  effective_date date,
  source_url text,
  is_published boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user legal update subscriptions
CREATE TABLE IF NOT EXISTS user_legal_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  legal_domain_id uuid REFERENCES legal_domains(id) ON DELETE CASCADE,
  update_types text[] DEFAULT ARRAY['new_law', 'amendment', 'jurisprudence', 'regulation', 'ohada_update'],
  notification_frequency text DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, legal_domain_id)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_legal_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can manage their notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for audit_logs
CREATE POLICY "Service role can manage audit logs"
  ON audit_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for system_settings
CREATE POLICY "Public can read public settings"
  ON system_settings FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Service role can manage system settings"
  ON system_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for subscription_plans
CREATE POLICY "Public can read active plans"
  ON subscription_plans FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage plans"
  ON subscription_plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for legal_updates
CREATE POLICY "Public can read published updates"
  ON legal_updates FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Service role can manage legal updates"
  ON legal_updates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_legal_subscriptions
CREATE POLICY "Users can manage their legal subscriptions"
  ON user_legal_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_category ON user_preferences(category);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_sort ON subscription_plans(sort_order);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_dates ON user_subscriptions(start_date, end_date);

CREATE INDEX idx_legal_updates_published ON legal_updates(is_published);
CREATE INDEX idx_legal_updates_date ON legal_updates(publication_date DESC);
CREATE INDEX idx_legal_updates_domain ON legal_updates(legal_domain_id);
CREATE INDEX idx_legal_updates_importance ON legal_updates(importance);

CREATE INDEX idx_user_legal_subscriptions_user ON user_legal_subscriptions(user_id);
CREATE INDEX idx_user_legal_subscriptions_domain ON user_legal_subscriptions(legal_domain_id);
CREATE INDEX idx_user_legal_subscriptions_active ON user_legal_subscriptions(is_active);

-- Create functions for audit logging
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, 
    old_values, new_values, metadata
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for sending notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL,
  p_priority text DEFAULT 'normal',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, action_url, 
    action_label, priority, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_action_url,
    p_action_label, p_priority, p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_updates_updated_at
  BEFORE UPDATE ON legal_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_legal_subscriptions_updated_at
  BEFORE UPDATE ON user_legal_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (code, name, description, price_fcfa, billing_period, features, limits, is_popular, sort_order) VALUES
('FREE', 'Gratuit', 'Plan de base pour découvrir Yujuris', 0, 'monthly', 
 '{"queries_per_day": 5, "document_analysis": "basic", "templates": "basic", "support": "community"}',
 '{"max_documents": 10, "max_conversations": 5, "ai_models": ["gemini-pro"]}', 
 false, 1),
 
('PREMIUM', 'Premium', 'Accès complet à toutes les fonctionnalités', 5000, 'monthly',
 '{"queries_unlimited": true, "document_analysis": "advanced", "templates": "all", "support": "priority", "legal_updates": true, "export_pdf": true, "audio_reading": true}',
 '{"max_documents": -1, "max_conversations": -1, "ai_models": ["gemini-pro", "gemini-pro-vision", "gpt-4-turbo"]}',
 true, 2),
 
('ENTERPRISE', 'Entreprise', 'Solution complète pour les cabinets et entreprises', 15000, 'monthly',
 '{"queries_unlimited": true, "document_analysis": "enterprise", "templates": "all", "support": "dedicated", "legal_updates": true, "export_pdf": true, "audio_reading": true, "team_collaboration": true, "custom_templates": true, "api_access": true}',
 '{"max_documents": -1, "max_conversations": -1, "max_team_members": 10, "ai_models": ["all"]}',
 false, 3);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"Yujuris"', 'Nom de l''application', 'general', true),
('app_version', '"1.0.0"', 'Version de l''application', 'general', true),
('maintenance_mode', 'false', 'Mode maintenance activé', 'system', false),
('max_file_size_mb', '10', 'Taille maximale des fichiers en MB', 'uploads', true),
('supported_file_types', '["pdf", "doc", "docx", "txt"]', 'Types de fichiers supportés', 'uploads', true),
('default_language', '"fr"', 'Langue par défaut', 'localization', true),
('contact_email', '"support@yujuris.com"', 'Email de contact', 'general', true),
('legal_notice_url', '"https://yujuris.com/mentions-legales"', 'URL des mentions légales', 'legal', true),
('privacy_policy_url', '"https://yujuris.com/politique-confidentialite"', 'URL de la politique de confidentialité', 'legal', true);