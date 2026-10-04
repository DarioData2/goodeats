# GoodEats · MVP 1

Lista de compras manual en español creada con Expo, React Native y TypeScript. Comparte código entre web y Android. Incluye agregar, editar, eliminar, marcar/desmarcar comprados, contadores y limpieza de comprados. Cantidad opcional; admite decimales con punto o coma. Nombre obligatorio y cantidades positivas.

Este alcance corresponde exclusivamente a “Primera tarea para Codex”: no incluye Supabase, autenticación, backend, planificación, recetas ni IA.

## Ejecutar

Requisitos: Node.js LTS compatible con Expo SDK 57 (se verificó con Node 24) y npm.

```powershell
cd C:\Users\alexa\Documents\Proyectos\goodeats
npm ci
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

No requiere cuenta de Supabase, API keys ni compilación EAS. La verificación de bundle Android no sustituye una prueba en teléfono físico.

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
types/shopping.ts            # Modelo y contrato ShoppingStorage
constants/
  units.ts                   # Unidades ampliables
  theme.ts                   # Colores
assets/                     # Recursos de Expo
tests/shopping.test.cjs       # Pruebas de lógica y serialización
```

## Persistencia y evolución

AsyncStorage guarda la lista bajo `@goodeats/shopping-items/v1`; en web utiliza almacenamiento local del navegador. Los datos pertenecen al dispositivo o al origen web: no se sincronizan. Borrar datos del navegador o desinstalar la aplicación puede eliminarlos.

Primero se carga la lista, luego se habilitan las acciones. Cada cambio se guarda antes de actualizar la interfaz; los cambios simultáneos se bloquean mientras se escribe. Si falla el guardado, se conserva el estado previo y se informa el error. Si falla la lectura o los datos no son válidos, no se sobrescriben; puedes reintentar.

Para una futura migración, implementa el contrato `ShoppingStorage` e inyéctalo en `useShoppingList`. La interfaz no conoce AsyncStorage. Las nuevas necesidades de usuarios y sincronización corresponden a fases posteriores.

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

- TypeScript y lint sin errores y seis pruebas automatizadas aprobadas.
- Bundles de web y Android generados correctamente; versiones compatibles verificadas con `expo install --check`.
- En navegador: altas, selección de unidad, edición decimal con coma, marcado, recarga con persistencia, limpieza selectiva, eliminación y validación de nombre vacío. Diseño revisado a 390 px y en escritorio.
- No se probó en un dispositivo físico Android; sigue los pasos de Expo Go para esa comprobación.
- `npm audit` reportó 23 avisos en dependencias transitivas del stack (7 moderados, 16 altos). No se aplicó `npm audit fix --force`: propone retroceder Expo a SDK 44 y React Native a 0.72, incompatibles con este proyecto. Revisar parches compatibles del stack antes de distribuirlo.
