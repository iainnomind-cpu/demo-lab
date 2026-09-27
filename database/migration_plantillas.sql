-- ============================================================
-- MIGRACIÓN FASE 4: Módulo de Marketing y Plantillas Meta
-- ============================================================

CREATE TYPE canal_mensaje AS ENUM ('whatsapp', 'email');
CREATE TYPE tipo_plantilla AS ENUM ('marketing', 'utilidad', 'autenticacion');
CREATE TYPE estado_meta AS ENUM ('borrador', 'en_revision', 'aprobada', 'rechazada');

CREATE TABLE plantillas_mensajes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre              VARCHAR(150) NOT NULL,
  canal               canal_mensaje NOT NULL DEFAULT 'whatsapp',
  tipo_notificacion   tipo_plantilla NOT NULL DEFAULT 'marketing',
  contenido           TEXT NOT NULL,
  estado_meta         estado_meta NOT NULL DEFAULT 'borrador',
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_plantillas_modtime
BEFORE UPDATE ON plantillas_mensajes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE plantillas_mensajes ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios pueden leer las plantillas aprobadas, pero solo admin y qfb pueden crearlas o leer todas.
-- Para simplicidad en este CRM clínico: admin y qfb tienen control total, recepcionista solo lee las aprobadas.
CREATE POLICY "read_plantillas" ON plantillas_mensajes FOR SELECT USING (
  current_user_rol() IN ('admin', 'qfb') OR estado_meta = 'aprobada'
);
CREATE POLICY "write_plantillas" ON plantillas_mensajes FOR ALL USING (
  current_user_rol() IN ('admin', 'qfb')
);

-- Insertar algunas plantillas de prueba simulando estados
INSERT INTO plantillas_mensajes (nombre, canal, tipo_notificacion, contenido, estado_meta)
VALUES 
('promo_reactivacion_verano', 'whatsapp', 'marketing', 'Hola {{1}}, en BioLab extrañamos verte. Obtén 15% de desc. en Checkup Básico este verano. ¡Te esperamos!', 'aprobada'),
('recordatorio_ayuno', 'whatsapp', 'utilidad', 'Hola {{1}}, te recordamos presentarte mañana con un ayuno mínimo de {{2}} horas para tus estudios. Saludos de BioLab.', 'aprobada'),
('promo_buen_fin', 'whatsapp', 'marketing', 'Hola {{1}}, aprovecha el Buen Fin en BioLab. 2x1 en química sanguínea.', 'en_revision'),
('resultados_listos', 'email', 'utilidad', 'Estimado/a {{1}}, sus resultados de la orden {{2}} ya están listos. Puede consultarlos en línea.', 'borrador');
