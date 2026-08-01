# REST API Contracts (Express)

## Autenticación
El frontend maneja login vía `@supabase/supabase-js`. 
Todas las llamadas a la API (excepto auth) requieren el header:
`Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`

## Endpoints Principales

### `GET /api/sucursales`
- Desc: Lista sucursales activas.
- Permisos: Todos (admin ve todas, recepcionista ve la suya).

### `POST /api/ordenes`
- Desc: Crea una nueva orden de estudios.
- Body: `{ paciente_id, medico_id, sucursal_id, estudios: [ { estudio_id } ] }`
- Response: `201 Created` con el detalle y `costo_total` (calculado en backend).
- Constraints: backend busca el precio en `estudios_catalogo` y lo congela en `ordenes_estudios`.

### `PATCH /api/ordenes/:id/estado`
- Desc: Transiciona el estado de la orden.
- Body: `{ estado }` (enum: 'muestra_tomada', 'procesada', 'entregada')
- Constraints: Si `estado` es 'procesada' o 'entregada', middleware valida que `req.user.sucursal.tipo === 'matriz'`.

### `GET /api/reportes/ingresos`
- Desc: Genera reporte de ingresos.
- Query: `?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&sucursal_id=UUID`
- Constraints: admin ve consolidados; rol sucursal ve solo lo suyo.

### `POST /api/recordatorios/motor`
- Desc: Endpoint interno/Cron para disparar el motor de recordatorios. Busca pacientes vencidos y genera/envía correos.
