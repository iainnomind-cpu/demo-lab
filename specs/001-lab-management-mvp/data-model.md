# Data Model: lab-management-mvp

## Entities & Relationships

### `sucursales`
- `id` (UUID, PK)
- `nombre` (varchar)
- `tipo` (enum: 'matriz', 'toma_muestra')
- `activo` (boolean, default true)

### `usuarios` (Extiende Auth)
- `id` (UUID, references auth.users)
- `rol` (enum: 'admin', 'recepcionista', 'qfb')
- `sucursal_id` (UUID, references sucursales)

### `medicos_referentes`
- `id` (UUID, PK)
- `nombre_completo` (varchar)
- `telefono` (varchar)
- `activo` (boolean, default true)

### `estudios_catalogo`
- `id` (UUID, PK)
- `nombre` (varchar)
- `precio` (numeric)
- `meses_recordatorio` (integer)
- `activo` (boolean, default true)

### `pacientes`
- `id` (UUID, PK)
- `nombre_completo` (varchar)
- `fecha_nacimiento` (date)
- `email` (varchar)
- `whatsapp` (varchar)
- `activo` (boolean, default true)

### `ordenes`
- `id` (UUID, PK)
- `paciente_id` (UUID, FK)
- `sucursal_id` (UUID, FK)
- `medico_id` (UUID, FK, null)
- `estado` (enum: 'muestra_tomada', 'procesada', 'entregada')
- `costo_total` (numeric, calculado por backend)
- `fecha_creacion` (timestamp)

### `ordenes_estudios` (Tabla intermedia)
- `orden_id` (UUID, FK)
- `estudio_id` (UUID, FK)
- `precio_al_momento` (numeric)

### `egresos`
- `id` (UUID, PK)
- `sucursal_id` (UUID, FK)
- `monto` (numeric)
- `categoria` (varchar)
- `folio_factura` (varchar)
- `fecha` (timestamp)
- `activo` (boolean, default true)

### `recordatorios`
- `id` (UUID, PK)
- `paciente_id` (UUID, FK)
- `estudio_id` (UUID, FK)
- `estado` (enum: 'pendiente', 'enviado', 'fallido')
- `fecha_generacion` (timestamp)
