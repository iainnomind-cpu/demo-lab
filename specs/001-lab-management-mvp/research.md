# Research & Decisions: lab-management-mvp

## Decision: Arquitectura Cliente/Servidor con Supabase
- **Rationale**: El cliente especificó un stack concreto (React 18, Node.js + Express, Supabase) junto con restricciones constitucionales donde el backend (Express) actúa como mediador exclusivo (con `service_role` key) y las escrituras directas desde frontend (a Supabase) están prohibidas, salvo para Supabase Auth.
- **Alternatives considered**: Frontend directo a Supabase usando el SDK JS estándar (descartado por la constitución VIII).

## Decision: Uso de Supabase Auth con Express middleware
- **Rationale**: El frontend se autentica vía Supabase Auth nativo para gestionar la sesión de manera segura. El access token (JWT) se envía en cada petición al API Express en el header `Authorization: Bearer <token>`. Express verifica el JWT usando su propia validación y determina el rol y sucursal.
- **Alternatives considered**: Auth propia desde cero (descartado porque el stack dice explícitamente Supabase Auth).
