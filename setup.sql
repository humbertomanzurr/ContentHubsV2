-- ═══════════════════════════════════════════════════════════════════
-- THECONTENTHUB — REVO LABS — SUPABASE SETUP
-- Run this entire file in Supabase SQL Editor (one click)
-- ═══════════════════════════════════════════════════════════════════

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  status TEXT DEFAULT 'active',
  am TEXT,
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIDEOS
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  title TEXT,
  platform TEXT DEFAULT 'TikTok',
  publish_date TEXT,
  creator TEXT DEFAULT '',
  editor TEXT DEFAULT '',
  cm TEXT DEFAULT '',
  producer TEXT DEFAULT '',
  hook TEXT DEFAULT '',
  format TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  trigger TEXT DEFAULT '',
  pillar TEXT DEFAULT '',
  pauta NUMERIC DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  watch_time_avg NUMERIC DEFAULT 0,
  followers INTEGER DEFAULT 0,
  para_ti NUMERIC,
  siguiendo NUMERIC,
  busqueda NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PIPELINE CARDS
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  title TEXT,
  editor TEXT DEFAULT '',
  due_date TEXT,
  platform TEXT DEFAULT 'TikTok',
  stage TEXT DEFAULT 'brief',
  month TEXT,
  created_at TEXT,
  publish_date TEXT,
  revision_count INTEGER DEFAULT 0
);

-- TARGETS (monthly video goals per client)
CREATE TABLE IF NOT EXISTS targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  client_id TEXT NOT NULL,
  target INTEGER DEFAULT 0,
  UNIQUE(month, client_id)
);

-- USER PROFILES (role + client assignment)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'community',
  client_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ENABLE REALTIME ──────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE targets;

-- ── SEED DATA ────────────────────────────────────────────────────────────────
INSERT INTO clients (id, name, industry, status, am, goal) VALUES
  ('tony',     'Tony',          'Retail',       'active',  'Sofia', 'Brand awareness + crecimiento de seguidores'),
  ('unitam',   'Unitam',        'Moda',         'active',  'Sofia', 'Engagement y comunidad'),
  ('solanum',  'Solanum',       'Fitness',      'active',  'Sofia', 'Brand awareness — debut'),
  ('celularte','Celularte',     'Retail',       'pending', 'Sofia', 'Ventas y tráfico'),
  ('carso',    'Grupo Carso',   'Conglomerado', 'pending', 'Sofia', 'Presencia digital'),
  ('fredinero','Fredinero',     'Fintech',      'pending', 'Sofia', 'Generación de leads'),
  ('matera',   'Matera Motors', 'Automotriz',   'pending', 'Sofia', 'Awareness')
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees (id, name, role, status) VALUES
  ('e009', 'Paco',    'Editor',            'active'),
  ('e010', 'Danny',   'Editor',            'active'),
  ('e011', 'Cristian','Editor',            'active'),
  ('e012', 'Itzel',   'Community Manager', 'active'),
  ('e013', 'Ivanna',  'Community Manager', 'active'),
  ('e014', 'Paula',   'Community Manager', 'active'),
  ('e015', 'Larissa', 'Community Manager', 'active')
ON CONFLICT (id) DO NOTHING;

