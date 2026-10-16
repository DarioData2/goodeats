# Auditoría UX/UI — GoodEats

Fecha: 16 de octubre de 2026. Skill aplicada: `ux-ui-design`.

Seguimiento: mejoras implementadas en local; consultar [cambios y validaciones](ux-ui-implementation-2026-10-16.md). Los hallazgos siguientes conservan la evidencia anterior a las modificaciones.

## Alcance y referencia visual

Revisión del inicio, compras automáticas y lista manual, menú semanal, biblioteca y formulario de recetas, y acceso a la cuenta. Inspección de código, DOM, árbol accesible y capturas locales. Pantallas principales revisadas a 390 × 844; comprobaciones adicionales de login y menú a 320 px, e inicio de escritorio a 1100 × 850.

La referencia es la identidad vigente en `constants/theme.ts`: morado #6D28D9, naranjo #FF7A18, texto #111827, fondo #F9FAFB y superficies blancas. La skill contiene otros códigos (#FF6B35 y #6C3FC5); esta discrepancia documental no autoriza sustituir la identidad aprobada. Conviene alinear ese documento en una tarea posterior.

Esta entrega propone mejoras; no modifica componentes, colores, autenticación ni datos guardados. El editor temporal se canceló y se restauró el tamaño habitual del navegador.

## Evaluación general

La base visual es consistente: superficies claras, color primario reconocible, fotografía gastronómica, controles de compra compactos y botones de al menos 44–48 px según el componente. La selección se refuerza con marcas y texto; las casillas y unidades corregidas exponen `aria-checked`. Las principales oportunidades están en la orientación, longitud de los formularios y semántica accesible, más que en cambiar colores.

## Hallazgos priorizados

### UX-01 — Alta: idioma declarado incorrecto

**Evidencia:** `document.documentElement.lang` devuelve `en` en inicio y acceso, con contenido en español. Puede provocar una pronunciación incorrecta en lectores de pantalla. Relacionado con WCAG 3.1.1.

**Propuesta:** declarar `es-CL` en el documento web.

**Componentes afectados:** documento HTML de Expo Router, posiblemente `src/app/+html.tsx` por crear tras revisar la configuración vigente.

**Aceptación:** `html[lang="es-CL"]` presente en carga directa y navegación, sin depender de un cambio posterior en cliente; comprobar pronunciación en lector de pantalla.

### UX-02 — Media: estructura de encabezados poco informativa

**Evidencia:** inicio expone cinco H1; menú solo expone el título principal y sus días son texto genérico; acceso no expone encabezados pese a mostrar títulos grandes. Varios H1 por sí solos no demuestran un incumplimiento, pero esta estructura no refleja bien las secciones visibles.

**Propuesta:** un título principal por pantalla, H2 para secciones/días y H3 cuando exista una subdivisión real. No asignar jerarquía únicamente por tamaño visual.

**Componentes afectados:** `HomeScreen`, `PlannerWorkspace`, `src/app/login.tsx`, pantallas anteriores.

**Aceptación:** un usuario que navega por encabezados puede encontrar el día, formulario o sección; orden lógico y nombres claros en el árbol accesible.

### UX-03 — Media: navegación activa no comunica ubicación

**Evidencia:** enlace activo Mi menú tiene estilo morado y un punto, pero ni `aria-current` ni `aria-selected` en el DOM inspeccionado.

**Propuesta:** `aria-current="page"` en el enlace actual en web. Mantener el refuerzo visual actual y un nombre consistente: “Mis recetas” en lugar de “Mi Recetas”.

**Componente afectado:** `AppHeader`.

**Aceptación:** exactamente un enlace declara página actual en las rutas principales; el foco de teclado es visible y la navegación sigue operativa con teclado y tecnologías de asistencia.

### UX-04 — Media: errores de recetas genéricos y alejados del campo

**Evidencia:** guardar una receta vacía muestra “Usa una cantidad numérica mayor que cero” al final del formulario antes de señalar el nombre faltante. Hay `role="alert"`, pero no campos con `aria-invalid`, no asociación con `aria-describedby`, y el foco permanece en Guardar. Los campos tienen nombre accesible; no se considera que carezcan de nombre.

**Propuesta:** validar en orden de lectura; mostrar errores junto al campo, identificando el ingrediente; asociar ayuda/error y llevar al primer campo inválido cuando se envíe el formulario.

