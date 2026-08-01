# Quickstart & Validation Guide

## Setup Inicial
1. En Supabase SQL Editor: Ejecutar `database/schema.sql` (crea tablas, roles y RLS).
2. Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Flujo de Validación (End-to-End)
1. **Crear Orden (Phase 5)**: Ingresar a frontend como `recepcionista` en una sucursal `toma_muestra`. Registrar un paciente, asignar estudios y confirmar.
2. **Validar Costo (Constitution IV)**: Verificar en la BD o logs que el `costo_total` se calculó correctamente sin enviar el precio desde el frontend.
3. **Validar Roles (Constitution II)**:
   - Intentar cambiar el estado de la orden a `procesada` con el usuario `recepcionista`.
   - Esperar un bloqueo de la API (`403 Forbidden`).
4. **Ejecutar Egresos y Reporte (Phase 6)**: Crear un egreso con folio de factura. En la pantalla de reportes, verificar ingresos menos egresos.
5. **Ejecutar Motor de Recordatorios (Phase 7)**: Lanzar `POST /api/recordatorios/motor` y revisar que Nodemailer imprime o envía los emails, generando un solo recordatorio por estudio en un rango de 30 días (Constitution VI).
