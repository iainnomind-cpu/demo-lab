-- ============================================================
-- MOCK DATA PARA DEMOSTRACIÓN AL CLIENTE
-- ============================================================

-- IMPORTANTE: Para evitar problemas con foreign keys, usamos UUIDs estáticos.
-- Si vuelves a correr este script, primero ejecuta schema.sql para limpiar la BD.

-- 1. Sucursales
INSERT INTO sucursales (id, nombre, tipo) VALUES
('00000000-0000-0000-0000-000000000001', 'Matriz Central', 'matriz'),
('00000000-0000-0000-0000-000000000002', 'Sucursal Norte', 'toma_muestra'),
('00000000-0000-0000-0000-000000000003', 'Sucursal Sur', 'toma_muestra')
ON CONFLICT (id) DO NOTHING;

-- 2. Médicos Referentes
INSERT INTO medicos_referentes (id, nombre_completo, telefono) VALUES
('10000000-0000-0000-0000-000000000001', 'Dr. Roberto Sánchez', '5551234567'),
('10000000-0000-0000-0000-000000000002', 'Dra. María Elena González', '5559876543'),
('10000000-0000-0000-0000-000000000003', 'Dr. Carlos Mendoza', '5554567890')
ON CONFLICT (id) DO NOTHING;

-- 3. Catálogo de Estudios
INSERT INTO estudios_catalogo (id, nombre, precio, meses_recordatorio) VALUES
('20000000-0000-0000-0000-000000000001', 'Biometría Hemática Completa', 250.00, 6),
('20000000-0000-0000-0000-000000000002', 'Química Sanguínea de 27 elementos', 580.00, 12),
('20000000-0000-0000-0000-000000000003', 'Perfil Lipídico', 350.00, 6),
('20000000-0000-0000-0000-000000000004', 'Examen General de Orina', 120.00, 12),
('20000000-0000-0000-0000-000000000005', 'Hemoglobina Glucosilada', 300.00, 3)
ON CONFLICT (id) DO NOTHING;

-- 4. Pacientes
INSERT INTO pacientes (id, nombre_completo, fecha_nacimiento, email, whatsapp) VALUES
('30000000-0000-0000-0000-000000000001', 'Juan Pérez López', '1985-04-12', 'juan.perez@example.com', '5550001111'),
('30000000-0000-0000-0000-000000000002', 'Ana Silvia Torres', '1990-11-25', 'ana.torres@example.com', '5550002222'),
('30000000-0000-0000-0000-000000000003', 'Luis Miguel García', '1975-08-08', 'luis.garcia@example.com', '5550003333'),
('30000000-0000-0000-0000-000000000004', 'Carmen Ruiz', '2001-02-14', 'carmen.ruiz@example.com', '5550004444')
ON CONFLICT (id) DO NOTHING;

-- 5. Órdenes (con fechas desfasadas para mostrar el reporte de ingresos)
INSERT INTO ordenes (id, paciente_id, sucursal_id, medico_id, estado, costo_total, fecha_creacion) VALUES
-- Orden de hoy (Matriz)
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'entregada', 830.00, NOW()),
-- Orden de ayer (Sucursal Norte)
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'procesada', 120.00, NOW() - INTERVAL '1 day'),
-- Orden de la semana pasada (Sucursal Sur)
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', NULL, 'muestra_tomada', 350.00, NOW() - INTERVAL '5 days'),
-- Orden antigua para probar recordatorios (Hace 6 meses)
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'entregada', 250.00, NOW() - INTERVAL '6 months')
ON CONFLICT (id) DO NOTHING;

-- 6. Detalles de las órdenes (Ordenes_Estudios)
-- Como esta tabla no tiene primary key 'id' seteado manual, borramos por orden_id primero por si acaso
DELETE FROM ordenes_estudios WHERE orden_id IN ('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004');
INSERT INTO ordenes_estudios (orden_id, estudio_id, precio_al_momento) VALUES
-- Orden 1: Biometría (250) + Química Sanguínea (580) = 830
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 250.00),
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 580.00),
-- Orden 2: Orina (120)
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 120.00),
-- Orden 3: Perfil Lipídico (350)
('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 350.00),
-- Orden 4: Biometría (250)
('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 250.00);

-- 7. Egresos (Para dar color al reporte financiero)
-- (Sin ID fijo, así que solo insertamos de nuevo, no es destructivo que se dupliquen)
INSERT INTO egresos (sucursal_id, monto, categoria, folio_factura, fecha) VALUES
('00000000-0000-0000-0000-000000000001', 1500.00, 'reactivos', 'FACT-001', NOW()),
('00000000-0000-0000-0000-000000000001', 300.00, 'insumos', 'FACT-002', NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000002', 450.00, 'mantenimiento', NULL, NOW() - INTERVAL '1 day');
