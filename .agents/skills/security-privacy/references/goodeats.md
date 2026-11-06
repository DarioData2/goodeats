# Inventario inicial de GoodEats

Instantánea del repositorio del **5 de noviembre de 2026**; no equivale a una auditoría de producción.

- Expo/React Native, TypeScript, Expo Router; hosting Cloudflare Pages; Supabase Auth, PostgreSQL y Storage. Confirmar versiones y región/contratos por separado.
- `lib/supabase.ts`: Auth usa almacenamiento local, persistencia de sesión y renovación de tokens; el cliente usa URL y clave publishable públicas. No afirmar que las contraseñas estén en una tabla propia de GoodEats.
- `services/profileService.ts`, `services/profileLogic.ts`: perfil y avatar. Migración `202610260001_profile_avatars.sql` define bucket privado por propietario. Verificar configuración aplicada y metadatos realmente guardados.
- `services/shoppingService.ts`, `shoppingStorage.ts`: compras de cuenta y locales; no inferir que todos los módulos comparten la misma persistencia.
- `services/plannerLogic.ts` y `components/PlannerWorkspace.tsx`: biblioteca/planificación y compras derivadas; comprobar persistencia real antes de describir sincronización. Vistas anteriores usan otros servicios.
- `services/hydrationService.ts`, `hydrationStorage.ts` y migración `202611040001_hydration_cloud.sql`: cantidades de agua, fechas y meta; almacenamiento de invitado local y cuenta en `hydration_profiles`. Evaluar la sensibilidad por contexto y finalidad, sin declarar automáticamente que toda app de bienestar trata o deja de tratar datos de salud.
- `services/themePreference.ts`: preferencia local de modo claro/oscuro.
- `services/videoRecipes.ts`: enlaces YouTube/TikTok. Verificar si hay embeds, miniaturas o solicitudes de metadatos antes de declarar transferencias o extracción de video.
- Las sugerencias e iconos de ingredientes se resuelven localmente. No justifican por sí solos cookies publicitarias ni un proveedor de IA.

Desconocidos que deben comprobarse: operador legal, contacto oficial, edades/mercados, analítica y cookies de la configuración publicada, región de datos, conservación/backups, eliminación integral, contratos de encargados y flujos de derechos. No reutilizar un correo personal del chat como contacto legal sin que el usuario lo designe.

La paleta y arquitectura existentes se conservan. Crear documentos o auditar no autoriza migraciones, publicación, cambios de permisos o instrumentación de seguimiento.
