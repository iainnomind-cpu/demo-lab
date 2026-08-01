-- ============================================================
-- LABORATORIO CLÍNICO - SCHEMA (Supabase / PostgreSQL)
-- Principios: baja lógica, precio congelado, RLS por sucursal
-- ============================================================

-- ---- Extensiones ----
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- ENUMS ----
CREATE TYPE tipo_sucursal AS ENUM ('matriz', 'toma_muestra');
CREATE TYPE rol_usuario   AS ENUM ('admin', 'recepcionista', 'qfb');
CREATE TYPE estado_orden  AS ENUM ('muestra_tomada', 'procesada', 'entregada');
CREATE TYPE estado_recordatorio AS ENUM ('pendiente', 'enviado', 'fallido');

-- ---- TABLAS BASE ----

CREATE TABLE sucursales (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre  VARCHAR(120) NOT NULL,
  tipo    tipo_sucursal NOT NULL,
  activo  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extiende auth.users de Supabase
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol         rol_usuario NOT NULL DEFAULT 'recepcionista',
  sucursal_id UUID REFERENCES sucursales(id),
  nombre      VARCHAR(120),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE medicos_referentes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(150) NOT NULL,
  telefono        VARCHAR(20),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estudios_catalogo (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre             VARCHAR(150) NOT NULL,
  precio             NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  meses_recordatorio INTEGER NOT NULL DEFAULT 12,
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pacientes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(150) NOT NULL,
  fecha_nacimiento DATE,
  email           VARCHAR(150),
  whatsapp        VARCHAR(20),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ordenes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id  UUID NOT NULL REFERENCES pacientes(id),
  sucursal_id  UUID NOT NULL REFERENCES sucursales(id),
  medico_id    UUID REFERENCES medicos_referentes(id),
  estado       estado_orden NOT NULL DEFAULT 'muestra_tomada',
  costo_total  NUMERIC(10,2) NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ordenes_estudios (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id         UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  estudio_id       UUID NOT NULL REFERENCES estudios_catalogo(id),
  precio_al_momento NUMERIC(10,2) NOT NULL  -- precio congelado (Principio I)
);

CREATE TABLE egresos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id   UUID NOT NULL REFERENCES sucursales(id),
  monto         NUMERIC(10,2) NOT NULL CHECK (monto >= 0),
  categoria     VARCHAR(80) NOT NULL DEFAULT 'insumos',
  folio_factura VARCHAR(80),
  fecha         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activo        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE recordatorios (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id      UUID NOT NULL REFERENCES pacientes(id),
  estudio_id       UUID NOT NULL REFERENCES estudios_catalogo(id),
  estado           estado_recordatorio NOT NULL DEFAULT 'pendiente',
  fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN HELPER: retorna la sucursal_id del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION current_user_sucursal()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT sucursal_id FROM usuarios WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_user_rol()
RETURNS rol_usuario LANGUAGE sql STABLE AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Principio V
-- ============================================================

ALTER TABLE sucursales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos_referentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_catalogo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_estudios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE egresos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios      ENABLE ROW LEVEL SECURITY;

-- Admin ve todo; recepcionista/qfb ven su sucursal

-- sucursales: todos ven, solo admin modifica
CREATE POLICY "read_sucursales" ON sucursales FOR SELECT USING (true);
CREATE POLICY "write_sucursales" ON sucursales FOR ALL USING (current_user_rol() = 'admin');

-- usuarios: solo admin
CREATE POLICY "admin_usuarios" ON usuarios FOR ALL USING (current_user_rol() = 'admin');

-- catálogos: todos leen, solo admin escribe
CREATE POLICY "read_medicos" ON medicos_referentes FOR SELECT USING (true);
CREATE POLICY "write_medicos" ON medicos_referentes FOR ALL USING (current_user_rol() = 'admin');

CREATE POLICY "read_estudios" ON estudios_catalogo FOR SELECT USING (true);
CREATE POLICY "write_estudios" ON estudios_catalogo FOR ALL USING (current_user_rol() = 'admin');

-- pacientes: todos leen y crean; solo admin elimina lógicamente
CREATE POLICY "all_pacientes" ON pacientes FOR ALL USING (true);

-- ordenes: admin ve todas, recepcionista/qfb solo su sucursal
CREATE POLICY "read_ordenes" ON ordenes FOR SELECT USING (
  current_user_rol() = 'admin' OR sucursal_id = current_user_sucursal()
);
CREATE POLICY "insert_ordenes" ON ordenes FOR INSERT WITH CHECK (
  sucursal_id = current_user_sucursal() OR current_user_rol() = 'admin'
);
CREATE POLICY "update_ordenes" ON ordenes FOR UPDATE USING (
  current_user_rol() = 'admin' OR sucursal_id = current_user_sucursal()
);

-- ordenes_estudios: heredan acceso de la orden
CREATE POLICY "all_ordenes_estudios" ON ordenes_estudios FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ordenes o
    WHERE o.id = orden_id AND (
      o.sucursal_id = current_user_sucursal() OR current_user_rol() = 'admin'
    )
  )
);

-- egresos: admin ve todos, recepcionista solo su sucursal
CREATE POLICY "read_egresos" ON egresos FOR SELECT USING (
  current_user_rol() = 'admin' OR sucursal_id = current_user_sucursal()
);
CREATE POLICY "insert_egresos" ON egresos FOR INSERT WITH CHECK (
  sucursal_id = current_user_sucursal() OR current_user_rol() = 'admin'
);
CREATE POLICY "update_egresos" ON egresos FOR UPDATE USING (current_user_rol() = 'admin');

-- recordatorios: solo admin y qfb
CREATE POLICY "all_recordatorios" ON recordatorios FOR ALL USING (
  current_user_rol() IN ('admin', 'qfb')
);
