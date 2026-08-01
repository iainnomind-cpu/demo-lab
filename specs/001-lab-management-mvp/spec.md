# Feature Specification: lab-management-mvp

**Feature Branch**: `[001-lab-management-mvp]`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "Construir el MVP de un sistema de gestión para laboratorio clínico con: Autenticación con Supabase Auth y 3 roles: admin, recepcionista, qfb..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recepción y Toma de Muestra (Priority: P1)

Un recepcionista registra a un paciente que llega a una sede, selecciona los estudios solicitados, el médico que refiere, y genera una orden de visita cobrando el total.

**Why this priority**: Es el flujo principal de ingresos (core business).

**Independent Test**: Can be fully tested by creating a patient and an order via the UI and verifying that the order and its studies are persisted with the correct total cost.

**Acceptance Scenarios**:

1. **Given** un recepcionista logueado en una sede, **When** crea una orden seleccionando estudios, **Then** el sistema calcula el `costo_total` en base a los precios congelados y guarda la orden en estado `muestra_tomada`.

---

### User Story 2 - Procesamiento de Muestras en Matriz (Priority: P2)

El personal (QFB) en la sede matriz recibe muestras de todas las sedes y actualiza el estado de la orden conforme se procesan y entregan.

**Why this priority**: Permite completar el ciclo de vida de una orden centralizando operaciones.

**Independent Test**: Can be fully tested by attempting to change order states logged in as a user from 'matriz' vs 'toma_muestra'.

**Acceptance Scenarios**:

1. **Given** un usuario en sede matriz, **When** actualiza una orden a `procesada`, **Then** el sistema permite el cambio.
2. **Given** un usuario en sede toma_muestra, **When** intenta actualizar a `procesada`, **Then** el sistema lo bloquea.

---

### User Story 3 - Recordatorios de Seguimiento (Priority: P3)

El sistema detecta automáticamente pacientes que necesitan repetir sus estudios y les envía un correo electrónico.

**Why this priority**: Es el pain point central para incrementar recurrencia de pacientes.

**Independent Test**: Ejecutar el motor de recordatorios y verificar que se envían emails sin duplicados en 30 días.

**Acceptance Scenarios**:

1. **Given** un paciente cuyo último estudio superó sus `meses_recordatorio`, **When** corre el motor, **Then** se genera un recordatorio `pendiente` y se envía un email por Nodemailer.

---

### User Story 4 - Reportes de Ingresos y Egresos (Priority: P4)

El administrador revisa los ingresos por día o quincena, filtrados por sucursal o consolidados, para analizar rentabilidad.

**Why this priority**: Vital para la gestión administrativa y toma de decisiones.

**Independent Test**: Generar un reporte quincenal y validar sumas contra las órdenes y egresos registrados.

**Acceptance Scenarios**:

1. **Given** órdenes pagadas en la quincena, **When** se solicita el reporte de ingresos para esa quincena, **Then** se muestra la suma correcta del `costo_total`.

### Edge Cases

- ¿Qué pasa si un administrador intenta cambiar el precio de un estudio en el catálogo que ya ha sido cobrado en órdenes anteriores? (El precio se congela en `orden_estudios`, la orden histórica no cambia).
- ¿Qué pasa si el cron job de recordatorios falla a la mitad del procesamiento? (Los registros quedan pendientes y el motor reintenta sin duplicar envíos gracias a la validación de 30 días).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST proveer autenticación usando Supabase Auth con roles: admin, recepcionista, qfb, restringiendo acceso a datos según el rol y la sucursal del usuario (RLS).
- **FR-002**: El sistema MUST permitir el CRUD de sucursales (matriz/toma_muestra), médicos, estudios y pacientes con baja lógica (`activo = false`).
- **FR-003**: El sistema MUST calcular el costo total de una orden exclusivamente en el backend (Express) sumando los precios de los estudios asociados.
- **FR-004**: El sistema MUST restringir el cambio de estado de órdenes a `procesada` y `entregada` únicamente a usuarios asignados a una sucursal de tipo `matriz`.
- **FR-005**: El sistema MUST gestionar egresos registrando montos, categorías y folio de factura por sucursal.
- **FR-006**: El sistema MUST generar reportes de ingresos filtrables por día, quincena, sucursal y consolidados.
- **FR-007**: El sistema MUST incluir un motor de recordatorios que detecte pacientes vencidos según `meses_recordatorio` del estudio, generando un registro único por paciente cada 30 días.
- **FR-008**: El sistema MUST enviar correos mediante Nodemailer + Gmail SMTP de manera obligatoria.
- **FR-009**: El sistema MUST contar con un módulo de notificaciones masivas por WhatsApp.

### Key Entities *(include if feature involves data)*

- **Usuario**: Con roles (admin, recepcionista, qfb) y asociado a una sucursal.
- **Sucursal**: Tipo matriz o toma_muestra.
- **Paciente**: Historial global y datos de contacto (email, WhatsApp).
- **Médico**: Datos del referente.
- **Estudio**: Catálogo con precio fijo y meses de recordatorio.
- **Orden**: Visita de un paciente con costo total calculado en servidor y transiciones de estado.
- **Egreso**: Gasto registrado por sucursal con folio.
- **Recordatorio**: Registro de seguimiento programado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los recepcionistas pueden registrar una orden de toma de muestra con un nuevo paciente en menos de 2 minutos.
- **SC-002**: El 100% de los cálculos de costo de las órdenes son procesados por el backend sin manipulación desde el cliente.
- **SC-003**: El sistema genera el 100% de los reportes quincenales en menos de 3 segundos.
- **SC-004**: Se envían recordatorios al 100% de pacientes elegibles sin duplicados en un periodo de 30 días.

## Assumptions

- Los usuarios tendrán conectividad a internet estable.
- El módulo de WhatsApp utilizará una API externa o servicio que provea la interfaz final de envío y requerirá validación de números previa.
- Los pacientes comparten la misma zona horaria para los cortes de caja y programaciones.
