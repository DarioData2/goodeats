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

## Datos y privacidad

AsyncStorage conserva `@goodeats/hydration/v1/<userId|local>`. No hay envío a Supabase, servicios de analítica ni APIs externas desde el módulo. Es almacenamiento local del dispositivo/navegador, no almacenamiento cifrado ni un respaldo en la nube. Cambiar de cuenta no mezcla registros con la cuenta anterior o con el modo sin sesión.

Cada registro contiene identificador, cantidad en ml y hora. La fecha de registro se calcula con la zona horaria local al pulsar Registrar. La pantalla actualiza la fecha periódicamente mientras está abierta. El historial no se descarta al empezar otro día.

La meta es una preferencia actual; cambiarla no altera volúmenes históricos. El resumen semanal muestra volúmenes, sin reinterpretar metas de días anteriores.

La lectura y escritura validan formato, fechas, cantidades enteras y duplicados. El límite de 1 a 10.000 ml por entrada o meta es técnico, no una recomendación de consumo. Un fallo de lectura impide sobrescribir datos; un fallo de guardado conserva el campo para reintentar. Las operaciones simultáneas desde la misma pantalla se bloquean durante el guardado. No hay soporte para edición simultánea entre pestañas.

## Verificación

74 pruebas del proyecto aprobadas, incluidas diez sobre validaciones, persistencia, separación por cuenta, cambio de fecha, metas en litros, deshacer, errores de almacenamiento simulado, llenado de botellas y representación de volúmenes grandes sin renderizar listas ilimitadas. Lint, TypeScript y exportación web aprobados. Las pruebas de almacenamiento usan mocks; no implican sincronización remota ni pruebas en dispositivos físicos.

Navegador de prueba local con origen separado (`127.0.0.1`): cinco pulsaciones de Agregar 200 ml produjeron 200, 400, 600, 800 y 1.000 ml. El estado de botella completa se conservó al recargar. Estos datos de prueba no se incorporaron al almacenamiento de la cuenta en `localhost`. La implementación utiliza Animated.Value compatible con React Native Web, sin depender de hooks que solo estén exportados por React Native nativo.

Ampliación del 4 de noviembre: navegador aislado confirmó segunda botella vacía al alcanzar 1.000 ml, llenado con los siguientes 200 ml, edición de meta a 1,5 litros, progreso al 80 % y conservación del total de 1.200 ml y la meta al recargar. En volúmenes grandes se muestran como máximo doce botellas y se informa cuántas completas anteriores se resumen; no se eliminan registros.

No se modifican tablas, políticas RLS, credenciales ni configuración de producción. Publicación y commits quedan fuera de esta entrega local.
