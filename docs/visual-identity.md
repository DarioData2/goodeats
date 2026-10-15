# Identidad visual GoodEats

Implementación visual local del 14 de octubre de 2026, sin cambios de arquitectura, servicios, hooks de datos, configuración de Supabase ni esquema.

## Tema y componentes

`constants/theme.ts` centraliza colores oficiales, tonos derivados, estados deshabilitados y radios compartidos: tarjeta 20 y control 12. Morado `#6D28D9` para acciones principales, enlaces y selección; naranjo `#FF7A18` para el detalle de marca y destacados gastronómicos. Texto `#111827`, fondo `#F9FAFB`, tarjetas blancas. No se utilizan amarillo ni lila como identidades independientes.

`Button` distingue acción primaria, secundaria y deshabilitada. Los controles conservan áreas táctiles de 44–50 px. Navegación activa con marcador visible y estado accesible; unidades seleccionadas con check; compras con checkbox y tachado; calendario conserva icono y etiqueta de almuerzo guardado. Los campos tienen bordes de control distinguibles sobre blanco. El encabezado se ajusta en varias filas en móvil.

Inicio, compras, menú, recetas y acceso conservan sus rutas, acciones y contenido. No se añadieron barra inferior, búsqueda, filtros ni funciones que no existían. La foto de Inicio es ilustrativa; atribución en `assets/ATTRIBUTION.md`. No se añadieron dependencias ni sombras innecesarias.

## Logo pendiente

El archivo del logo aprobado no estaba adjunto. Se conserva el texto existente, con Good morado y Eats naranjo `#FF7A18`, sin punto al final, según los ajustes solicitados por el usuario. No se dibujó un bowl ni se inventó un logo alternativo. Sustituirlo por el recurso aprobado cuando el usuario lo facilite, conservando su geometría. El naranjo de marca no se usa como texto normal sobre blanco: para etiquetas gastronómicas se utiliza el tono oscuro accesible `accentText`.

## Contraste comprobado

| Combinación | Ratio |
| --- | --- |
| Texto principal / blanco | 17,74:1 |
| Texto secundario / fondo general | 7,23:1 |
| Blanco / morado principal | 7,10:1 |
| Morado principal / fondo morado suave | 6,24:1 |
| Texto oscuro / naranjo oficial | 6,80:1 |
| Naranjo oscuro / fondo naranjo suave | 6,24:1 |
| Borde de campo / blanco | 4,83:1 |

Estos pares superan AA para texto normal (4,5:1) y componentes (3:1), según corresponda. No constituyen una auditoría completa de accesibilidad ni una prueba en dispositivo físico.

## Archivos y validación

- Tema: `constants/theme.ts`.
- Componentes compartidos: `components/AppHeader.tsx`, `Button.tsx`, `AddItemForm.tsx`, `InlineItemEditor.tsx`, `CloudListControls.tsx`, `AccountPanel.tsx`, `ShoppingItem.tsx`, `ShoppingList.tsx`.
- Pantallas: `components/HomeScreen.tsx`, `ShoppingScreen.tsx`, `WeeklyMenuScreen.tsx`, `RecipesScreen.tsx`, `src/app/login.tsx`; indicador de sesión en `src/app/_layout.tsx`.
- Recursos y documentación: `assets/home-salad.jpg`, `assets/ATTRIBUTION.md`, este documento y `CHANGELOG.md`.

Se verificaron Inicio a 1100 px y 390 px, y navegación móvil por lista, menú, recetas y acceso. Se comprobaron edición inline y cancelación sin guardar sobre los productos existentes, cambio de semana, borrador y cancelación de receta y mostrar/ocultar contraseña con campos vacíos. No se inició sesión ni se hicieron escrituras nuevas en Supabase durante esta revisión visual. Lint, TypeScript, 24 pruebas automatizadas y exportación web aprobados. Pendiente prueba en teléfono físico y auditoría completa con lector de pantalla.