**Componentes afectados:** editor de `PlannerWorkspace`, validaciones de formulario y patrones compartidos de campos.

**Aceptación:** cada error identifica qué corregir, se anuncia y se puede localizar sin recorrer todo el formulario; la información escrita se conserva. Confirmar también validación con teclado móvil.

### UX-05 — Media: opciones de receta demasiado extensas y agrupación accesible incompleta

**Evidencia:** un ingrediente ya añade 9 radios de unidad y 7 de sección; no existe `radiogroup`. ArrowRight sobre unidad seleccionada no cambia la selección. Esto confirma que no sigue el patrón habitual de teclado de un grupo de radios, no que todas las opciones sean inaccesibles por teclado.

**Propuesta:** fila de nombre/cantidad y selectores compactos de unidad/sección; etiquetas siempre visibles. Si se conservan radios, agruparlos con nombre y navegación por flechas. Usar sugerencias sin asignar categorías silenciosamente.

**Componentes afectados:** `Choices`, `RecipeEditor` dentro de `PlannerWorkspace`; patrones de unidades de lista manual.

**Aceptación:** nombre, cantidad, unidad y sección pueden completarse con teclado; selección anunciada, grupos identificables y sin añadir 16 paradas de tabulación por ingrediente.

### UX-06 — Media: planificador semanal exige demasiado desplazamiento

**Evidencia:** a 390 × 844 el contenedor mide 5467 px de contenido para 844 px visibles, con 28 espacios de comida; Guardar se encuentra después del domingo. No todos los días o semanas necesitarán la misma altura.

**Propuesta:** resumen semanal y acceso directo a cada día; desplegar inicialmente el día relevante y permitir expandir los demás. Mantener Guardar al final y añadir una acción/resumen persistente de cambios sin guardar. Botones cortos “Elegir receta”, con día y comida en el nombre accesible.

**Componentes afectados:** `Weekly` y calendario de `PlannerWorkspace`.

**Aceptación:** llegar a cualquier día y guardar sin recorrer toda la semana; acción persistente no tapa campos ni foco; estado guardado se comunica con texto y no solo color. Revisar con teclado y área segura de iOS/Android.

### UX-07 — Media: caminos paralelos y explicaciones técnicas dificultan la orientación

**Evidencia:** “Lista manual”, “Menú anterior” y “Recetas por fecha” abren pantallas con otro encabezado y retorno superior. Las compras nuevas no incluyen los productos manuales. Hay textos sobre Supabase y futura sincronización en lugares centrales.

**Propuesta:** navegación local estable en cada módulo (“Del menú / Manual”, “Biblioteca / Por fecha”); presentar guardado como un estado breve “En este dispositivo” o “En tu cuenta”, con detalle bajo demanda. La separación real de almacenamiento debe seguir explícita. Unificar recorridos solo cuando se garantice conservación de datos.

**Componentes afectados:** `PlannerWorkspace`, pantallas anteriores, `AccountPanel` y mensajes de inicio.

**Aceptación:** el usuario entiende dónde están sus datos y cómo volver; las listas existentes siguen visibles; ninguna etiqueta promete sincronización donde no existe.

### UX-08 — Media: cabecera móvil ocupa varias filas

**Evidencia:** a 390 px el logo, enlaces y acceso forman tres filas; login ocupa una fila propia. No se observó desbordamiento horizontal en inicio/menú a 390 ni en login/menú a 320, pero la cabecera consume espacio antes de la tarea principal.

**Propuesta:** logo y cuenta compactos arriba, y navegación principal en una fila secundaria; evaluar navegación inferior solo si mejora tareas frecuentes y sin añadir destinos duplicados.

**Componente afectado:** `AppHeader`.

**Aceptación:** destinos principales distinguibles, objetivos táctiles cómodos, sin recorte a 320 px y con textos ampliados; navegación activa y foco visibles. 44–48 px es el objetivo de comodidad móvil, no una afirmación de que WCAG AA exija 44 px en todos los casos.

### UX-09 — Baja: acceso con títulos repetidos y etiquetas solo dentro de campos

**Evidencia:** “Bienvenido…”, “Tu lista, en todos tus dispositivos” e “Iniciar sesión” compiten visualmente. Correo y contraseña tienen `aria-label`, pero visualmente dependen de placeholder, que desaparece al escribir. Mostrar/Ocultar está disponible.

