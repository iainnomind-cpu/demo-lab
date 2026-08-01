<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0
- Modified principles: Initialized 9 project-specific principles governing pricing, permissions, deletions, calculations, email provider, backend routing, and minimal coding.
- Added sections: None
- Removed sections: SECTION_2, SECTION_3 from template.
- Follow-up TODOs: None
-->
# Sistema de Gestión para Laboratorio Clínico Constitution

## Core Principles

### I. Congelamiento de Precios
El precio de un estudio se congela al momento de la orden (`orden_estudios.precio_al_momento`) y nunca se recalcula con el precio actual del catálogo. Los cambios futuros en el catálogo no afectan las órdenes históricas.

### II. Transiciones de Estado por Sede
Solo una sucursal de tipo 'matriz' puede transicionar una orden al estado 'procesada'. Las sucursales 'toma_muestra' tienen restringida esta acción y solo pueden crear órdenes en estado 'muestra_tomada'.

### III. Baja Lógica Estricta
Ningún dato se borra físicamente. Pacientes, estudios, médicos, sucursales y egresos deben utilizar baja lógica (`activo = false`) para preservar la integridad del historial.

### IV. Cálculos de Costo Server-Side
El `costo_total` de una orden siempre se recalcula en el backend (Express) a partir de la suma de sus estudios asociados. El frontend tiene prohibido enviarlo como fuente de verdad para evitar vulnerabilidades o errores.

### V. Seguridad RLS por Sucursal
El Row Level Security (RLS) debe estar activo en toda tabla. Un recepcionista solo puede operar y ver los registros correspondientes a su propia sucursal (usando `current_user_sucursal()`), mientras que el rol admin tiene acceso sin restricción de sucursal.

### VI. Unicidad de Recordatorios
El motor de recordatorios debe validar y evitar duplicidades: nunca generará un recordatorio para el mismo paciente si ya existe uno pendiente dentro de una ventana de 30 días.

### VII. Proveedor de Email Restringido
Todo envío de correos electrónicos debe implementarse obligatoriamente usando Nodemailer y Gmail SMTP (`GMAIL_USER` / `GMAIL_APP_PASSWORD`). Está prohibido integrar Resend o cualquier otro proveedor de correo.

### VIII. Acceso Exclusivo Backend-Supabase
El cliente (frontend) nunca interactúa directamente con Supabase (no usa `supabase-js` para operaciones en cliente). Toda lectura y escritura pasa obligatoriamente por el backend (Express) usando la `SUPABASE_SERVICE_ROLE_KEY` y el control de acceso vía `authMiddleware` con JWT.

### IX. Filosofía Ponytail (Minimalismo)
Antes de escribir cualquier código, se debe recorrer la escalera de 7 peldaños de Ponytail. El código generado debe ser exclusivamente el mínimo necesario para cumplir la funcionalidad requerida, aplicando YAGNI rigurosamente.

## Governance

La presente constitución rige todas las decisiones técnicas del proyecto. Cualquier cambio en estas reglas fundamentales debe ser documentado, aprobado e incluir un plan de migración. Toda nueva implementación (frontend, backend o base de datos) debe auditarse obligatoriamente contra este documento antes de considerarse completa.

**Version**: 1.0.0 | **Ratified**: 2026-07-31 | **Last Amended**: 2026-07-31