-- ── SEED VIDEOS (June 2026 data) ────────────────────────────────────────────
INSERT INTO videos (id, client_id, title, platform, publish_date, creator, editor, cm, producer, hook, format, cta, trigger, pillar, pauta, views, likes, comments, shares, saves, duration, watch_time_avg, followers, para_ti, siguiendo, busqueda) VALUES
  ('v001','tony',   'TOP INESPERADO',             'TikTok','2026-06-23','Álvaro Salinas',   'Paco', 'Itzel', '','Impacto',      'Demostracion de Producto','Seguir',       'Sorprendente', 'Entretenimiento',       800,56000,2100,340,890, 760,45,28,520,84,11,5 ),
  ('v002','tony',   'COLECCIÓN MUNDIAL',           'TikTok','2026-06-25','Santiago Paniagua','Paco', 'Itzel', '','Impacto',      'Tendencia',               'Compartir',    'Inspirador',   'Entretenimiento',       800,53000,1980,290,1200,430,38,24,490,81,13,6 ),
  ('v003','tony',   'HAÚL ASMR',                  'TikTok','2026-06-13','Ivanna Paniagua',  'Paco', 'Paula', '','Impacto',      'Demostracion de Producto','Guardar',      'Satisfaccion', 'Entretenimiento',       714,33000,1450,210,340, 890,52,31,310,76,16,8 ),
  ('v004','tony',   'SEMANA SMARTY',               'TikTok','2026-06-22','Álvaro Salinas',   'Danny','Itzel', '','Impacto',      'Hablando a Camara',       'Seguir',       'Curiosidad',   'Educacion',             840,32000,1230,450,280, 340,41,26,290,72,20,8 ),
  ('v005','tony',   'Lo hicimos real',             'TikTok','2026-06-03','Efrén',            'Danny','Itzel', '','Transformacion','Tutorial',                'Guardar',      'Inspirador',   'Educacion',             410,27300,980, 320,180, 720,58,34,250,68,22,10),
  ('v006','tony',   'Vibras de verano',            'TikTok','2026-06-05','Ivanna Paniagua',  'Danny','Paula', '','Deseo',        'Voz en Off',              'Seguir',       'Identificable','Entretenimiento',       410,25000,920, 180,420, 290,30,19,230,65,24,11),
  ('v007','tony',   'REGALO PARA PAPÁ',            'TikTok','2026-06-19','Álvaro Salinas',   'Danny','Itzel', '','Antes/Despues','Tutorial',                'Comprar',      'Deseo',        'Conversion',            400,20000,760, 290,120, 480,44,22,180,61,28,11),
  ('v008','tony',   'PARA MI PAPÁ ES',             'TikTok','2026-06-21','Hugo',             'Danny','Itzel', '','Deseo',        'Tendencia',               'Sin CTA',      'Identificable','Entretenimiento',       400,7461, 890, 340,120, 220,22,14,70, 42,48,10),
  ('v009','tony',   'EXPERTONY CONTESTA P.3',      'TikTok','2026-06-29','Álvaro Salinas',   'Danny','Itzel', '','Pregunta',     'Hablando a Camara',       'Comentar',     'Curiosidad',   'Comunidad',             0,  849,  45,  89, 12,  23, 35,18,8,  38,55,7 ),
  ('v010','unitam', '¡Ya llego a Unitam!',         'TikTok','2026-06-15','Álvaro Salinas',   'Danny','Ivanna','','Impacto',      'Hablando a Camara',       'Visitar Perfil','Sorprendente','Entretenimiento',       800,46000,1780,390,650, 420,28,19,420,79,15,6 ),
  ('v011','unitam', 'Playeras nuevas',             'TikTok','2026-06-12','Paco',             'Danny','Ivanna','','POV',          'Tendencia',               'Compartir',    'Identificable','Entretenimiento',       800,40000,1560,280,890, 340,18,14,370,77,17,6 ),
  ('v012','unitam', 'Prompt Guion Viral ChatGPT',  'TikTok','2026-06-29','Galilea Espinoza', 'Paco', 'Ivanna','','Curiosidad',   'Hablando a Camara',       'Guardar',      'Educativo',    'Educacion',             0,  12000,580, 210,180, 890,45,32,110,88,8, 4 ),
  ('v013','unitam', '1, 2, 3... ¡UNITAM!',         'TikTok','2026-06-18','Mariana García',   'Paco', 'Ivanna','','Historia',     'Tendencia',               'Seguir',       'Gracioso',     'Entretenimiento',       200,8795, 340, 120,89,  67, 15,12,82, 55,36,9 ),
  ('v014','unitam', 'Día del padre',               'TikTok','2026-06-21','Álvaro Salinas',   'Danny','Ivanna','','Deseo',        'Hablando a Camara',       'Compartir',    'Identificable','Entretenimiento',       200,7958, 310, 98, 120, 89, 22,15,74, 50,40,10),
  ('v015','unitam', 'Tiempo Récord',               'TikTok','2026-06-23','Mariana García',   'Paco', 'Ivanna','','Impacto',      'Tutorial',                'Guardar',      'Sorprendente', 'Educacion',             200,719,  34,  18, 8,   45, 30,12,7,  31,58,11),
  ('v016','solanum','This is Solanum',             'TikTok','2026-06-16','Ana Paula',        'Danny','Larissa','','Historia',    'Hablando a Camara',       'Seguir',       'Inspirador',   'Reconocimiento de Marca',700,20000,780, 210,340, 290,42,26,188,70,22,8 )
ON CONFLICT (id) DO NOTHING;
