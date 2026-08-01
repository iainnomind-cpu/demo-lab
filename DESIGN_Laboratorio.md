# DESIGN.md — Sistema de Gestión para Laboratorio Clínico (Diagnóstico)

> Generado a partir del levantamiento de requerimientos del 28 de julio de 2026.
> Participante cliente: Daniela Benítez Rodríguez (recepción/captura, sede matriz).
> Decisor final no presente en la llamada: Gilberto ("Gilber"), dueño/gerente.

---

## 1. CONTEXTO DEL NEGOCIO

El cliente opera un **laboratorio de análisis clínicos** con tres puntos de atención:

- **1 sede matriz**: aquí se toman muestras Y se procesan todos los estudios (propios y los que llegan de las otras sedes). Trabajan aquí Daniela y una compañera, que se turnan/apoyan simultáneamente en recepción, captura de datos y manejo de redes sociales.
- **2 sedes de toma de muestra** (una identificada en la demo como "San Andrés"): solo recolectan muestra y datos del paciente; no procesan nada ahí. Cada una opera con **una sola persona**, y las muestras se envían físicamente a la matriz para su procesamiento.

**Operación actual**: no manejan citas — atienden por orden de llegada ("conforme va llegando la gente se les va atendiendo"), con tiempos de espera cortos (≤5 minutos). Todo el registro de pacientes se lleva en **Google Drive**, con una hoja de cálculo por sede, compartida con la matriz para consolidar. Cada hoja registra: fecha, nombre, edad, estudios solicitados, costo, médico que refiere y teléfono. Los ingresos se revisan formalmente por quincena, aunque el ingreso de un día específico se puede consultar manualmente sumando una columna. Los egresos (material, insumos, reactivos) se controlan con facturas físicas y captura manual, sin sistema digital.

Usan Facebook (tráfico constante, con respuesta) e Instagram (recién abierto, tráfico bajo) para difundir promociones. Las promociones cambian cada mes según temporada: día del padre, mes de la mujer, temporada de dengue/influenza/covid, etc., y se distribuyen como cuponeras físicas y tarjetas de descuento — no ligadas a un sistema de fidelización o recompra automática.

**Pain point central identificado** (no verbalizado espontáneamente por la clienta, pero confirmado como útil cuando se le planteó): hoy no existe ningún mecanismo que detecte que un paciente no ha regresado a su chequeo de rutina (p.ej. cada 6-8 meses) y lo invite de vuelta con un descuento. La recurrencia depende de que el paciente se acuerde solo o de que un médico se lo vuelva a pedir.

**Estudios más frecuentes y precios fijos confirmados**:

| Estudio | Precio |
|---|---|
| Biometría hemática | incluido en perfil básico |
| Química sanguínea | incluido en perfil básico |
| Examen general de orina (EGO) | incluido en perfil básico |
| **Perfil básico** (biometría + química + EGO) / "chequeo general" | **$555** |
| Prueba de embarazo | **$120** |
| Perfil hepático | por confirmar con Gilber |
| Perfil de lípidos | por confirmar con Gilber |
| Electrolitos | por confirmar con Gilber |
| Perfil tiroideo | por confirmar con Gilber |

---

## 2. NECESIDADES IDENTIFICADAS

### Explícitas (lo que se dijo o confirmó textualmente)

- Confirmó que **sí le funcionaría** un mecanismo que avise cuándo un paciente lleva 8-9 meses o un año sin regresar a chequeo y le ofrezca un descuento para que vuelva. **[MVP]**
- El registro actual de pacientes vive en Google Drive/Excel, por sede. **[MVP — migrar a base de datos estructurada]**
- Manejan cuponeras y tarjetas de descuento, con promociones que cambian cada mes según temporada. **[OPCIONAL]**
- Usan Facebook e Instagram para difusión; Instagram aún no tiene volumen relevante de mensajes. **[OPCIONAL — no es urgente]**
- No identifica pain points administrativos graves actuales ("No creo que no"). **[confirma que el sistema de citas NO es necesario — se descarta]**

### Implícitas (deducidas de la operación descrita)

