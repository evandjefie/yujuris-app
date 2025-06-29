/*
  # Fix user profile creation function

  1. Changes
    - Drop trigger first before dropping function
    - Improve error handling in profile creation
    - Add utility function for manual profile creation
    - Update RLS policies for better profile management

  2. Security
    - Maintain RLS policies
    - Secure function execution
    - Proper error handling
*/

-- Drop trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Extract email and name safely
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(user_email, '@', 1),
    'Utilisateur'
  );

  -- Insert profile with error handling
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
      -- If profile already exists, update it
      UPDATE profiles 
      SET 
        name = user_name,
        email = user_email,
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = now()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the signup
      RAISE WARNING 'Error creating profile for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Check and fix profiles table if necessary
DO $$
BEGIN
  -- Check if foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    -- Add foreign key constraint if it doesn't exist
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Improve RLS policies for better profile creation handling
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Recreate policies
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

-- Policy to allow insertion during signup
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for service role (for trigger)
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Utility function to create profile manually if needed
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