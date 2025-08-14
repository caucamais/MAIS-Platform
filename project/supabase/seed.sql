
-- supabase/seed.sql
-- Este script puebla la base de datos con datos iniciales y de prueba.

-- 1. Desactivar Row Level Security (RLS) para poder insertar datos
-- Es crucial reactivarlo al final.
ALTER TABLE territories DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;


-- 2. Insertar los Territorios Jerárquicos
-- Primero, el nivel más alto (Departamento/Región)
INSERT INTO public.territories (name, type) VALUES ('Cauca', 'DEPARTAMENTO') ON CONFLICT (name) DO NOTHING;

-- Luego, los municipios, vinculados al departamento del Cauca
-- ON CONFLICT (name) DO NOTHING evita duplicados si el script se ejecuta varias veces.
INSERT INTO public.territories (name, type, parent_id)
SELECT
    'Popayán',
    'MUNICIPIO',
    (SELECT id from public.territories WHERE name = 'Cauca')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.territories (name, type, parent_id)
SELECT
    'Santander de Quilichao',
    'MUNICIPIO',
    (SELECT id from public.territories WHERE name = 'Cauca')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.territories (name, type, parent_id)
SELECT
    'Inzá',
    'MUNICIPIO',
    (SELECT id from public.territories WHERE name = 'Cauca')
ON CONFLICT (name) DO NOTHING;
-- ... añadir aquí el resto de municipios del Cauca ...


-- 3. Insertar los Roles Organizacionales y Políticos
INSERT INTO public.roles (name) VALUES
    ('Coordinador Regional'),
    ('Diputado'),
    ('Coordinador Zonal'),
    ('Lider Municipal'),
    ('Alcalde'),
    ('Concejal')
ON CONFLICT (name) DO NOTHING;


-- 4. Insertar Usuarios de Ejemplo y Asignarles Roles
-- IMPORTANTE: La creación de usuarios en `auth.users` no se puede hacer directamente con SQL.
-- PASO 1: Crea los usuarios manualmente en el panel de Supabase > Authentication.
-- PASO 2: Obtén el `ID` de cada usuario creado y pégalo en este script.

-- Ejemplo para un Coordinador Regional del Cauca
-- Reemplaza 'UUID_DEL_COORDINADOR_REGIONAL' con el ID real del usuario.
INSERT INTO public.user_roles (user_id, role_id, territory_id)
SELECT
    'a1b2c3d4-e5f6-7890-1234-567890abcdef', -- REEMPLAZAR CON UUID REAL
    (SELECT id FROM public.roles WHERE name = 'Coordinador Regional'),
    (SELECT id FROM public.territories WHERE name = 'Cauca');

-- Ejemplo para un Diputado del Cauca
-- Reemplaza 'UUID_DEL_DIPUTADO' con el ID real del usuario.
INSERT INTO public.user_roles (user_id, role_id, territory_id)
SELECT
    'b2c3d4e5-f6a7-8901-2345-67890abcdef1', -- REEMPLAZAR CON UUID REAL
    (SELECT id FROM public.roles WHERE name = 'Diputado'),
    (SELECT id FROM public.territories WHERE name = 'Cauca');

-- Ejemplo para un Líder Municipal de Popayán
-- Reemplaza 'UUID_DEL_LIDER_MUNICIPAL' con el ID real del usuario.
INSERT INTO public.user_roles (user_id, role_id, territory_id)
SELECT
    'c3d4e5f6-a7b8-9012-3456-7890abcdef12', -- REEMPLAZAR CON UUID REAL
    (SELECT id FROM public.roles WHERE name = 'Lider Municipal'),
    (SELECT id FROM public.territories WHERE name = 'Popayán');


-- 5. Reactivar Row Level Security (RLS)
-- ¡Este es el paso más importante para la seguridad!
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

