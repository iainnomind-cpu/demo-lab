-- ============================================================
-- LABORATORIO CLÍNICO - SCHEMA (Supabase / PostgreSQL)
-- Principios: baja lógica, precio congelado, RLS por sucursal
-- ============================================================

-- ---- Extensiones ----
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza previa para poder ejecutar el script múltiples veces sin errores
DROP TABLE IF EXISTS recordatorios CASCADE;
DROP TABLE IF EXISTS egresos CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS ordenes_estudios CASCADE;
DROP TABLE IF EXISTS ordenes CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS estudios_catalogo CASCADE;
DROP TABLE IF EXISTS medicos_referentes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;
DROP TABLE IF EXISTS config_laboratorio CASCADE;
DROP TABLE IF EXISTS estudios_catalogo CASCADE;
DROP TABLE IF EXISTS medicos_referentes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;

DROP TYPE IF EXISTS tipo_sucursal CASCADE;
DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS estado_orden CASCADE;
DROP TYPE IF EXISTS estado_recordatorio CASCADE;
DROP TYPE IF EXISTS metodo_pago CASCADE;
DROP TYPE IF EXISTS estado_pago CASCADE;
DROP TYPE IF EXISTS prioridad_orden CASCADE;

-- ---- ENUMS ----
CREATE TYPE tipo_sucursal AS ENUM ('matriz', 'toma_muestra');
CREATE TYPE rol_usuario   AS ENUM ('admin', 'recepcionista', 'qfb');
CREATE TYPE estado_orden  AS ENUM ('muestra_tomada', 'procesada', 'entregada');
CREATE TYPE estado_recordatorio AS ENUM ('pendiente', 'enviado', 'fallido');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'parcial', 'pagado', 'credito');
CREATE TYPE prioridad_orden AS ENUM ('normal', 'urgente', 'stat');

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

-- Trigger para automatizar la creación del usuario en public.usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, rol, nombre)
  VALUES (new.id, 'admin', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE medicos_referentes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(150) NOT NULL,
  telefono        VARCHAR(20),
  especialidad    VARCHAR(100),
  cedula_profesional VARCHAR(50),
  email           VARCHAR(150),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estudios_catalogo (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_interno     VARCHAR(20),
  nombre             VARCHAR(150) NOT NULL,
  precio             NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  tipo_muestra       VARCHAR(100),
  tubo_requerido     VARCHAR(100),
  requiere_ayuno     BOOLEAN DEFAULT false,
  horas_ayuno        INTEGER,
  tiempo_entrega_hrs INTEGER,
  area               VARCHAR(100),
  instrucciones_paciente TEXT,
  meses_recordatorio INTEGER NOT NULL DEFAULT 12,
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pacientes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(150) NOT NULL,
  fecha_nacimiento DATE,
  sexo            VARCHAR(10) CHECK (sexo IN ('M', 'F', 'Ambos')),
  curp            VARCHAR(18),
  numero_expediente VARCHAR(50),
  aseguradora     VARCHAR(100),
  no_poliza       VARCHAR(100),
  email           VARCHAR(150),
  whatsapp        VARCHAR(20),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS ordenes_folio_seq START 1;

CREATE TABLE ordenes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio        VARCHAR(20),
  paciente_id  UUID NOT NULL REFERENCES pacientes(id),
  sucursal_id  UUID NOT NULL REFERENCES sucursales(id),
  medico_id    UUID REFERENCES medicos_referentes(id),
  estado       estado_orden NOT NULL DEFAULT 'muestra_tomada',
  prioridad    prioridad_orden NOT NULL DEFAULT 'normal',
  estado_pago  estado_pago NOT NULL DEFAULT 'pendiente',
  costo_total  NUMERIC(10,2) NOT NULL DEFAULT 0,
  descuento_monto NUMERIC(10,2) DEFAULT 0,
  ayuno_confirmado BOOLEAN,
  hora_toma_muestra TIMESTAMPTZ,
  observaciones_clinicas TEXT,
  nota_interna TEXT,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para generar folio automáticamente 'LAB-YYYY-NNNNN'
CREATE OR REPLACE FUNCTION generate_orden_folio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.folio IS NULL THEN
    NEW.folio := 'LAB-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('ordenes_folio_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_orden_folio ON ordenes;
CREATE TRIGGER trigger_generate_orden_folio
BEFORE INSERT ON ordenes
FOR EACH ROW
EXECUTE FUNCTION generate_orden_folio();

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

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo metodo_pago NOT NULL,
  referencia VARCHAR(100),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registrado_por UUID REFERENCES auth.users(id)
);

CREATE TABLE config_laboratorio (
  clave VARCHAR(50) PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO config_laboratorio (clave, valor, descripcion) VALUES
('nombre_laboratorio', 'Laboratorio Demo', 'Nombre oficial del laboratorio'),
('direccion', 'Av. Principal 123, Centro', 'Dirección fiscal/física'),
('telefono', '555-123-4567', 'Teléfono principal'),
('director_tecnico', 'Q.F.B. Juan Pérez', 'Nombre del responsable sanitario'),
('cedula_profesional', '12345678', 'Cédula del director técnico')
ON CONFLICT (clave) DO NOTHING;

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
ALTER TABLE pagos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_laboratorio ENABLE ROW LEVEL SECURITY;

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

-- Pagos: admin ve todo, recepcionista ve los de su sucursal (a través de ordenes)
CREATE POLICY "read_pagos" ON pagos FOR SELECT USING (
  current_user_rol() = 'admin' OR 
  EXISTS (SELECT 1 FROM ordenes o WHERE o.id = pagos.orden_id AND o.sucursal_id = current_user_sucursal())
);
CREATE POLICY "insert_pagos" ON pagos FOR INSERT WITH CHECK (
  current_user_rol() = 'admin' OR 
  EXISTS (SELECT 1 FROM ordenes o WHERE o.id = orden_id AND o.sucursal_id = current_user_sucursal())
);

-- Configuración: Todos leen, solo admin escribe
CREATE POLICY "read_config" ON config_laboratorio FOR SELECT USING (true);
CREATE POLICY "write_config" ON config_laboratorio FOR ALL USING (current_user_rol() = 'admin');

-- Garantizar Permisos globales
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
