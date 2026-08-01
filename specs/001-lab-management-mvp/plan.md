# Implementation Plan: lab-management-mvp

**Branch**: `001-lab-management-mvp` | **Date**: 2026-07-31 | **Spec**: [spec.md](../spec.md)

**Input**: Feature specification from `specs/001-lab-management-mvp/spec.md`

## Summary

Desarrollo del MVP completo (fases 1 a 7) para un sistema de gestión de laboratorio clínico utilizando React 18 + Vite (frontend) y Node.js + Express (backend) interactuando con Supabase (Auth + DB) respetando las restricciones de RLS y operaciones vía service_role.

## Technical Context

**Language/Version**: TypeScript/JavaScript, Node.js v18+, React 18
**Primary Dependencies**: Vite, TailwindCSS, Express, Supabase (JS client for auth, pg/supabase-js with service_role in backend), Nodemailer.
**Storage**: Supabase (PostgreSQL) con RLS estricto por sucursal.
**Testing**: Jest / React Testing Library (recomendado).
**Target Platform**: Frontend: Web (Vercel), Backend: Node (Vercel/Render/Fly).
**Project Type**: Aplicación Web Cliente-Servidor + REST API
**Performance Goals**: Frontend SPA responsivo, Backend APIs < 500ms p95.
**Constraints**: El cliente (frontend) nunca toca Supabase directamente para datos (solo login vía Supabase Auth). Toda transacción pasa por Express usando `authMiddleware` JWT y `SUPABASE_SERVICE_ROLE_KEY`. El precio de los estudios se congela al ordenar.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Congelamiento de Precios**: Se pasará el `precio_al_momento` al guardar la relación orden-estudio (Phase 1).
- **II. Transiciones de Estado**: Validado en `ordenController.js` (solo permite 'matriz' pasar de 'muestra_tomada' a 'procesada').
- **III. Baja Lógica Estricta**: Todas las tablas principales incluirán `activo boolean default true`.
- **IV. Cálculos Server-Side**: `costo_total` no se envía desde el cliente; se calcula sumando estudios en Express.
- **V. RLS por Sucursal**: Implementado a nivel tabla/función usando JWT claims de Supabase y validado en Express.
- **VI. Recordatorios Únicos (30 días)**: Cron job / motor valida registros recientes antes de crear `pendiente`.
- **VII. Nodemailer + Gmail**: Proveedor exclusivo, cero uso de Resend.
- **VIII. Backend Exclusivo para Datos**: Expresado explícitamente en el `Technical Context`.
- **IX. Ponytail Minimalismo**: Uso nativo o estándar sin sobreingeniería (Fetch en frontend, Express básico).

## Project Structure

### Documentation (this feature)

```text
specs/001-lab-management-mvp/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
└── tasks.md             # Phase 2 output ($speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── services/
└── package.json

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── context/
└── package.json

database/
└── schema.sql
```

**Structure Decision**: El cliente especificó explícitamente esta estructura Web Application de doble capa con DB independiente, por lo cual se adopta fielmente.
