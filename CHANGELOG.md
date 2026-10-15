# Historial de cambios

## 2026-10-14 — Menús y recetas en Supabase

- Guardado por cuenta y semana/fecha en nuevas tablas `weekly_menus` y `daily_recipes`, con RLS por propietario y validación de sesión. Sin sesión se mantiene el almacenamiento local.
- Actualización manual desde Supabase, recuperación de datos sin sesión como borrador y migración de respaldos de una cuenta sin sobrescribir registros remotos. Los fallos de guardado conservan el borrador.
- SQL de migración y prueba de aislamiento entre cuentas con ROLLBACK; documentación actualizada.
- Migración aplicada en Supabase y prueba real RLS aprobada, con datos temporales revertidos. Lint, TypeScript, 24 pruebas automatizadas y compilación web aprobados. Se reactivó el proyecto que estaba pausado; las contraseñas siguen gestionadas por Supabase Auth.

## 2026-10-12 — Mi Recetas

- Nuevo enlace en el encabezado y ruta `/recetas` para la comida del día: nombre del plato, ingredientes y pasos de preparación.
- Guardado local separado por fecha y cuenta, navegación entre días y opción Cancelar cambios. Vista de preparación con pasos numerados.
- Se valida el nombre del plato cuando hay contenido, se protegen datos corruptos y se conserva el borrador ante fallos de guardado.
- Verificación: lint, TypeScript y 18 pruebas aprobadas. En local se comprobaron acceso desde el encabezado, validación, guardar, recargar, separación entre días, vista de preparación y cancelar. Se retiró la receta de prueba.

## 2026-10-11 — Acceso a Mi lista

- El inicio ahora presenta las ventajas de GoodEats, un ejemplo ilustrativo y las funciones disponibles, con accesos a lista, menú y cuenta. Diseño adaptable a móvil y escritorio con los colores de la marca.
- Se verificaron lint, TypeScript, diseño en ambas anchuras y navegación a `/lista`, `/menu` y `/login`, conservando los datos existentes.

- Nueva página de inicio vacía en `/`, conservando el encabezado. El logo abre el inicio y la lista de compras se encuentra ahora en `/lista`, accesible desde «Mi lista» y desde la cuenta.

- El encabezado mantiene visibles «Mi lista» y «Mi menú» en todas las páginas. «Mi lista» abre la lista de compras actual y se destaca el enlace de la sección activa.

## 2026-10-09 — Mi menú semanal

### Calendario y almuerzos

- Guardar menú usa el amarillo de la marca. Los días con almuerzo guardado se destacan en turquesa oscuro con un icono SVG de plato y cubiertos; la marca refleja el último guardado confirmado, también al recargar o vaciar un almuerzo.

- Calendario sobre el lunes con fechas y navegación por semanas; cada semana conserva su menú local por separado.
- Se muestra solo el almuerzo por día y el contador refleja esos almuerzos. Los datos anteriores se conservan.
- Un único botón Guardar menú al final del domingo guarda la semana completa; cambiar de semana requiere guardar los cambios pendientes.
- Verificación: lint, TypeScript y 16 pruebas aprobadas, incluidos cambios de mes y año. En navegador se comprobaron siete campos de almuerzo, un único botón de guardado, persistencia por semana y conservación del almuerzo anterior.

- Enlace «Mi menú» en el encabezado y nueva ruta `/menu`, con regreso a «Mi lista».
- Planificación manual de almuerzos para los siete días, con campos opcionales y contador.
- Guardado local separado por cuenta y uso sin sesión. Se conservan borradores si falla el guardado y se bloquea la edición si falla la carga para proteger los datos existentes.
- Menús editables por semana; no sincroniza menús con Supabase ni genera productos automáticamente.
- Verificación: lint, TypeScript y exportación web aprobados. En navegador local se comprobó navegación desde el encabezado, guardado de platos, persistencia al recargar `/menu` y regreso a la lista conservando sus productos. Se retiraron los platos de prueba.

## 2026-10-08 — Edición dentro de la lista

- El lápiz abre un editor debajo del producto para cambiar nombre, cantidad y unidad sin volver al formulario superior.
- Guardar cierra el editor tras confirmar el guardado; Cancelar descarta el borrador. Se conserva la validación de cantidades positivas y decimales con coma.
- Se verificaron lint y TypeScript. En la web local se comprobó guardar cantidad y unidad, persistencia al recargar, cancelar y rechazo de cantidad cero. Los datos usados en la prueba se restauraron.

## 2026-10-06 — Acceso en el encabezado y lista unificada

### Filas compactas e iconos de acciones

- Corrección web: lápiz y papelera ahora se dibujan con SVG para evitar símbolos vacíos cuando la fuente de iconos no se renderiza en producción. Se mantienen colores, etiquetas accesibles y áreas táctiles.

- Se redujo el espacio vertical de cada producto y se colocaron las acciones lado a lado.
- Se reemplazaron los textos de editar y eliminar por iconos Feather de lápiz y papelera mediante `@expo/vector-icons`, instalado con Expo para SDK 57.
- Se conservaron las etiquetas accesibles por producto y áreas táctiles de 44 × 44 para las acciones.
- Lint y TypeScript aprobados; iconos revisados en la web local.

- El acceso a la cuenta se trasladó del panel de la lista al lado derecho del encabezado.
- Se añadió `/login` para iniciar sesión, registrarse y gestionar la cuenta, con un enlace de regreso a la lista.
- Se incorporó Expo Router y se organizaron las rutas en `src/app/`. Un proveedor compartido mantiene el estado de autenticación entre páginas.
- Los productos comparten un único panel con separadores, conservando sus acciones y almacenamiento.
- Se mantiene el control Mostrar/Ocultar contraseña en login y registro.
- Se verificaron lint, TypeScript, las 14 pruebas existentes y la exportación web. En navegador local se comprobó la navegación, la recarga directa de `/login` y la conservación de los productos al volver. No se realizó una prueba en dispositivo físico.

## 2026-10-04 — Publicación y contraseña visible

- Se publicó la web en Cloudflare Pages con despliegues desde `main` de `DarioData2/goodeats`.
- Se vinculó `goodeats.cl` y se verificó su acceso por HTTPS.
- Se configuró `https://goodeats.cl` como Site URL de Supabase Auth.
- Se añadió Mostrar/Ocultar al campo de contraseña.
