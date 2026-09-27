-- ============================================================
-- MIGRACIÓN FASE 2 - SISTEMA DE LABORATORIO
-- Ejecutar en el SQL Editor de Supabase
-- Agrega columnas y tablas sin borrar los datos existentes.
-- ============================================================

-- 1. Nuevos tipos de datos (ENUMS)
DO $$ BEGIN
    CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_pago AS ENUM ('pendiente', 'parcial', 'pagado', 'credito');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prioridad_orden AS ENUM ('normal', 'urgente', 'stat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Modificaciones a tablas existentes

-- Pacientes
ALTER TABLE pacientes 
  ADD COLUMN IF NOT EXISTS sexo VARCHAR(10) CHECK (sexo IN ('M', 'F', 'Ambos')),
  ADD COLUMN IF NOT EXISTS curp VARCHAR(18),
  ADD COLUMN IF NOT EXISTS numero_expediente VARCHAR(50),
  ADD COLUMN IF NOT EXISTS aseguradora VARCHAR(100),
  ADD COLUMN IF NOT EXISTS no_poliza VARCHAR(100);

-- Médicos Referentes
ALTER TABLE medicos_referentes
  ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cedula_profesional VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email VARCHAR(150);

-- Estudios Catálogo
ALTER TABLE estudios_catalogo
  ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tipo_muestra VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tubo_requerido VARCHAR(100),
  ADD COLUMN IF NOT EXISTS requiere_ayuno BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS horas_ayuno INTEGER,
  ADD COLUMN IF NOT EXISTS tiempo_entrega_hrs INTEGER,
  ADD COLUMN IF NOT EXISTS area VARCHAR(100),
  ADD COLUMN IF NOT EXISTS instrucciones_paciente TEXT;

-- Órdenes
-- Secuencia para el folio
CREATE SEQUENCE IF NOT EXISTS ordenes_folio_seq START 1;

ALTER TABLE ordenes
  ADD COLUMN IF NOT EXISTS folio VARCHAR(20),
  ADD COLUMN IF NOT EXISTS prioridad prioridad_orden NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS estado_pago estado_pago NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS descuento_monto NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ayuno_confirmado BOOLEAN,
  ADD COLUMN IF NOT EXISTS hora_toma_muestra TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS observaciones_clinicas TEXT,
  ADD COLUMN IF NOT EXISTS nota_interna TEXT;

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

-- 3. Nuevas Tablas

-- Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  metodo metodo_pago NOT NULL,
  referencia VARCHAR(100),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registrado_por UUID REFERENCES auth.users(id)
);

-- Configuración del Laboratorio
CREATE TABLE IF NOT EXISTS config_laboratorio (
  clave VARCHAR(50) PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datos iniciales de configuración
INSERT INTO config_laboratorio (clave, valor, descripcion) VALUES
('nombre_laboratorio', 'Laboratorio Demo', 'Nombre oficial del laboratorio'),
('direccion', 'Av. Principal 123, Centro', 'Dirección fiscal/física'),
('telefono', '555-123-4567', 'Teléfono principal'),
('director_tecnico', 'Q.F.B. Juan Pérez', 'Nombre del responsable sanitario'),
('cedula_profesional', '12345678', 'Cédula del director técnico')
ON CONFLICT (clave) DO NOTHING;

-- 4. RLS y Políticas para Nuevas Tablas

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_laboratorio ENABLE ROW LEVEL SECURITY;

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

-- 5. Garantizar Permisos
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
