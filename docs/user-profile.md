# Perfil de usuario

## Flujo

Crear cuenta solicita nombre y apellido, además del correo y contraseña. En una cuenta existente, Mi cuenta muestra el nombre completo o invita a completar el perfil. Editar perfil permite cambiar nombre, apellido y foto; cancelar descarta el borrador. La foto se selecciona desde el dispositivo, se recorta al centro y se reduce a JPEG de 256 × 256 antes de subir. Solo se transmite al pulsar Guardar perfil.

Editar perfil consulta los metadatos actuales del usuario autenticado antes de precargar Nombre y Apellido. Un fallo de lectura se muestra como error y no se interpreta como un perfil vacío. Guardar actualiza la sesión compartida con el usuario confirmado por Supabase, sin depender únicamente del evento de Auth. Los campos siguen siendo editables; cancelar no cambia los datos guardados. La confirmación de guardado y los errores aparecen destacados al principio del panel.

Sin foto se conserva la silueta blanca sobre naranja en el encabezado. Con foto, ese mismo botón muestra el avatar circular. En la pantalla de acceso se conserva la flecha para volver a la lista.

## Persistencia y seguridad

- Nombres en `auth.users.user_metadata.first_name/last_name`; ruta privada en `avatar_path`. No se modifican ni duplican contraseñas. Estos metadatos son editables por el usuario y no deben usarse para autorización.
- Bucket privado `profile-avatars`; JPEG hasta 512 KB; rutas `user_id/uuid.jpg`. Solo el propietario puede insertar, leer y eliminar sus fotos. No hay acceso anónimo ni actualización de objetos existentes.
- URL firmada de una hora, renovada cada 50 minutos durante la sesión; no se guarda la URL firmada en el perfil. Caché en memoria vinculada a propietario y ruta.
- Subir una foto no cambia el perfil hasta confirmar `auth.updateUser`. Ante error se intenta retirar únicamente la foto nueva. Tras el guardado se intenta limpiar la foto anterior. Si la limpieza falla puede quedar un objeto sin referencia; no se informa fallo de guardado tras una actualización confirmada.
- Comprobar sesión antes de subir y antes de actualizar; políticas de Storage siguen siendo la frontera de autorización. Cerrar sesión se bloquea durante el guardado desde esta pantalla.

## Configuración

Aplicar `supabase/migrations/202610260001_profile_avatars.sql` para habilitar las fotos en el Supabase correspondiente. La migración no crea una tabla pública de usuarios; no modifica datos existentes ni convierte un bucket público existente a privado silenciosamente. Nombres funcionan mediante Auth sin esta migración; subir fotos informa error si falta el bucket.

Aplicada con autorización en el proyecto GoodEats (`pionprlepbecpggrsuve`) el 26 de octubre de 2026. El cambio de interfaz permanece local hasta un commit/push y despliegue posterior.

Dependencias oficiales añadidas mediante `npx expo install`: `expo-image-picker` y `expo-image-manipulator`. Usan selector del sistema, sin cámara. Verificar en build nativo compatible; la validación web no confirma permisos o comportamiento en dispositivos físicos.

## Verificación

- 58 pruebas automatizadas aprobadas, incluyendo catorce de nombres, sesión, aislamiento de rutas, límites JPEG, orden de subida/guardado, errores, cambio de cuenta, limpieza, registro y lectura de nombres para editar. Integración Supabase simulada en estas pruebas.
- Lint, TypeScript y exportación web aprobados.
- Navegador local con sesión real: acceso recuperado después de reactivar Supabase, apertura de Editar perfil, rechazo de nombre vacío y cancelación sin modificar metadatos. Supabase confirmado Healthy y Auth HTTP 200. No se guardaron nombres ni fotos reales durante esta comprobación.
- `supabase/tests/profile_avatars_rls.sql` ejecutado en Supabase con resultado PASS: subida/lectura propia, rechazo de inserción/lectura de otra cuenta y rechazo de lectura anónima. Fixtures revertidas mediante rollback. Una primera ejecución falló porque Storage bloquea DELETE directo por SQL incluso sin filas afectadas; se conservó esa protección y se retiraron los DELETE SQL de la prueba. La eliminación por API se comprobó con mocks, no mediante bypass del guard.
- Navegador local: foto seleccionada visible como borrador; se exige nombre y apellido para guardar. No se sustituyó el borrador del usuario.
- Pendiente de verificación real con datos completados por el usuario: guardar nombre, subida privada, recarga, foto en encabezado y cambio de cuenta. No se accede a contraseñas del usuario para probarlo.
