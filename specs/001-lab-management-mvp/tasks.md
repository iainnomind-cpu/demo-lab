# Tasks: lab-management-mvp

**Input**: Design documents from `/specs/001-lab-management-mvp/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. El diseño debe basarse rigurosamente en las directrices de `Antigravity Design Expert` (glassmorphism, tipografía moderna, colores vibrantes, etc.).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Inicializar frontend React 18 + Vite en `frontend/` y configurar TailwindCSS
- [ ] T002 Inicializar backend Node.js + Express en `backend/`
- [ ] T003 Configurar `Supabase` client (App y Admin Auth) en `frontend/src/services/supabase.ts` y `backend/src/services/supabase.ts`
- [ ] T004 Establecer sistema de diseño (Antigravity Design Expert) configurando utilidades de tailwind, glassmorphism y fuentes en `frontend/src/index.css` y `frontend/tailwind.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Ejecutar `database/schema.sql` para crear tablas, RLS (Row Level Security) y triggers en Supabase
- [ ] T006 Implementar `authMiddleware` con verificación de JWT (Supabase Auth) en `backend/src/middleware/authMiddleware.ts`
- [ ] T007 [P] Implementar login UI y estado global (Context) con diseño premium en `frontend/src/pages/Login.tsx` y `frontend/src/context/AuthContext.tsx`
- [ ] T008 [P] Configurar el enrutador de la API base y manejador global de errores en `backend/src/index.ts`
- [ ] T009 [P] Crear el layout base del Dashboard (Sidebar + Header) con animaciones fluidas (GSAP) en `frontend/src/components/Layout/DashboardLayout.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Recepción y Toma de Muestra (Priority: P1) 🎯 MVP

**Goal**: Un recepcionista registra a un paciente, selecciona estudios y genera una orden cobrando el total.

**Independent Test**: Crear paciente y orden vía UI; verificar persistencia y costo_total calculado en backend.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Implementar endpoints CRUD para Sucursales, Médicos, Estudios y Pacientes en `backend/src/routes/catalogRoutes.ts` y sus respectivos controladores en `backend/src/controllers/catalogController.ts`
- [ ] T011 [P] [US1] Implementar API para crear Orden (incluyendo cálculo `costo_total`) en `backend/src/routes/ordenRoutes.ts` y `backend/src/controllers/ordenController.ts`
- [ ] T012 [P] [US1] Crear UI de Catálogos (Sucursales, Médicos, Estudios) con tablas responsivas (estilo glass) en `frontend/src/pages/Catalogos/`
- [ ] T013 [P] [US1] Crear UI de Pacientes y su historial en `frontend/src/pages/Pacientes/`
- [ ] T014 [US1] Desarrollar la pantalla de "Crear Orden de Visita" (buscadores de paciente, estudios, médico) con UI premium en `frontend/src/pages/Ordenes/NuevaOrden.tsx`
- [ ] T015 [US1] Conectar `NuevaOrden.tsx` con el endpoint de creación y manejar respuesta.

**Checkpoint**: User Story 1 es funcional (MVP de captura de datos).

---

## Phase 4: User Story 2 - Procesamiento de Muestras en Matriz (Priority: P2)

**Goal**: El QFB en matriz actualiza el estado de las órdenes.

**Independent Test**: Intentar cambiar estado logueado como matriz (éxito) vs toma_muestra (bloqueo).

### Implementation for User Story 2

- [ ] T016 [P] [US2] Implementar endpoint para actualizar estado y validar rol/sucursal matriz en `backend/src/controllers/ordenController.ts`
- [ ] T017 [US2] Crear vista de "Cola de Trabajo / Laboratorio" listando órdenes pendientes en `frontend/src/pages/Laboratorio/ColaTrabajo.tsx`
- [ ] T018 [US2] Agregar micro-interacciones (botones dinámicos) para avanzar estados (muestra_tomada -> procesada -> entregada) e integrar con API.

**Checkpoint**: Ciclo de vida de la orden completo.

---

## Phase 5: User Story 3 - Recordatorios de Seguimiento (Priority: P3)

**Goal**: Motor automático notifica a pacientes vencidos (email y WhatsApp).

**Independent Test**: Disparar endpoint de motor; confirmar envío sin duplicados (rango 30 días).

### Implementation for User Story 3

- [ ] T019 [P] [US3] Crear servicio para Nodemailer en `backend/src/services/emailService.ts`
- [ ] T020 [P] [US3] Crear servicio para WhatsApp (API de notificaciones) en `backend/src/services/whatsappService.ts`
- [ ] T021 [US3] Implementar la lógica de negocio del motor evaluador (`meses_recordatorio` + 30 días de ventana) en `backend/src/services/recordatorioMotor.ts`
- [ ] T022 [US3] Exponer el cron trigger en un endpoint `POST /api/recordatorios/motor` en `backend/src/routes/recordatorioRoutes.ts`

**Checkpoint**: El laboratorio retiene clientes proactivamente de forma automática.

---

## Phase 6: User Story 4 - Reportes de Ingresos y Egresos (Priority: P4)

**Goal**: Administrador revisa ingresos y egresos diarios/quincenales.

**Independent Test**: Crear egresos, facturar órdenes, generar reporte y cuadrar matemáticas.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Implementar endpoints CRUD de Egresos en `backend/src/routes/egresosRoutes.ts` y `backend/src/controllers/egresosController.ts`
- [ ] T024 [P] [US4] Implementar endpoint generador de Reporte (Ingresos vs Egresos) en `backend/src/routes/reportesRoutes.ts`
- [ ] T025 [P] [US4] Crear UI de captura de Egresos en `frontend/src/pages/Finanzas/Egresos.tsx`
- [ ] T026 [US4] Desarrollar Dashboard Financiero con gráficos modernos y data cards de alto contraste (Antigravity Design Expert) en `frontend/src/pages/Finanzas/Reportes.tsx`

**Checkpoint**: Control financiero funcional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T027 [P] Aplicar micro-animaciones (GSAP/Framer Motion) a las transiciones de rutas del frontend.
- [ ] T028 Refinar la responsividad móvil en vistas de recepción y reportes.
- [ ] T029 Revisión de validación del Quickstart End-to-End.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion. 
  - T010-T013 se pueden hacer en paralelo por el backend/frontend devs.
- **Polish (Phase 7)**: Al finalizar todas las historias.

## Implementation Strategy

### Incremental Delivery (MVP)
1. Setup + Foundation (Backend JWT + Frontend base).
2. User Story 1 (Captura de Orden): Permite operar el negocio y cobrar.
3. User Story 2 (Flujo matriz).
4. User Story 4 (Finanzas).
5. User Story 3 (Recordatorios automáticos) al final.