**Propuesta:** un encabezado claro “Iniciar sesión”, una frase de ayuda y etiquetas persistentes de Correo/Contraseña. Sustituir jerga de proveedor por instrucciones al usuario.

**Componentes afectados:** `src/app/login.tsx`, `AccountPanel`.

**Aceptación:** el propósito de cada campo sigue visible con valores escritos; acceso y registro se distinguen; el control de contraseña conserva un nombre accesible claro.

### UX-10 — Baja: jerarquía de acciones y microtexto

**Evidencia:** tarjetas de recetas repiten botones grandes de preparación, edición y eliminación; acceso a funciones anteriores aparece antes de la tarea principal. Se muestran “1 comidas planificadas”, “1 ingredientes” y capitalización variable.

**Propuesta:** una acción principal por tarjeta, edición secundaria y eliminación en un menú de opciones o acción discreta con confirmación. Corregir plurales; agrupar ayuda extensa bajo “Cómo funciona”. Mantener tipografía secundaria legible y comprobar su ampliación.

**Componentes afectados:** biblioteca, resumen semanal y contenido de inicio de `PlannerWorkspace`.

**Aceptación:** la tarea principal se distingue de acciones destructivas o auxiliares; copias correctas con 0, 1 y varios elementos; objetivos táctiles y nombres accesibles conservados.

## Contraste de la paleta actual

Cálculo de luminancia relativa sRGB sobre pares de tokens, sin transparencias:

| Combinación | Contraste | Uso |
| --- | --- | --- |
| Blanco / morado #6D28D9 | 7,10:1 | Botones principales, adecuado para texto normal |
| Texto #111827 / fondo #F9FAFB | 16,98:1 | Texto principal |
| Secundario #4B5563 / blanco | 7,56:1 | Texto secundario |
| Morado / suave #F3EEFC | 6,24:1 | Acciones secundarias |
| Naranjo #FF7A18 / blanco | 2,61:1 | Evitar texto informativo y controles esenciales sin otro contraste |
| Texto oscuro #111827 / naranjo | 6,80:1 | Texto/iconos oscuros sobre acento |
| Naranjo oscuro #9A3D00 / suave #FFF1E7 | 6,24:1 | Texto gastronómico destacado |
| Borde #6B7280 / blanco | 4,83:1 | Identificación del campo |

Conservar Good morado y Eats naranjo. El texto del logotipo tiene una excepción en el criterio de contraste de texto: su combinación no constituye por sí sola un fallo de ese criterio. Los separadores claros decorativos tampoco se evalúan como si fueran texto o controles esenciales. No se propone sustituirlos indiscriminadamente por bordes oscuros.

Referencia normativa: [WCAG 2.2, guía rápida de W3C](https://www.w3.org/WAI/WCAG22/quickref/), especialmente 1.3.1, 1.4.3, 1.4.10, 1.4.11, 2.4.6, 2.4.7, 2.5.8, 3.1.1, 3.3.1, 3.3.2 y 4.1.2. Las mejoras heurísticas no equivalen automáticamente a incumplimientos normativos.

## Orden propuesto de implementación

1. Idioma, estructura de encabezados, página activa, grupos de opciones y errores asociados a campos.
2. Cabecera móvil y navegación estable entre modos existentes.
3. Planificador por día y guardado accesible; editor de ingredientes compacto.
4. Jerarquía de tarjetas, acceso y microtextos.

## Evidencia y límites

Capturas ignoradas por Git en `.expo/`: `ux-home-mobile.png`, `ux-menu-mobile.png`, `ux-recipe-editor-mobile.png`, `ux-shopping-mobile.png`, `ux-login-mobile.png`, `ux-home-desktop.png`.

Se ejecutaron inspecciones de idioma, encabezados, estados, asociaciones de campos y teclado de radios; se provocó un error de receta vacía sin guardar datos y se canceló el formulario. Lint y TypeScript se ejecutan como comprobaciones del proyecto, pero no certifican accesibilidad.

No es una certificación WCAG completa. Pendientes: lector de pantalla real, zoom de navegador y ampliación de texto del sistema, recorrido completo con teclado, dispositivo físico Android/iOS, todos los estados autenticados, fallos de red y todos los estados de carga. La comprobación de 320 px no sustituye las pruebas de zoom. No se ha medido la usabilidad con usuarios reales.
