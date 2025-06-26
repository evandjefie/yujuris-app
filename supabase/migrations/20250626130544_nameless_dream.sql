/*
  # Correction de l'erreur d'inscription utilisateur

  1. Corrections
    - Mise à jour de la fonction handle_new_user()
    - Correction des contraintes sur la table profiles
    - Amélioration de la gestion d'erreurs

  2. Sécurité
    - Maintien des politiques RLS
    - Gestion des erreurs robuste
*/

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS handle_new_user();

-- Recréer la fonction avec une meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Extraire l'email et le nom de façon sécurisée
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(user_email, '@', 1),
    'Utilisateur'
  );

  -- Insérer le profil avec gestion d'erreur
  BEGIN
    INSERT INTO profiles (
      id, 
      name, 
      email, 
      avatar_url,
      plan,
      remaining_queries
    ) VALUES (
      NEW.id,
      user_name,
      user_email,
      NEW.raw_user_meta_data->>'avatar_url',
      'free',
      5
    );
  EXCEPTION 
    WHEN unique_violation THEN
      -- Si le profil existe déjà, on le met à jour
      UPDATE profiles 
      SET 
        name = user_name,
        email = user_email,
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = now()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log l'erreur mais ne pas faire échouer l'inscription
      RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Vérifier et corriger la table profiles si nécessaire
DO $$
BEGIN
  -- Vérifier si la contrainte de foreign key existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    -- Ajouter la contrainte foreign key si elle n'existe pas
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Améliorer les politiques RLS pour être plus permissives lors de la création
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique pour permettre l'insertion lors de l'inscription
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique pour le service role (pour le trigger)
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fonction utilitaire pour créer un profil manuellement si nécessaire
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_name text DEFAULT NULL,
  user_email text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, name, email, plan, remaining_queries)
  VALUES (
    user_id,
    COALESCE(user_name, 'Utilisateur'),
    COALESCE(user_email, ''),
    'free',
    5
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;