- Catálogo de estudios con precio fijo por estudio. **[MVP]**
- Registro por visita: paciente, sede, estudios solicitados, costo, médico que refiere, fecha, empleado que atendió. **[MVP]**
- Diferenciar tipo de sede: matriz (procesa) vs. toma de muestra (solo colecta y envía a matriz). **[MVP]**
- Reporte de ingresos diario y consolidado por quincena, por sede y global. **[MVP]**
- Registro de egresos (insumos, reactivos) con folio de factura, por sede. **[MVP]**
- Historial de paciente (estudios previos y fechas) como base para generar recordatorios de seguimiento. **[MVP]**
- Recordatorios automáticos de regreso a chequeo (vía email, y opcionalmente WhatsApp) con lógica de "han pasado X meses desde tu último estudio". **[MVP el motor + email; WhatsApp masivo OPCIONAL]**
- Catálogo simple de médicos referentes (para saber quién refiere y medir procedencia de pacientes). **[MVP]**
- Gestión digital de promociones/cuponeras mensuales, para dejar de depender del papel. **[OPCIONAL]**
- Chatbot o respuesta automática en WhatsApp/Instagram para cuando el volumen de mensajes crezca (hoy no es un problema, pero es una extensión natural del módulo de recordatorios). **[OPCIONAL]**
- Sistema de citas: **descartado explícitamente** — el flujo de llegada libre funciona bien y el tiempo de espera ya es corto.
- Facturación CFDI: **no mencionado en la reunión**, no se incluye en este alcance. Si el cliente lo requiere después, se puede agregar como módulo opcional adicional siguiendo el estándar de facturación de Innomind (Facturama como PAC).

---

## 3. STACK TECNOLÓGICO

**Frontend**
- React 18 + Vite
- TailwindCSS
- React Router DOM
- Deploy: Vercel

**Backend**
- Node.js + Express
- Arquitectura REST, `authMiddleware` JWT (Supabase Auth) en toda ruta protegida
- Deploy: Vercel Serverless Functions (o Railway si se requiere un proceso persistente para el cron de recordatorios — ver sección 8)

**Infraestructura**
- Supabase: Postgres + Auth + Storage
- RLS activo en todas las tablas
- El cliente (frontend) nunca toca la BD directamente — todo pasa por el backend con `service_role` key

**Email**
- Nodemailer + Gmail SMTP (nunca Resend)
- `GMAIL_USER` y `GMAIL_APP_PASSWORD`

**WhatsApp (solo si se activa el módulo opcional)**
- Meta WhatsApp Cloud API (mensajes masivos/notificaciones y, si se requiere, chatbot con OpenAI)

---

## 4. ARQUITECTURA DE MÓDULOS

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA LABORATORIO CLÍNICO                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [MVP] Autenticación y Roles (admin / recepcionista / qfb)       │
│                                                                   │
│  [MVP] Sucursales          [MVP] Médicos Referentes              │
│       (matriz / toma_muestra)                                    │
│                                                                   │
│  [MVP] Catálogo de Estudios ──────┐                              │
│                                    │                              │
│  [MVP] Pacientes ─────────────────┼──> [MVP] Órdenes             │
│       (historial global)          │       (visita: estudios,     │
│                                    │        costo, sede, médico)  │
│                                    │                              │
│  [MVP] Egresos (insumos/reactivos)│                              │
│                                    │                              │
│  [MVP] Recordatorios de Seguimiento (motor + email) ◄─────────────┤
│                                    │                              │
│  [MVP] Reportes (ingresos diarios / quincenales, por sede)        │
│                                                                   │
│  ─────────────────────── OPCIONALES ──────────────────────────   │
│                                                                   │
│  [OPCIONAL] Promociones y Cupones digitales                      │
│  [OPCIONAL] Notificaciones masivas WhatsApp (recordatorios/promos)│
│  [OPCIONAL] Chatbot WhatsApp/Instagram (Meta API + OpenAI)        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. ESTRUCTURA DE CARPETAS

