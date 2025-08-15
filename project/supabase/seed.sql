-- MAIS Political Command Center - Seed Data
-- Swiss Precision Standards - Consistent Development Environment

-- Disable Row Level Security to insert data
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 1. Seed Roles
-- These should match the roles defined in the migration.
INSERT INTO public.roles (name) VALUES
  ('comite_ejecutivo_nacional'),
  ('lider_regional'),
  ('comite_departamental'),
  ('candidato'),
  ('influenciador_digital'),
  ('lider_comunitario'),
  ('votante_simpatizante')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Test Users in Supabase Auth
-- Use a secure, common password for all test users. 
-- IMPORTANT: Replace with your actual project ref and a secure JWT secret in a real scenario.
-- This is a simplified example for local development.

-- Create a temporary function to create users
CREATE OR REPLACE FUNCTION create_test_user(email TEXT, password TEXT) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, instance_id)
  VALUES (user_id, 'authenticated', 'authenticated', email, crypt(password, gen_salt('bf')), now(), '00000000-0000-0000-0000-000000000000');
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Create the users and store their IDs
DO $$
DECLARE 
  cen_user_id uuid;
  lr_user_id uuid;
  cd_user_id uuid;
  cand_user_id uuid;
  cen_role_id uuid;
  lr_role_id uuid;
  cd_role_id uuid;
  cand_role_id uuid;
BEGIN
  -- Get Role IDs
  SELECT id INTO cen_role_id FROM public.roles WHERE name = 'comite_ejecutivo_nacional';
  SELECT id INTO lr_role_id FROM public.roles WHERE name = 'lider_regional';
  SELECT id INTO cd_role_id FROM public.roles WHERE name = 'comite_departamental';
  SELECT id INTO cand_role_id FROM public.roles WHERE name = 'candidato';

  -- Create users and get their IDs
  cen_user_id := create_test_user('nacional@mais.com', 'password123');
  lr_user_id := create_test_user('regional@mais.com', 'password123');
  cd_user_id := create_test_user('departamental@mais.com', 'password123');
  cand_user_id := create_test_user('candidato@mais.com', 'password123');

  -- 3. Seed User Profiles
  INSERT INTO public.user_profiles (id, full_name, email, role_id, territory_zone, is_password_changed)
  VALUES
    (cen_user_id, 'Presidente Nacional', 'nacional@mais.com', cen_role_id, 'zona_norte', false),
    (lr_user_id, 'Líder Regional Sur', 'regional@mais.com', lr_role_id, 'zona_sur', false),
    (cd_user_id, 'Comité Departamental Centro', 'departamental@mais.com', cd_role_id, 'zona_centro', false),
    (cand_user_id, 'Candidato Oriente', 'candidato@mais.com', cand_role_id, 'zona_oriente', false)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Seed Messages
  INSERT INTO public.messages (sender_id, sender_name, sender_role_id, content, is_urgent, is_confidential)
  VALUES
    (cen_user_id, 'Presidente Nacional', cen_role_id, 'Reunión nacional de estrategia este viernes. Asistencia obligatoria.', true, true),
    (lr_user_id, 'Líder Regional Sur', lr_role_id, 'Necesitamos movilizar a los votantes en la zona sur para el próximo evento.', false, false);

END $$;

-- Clean up the temporary function
DROP FUNCTION create_test_user(TEXT, TEXT);

-- Re-enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
