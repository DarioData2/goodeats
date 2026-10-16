# QA — listas de compras — 15 de octubre de 2026

## Cierre de los bugs — 16 de octubre de 2026

QA-01, QA-02 y QA-03 corregidos y verificados nuevamente con éxito. El resto de este documento conserva la revisión inicial como evidencia histórica.

- QA-01: añadido `aria-checked` a las casillas de la lista manual y radios de los formularios de alta/edición, conservando `accessibilityState` para plataformas nativas. Navegador local: radio kg=true/unidad=false al seleccionar kg; casilla tomate=true al marcar y false al restaurar. El editor también expone la unidad seleccionada.
- QA-02: `services/quantities.ts` centraliza el formato con 15 cifras significativas. Prueba automatizada y fila real muestran `0,0001 kg`. Se restauró el producto local a 6 unidad después de verificarlo; poroto quedó intacto.
- QA-03: consolidación con cifras significativas en lugar de seis decimales fijos. La cantidad positiva escalada 0.0000001 g sigue positiva, se muestra `0,0000001`, y las sumas como 0.1 + 0.2 se presentan como 0,3. Lista automática utiliza el mismo formateador en texto y etiqueta accesible.
- Los casos de regresión se trasladaron de `scripts/qa-shopping-regressions.cjs` a `tests/qa-shopping-regressions.test.cjs`: ahora forman parte de `npm test`, con dos comprobaciones adicionales de precisión.
- `npm test`: 34 aprobadas, 0 fallidas. `npm run lint` y `npm run typecheck`: correctos.
- `npm run export:web`: exportación completada en `dist`; fue necesario repetir fuera del entorno restringido tras un bloqueo de permisos de escritura (EPERM).
- Evidencia visual local: `.expo/qa-shopping-fixed.png` (muestra la cantidad temporal del caso de prueba, antes de restaurar los datos).

No se certifican dispositivos físicos ni RLS desplegado: las limitaciones de alcance indicadas en la revisión inicial siguen aplicando. El riesgo de edición simultánea entre pestañas no formó parte de estos tres bugs y sigue pendiente de evaluación específica.

## Alcance y resultado

Revisión de listas manuales locales, servicios de listas en Supabase y compras generadas desde el menú. Código actual del directorio de trabajo, incluyendo cambios aún sin commit. No se aplicaron correcciones funcionales ni se modificaron datos de producción.

- `npm test`: 30 aprobadas, 0 fallidas. Incluye pruebas de otros módulos, no son 30 casos exclusivos de compras.
- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `node --test scripts/qa-shopping-regressions.cjs`: 0 aprobadas, 2 fallidas, reproduciendo QA-02 y QA-03. Ejecutar `npm test` antes para compilar los servicios actuales en `.test-build`.
- Navegador local: compras automáticas existentes muestran Tomate 500 g bajo Frutas y verduras; navegación a lista manual conserva tomate 6 unidad y poroto; formulario vacío rechazado; edición con cantidad 0 rechazada; cancelar conserva tomate 6 unidad.

## Bugs confirmados

### QA-01 — Media (P2): estados no expuestos a tecnologías de asistencia en web

Archivos: `components/ShoppingItem.tsx:10`, `components/AddItemForm.tsx:37`, `components/InlineItemEditor.tsx:35`.

Reproducción: abrir Mi lista → Lista manual y consultar los atributos accesibles de la casilla de tomate y del selector de unidad. La unidad muestra visualmente una marca de selección, pero el elemento radio no tiene `aria-checked`. La casilla tampoco lo tiene. Inspección DOM ejecutada: `getAttribute('aria-checked')` devuelve `null` para ambos. El árbol accesible informa valor 0 para la unidad seleccionada; el editor repite el patrón.

Esperado: radio seleccionado con estado checked=true y casillas con true/false consistente con su estado real. Impacto: lectores de pantalla no disponen de un estado fiable. La etiqueta de la casilla ayuda a identificar la acción, pero no sustituye su estado semántico.

Recomendación: exponer explícitamente `aria-checked` en web, conservando la compatibilidad nativa. Verificar marcada/desmarcada y cada unidad con teclado y árbol accesible. El nuevo control de compras automáticas ya utiliza ese atributo.

### QA-02 — Media (P2): cantidades manuales válidas pueden mostrarse como cero

Archivo: `components/ShoppingItem.tsx:7`.

Reproducción automatizada: `parseItemInput('Azafrán', '0,0001', 'kg')` acepta 0.0001 kg; el formateador de la fila, `quantity.toLocaleString('es-CL')`, devuelve `0`. Es una cantidad de 0.1 g, relevante para ingredientes pequeños. No fue necesario guardar un producto real.

Esperado: conservar la cantidad al presentarla (0,0001 kg o 0,1 g), o rechazar explícitamente una precisión no admitida. Actual: se presenta 0 kg aunque el valor guardado es positivo.

Recomendación: centralizar el formateo de cantidades con precisión definida y coherente con la validación; añadir este caso a la suite principal después de corregir.

### QA-03 — Baja (P3): redondeo de compras automáticas elimina cantidades positivas muy pequeñas

Archivo: `services/plannerLogic.ts:47`.

Reproducción automatizada: receta válida con 0.0001 g de especia para 1000 porciones, planificar 1 porción. Resultado matemático positivo 0.0000001 g; `generateGroceries` produce 0 g por el redondeo fijo a seis decimales. Caso límite admitido por las validaciones actuales; baja probabilidad en cocina cotidiana.

Esperado: conservar un resultado positivo o informar que la cantidad queda fuera del rango soportado. Recomendación: definir precisión/rango de ingredientes y porciones, y evitar convertir silenciosamente a cero el valor utilizado por la lista y su clave de compra.

## Seguridad, integraciones y límites

- Las pruebas de servicios usan un cliente Supabase simulado: validan sesión, filtros de propietario/lista, rechazo de lista ajena, campos editables, propagación de errores RLS y eliminación de productos no visibles. No prueban las políticas desplegadas del servidor.
- Se inspeccionó la migración de lectura de shopping_items y el test SQL disponible. No se ejecutó `supabase/tests/shopping_rls.sql` contra una base real en esta revisión; no se certifica la configuración RLS de producción.
- No se instalaron Jest/Vitest, Testing Library, Maestro ni Detox. Se utilizó el runner Node existente y el navegador local.
- No se realizaron mediciones de rendimiento, pruebas de volumen, fallos de red/almacenamiento en navegador ni pruebas en Android/iOS físicos.
- Riesgo observado por inspección, no reproducido en esta revisión: `useShoppingList` escribe una copia completa de la lista desde memoria; dos pestañas pueden sobrescribir cambios entre sí. La planificación nueva tampoco ofrece transacciones entre pestañas. Requiere prueba aislada adicional.
- El nuevo planificador sigue siendo local y la lista automática está separada de la manual: limitaciones conocidas, no fallos de sincronización descubiertos en esta revisión.

## Siguiente acción recomendada

Corregir primero QA-01 y QA-02; definir luego el rango de cantidades de QA-03. Reejecutar los casos de regresión, la suite completa, lint y typecheck. Las dos pruebas adicionales se conservan fuera del glob habitual para documentar defectos abiertos sin presentar la suite existente como una validación suficiente.