```
laboratorio-clinico/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   ├── pacientes/
│   │   │   │   ├── PacienteForm.jsx
│   │   │   │   ├── PacienteTable.jsx
│   │   │   │   └── PacienteHistorial.jsx
│   │   │   ├── ordenes/
│   │   │   │   ├── OrdenForm.jsx
│   │   │   │   └── OrdenTable.jsx
│   │   │   ├── estudios/
│   │   │   │   └── EstudioForm.jsx
│   │   │   ├── egresos/
│   │   │   │   └── EgresoForm.jsx
│   │   │   ├── reportes/
│   │   │   │   └── ReporteIngresos.jsx
│   │   │   └── recordatorios/
│   │   │       └── RecordatorioTable.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PacientesPage.jsx
│   │   │   ├── OrdenesPage.jsx
│   │   │   ├── EstudiosPage.jsx
│   │   │   ├── MedicosPage.jsx
│   │   │   ├── EgresosPage.jsx
│   │   │   ├── ReportesPage.jsx
│   │   │   ├── RecordatoriosPage.jsx
│   │   │   ├── PromocionesPage.jsx        (OPCIONAL)
│   │   │   └── SucursalesPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── sucursales.routes.js
│   │   │   ├── pacientes.routes.js
│   │   │   ├── medicos.routes.js
│   │   │   ├── estudios.routes.js
│   │   │   ├── ordenes.routes.js
│   │   │   ├── egresos.routes.js
│   │   │   ├── reportes.routes.js
│   │   │   ├── recordatorios.routes.js
│   │   │   ├── promociones.routes.js      (OPCIONAL)
│   │   │   └── whatsapp.routes.js         (OPCIONAL)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── sucursales.controller.js
│   │   │   ├── pacientes.controller.js
│   │   │   ├── medicos.controller.js
│   │   │   ├── estudios.controller.js
│   │   │   ├── ordenes.controller.js
│   │   │   ├── egresos.controller.js
│   │   │   ├── reportes.controller.js
│   │   │   ├── recordatorios.controller.js
│   │   │   ├── promociones.controller.js  (OPCIONAL)
│   │   │   └── whatsapp.controller.js     (OPCIONAL)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── services/
│   │   │   ├── supabaseClient.js
│   │   │   ├── emailService.js
│   │   │   ├── recordatoriosScheduler.js
│   │   │   └── whatsappService.js         (OPCIONAL)
│   │   └── server.js
│   ├── vercel.json
│   ├── .env.example
│   └── package.json
│
└── database/
    └── schema.sql
```

---

## 6. ESQUEMA DE BASE DE DATOS

