# GoodEats · MVP 1

Lista de compras manual en español creada con Expo, React Native y TypeScript. Comparte código entre web y Android. Incluye agregar, editar, eliminar, marcar/desmarcar comprados, contadores y limpieza de comprados. Cantidad opcional; admite decimales con punto o coma. Nombre obligatorio y cantidades positivas.

Incluye registro e inicio de sesión con Supabase Auth y listas de compras en la nube. Sin sesión conserva el MVP local. Incluye un menú semanal manual con guardado local; no incluye recetas ni IA. Consulta [la integración de Supabase](docs/supabase.md).

Web publicada: [goodeats.cl](https://goodeats.cl). Los cambios enviados a `main` se despliegan automáticamente en Cloudflare Pages. Consulta el [historial de cambios](CHANGELOG.md).

## Acceso y lista de compras

El inicio `/` presenta las ventajas de GoodEats, un ejemplo de organización y las funciones de «Mi lista» y «Mi menú», con accesos a ambas páginas y a la cuenta. Explica las opciones reales de guardado local y en la nube. El logo lleva al inicio; «Mi lista» abre las compras en `/lista` y «Mi menú» abre `/menu`. El botón «Iniciar sesión» abre `/login`, donde puedes iniciar sesión, crear una cuenta y mostrar u ocultar la contraseña. «Volver a la lista» regresa a `/lista`. Con una sesión activa, el botón del encabezado muestra «Mi cuenta» y permite acceder al cierre de sesión.

Los productos se presentan como filas dentro de un único panel, con separadores entre ellos. Cada fila conserva las acciones de marcar/desmarcar, editar y eliminar. Este cambio es visual: las listas locales y las de Supabase mantienen sus respectivos datos y no se fusionan automáticamente.

## Mi menú

El enlace «Mi menú» del encabezado abre `/menu`. Permite escribir un almuerzo por día de lunes a domingo, dejando campos vacíos cuando no sean necesarios. El calendario situado sobre el lunes muestra las fechas y permite cambiar de semana. Pulsa «Guardar menú» al final del domingo antes de salir o cambiar de semana; guarda todos los almuerzos de la semana seleccionada.

El menú se guarda con AsyncStorage en este dispositivo, separado por semana, cuenta y uso sin sesión. El menú anterior sin fechas se conserva en la semana actual al cargarlo por primera vez. Los campos antiguos de desayuno y cena se conservan en el almacenamiento aunque ya no se muestran. Los menús aún no se sincronizan con Supabase.

## Ejecutar

Requisitos: Node.js LTS compatible con Expo SDK 57 (se verificó con Node 24) y npm.

```powershell
cd C:\Users\alexa\Documents\Proyectos\goodeats
npm ci
# En otro equipo: copia .env.example a .env y completa los valores públicos de Supabase.
npm start
```

## Web

```powershell
npm run web
```

Expo abre el navegador; también puedes presionar `w` desde `npm start`. Usa la URL que muestra la terminal (normalmente http://localhost:8081). La pantalla coloca formulario y lista en columnas desde 850 px; en teléfono los apila.

Para publicar en Cloudflare Pages con `goodeats.cl`, consulta [la configuración de despliegue](docs/cloudflare.md). Compilación: `npm run build:cloudflare`; carpeta de salida: `dist`.

## Android con Expo Go

1. Instala Expo Go compatible con **SDK 57**. Consulta [la descarga oficial por SDK y plataforma](https://expo.dev/go) si la versión instalada no coincide; la versión de la tienda puede diferir.
2. Conecta el teléfono y el computador a la misma red Wi-Fi.
3. Ejecuta `npm start` y escanea el QR desde Expo Go en Android.
4. Si Windows solicita acceso de red, permite Node.js en tu red privada. Revisa que firewall y aislamiento Wi-Fi permitan la conexión.
5. Para un emulador Android ya configurado y abierto, usa `npm run android` o presiona `a`.

El MVP local funciona incluso sin configurar Supabase. Para guardar en la nube, pulsa «Iniciar sesión» en el encabezado, confirma tu correo si lo solicita Supabase, vuelve a la lista y crea una lista. La navegación usa Expo Router con versiones compatibles con SDK 57. La verificación de bundle Android no sustituye una prueba en teléfono físico.

## Estructura

```text
package.json                # Entrada principal: expo-router/entry
src/app/
  _layout.tsx               # Proveedores, sesión y rutas
  index.tsx                 # Ruta /: presentación de GoodEats
  lista.tsx                 # Ruta /lista: lista de compras
  login.tsx                 # Ruta /login: acceso y cuenta
contexts/AuthContext.tsx    # Una sesión compartida entre páginas
components/
  AppHeader.tsx             # Marca y enlace de acceso/cuenta
  AccountPanel.tsx          # Login, registro, contraseña y cierre de sesión
  ShoppingScreen.tsx        # Pantalla responsive local o nube
  AddItemForm.tsx            # Formulario de alta y edición
  ShoppingItem.tsx           # Producto, checkbox y acciones
  ShoppingList.tsx           # Lista y estado vacío
  Button.tsx                # Botón reutilizable
hooks/useShoppingList.ts     # Carga y operaciones con manejo de errores
services/
  shoppingStorage.ts         # Adaptador AsyncStorage
  shoppingLogic.ts           # Validación y transformaciones
  shoppingService.ts         # Operaciones remotas; requieren autenticación
  authService.ts             # Registro, inicio y cierre de sesión
hooks/useAuth.ts             # Estado y recuperación de sesión
hooks/useCloudShoppingList.ts # Operaciones y selección de listas remotas
lib/supabase.ts              # Cliente y persistencia de sesión
types/shopping.ts            # Modelos local/remoto y contrato ShoppingStorage
types/database.ts            # Contrato TypeScript del esquema previsto
constants/
  units.ts                   # Unidades ampliables
  theme.ts                   # Colores
assets/                     # Recursos de Expo
tests/shopping.test.cjs       # Pruebas de lógica y serialización
```

## Persistencia y evolución

AsyncStorage guarda la lista bajo `@goodeats/shopping-items/v1`; en web utiliza almacenamiento local del navegador. Los datos pertenecen al dispositivo o al origen web: no se sincronizan. Borrar datos del navegador o desinstalar la aplicación puede eliminarlos.

Primero se carga la lista, luego se habilitan las acciones. Cada cambio se guarda antes de actualizar la interfaz; los cambios simultáneos se bloquean mientras se escribe. Si falla el guardado, se conserva el estado previo y se informa el error. Si falla la lectura o los datos no son válidos, no se sobrescriben; puedes reintentar.

Sin sesión, `useShoppingList` usa AsyncStorage y el formato original. Con sesión, `useCloudShoppingList` utiliza el servicio remoto por producto y lista. La vista se reinicia al cambiar de cuenta o de lista para no mezclar datos ni ediciones. Los cambios remotos se muestran tras confirmarse el guardado. Usa «Actualizar desde Supabase» para ver cambios de otros dispositivos; todavía no hay sincronización en tiempo real ni cola offline.

Los productos locales no se importan automáticamente a ninguna cuenta. Al cerrar sesión vuelven a estar disponibles. Un fallo remoto muestra un error y no cambia al almacenamiento local silenciosamente. La migración `supabase/migrations/202610040001_shopping_items_read.sql` complementa las tablas y políticas que ya existían en este proyecto; no constituye un esquema inicial para una base vacía.

## Verificar

```powershell
npm run typecheck
npm run lint
npm test
npm run export:web
npm run export:android
```

Las exportaciones generan bundles en `dist/`; no producen APK/AAB ni publican la aplicación.

Prueba manual en web y Expo Go: agregar Tomates (6 unidades) y Leche (2 litros), editar cantidad/unidad, quitar una cantidad, marcar y desmarcar, eliminar individualmente y limpiar comprados dejando pendientes intactos. Cierra y vuelve a abrir para verificar persistencia. Prueba también nombre vacío y cantidad cero, negativos o texto.

Para la navegación: abre «Iniciar sesión», verifica que la URL sea `/login`, recarga esa dirección directamente y vuelve a `/`. Los productos locales deben conservarse. Alterna login/registro y Mostrar/Ocultar contraseña. Revisa el encabezado y las filas de la lista en teléfono y escritorio.

## Validación realizada

- TypeScript y lint sin errores y catorce pruebas automatizadas aprobadas.
- Prueba real en Supabase: CRUD del propietario, limpieza de comprados, aislamiento de dos usuarios y ausencia de acceso anónimo; fixtures revertidos con ROLLBACK. SQL reproducible en `supabase/tests/shopping_rls.sql`.
- Bundles de web y Android generados correctamente; versiones compatibles verificadas con `expo install --check`.
- En navegador: altas, selección de unidad, edición decimal con coma, marcado, recarga con persistencia, limpieza selectiva, eliminación y validación de nombre vacío. Diseño revisado a 390 px y en escritorio.
- No se probó en un dispositivo físico Android; sigue los pasos de Expo Go para esa comprobación.
- La instalación de Expo Router reportó 29 avisos de auditoría (10 moderados, 19 altos) y un aviso de peer dependency transitiva de `react-native-worklets`. La compilación web y TypeScript pasan. Revisar parches compatibles antes de distribuir builds nativos; no se aplicaron actualizaciones forzadas del stack.
