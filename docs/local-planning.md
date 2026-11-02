# Biblioteca, menú completo y compras automáticas

Implementación local del 15 de octubre de 2026. No incluye importación desde sitios web ni integración con supermercados.

## Uso

1. En Mis recetas, crear un plato, su categoría, porciones, ingredientes y preparación. Cada ingrediente tiene nombre, cantidad, unidad y sección de compra. Se puede buscar por nombre, filtrar por categoría, editar, consultar y eliminar con confirmación.
2. En Mi menú, elegir una receta para desayuno, almuerzo, cena, snacks o postres de cualquier día; ajustar las porciones y guardar la semana.
3. Pulsar Generar lista de compras o abrir Mi lista. Las compras se calculan a partir de la semana guardada y se agrupan por sección. Marcar productos persiste el estado de compra.

Las cantidades se multiplican por `porciones planificadas / porciones de la receta`. Se suman nombres iguales ignorando mayúsculas, espacios y acentos. Se convierten kg a g y litros a ml; no se inventan conversiones entre unidades, tazas, paquetes o peso. No se fusionan sinónimos ni preparaciones distintas. Si un ingrediente tiene secciones diferentes, se conserva la primera sección de la semana.

Cada comida guarda una copia de la receta: editar o eliminar la receta de la biblioteca no cambia silenciosamente las compras de una semana ya guardada. Para actualizarla, volver a elegir la receta desde el menú. Si cambia la cantidad necesaria, el producto vuelve a pendiente; otros productos conservan su marca.

## Compatibilidad y almacenamiento

- Nuevo documento local `@goodeats/planner/v1/<userId|local>` con recetas, semanas y marcas de compra. Separación por usuario; no sincroniza entre dispositivos ni entre distintos orígenes web.
- Los datos anteriores no se eliminan ni se sobrescriben: accesos Recetas por fecha, Menú anterior y Lista manual conservan sus pantallas y su integración actual con Supabase.
- Recuperar esta semana copia el menú anterior como borrador únicamente cuando no hay una semana nueva guardada. Los platos de texto deben vincularse a recetas para aportar ingredientes; se muestra una advertencia cuando faltan.
- La nueva lista automática está separada de la lista manual para evitar duplicados al regenerar. Se deriva del menú guardado: repetir la generación no agrega filas duplicadas.
- Guardado explícito de recetas y menú. Cancelar descarta el borrador. No se garantiza conservación de borradores al salir de la pantalla.
- Errores de lectura bloquean escritura; errores de guardado mantienen el borrador. No hay soporte de edición simultánea entre pestañas.
- Esta entrega no aplica migraciones ni modifica producción, credenciales o políticas de Supabase. La sincronización de la nueva biblioteca y del plan de cinco tipos de comida requiere una fase posterior antes de ofrecerla como función en la nube.

### Ampliación local del 1 de noviembre de 2026

El planificador incluye Postres como quinto espacio opcional. Al leer semanas anteriores de cuatro espacios, conserva desayuno, almuerzo, cena y snacks en sus posiciones y agrega un postre vacío, sin alterar recetas ni marcas de compra. Los ingredientes de los postres guardados participan en la lista automática y en el ajuste de porciones.

Menú anterior vuelve a mostrar sus tres campos existentes (desayuno, almuerzo y cena); sus indicadores cuentan cualquier comida guardada. Conserva el formato remoto de tres campos exigido por Supabase. Snacks y postres se planifican en la vista Planificador. Recuperar un menú anterior conserva los tres campos y deja vacíos los dos espacios adicionales.

Verificación de esta ampliación: 61 pruebas automatizadas aprobadas, incluidas regresiones de compatibilidad, recuperación del menú anterior y compras con postres; lint, TypeScript y exportación web aprobados. No se realizaron despliegues ni migraciones de Supabase.

## Archivos

- `services/plannerLogic.ts`: modelo, validación, conversión y consolidación de ingredientes.
- `hooks/usePlanner.ts`: almacenamiento local, recarga al volver a una pantalla y manejo de errores.
- `components/PlannerWorkspace.tsx`: biblioteca, editor, planificador, compras y acceso a funciones anteriores.
- `src/app/{recetas,menu,lista}.tsx`: entrada a las nuevas pantallas.
- `tests/planner.test.cjs`: porciones, conversiones, unidades incompatibles, platos no vinculados, marcas de compra y datos inválidos.

## Verificación

Lint y TypeScript. Pruebas automatizadas del proyecto, incluyendo seis nuevas pruebas del planificador. Prueba web local: crear receta de ejemplo para dos porciones con 250 g de tomate, planificar cuatro porciones y comprobar 500 g en compras; persistencia tras recarga. Sin prueba en dispositivo físico ni sincronización de las nuevas funciones con Supabase.
