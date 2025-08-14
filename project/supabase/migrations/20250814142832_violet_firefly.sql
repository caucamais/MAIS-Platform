/*
  # MAIS Political Command Center - Complete Database Schema

  1. New Tables
    - `user_profiles` - Extended user profiles with political roles and territory assignments
    - `messages` - Real-time messaging system with territorial and role-based filtering
    - `campaign_finances` - Financial tracking with territorial breakdown
    - `territories` - Geographic and administrative territory definitions
    - `municipalities` - Detailed municipality data with demographics

  2. Security
    - Enable RLS on all tables
    - Role-based access policies for each political hierarchy level
    - Territory-based data isolation
    - Secure financial data access

  3. Real-time Features
    - Message broadcasting with role/territory filtering
    - User status updates
    - Financial data synchronization

  4. Indexes
    - Optimized queries for territorial and role-based filtering
    - Performance indexes for real-time operations
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN (
    'comite_ejecutivo_nacional',
    'lider_regional',
    'comite_departamental',
    'candidato',
    'influenciador_digital',
    'lider_comunitario',
    'votante_simpatizante'
  )),
  territory_zone text NOT NULL CHECK (territory_zone IN (
    'zona_norte',
    'zona_centro',
    'zona_sur',
    'zona_oriente',
    'zona_occidente'
  )),
  municipality text,
  phone text,
  avatar_url text,
  is_password_changed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_role text NOT NULL,
  content text NOT NULL,
  territory_zone text CHECK (territory_zone IN (
    'zona_norte',
    'zona_centro',
    'zona_sur',
    'zona_oriente',
    'zona_occidente'
  )),
  is_urgent boolean DEFAULT false,
  is_confidential boolean DEFAULT false,
  read_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Campaign Finances Table
CREATE TABLE IF NOT EXISTS campaign_finances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_zone text NOT NULL CHECK (territory_zone IN (
    'zona_norte',
    'zona_centro',
    'zona_sur',
    'zona_oriente',
    'zona_occidente'
  )),
  municipality text,
  income numeric(15,2) DEFAULT 0,
  expenses numeric(15,2) DEFAULT 0,
  budget_allocated numeric(15,2) DEFAULT 0,
  budget_used numeric(15,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  updated_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Territories Table
CREATE TABLE IF NOT EXISTS territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone text UNIQUE NOT NULL CHECK (zone IN (
    'zona_norte',
    'zona_centro',
    'zona_sur',
    'zona_oriente',
    'zona_occidente'
  )),
  name text NOT NULL,
  leader_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  coordinates jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Municipalities Table
CREATE TABLE IF NOT EXISTS municipalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  territory_zone text NOT NULL CHECK (territory_zone IN (
    'zona_norte',
    'zona_centro',
    'zona_sur',
    'zona_oriente',
    'zona_occidente'
  )),
  population integer DEFAULT 0,
  registered_voters integer DEFAULT 0,
  coordinates jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "National committee can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'comite_ejecutivo_nacional'
    )
  );

CREATE POLICY "Regional leaders can read territory profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.role = 'comite_ejecutivo_nacional'
        OR (up.role IN ('lider_regional', 'comite_departamental') AND up.territory_zone = user_profiles.territory_zone)
      )
    )
  );

-- Messages Policies
CREATE POLICY "Users can read messages for their territory or public"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    territory_zone IS NULL
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (
        role = 'comite_ejecutivo_nacional'
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
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN (
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
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (
        role = 'comite_ejecutivo_nacional'
        OR territory_zone = messages.territory_zone
      )
    )
  );

-- Campaign Finances Policies
CREATE POLICY "National committee can read all finances"
  ON campaign_finances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'comite_ejecutivo_nacional'
    )
  );

CREATE POLICY "Regional leaders can read territory finances"
  ON campaign_finances
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND (
        role = 'comite_ejecutivo_nacional'
        OR (role IN ('lider_regional', 'comite_departamental', 'candidato') AND territory_zone = campaign_finances.territory_zone)
      )
    )
  );

-- Territories Policies
CREATE POLICY "All authenticated users can read territories"
  ON territories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "National committee can manage territories"
  ON territories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'comite_ejecutivo_nacional'
    )
  );

-- Municipalities Policies
CREATE POLICY "All authenticated users can read municipalities"
  ON municipalities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "National committee can manage municipalities"
  ON municipalities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'comite_ejecutivo_nacional'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_territory ON user_profiles(territory_zone);
CREATE INDEX IF NOT EXISTS idx_messages_territory ON messages(territory_zone);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_campaign_finances_territory ON campaign_finances(territory_zone);
CREATE INDEX IF NOT EXISTS idx_municipalities_territory ON municipalities(territory_zone);

-- Insert initial territory data
INSERT INTO territories (zone, name, coordinates) VALUES
  ('zona_norte', 'Zona Norte', '{"lat": 3.0, "lng": -76.5}'),
  ('zona_centro', 'Zona Centro', '{"lat": 2.4, "lng": -76.6}'),
  ('zona_sur', 'Zona Sur', '{"lat": 1.8, "lng": -76.7}'),
  ('zona_oriente', 'Zona Oriente', '{"lat": 2.5, "lng": -76.0}'),
  ('zona_occidente', 'Zona Occidente', '{"lat": 2.2, "lng": -77.2}')
ON CONFLICT (zone) DO NOTHING;

-- Insert municipality data
INSERT INTO municipalities (name, territory_zone, population, registered_voters, coordinates) VALUES
  -- Zona Norte
  ('Santander de Quilichao', 'zona_norte', 95000, 65000, '{"lat": 3.0065, "lng": -76.4845}'),
  ('Caloto', 'zona_norte', 18500, 12500, '{"lat": 3.0234, "lng": -76.4567}'),
  ('Guachené', 'zona_norte', 22000, 15000, '{"lat": 3.1234, "lng": -76.3456}'),
  ('Villa Rica', 'zona_norte', 15000, 10000, '{"lat": 3.0567, "lng": -76.2345}'),
  ('Padilla', 'zona_norte', 8500, 6000, '{"lat": 2.9876, "lng": -76.1234}'),
  
  -- Zona Centro
  ('Popayán', 'zona_centro', 280000, 200000, '{"lat": 2.4448, "lng": -76.6147}'),
  ('Timbío', 'zona_centro', 35000, 25000, '{"lat": 2.3456, "lng": -76.6789}'),
  ('Cajibío', 'zona_centro', 38000, 27000, '{"lat": 2.5678, "lng": -76.5432}'),
  ('Piendamó', 'zona_centro', 45000, 32000, '{"lat": 2.6789, "lng": -76.4321}'),
  ('Morales', 'zona_centro', 28000, 20000, '{"lat": 2.7890, "lng": -76.3210}'),
  
  -- Zona Sur
  ('Bolívar', 'zona_sur', 65000, 45000, '{"lat": 1.8234, "lng": -76.7890}'),
  ('La Sierra', 'zona_sur', 12000, 8500, '{"lat": 1.7345, "lng": -76.6789}'),
  ('Almaguer', 'zona_sur', 22000, 15500, '{"lat": 1.9123, "lng": -76.5678}'),
  ('San Sebastián', 'zona_sur', 15000, 10500, '{"lat": 1.8567, "lng": -76.4567}'),
  ('Sucre', 'zona_sur', 18000, 12500, '{"lat": 1.7890, "lng": -76.3456}'),
  
  -- Zona Oriente
  ('Inzá', 'zona_oriente', 28000, 20000, '{"lat": 2.5432, "lng": -76.0123}'),
  ('Belalcázar', 'zona_oriente', 25000, 18000, '{"lat": 2.4321, "lng": -75.9876}'),
  ('Páez', 'zona_oriente', 42000, 30000, '{"lat": 2.6543, "lng": -75.8765}'),
  ('Silvia', 'zona_oriente', 35000, 25000, '{"lat": 2.7654, "lng": -75.7654}'),
  ('Jambaló', 'zona_oriente', 18000, 13000, '{"lat": 2.8765, "lng": -75.6543}'),
  
  -- Zona Occidente
  ('López de Micay', 'zona_occidente', 25000, 17000, '{"lat": 2.1234, "lng": -77.2345}'),
  ('Timbiquí', 'zona_occidente', 22000, 15000, '{"lat": 2.0123, "lng": -77.3456}'),
  ('Guapi', 'zona_occidente', 30000, 21000, '{"lat": 2.3456, "lng": -77.4567}'),
  ('Argelia', 'zona_occidente', 28000, 19000, '{"lat": 2.4567, "lng": -77.1234}'),
  ('El Tambo', 'zona_occidente', 55000, 38000, '{"lat": 2.5678, "lng": -77.0123}')
ON CONFLICT DO NOTHING;

-- Insert sample campaign finance data
INSERT INTO campaign_finances (territory_zone, income, expenses, budget_allocated, budget_used) VALUES
  ('zona_norte', 150000000, 120000000, 200000000, 140000000),
  ('zona_centro', 300000000, 250000000, 400000000, 280000000),
  ('zona_sur', 100000000, 80000000, 150000000, 95000000),
  ('zona_oriente', 120000000, 95000000, 180000000, 110000000),
  ('zona_occidente', 90000000, 70000000, 130000000, 85000000)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territories_updated_at
  BEFORE UPDATE ON territories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();