```sql
-- =========================================================
-- EXTENSIONES
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- SUCURSALES
-- =========================================================
create table sucursales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('matriz','toma_muestra')),
  direccion text,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- USUARIOS (staff, vinculado a Supabase Auth)
-- =========================================================
create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('admin','recepcionista','qfb')),
  sucursal_id uuid references sucursales(id),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Funciones helper para RLS
create or replace function public.current_user_role()
returns text
language sql stable security definer
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

create or replace function public.current_user_sucursal()
returns uuid
language sql stable security definer
as $$
  select sucursal_id from public.usuarios where id = auth.uid();
$$;

-- =========================================================
-- MEDICOS REFERENTES
-- =========================================================
create table medicos_referentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- PACIENTES (historial global, no ligado a una sola sucursal)
-- =========================================================
create table pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  edad integer check (edad >= 0),
  sexo text check (sexo in ('F','M','otro')),
  email text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ESTUDIOS (catálogo con precio fijo)
-- =========================================================
create table estudios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric(10,2) not null check (precio >= 0),
  meses_recordatorio integer default 6, -- cada cuántos meses se sugiere repetir
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ORDENES (una visita = una orden)
-- =========================================================
create table ordenes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id),
  sucursal_id uuid not null references sucursales(id),
  medico_referente_id uuid references medicos_referentes(id),
  empleado_id uuid references usuarios(id),
  costo_total numeric(10,2) not null default 0 check (costo_total >= 0),
  estado text not null default 'muestra_tomada'
    check (estado in ('muestra_tomada','procesada','entregada')),
  fecha timestamptz not null default now(),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ORDEN_ESTUDIOS (detalle de estudios por orden)
-- =========================================================
create table orden_estudios (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes(id) on delete cascade,
  estudio_id uuid not null references estudios(id),
  precio_al_momento numeric(10,2) not null check (precio_al_momento >= 0)
);

-- =========================================================
-- EGRESOS (insumos, reactivos, gastos por sucursal)
-- =========================================================
create table egresos (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references sucursales(id),
  concepto text not null,
  categoria text not null check (categoria in ('insumos','reactivos','otros')),
  monto numeric(10,2) not null check (monto >= 0),
  folio_factura text,
  fecha date not null default current_date,
  empleado_id uuid references usuarios(id),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RECORDATORIOS (motor de seguimiento a pacientes)
-- =========================================================
create table recordatorios (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id),
  orden_id uuid references ordenes(id),
  fecha_programada date not null,
  canal text not null default 'email' check (canal in ('email','whatsapp')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente','enviado','atendido','cancelado')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- PROMOCIONES (OPCIONAL)
-- =========================================================
create table promociones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  descuento_porcentaje numeric(5,2) check (descuento_porcentaje between 0 and 100),
  fecha_inicio date not null,
  fecha_fin date not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RLS
-- =========================================================
alter table sucursales enable row level security;
alter table usuarios enable row level security;
alter table medicos_referentes enable row level security;
alter table pacientes enable row level security;
alter table estudios enable row level security;
alter table ordenes enable row level security;
alter table orden_estudios enable row level security;
alter table egresos enable row level security;
alter table recordatorios enable row level security;
alter table promociones enable row level security;

-- SUCURSALES: todos los autenticados leen, solo admin escribe
create policy sucursales_select on sucursales
  for select using (auth.role() = 'authenticated');
create policy sucursales_write on sucursales
  for all using (current_user_role() = 'admin');

-- USUARIOS: cada quien ve su fila, admin ve todas
create policy usuarios_select on usuarios
  for select using (id = auth.uid() or current_user_role() = 'admin');
create policy usuarios_write on usuarios
  for all using (current_user_role() = 'admin');

-- MEDICOS_REFERENTES: lectura para todos, escritura admin/recepcionista
create policy medicos_select on medicos_referentes
  for select using (auth.role() = 'authenticated');
create policy medicos_write on medicos_referentes
  for all using (current_user_role() in ('admin','recepcionista'));

-- PACIENTES: catálogo global, cualquier autenticado lee/escribe
create policy pacientes_select on pacientes
  for select using (auth.role() = 'authenticated');
create policy pacientes_write on pacientes
  for all using (current_user_role() in ('admin','recepcionista'));

-- ESTUDIOS: lectura para todos, escritura solo admin
create policy estudios_select on estudios
  for select using (auth.role() = 'authenticated');
create policy estudios_write on estudios
  for all using (current_user_role() = 'admin');

-- ORDENES: recepcionista solo ve/crea las de su sucursal; admin ve todas
create policy ordenes_select on ordenes
  for select using (
    current_user_role() = 'admin' or sucursal_id = current_user_sucursal()
  );
create policy ordenes_write on ordenes
  for all using (
    current_user_role() = 'admin' or sucursal_id = current_user_sucursal()
  );

-- ORDEN_ESTUDIOS: hereda el alcance de la orden
create policy orden_estudios_select on orden_estudios
  for select using (
    exists (
      select 1 from ordenes o
      where o.id = orden_estudios.orden_id
        and (current_user_role() = 'admin' or o.sucursal_id = current_user_sucursal())
    )
  );
create policy orden_estudios_write on orden_estudios
  for all using (
    exists (
      select 1 from ordenes o
      where o.id = orden_estudios.orden_id
        and (current_user_role() = 'admin' or o.sucursal_id = current_user_sucursal())
    )
  );

-- EGRESOS: igual que órdenes, por sucursal
create policy egresos_select on egresos
  for select using (
    current_user_role() = 'admin' or sucursal_id = current_user_sucursal()
  );
create policy egresos_write on egresos
  for all using (
    current_user_role() = 'admin' or sucursal_id = current_user_sucursal()
  );

-- RECORDATORIOS: visibles para todo el personal autenticado
create policy recordatorios_select on recordatorios
  for select using (auth.role() = 'authenticated');
create policy recordatorios_write on recordatorios
  for all using (current_user_role() in ('admin','recepcionista'));

-- PROMOCIONES: lectura para todos, escritura solo admin
create policy promociones_select on promociones
  for select using (auth.role() = 'authenticated');
create policy promociones_write on promociones
  for all using (current_user_role() = 'admin');
```

---

## 7. CONTRATOS DE API

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Sucursales
- `GET /api/sucursales`
- `POST /api/sucursales`
- `PUT /api/sucursales/:id`
- `DELETE /api/sucursales/:id` (baja lógica)

### Médicos referentes
- `GET /api/medicos`
- `POST /api/medicos`
- `PUT /api/medicos/:id`
- `DELETE /api/medicos/:id` (baja lógica)

