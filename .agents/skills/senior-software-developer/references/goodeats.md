# Contexto inicial de GoodEats

Instantánea de referencia: 16 de octubre de 2026. Confirmar archivos, versiones y decisiones del usuario antes de actuar; esta guía no reemplaza las instrucciones del repositorio.

## Producto y stack

GoodEats organiza alimentación y compras. El MVP inicial incluye listas de compras sin IA obligatoria. El proyecto ya tiene recetas y planificación; no confundir el alcance inicial con una orden de retirar funciones actuales ni añadir otras sin autorización.

React Native, Expo, TypeScript, Expo Router, Supabase/PostgreSQL y Git/GitHub. Lee `package.json`, lockfile y `AGENTS.md`: no fijar en esta skill una versión de SDK que quedará obsoleta. No incorporar Node o Django como backend adicional sin necesidad del proyecto.

## Mapa para inspección

- `src/app/`: rutas; `_layout.tsx` configura navegación. Componentes y hooks fuera de las rutas.
- `components/`: UI compartida y pantallas; `PlannerWorkspace.tsx` implementa biblioteca, menú y compras derivadas.
- `hooks/`: estado y coordinación; `usePlanner.ts` gestiona la planificación nueva local.
- `services/`: reglas y persistencia. Inspeccionar `plannerLogic.ts`, `shoppingLogic.ts`, `quantities.ts`, `shoppingService.ts` y `mealPlanningService.ts` según la tarea.
- `constants/theme.ts`: tokens visuales; reutilizarlos antes de añadir valores en componentes.
- `supabase/migrations/`, `supabase/tests/`: cambios de esquema y pruebas disponibles. Su presencia no prueba ejecución en producción.
- `tests/` y scripts de `package.json`: verificación existente. Actualmente se usa Node test runner con compilación TypeScript; no asumir Jest/Vitest instalados.

## Invariantes relevantes

- Auth gestiona usuarios y contraseñas en Supabase; conservar RLS y aislamiento por propietario.
- La biblioteca y planificación nuevas, con compras derivadas, se guardan por dispositivo/cuenta local. Las vistas anteriores conservan su integración remota donde está implementada. Verificar cada servicio antes de afirmar sincronización.
- No sobrescribir respaldo local con una lectura remota fallida, ni trasladar datos entre orígenes o cuentas implícitamente.
- Mantener compatibilidad con datos previos y snapshots de recetas del menú. Cambiar una receta de biblioteca no debe reescribir silenciosamente menús guardados.
- Entradas decimales y cantidades pequeñas requieren conservar magnitud tanto al calcular como al mostrar.
- Importación web e integración con supermercados están pospuestas; esta skill no autoriza implementarlas.

## Expo y verificaciones

Antes de tocar APIs Expo/EAS/React Native: leer el major en `package.json` y documentación correspondiente en `https://docs.expo.dev/versions/v<major>.0.0/`. Para otras guías usar `https://docs.expo.dev/llms.txt` y sus enlaces. Seguir `AGENTS.md` para gestor de paquetes, instalación compatible, Router y directorios nativos generados.

Descubrir comandos en el proyecto; actualmente `npm run lint`, `npm run typecheck`, `npm test` y `npm run export:web`. Ejecutar siempre lint y tipos al terminar según AGENTS. Las pruebas remotas, E2E y nativas se reportan por separado; no instalarlas ni ejecutar migraciones de producción por cargar esta guía.

## Identidad visual: discrepancia documentada

El usuario proporcionó para esta skill naranjo `#FF6B35` y morado `#6C3FC5`, coincidentes con la referencia de `ux-ui-design`. Los tokens de la aplicación inspeccionados al crearla son naranjo `#FF7A18` y morado `#6D28D9`.

Conservar los tokens actuales en tareas de desarrollo. Esta solicitud crea una skill, no solicita recolorear la app. Si una tarea posterior solicita cambiar identidad, señalar la discrepancia y aplicar la decisión explícita del usuario de esa tarea mediante tokens centralizados, comprobando contraste; no resolverla silenciosamente ni imponer la paleta de GoodEats a otros proyectos.
