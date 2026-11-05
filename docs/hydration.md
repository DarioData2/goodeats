# Hidratación

Primera versión local, 3 de noviembre de 2026. Acceso desde **Mi salud** en la barra inferior y ruta `/hidratacion`.

## Funciones

- Registrar agua para el día local actual con accesos de 150, 250 y 500 ml o una cantidad personalizada.
- Botellas animadas de 1 litro con botón Agregar 200 ml. Cada pulsación confirmada en almacenamiento sube el nivel; cinco pulsaciones llenan una botella. Al completarla aparece otra vacía y los siguientes registros la llenan. Por ejemplo, 1.200 ml son una botella completa y otra con 200 ml. Deshacer también actualiza los niveles. La animación respeta la preferencia de movimiento reducido.
- Editar la meta en litros, incluidos decimales con coma o punto (1,5 o 1.5). Se conserva el formato de almacenamiento en ml para no perder registros ni metas existentes. Cuando aún no existe una meta guardada, la pantalla muestra 1 litro como valor inicial solicitado por el usuario; no se escribe hasta guardar la edición ni se calcula una recomendación de salud.
- Mostrar total diario, porcentaje y progreso de la meta. La barra se limita visualmente al 100 %, mientras que el total conserva la cantidad real. La meta no bloquea registros adicionales: estos se muestran en las botellas extra. Se prepara también el número de botellas necesario para representar la meta elegida.
- Ver los últimos diez registros del día (el total incluye todos) y deshacer el último registro de ese día.
- Consultar volúmenes de lunes a domingo de la semana actual. Los días futuros y los días sin registros se distinguen de un volumen registrado.
- Conservar la identidad y los componentes existentes en modo claro y oscuro.

## Guardado en la nube (4 de noviembre de 2026)

Con sesión, `services/hydrationService.ts` guarda y recupera registros de todos los días y la meta en `public.hydration_profiles` de Supabase. Al volver a Mi salud, recargar la app o recuperar una sesión, se lee la versión de la cuenta. El botón **Actualizar desde mi cuenta** permite consultar cambios de otro dispositivo; no hay suscripción en tiempo real ni cola offline.

La primera activación de una cuenta importa su historial local únicamente si todavía no existe una fila remota. La inserción no reemplaza datos creados simultáneamente desde otro dispositivo. Si ya existe un historial remoto, este tiene prioridad; el respaldo local anterior permanece intacto en el dispositivo y no se fusiona automáticamente. Los registros sin sesión no se trasladan a una cuenta.

Los guardados usan una revisión generada por el servidor y actualización condicional. Si otro dispositivo guarda primero, se recupera su versión y se reaplica la operación, hasta tres intentos. Deshacer comprueba el identificador del último registro visible para evitar retirar un registro nuevo de otro dispositivo. Ante un error de red no se comunica éxito ni se cambia silenciosamente al guardado local. Tras un guardado ambiguo, actualizar desde la cuenta antes de volver a registrar la misma cantidad.

La tabla usa RLS, permisos de lectura, inserción y actualización limitados al propietario y validación de fechas, cantidades, meta y estructura JSON. El propietario y la revisión no son editables desde el cliente. El documento tiene un límite técnico de 1 MB; las cantidades y límites previos se conservan. Credenciales y contraseñas siguen en Supabase Auth.

Migración `supabase/migrations/202611040001_hydration_cloud.sql` aplicada en el proyecto `pionprlepbecpggrsuve` el 4 de noviembre de 2026. `supabase/tests/hydration_rls.sql` ejecutado con PASS, con usuarios temporales dentro de una transacción revertida: persistencia propia, validación, conflicto de revisión, bloqueo de cambio de propietario/revisión, aislamiento entre cuentas y bloqueo anónimo. No volver a aplicar la migración a una tabla existente sin inspeccionar su estado.

Navegador local con la cuenta existente: se importó su historial anterior, incluyendo 2.000 ml del martes. Tras recargar la aplicación se recuperó el mismo historial desde Supabase. No se añadieron registros ficticios a esa cuenta. La prueba real utilizó la sesión persistente; queda pendiente comprobar el cierre e inicio manual y un segundo dispositivo físico.

## Datos locales y privacidad

Sin sesión, AsyncStorage conserva `@goodeats/hydration/v1/local`. Los respaldos anteriores de cada cuenta permanecen en `@goodeats/hydration/v1/<userId>`. El almacenamiento local del dispositivo/navegador no está cifrado por este módulo. Cambiar de cuenta no mezcla registros con la cuenta anterior o con el modo sin sesión. Con sesión, los registros y la meta se transmiten a Supabase por HTTPS; no se envían a servicios de analítica.

Cada registro contiene identificador, cantidad en ml y hora. La fecha de registro se calcula con la zona horaria local al pulsar Registrar. La pantalla actualiza la fecha periódicamente mientras está abierta. El historial no se descarta al empezar otro día.

La meta es una preferencia actual; cambiarla no altera volúmenes históricos. El resumen semanal muestra volúmenes, sin reinterpretar metas de días anteriores.

La lectura y escritura validan formato, fechas, cantidades enteras y duplicados. El límite de 1 a 10.000 ml por entrada o meta es técnico, no una recomendación de consumo. Un fallo de lectura impide sobrescribir datos; un fallo de guardado conserva el campo para reintentar. Las operaciones simultáneas desde la misma pantalla se bloquean durante el guardado. No hay soporte para edición simultánea entre pestañas.

## Verificación

81 pruebas del proyecto aprobadas: las 74 previas y siete nuevas de acceso autenticado, migración inicial, prioridad remota, concurrencia, lectura/guardado, errores y deshacer tras un cambio en otro dispositivo. Lint, TypeScript y exportación web aprobados. Las pruebas automatizadas de almacenamiento usan mocks. La verificación real de Supabase se describe arriba; no se ha probado en dispositivos físicos.

Navegador de prueba local con origen separado (`127.0.0.1`): cinco pulsaciones de Agregar 200 ml produjeron 200, 400, 600, 800 y 1.000 ml. El estado de botella completa se conservó al recargar. Estos datos de prueba no se incorporaron al almacenamiento de la cuenta en `localhost`. La implementación utiliza Animated.Value compatible con React Native Web, sin depender de hooks que solo estén exportados por React Native nativo.

Ampliación del 4 de noviembre: navegador aislado confirmó segunda botella vacía al alcanzar 1.000 ml, llenado con los siguientes 200 ml, edición de meta a 1,5 litros, progreso al 80 % y conservación del total de 1.200 ml y la meta al recargar. En volúmenes grandes se muestran como máximo doce botellas y se informa cuántas completas anteriores se resumen; no se eliminan registros.

Esta ampliación aplica la tabla y sus políticas en Supabase. El código de la aplicación queda local hasta que se solicite commit/push y publicación en Cloudflare. No cambia claves ni credenciales.
