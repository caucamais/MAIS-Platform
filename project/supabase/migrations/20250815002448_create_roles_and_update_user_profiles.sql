-- Create the roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated users to read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow national committee to manage roles" ON public.roles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'comite_ejecutivo_nacional'));

-- Insert existing roles from user_profiles CHECK constraint into the new roles table
-- This assumes the roles in the CHECK constraint are the definitive list
INSERT INTO public.roles (name) VALUES
('comite_ejecutivo_nacional'),
('lider_regional'),
('comite_departamental'),
('candidato'),
('influenciador_digital'),
('lider_comunitario'),
('votante_simpatizante')
ON CONFLICT (name) DO NOTHING; -- Handle cases where roles might already exist if run multiple times

-- Add a temporary role_id column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN role_id uuid;

-- Update the new role_id column based on the existing role (text) column
-- This is a critical data migration step
UPDATE public.user_profiles up
SET role_id = r.id
FROM public.roles r
WHERE up.role = r.name;

-- Make role_id NOT NULL (assuming all existing users have a valid role)
ALTER TABLE public.user_profiles ALTER COLUMN role_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.user_profiles ADD CONSTRAINT fk_role
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;

-- Drop ALL policies that depend on user_profiles.role BEFORE dropping the column
DROP POLICY IF EXISTS "National committee can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Regional leaders can read territory profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read messages for their territory or public" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update message read status" ON messages;
DROP POLICY IF EXISTS "National committee can read all finances" ON campaign_finances;
DROP POLICY IF EXISTS "Regional leaders can read territory finances" ON campaign_finances;
DROP POLICY IF EXISTS "National committee can manage territories" ON territories;
DROP POLICY IF EXISTS "National committee can manage municipalities" ON municipalities;
DROP POLICY IF EXISTS "Allow national committee to manage roles" ON public.roles; -- This policy also depends on user_profiles.role

-- Drop the old role (text) column
ALTER TABLE public.user_profiles DROP COLUMN role;

-- Recreate policies for user_profiles to use role_id instead of role (text)
CREATE POLICY "National committee can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND r_auth.name = 'comite_ejecutivo_nacional'
    )
  );

CREATE POLICY "Regional leaders can read territory profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND (
        r_auth.name = 'comite_ejecutivo_nacional'
        OR (r_auth.name IN ('lider_regional', 'comite_departamental') AND up_auth.territory_zone = user_profiles.territory_zone)
      )
    )
  );

-- Update messages table to use role_id instead of sender_role (text)
-- Add a temporary sender_role_id column
ALTER TABLE public.messages ADD COLUMN sender_role_id uuid;

-- Update the new sender_role_id column based on the existing sender_role (text) column
UPDATE public.messages m
SET sender_role_id = r.id
FROM public.roles r
WHERE m.sender_role = r.name;

-- Make sender_role_id NOT NULL
ALTER TABLE public.messages ALTER COLUMN sender_role_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.messages ADD CONSTRAINT fk_sender_role
FOREIGN KEY (sender_role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;

-- Drop the old sender_role (text) column
ALTER TABLE public.messages DROP COLUMN sender_role;

-- Recreate policies for messages to use sender_role_id
CREATE POLICY "Users can read messages for their territory or public"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    territory_zone IS NULL
    OR EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND (
        r_auth.name = 'comite_ejecutivo_nacional'
        OR territory_zone = messages.territory_zone
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND r_auth.name IN (
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental',
        'candidato',
        'influenciador_digital',
        'lider_comunitario'
      )
    )
  );

CREATE POLICY "Users can update message read status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    territory_zone IS NULL
    OR EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND (
        r_auth.name = 'comite_ejecutivo_nacional'
        OR territory_zone = messages.territory_zone
      )
    )
  );

-- Update campaign_finances table to use role_id in policies
-- No direct column change needed, only policy updates
CREATE POLICY "National committee can read all finances"
  ON campaign_finances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND r_auth.name = 'comite_ejecutivo_nacional'
    )
  );

CREATE POLICY "Regional leaders can read territory finances"
  ON campaign_finances
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND (
        r_auth.name = 'comite_ejecutivo_nacional'
        OR (r_auth.name IN ('lider_regional', 'comite_departamental', 'candidato') AND territory_zone = campaign_finances.territory_zone)
      )
    )
  );

-- Update territories table to use role_id in policies
CREATE POLICY "National committee can manage territories"
  ON territories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND r_auth.name = 'comite_ejecutivo_nacional'
    )
  );

-- Update municipalities table to use role_id in policies
CREATE POLICY "National committee can manage municipalities"
  ON municipalities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up_auth
      JOIN roles r_auth ON up_auth.role_id = r_auth.id
      WHERE up_auth.id = auth.uid()
      AND r_auth.name = 'comite_ejecutivo_nacional'
    )
  );

-- Recreate policy for roles table to use role_id
CREATE POLICY "Allow national committee to manage roles" ON public.roles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles up_auth JOIN roles r_auth ON up_auth.role_id = r_auth.id WHERE up_auth.id = auth.uid() AND r_auth.name = 'comite_ejecutivo_nacional'));
