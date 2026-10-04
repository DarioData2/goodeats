# GoodEats · MVP 1

Lista de compras manual en español creada con Expo, React Native y TypeScript. Comparte código entre web y Android. Incluye agregar, editar, eliminar, marcar/desmarcar comprados, contadores y limpieza de comprados. Cantidad opcional; admite decimales con punto o coma. Nombre obligatorio y cantidades positivas.

Incluye registro e inicio de sesión con Supabase Auth y listas de compras en la nube. Sin sesión conserva el MVP local. No incluye planificación, recetas ni IA. Consulta [la integración de Supabase](docs/supabase.md).

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

## Android con Expo Go

1. Instala Expo Go compatible con **SDK 57**. Consulta [la descarga oficial por SDK y plataforma](https://expo.dev/go) si la versión instalada no coincide; la versión de la tienda puede diferir.
2. Conecta el teléfono y el computador a la misma red Wi-Fi.
3. Ejecuta `npm start` y escanea el QR desde Expo Go en Android.
4. Si Windows solicita acceso de red, permite Node.js en tu red privada. Revisa que firewall y aislamiento Wi-Fi permitan la conexión.
5. Para un emulador Android ya configurado y abierto, usa `npm run android` o presiona `a`.

El MVP local funciona incluso sin configurar Supabase. Para guardar en la nube, pulsa «Iniciar sesión o crear cuenta», confirma tu correo si lo solicita Supabase y crea una lista. No requiere compilación EAS; la verificación de bundle Android no sustituye una prueba en teléfono físico.

## Estructura

```text
App.tsx                     # Proveedores y entrada de pantalla
index.ts                    # Registro de Expo
app/index.tsx               # Pantalla responsive
components/
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

## Validación realizada

- TypeScript y lint sin errores y catorce pruebas automatizadas aprobadas.
- Prueba real en Supabase: CRUD del propietario, limpieza de comprados, aislamiento de dos usuarios y ausencia de acceso anónimo; fixtures revertidos con ROLLBACK. SQL reproducible en `supabase/tests/shopping_rls.sql`.
- Bundles de web y Android generados correctamente; versiones compatibles verificadas con `expo install --check`.
- En navegador: altas, selección de unidad, edición decimal con coma, marcado, recarga con persistencia, limpieza selectiva, eliminación y validación de nombre vacío. Diseño revisado a 390 px y en escritorio.
- No se probó en un dispositivo físico Android; sigue los pasos de Expo Go para esa comprobación.
- `npm audit` reportó 23 avisos en dependencias transitivas del stack (7 moderados, 16 altos). No se aplicó `npm audit fix --force`: propone retroceder Expo a SDK 44 y React Native a 0.72, incompatibles con este proyecto. Revisar parches compatibles del stack antes de distribuirlo.