### Pacientes
- `GET /api/pacientes`
- `GET /api/pacientes/:id`
- `GET /api/pacientes/:id/historial` (órdenes previas + estudios)
- `POST /api/pacientes`
- `PUT /api/pacientes/:id`
- `DELETE /api/pacientes/:id` (baja lógica)

### Estudios (catálogo)
- `GET /api/estudios`
- `POST /api/estudios`
- `PUT /api/estudios/:id`
- `DELETE /api/estudios/:id` (baja lógica)

### Órdenes
- `GET /api/ordenes`
- `GET /api/ordenes/:id`
- `POST /api/ordenes` (crea orden + detalle de estudios)
- `PUT /api/ordenes/:id`
- `PUT /api/ordenes/:id/estado` (transición muestra_tomada → procesada → entregada, restringido a sede matriz)
- `DELETE /api/ordenes/:id` (baja lógica)

### Egresos
- `GET /api/egresos`
- `POST /api/egresos`
- `PUT /api/egresos/:id`
- `DELETE /api/egresos/:id` (baja lógica)

### Reportes
- `GET /api/reportes/ingresos-diarios?sucursal_id=&fecha=`
- `GET /api/reportes/ingresos-quincena?sucursal_id=&quincena=`
- `GET /api/reportes/egresos?sucursal_id=&desde=&hasta=`

### Recordatorios
- `GET /api/recordatorios?estado=pendiente`
- `POST /api/recordatorios/generar` (corre el motor manualmente)
- `PUT /api/recordatorios/:id/estado`

### Promociones **[OPCIONAL]**
- `GET /api/promociones`
- `POST /api/promociones`
- `PUT /api/promociones/:id`
- `DELETE /api/promociones/:id`

### WhatsApp **[OPCIONAL]**
- `POST /api/whatsapp/webhook` (recepción de mensajes Meta)
- `GET /api/whatsapp/webhook` (verificación Meta)
- `POST /api/whatsapp/enviar-masivo` (recordatorios/promos por WhatsApp)

---

## 8. REGLAS DE NEGOCIO CRÍTICAS

1. Toda orden debe tener al menos un estudio asociado en `orden_estudios`.
2. El precio de cada estudio se congela en `orden_estudios.precio_al_momento` al crear la orden — cambios futuros en `estudios.precio` no afectan órdenes ya creadas.
3. Solo una sucursal de `tipo = 'matriz'` puede transicionar una orden a `estado = 'procesada'`. Las sucursales `tipo = 'toma_muestra'` solo pueden crear/dejar órdenes en `estado = 'muestra_tomada'`.
4. Baja lógica (`activo = false`) en lugar de `DELETE` físico para pacientes, estudios, médicos, sucursales y egresos — nunca se pierde el historial.
5. `costo_total` de una orden debe ser igual a la suma de `precio_al_momento` de sus estudios asociados; se recalcula en el backend en cada creación/edición, nunca lo envía el frontend directamente.
6. Un recepcionista solo puede ver y crear órdenes/egresos de su propia `sucursal_id` (vía RLS); el rol `admin` ve y opera sobre todas las sucursales.
7. Los reportes de ingresos deben poder filtrarse por día individual y por quincena (1-15 / 16-fin de mes), replicando el corte actual del cliente.
8. Cada egreso debe registrar `folio_factura` cuando exista comprobante, para mantener trazabilidad fiscal básica.
9. El motor de recordatorios genera un registro en `recordatorios` cuando han transcurrido `estudios.meses_recordatorio` desde la última orden de un paciente para ese tipo de estudio, y **no** debe generar un duplicado si ya existe un recordatorio `pendiente` para el mismo paciente en una ventana de 30 días.
10. Los recordatorios en estado `pendiente` se envían por email (Nodemailer/Gmail) de forma automática mediante un job programado; el canal `whatsapp` solo se activa si el módulo opcional de WhatsApp está habilitado.

---

## 9. VARIABLES DE ENTORNO

### Backend (`backend/.env`)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
PORT=3000

# Email (Nodemailer + Gmail) — MVP, usado por el módulo de recordatorios
GMAIL_USER=
GMAIL_APP_PASSWORD=

