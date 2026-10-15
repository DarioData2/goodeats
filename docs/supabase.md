# GoodEats: Auth y persistencia en Supabase

## Cómo usarlo

1. Ejecuta `npm ci` y `npx expo start --clear`. En otro equipo copia `.env.example` a `.env` y completa las variables públicas antes de iniciar Expo.
2. Abre la app web o Expo Go para Android. Sin sesión se muestra tu lista local.
3. Pulsa «Iniciar sesión o crear cuenta». Crea una cuenta de GoodEats o inicia sesión por correo y contraseña. El acceso al dashboard de Supabase es independiente de la cuenta de la app.
4. Si Supabase exige confirmar el correo, abre su enlace y después inicia sesión en GoodEats. No hace falta capturar una sesión desde ese enlace en la app.
5. Crea una lista o selecciona una existente. Las altas, ediciones, marcas de comprado, eliminaciones y limpieza de comprados usan Supabase.
6. Usa «Actualizar desde Supabase» para obtener cambios realizados en otro dispositivo. Al cerrar sesión vuelve tu lista local.

## Almacenamiento y cuentas

Los datos locales continúan en AsyncStorage, con la misma clave y formato originales. No se migran automáticamente ni se mezclan con una cuenta. Las listas remotas se consultan y modifican mediante `shoppingService.ts`; los componentes no hacen consultas directas. La vista se desmonta cuando cambia el usuario o la lista seleccionada, evitando exponer datos o continuar una edición de otra lista.

No existe cola offline ni sincronización en tiempo real. Un fallo de red o de RLS muestra un error y conserva el estado previo; recarga antes de reintentar si una petición pudo llegar al servidor. No hay fallback silencioso del modo nube al local. El cierre de sesión usa alcance local y no cierra otros dispositivos.

## Cliente y configuración

`lib/supabase.ts` lee `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `.env` está ignorado por Git; `.env.example` contiene ejemplos. Las variables públicas se incluyen en el bundle y no sustituyen las políticas RLS.

La sesión persiste mediante `localStorage`: SQLite en Android/iOS y almacenamiento del navegador en web. La renovación de tokens nativos sigue el estado de la app. `hooks/useAuth.ts` escucha cambios de sesión y recupera la sesión guardada. Si falta configuración, el MVP local sigue disponible.

Dependencias añadidas: `@supabase/supabase-js`, `react-native-url-polyfill`, `expo-sqlite`, instaladas mediante Expo. No hay claves administrativas ni credenciales privadas en el frontend.

## Base de datos y RLS

### Menús y recetas

La migración `supabase/migrations/202610140001_meal_planning.sql` añade `weekly_menus` (usuario, lunes de la semana, comidas JSON) y `daily_recipes` (usuario, fecha, título, ingredientes y pasos). Ambas usan clave primaria compuesta, referencia a `auth.users`, RLS y permisos SELECT/INSERT/UPDATE exclusivos de usuarios autenticados sobre sus propios registros. No almacenan contraseñas.

`services/mealPlanningService.ts` valida la cuenta con `auth.getUser`, filtra por propietario y fecha, y guarda mediante upsert. Sin sesión usa almacenamiento local. Los errores de nube conservan el borrador y no cambian silenciosamente a modo local. La recuperación de datos sin sesión requiere revisión y guardado explícitos; la migración de respaldos locales de una cuenta usa inserción sin sobrescribir registros remotos.

La migración se aplicó en el proyecto GoodEats el 14 de octubre de 2026 tras reactivar su base pausada. `supabase/tests/meal_planning_rls.sql` comprobó lectura, edición y upsert propios, formato inválido, bloqueo entre dos usuarios y ausencia de acceso anónimo; devolvió PASS y terminó en ROLLBACK, sin dejar usuarios ni comidas de prueba. Los backups locales permanecen intactos. En otros entornos, ejecutar la migración antes de publicar el código.

La auditoría del proyecto confirmó las tablas `shopping_lists` y `shopping_items`, UUID y fechas con defaults y claves foráneas hacia propietarios y listas. RLS ya estaba habilitado en ambas tablas. Las listas tenían las cuatro políticas del propietario; a los productos les faltaba SELECT.

Se ejecutó `supabase/migrations/202610040001_shopping_items_read.sql` en el proyecto existente: añadió una política SELECT para usuarios autenticados cuyos productos pertenecen a listas propias y un trigger que actualiza `updated_at`. Se conservaron las políticas de escritura existentes. No se deshabilitó RLS ni se volvió a habilitar innecesariamente.

La migración es complementaria a las tablas existentes: no instala el esquema desde cero en una base vacía. No habilitar despliegues de bases de preview automáticamente sin añadir antes una migración inicial y confirmar la configuración de Supabase CLI.

`supabase/tests/shopping_rls.sql` prueba en la base real:

- Crear lista y producto, consultar y editar como propietario.
- Quitar cantidad/unidad, marcar comprado y limpiar comprados.
- Bloquear lectura, inserción, actualización y eliminación de productos de otro usuario.
- Conservar los productos pendientes del otro usuario.
- Eliminar productos propios y bloquear lectura anónima de las listas.

La prueba crea dos usuarios y listas temporales dentro de una transacción que termina en ROLLBACK. No registra credenciales, no envía correos y no deja esos registros en la base. La ejecución devolvió PASS.

## Archivos principales

- `components/AccountPanel.tsx`: formulario de registro/login y cierre de sesión.
- `components/CloudListControls.tsx`: selección, creación y actualización de listas.
- `hooks/useAuth.ts`, `services/authService.ts`: estado y operaciones de cuenta.
- `hooks/useCloudShoppingList.ts`: carga y operaciones remotas con control de concurrencia.
- `services/shoppingService.ts`: servicios tipados con validación de sesión y propiedad.
- `services/cloudShoppingLogic.ts`: conversión del modelo remoto al modelo de presentación.
- `types/shopping.ts`, `types/database.ts`: modelos y contrato remoto previsto.
- `App.tsx`, `app/index.tsx`: selección de vista local o nube según sesión.
- `tests/supabase.test.cjs`: validación de sesión, filtros, propiedad, errores y nullable.
- `supabase/migrations/` y `supabase/tests/`: cambio SQL y pruebas reales de políticas.

El resto de los cambios incluye configuración de dependencias, `.gitignore`, `.env.example`, imports del modelo local, documentación y configuración de pruebas. No se añadieron IA, recetas ni otras funciones fuera de listas y cuenta.

## Verificación

TypeScript y lint sin errores. Catorce pruebas automatizadas pasaron. Exportaciones web y Android correctas. La prueba SQL real de RLS pasó con todos los datos temporales revertidos. Sigue pendiente una prueba en un teléfono físico Android.

React Native DevTools utilizó su fallback por permisos de su caché; la app y Metro funcionaron. Continúan los 23 avisos de auditoría de dependencias que ya existían; no se aplicaron downgrades forzados.

Comandos: `npm start`, `npm run web`, `npm run android`; comprobaciones: `npm run typecheck`, `npm run lint`, `npm test`, `npm run export:web`, `npm run export:android`.

Referencias: [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [eventos de sesión](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [SQLite SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/).
