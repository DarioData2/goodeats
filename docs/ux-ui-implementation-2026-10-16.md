# Mejoras UX/UI implementadas — 16 de octubre de 2026

Aplicación local de la auditoría `ux-ui-audit-2026-10-16.md`, usando la skill `ux-ui-design`. Se conserva la paleta vigente: #6D28D9 y #FF7A18. No se modifican esquemas ni credenciales de Supabase, y no se publica en producción en esta tarea.

## Cambios

- **Idioma:** plantilla `public/index.html` generada con la CLI de Expo para el formato SPA existente; `lang="es-CL"` tanto en desarrollo como en `dist/index.html`. No se cambia a renderizado estático ni se añade un documento `+html` que este formato no usaría. Foco visible para controles web y mensaje sin JavaScript en español.
- **Cabecera:** marca y cuenta en una fila móvil; navegación principal en la segunda. Nombres consistentes y página activa mediante `aria-current="page"`.
- **Encabezados:** componente `Heading` conserva semántica nativa y niveles web. Inicio con H1/H2/H3; días y comidas del planificador con H2/H3; acceso y lista manual identifican sus secciones.
- **Vistas de cada módulo:** selector consistente Biblioteca/Por fecha, Planificador/Menú anterior, Del menú/Manual. Misma posición bajo la cabecera, sin encabezado duplicado ni botón de retorno externo. Los datos anteriores y sus servicios permanecen accesibles. La vista nueva informa “En este dispositivo · sin sincronización”.
- **Recetas:** selectores compactos de categoría, unidad y sección; en web, controles HTML nativos con etiquetas asociadas y navegación estándar; en móvil nativo, selector modal con opciones y cierre accesible. Las tarjetas destacan preparación y despliegan edición/eliminación bajo Opciones; la eliminación conserva su confirmación.
- **Errores:** componente `RecipeField` con etiqueta persistente, descripción del error, `aria-invalid`, `aria-describedby` y enfoque del primer campo inválido. Aplicado al editor de recetas, alta/edición de lista manual. La validación de recetas sigue el orden de lectura y nombra cada ingrediente. Las cantidades y reglas existentes se mantienen.
- **Menú:** siete días disponibles en calendario, uno visible a la vez, con sus cuatro comidas. Los borradores siguen abarcando toda la semana. Guardar arriba cuando hay cambios y al final del día visible; no se agrega una barra flotante que tape controles. Cambiar de semana o de vista se bloquea mientras haya borrador nuevo. Guardar conserva las comidas de todos los días y sus marcas de compra compatibles.
- **Acceso y textos:** título principal claro, etiquetas de correo y contraseña visibles al escribir, mostrar/ocultar conservado; mensajes orientados a “tu cuenta”. Plurales corregidos. No se promete sincronización para la nueva planificación local.

## Archivos principales

`components/AppHeader.tsx`, `Heading.tsx`, `CompactSelect.tsx`, `CompactSelect.web.tsx`, `RecipeField.tsx`, `ModuleViews.tsx`, `PlannerWorkspace.tsx`, `Button.tsx`, `HomeScreen.tsx`, `AccountPanel.tsx`, `AddItemForm.tsx`, `InlineItemEditor.tsx`, `ShoppingScreen.tsx`, `CloudListControls.tsx`, `WeeklyMenuScreen.tsx`, `RecipesScreen.tsx`, `src/app/login.tsx`, `public/index.html`, `services/recipeForm.ts`, `tests/recipeForm.test.cjs`, `tsconfig.test.json`. En `constants/theme.ts` se añade solo un token de opacidad para la superposición modal.

## Validación ejecutada

- 37 pruebas automatizadas aprobadas, incluyendo tres casos nuevos de validación del formulario (orden de errores, decimales con coma, límites y campos por ingrediente).
- Lint y TypeScript aprobados. Exportación web completada y HTML exportado inspeccionado para confirmar el idioma.
- Navegador local: idioma es-CL; inicio con un H1, un H2 y tres H3; enlace activo con aria-current=page.
- Receta vacía: foco en Nombre de la receta y errores asociados a nombre, ingrediente y cantidad. Selector de unidad operable, seleccionado kg y cancelado sin guardar.
- Lista manual vacía: foco en Producto. Cantidad 0 en editor de tomate: foco en Cantidad de tomate y descripción asociada. Cancelar conserva tomate 6 unidad y poroto.
- Vista Por fecha y regreso a Biblioteca; selector Manual y datos anteriores confirmados.
- Planificador: asignación temporal de una receta al viernes, cambio al lunes conserva el borrador; Cancelar cambios del menú restaura el menú guardado sin escribir datos nuevos.
- A 390 × 844, contenido del menú medido en 1473 px frente a 5467 px de la auditoría. A 320 px, ancho de documento 320 px, sin desbordamiento horizontal. Días con objetivos de aproximadamente 31 × 54 px a ese ancho: superan 24 × 24, aunque son más estrechos que el objetivo de comodidad de 44 px. El resto de acciones principales mantiene altura 48 px.

## Límites

Verificación sobre navegador local, no certificación WCAG completa. Aún se requieren pruebas en dispositivos físicos, VoiceOver/TalkBack, estados autenticados completos, ampliación de texto del sistema y zoom real. La nueva planificación sigue guardándose por dispositivo. No se instalaron dependencias adicionales.