# WhatsApp (Meta Cloud API) — solo si se activa el módulo OPCIONAL
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=
OPENAI_API_KEY=
```

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

---

## 10. FASES DE CONSTRUCCIÓN

| Fase | Módulo | Tipo | Descripción | Dependencias |
|---|---|---|---|---|
| 1 | Setup + Auth | MVP | Proyecto Vite/Express, Supabase, login con roles (admin/recepcionista/qfb) | — |
| 2 | Sucursales + Médicos referentes | MVP | CRUD de sucursales (matriz/toma_muestra) y catálogo de médicos | Fase 1 |
| 3 | Catálogo de estudios | MVP | CRUD de estudios con precio fijo y `meses_recordatorio` | Fase 1 |
| 4 | Pacientes | MVP | CRUD de pacientes + vista de historial | Fase 1 |
| 5 | Órdenes | MVP | Registro de visita, detalle de estudios, cálculo de costo total, transición de estado | Fases 2, 3, 4 |
| 6 | Egresos + Reportes | MVP | CRUD de egresos, reporte de ingresos diario/quincenal por sucursal | Fase 5 |
| 7 | Recordatorios (motor + email) | MVP | Job que detecta pacientes vencidos y genera/envía recordatorio por email | Fases 4, 5 |
| 8 | Promociones | OPCIONAL | CRUD de promociones/cupones digitales, vigencia por fecha | Fase 7 |
| 9 | Notificaciones masivas WhatsApp | OPCIONAL | Envío de recordatorios/promos vía Meta API | Fase 7, 8 |
| 10 | Chatbot WhatsApp/Instagram | OPCIONAL | Respuesta automática con OpenAI vía Meta API | Fase 9 |
| 11 | Reportes avanzados | OPCIONAL | Comparativos por sede, por médico referente, por temporada | Fase 6 |
| 12 | Facturación CFDI | OPCIONAL | Solo si el cliente lo solicita a futuro; se integraría con Facturama | Fase 6 |

**El MVP queda completamente funcional al terminar la fase 7.**

---

## 11. GUÍA DE MÓDULOS OPCIONALES

### Fase 8 — Promociones
- **Qué hace**: gestión digital de promociones mensuales (título, descuento %, vigencia), reemplazando las cuponeras físicas.
- **Variables que activa**: ninguna nueva (usa Supabase existente).
- **Instrucción para Antigravity**: `"Implementa el módulo de Promociones: tabla promociones ya existe en el schema, agrega rutas GET/POST/PUT/DELETE en promociones.routes.js, controller correspondiente, y una página PromocionesPage.jsx con CRUD y filtro por vigencia activa."`
- **Dependencias previas**: Fase 7 completa.

### Fase 9 — Notificaciones masivas WhatsApp
- **Qué hace**: envía recordatorios de seguimiento y promociones vía WhatsApp en lugar de (o además de) email.
- **Variables que activa**: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TOKEN`.
- **Instrucción para Antigravity**: `"Implementa whatsappService.js usando la Meta WhatsApp Cloud API para enviar plantillas de recordatorio y promoción a partir de los registros en recordatorios con canal='whatsapp'. Agrega el endpoint POST /api/whatsapp/enviar-masivo."`
- **Dependencias previas**: Fase 7 y 8; cuenta de Meta Business verificada con WABA configurado.

### Fase 10 — Chatbot WhatsApp/Instagram
- **Qué hace**: responde automáticamente mensajes entrantes de WhatsApp/Instagram usando OpenAI para resolver dudas frecuentes (precios, horarios, ubicación de sedes).
- **Variables que activa**: `WHATSAPP_VERIFY_TOKEN`, `OPENAI_API_KEY`.
- **Instrucción para Antigravity**: `"Implementa whatsapp.controller.js con el webhook de verificación (GET) y recepción de mensajes (POST). Cada mensaje entrante se procesa con un loop de OpenAI (gpt-4o-mini) que responde con base en el catálogo de estudios y precios, y hace fallback a un humano si no puede resolver la duda."`
- **Dependencias previas**: Fase 9.

### Fase 12 — Facturación CFDI (a futuro, no solicitado en esta reunión)
- **Qué hace**: emitir CFDI 4.0 a clientes que lo soliciten.
- **Variables que activa**: credenciales del PAC (Facturama) y datos fiscales del emisor.
- **Instrucción para Antigravity**: `"Solo implementar si el cliente lo confirma explícitamente. Seguir el patrón estándar de Innomind: Facturama como PAC, tabla facturas ligada a ordenes."`
- **Dependencias previas**: Fase 6.
