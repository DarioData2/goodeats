# Recetas desde YouTube y TikTok — primera versión

En **Mis recetas → Biblioteca → Importar desde video**, pega un enlace HTTPS, pulsa **Revisar enlace**, escribe opcionalmente el nombre y autor, y guarda el enlace pendiente. Revisar reconoce el formato y plataforma; no comprueba la existencia, disponibilidad o contenido del video.

Los pendientes aparecen separados de las recetas completas. **Completar receta** abre el editor existente con el nombre y fuente conservados. Introduce ingredientes, cantidades, unidades, porciones y, si quieres, pega la preparación. Solo después de guardar la receta validada pasa a estar disponible en el menú y las compras. Cancelar conserva el enlace pendiente. Eliminar un enlace requiere confirmación en pantalla.

## Alcance y almacenamiento

- Sin APIs externas, descarga, transcripción, extracción de metadatos, reproductores incrustados ni IA. Abrir el video es una navegación explícita al servicio original.
- Guardado local con la misma separación por cuenta/dispositivo que la biblioteca. No se añadió sincronización, tablas ni migraciones de Supabase. Tampoco se publica en Cloudflare por crear esta función.
- `PlannerData.savedVideos` es opcional para conservar la compatibilidad de los datos versión 1. Las recetas completas incorporan `source` opcional, conservado en edición y snapshots de menú.
- Los pendientes no entran en el selector de recetas del menú. La conversión valida primero y guarda receta y retirada del pendiente en una misma escritura local; ante fallo el pendiente persiste y el editor permanece abierto.
- Se conservan la plataforma, URL original de contenido normalizada y autor aportado por el usuario; parámetros de seguimiento, tiempo y fragmentos se eliminan.

## Enlaces aceptados

YouTube: `/watch?v=…`, `/shorts/…`, `/live/…` en youtube.com, www.youtube.com o m.youtube.com; youtu.be con ID de video de 11 caracteres. Se normalizan a la misma URL de reproducción.

TikTok: `/@usuario/video/ID` en tiktok.com, www.tiktok.com o m.tiktok.com; enlaces cortos vm.tiktok.com, vt.tiktok.com y www.tiktok.com/t/. No se siguen redirecciones: dos enlaces cortos distintos al mismo video no pueden reconocerse como duplicados sin resolverlos. Se detectan duplicados de URLs normalizadas tanto en pendientes como en recetas completas.

Se rechazan otras plataformas, páginas de perfil/listas, HTTP, credenciales, puertos no estándar, URLs con barras invertidas y dominios que suplantan a las plataformas. No se consulta ninguna URL al guardarla.

## Archivos principales

- `services/videoRecipes.ts`: tipos, normalización y validación.
- `services/plannerLogic.ts`: compatibilidad, detección de duplicados y conversión a receta completa.
- `components/VideoImport.tsx`: revisión y guardado del enlace, acceso al video original.
- `components/PlannerWorkspace.tsx`: pendientes, editor y recetas con fuente.
- `tests/videoRecipes.test.cjs`: siete pruebas de regresión.

## Validación ejecutada

- 44 pruebas automatizadas aprobadas; lint, TypeScript y exportación web aprobados.
- Navegador local: rechazo de dominio suplantado con foco en el campo, guardado de enlace YouTube y persistencia tras recarga, rechazo de ingredientes vacíos, conversión a receta con fuente/autor, detección de duplicado tras conversión y reconocimiento de enlace corto TikTok.
- Se retiró únicamente la receta temporal creada para estas comprobaciones. La receta y el menú previos se conservaron.
- Pendiente: revisión en dispositivos físicos y apertura en aplicaciones nativas. No se verificó el contenido de videos externos ni disponibilidad de ejemplos usados en pruebas.
