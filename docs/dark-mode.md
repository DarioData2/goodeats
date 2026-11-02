# Modo oscuro

Implementado en local el 2 de noviembre de 2026.

## Uso y alcance

Desde la foto o silueta del encabezado, abrir Mi cuenta y activar el botón Modo oscuro en Apariencia. También está disponible sin iniciar sesión. El botón muestra el estado, admite clic, Enter y Espacio, y permite volver al modo claro.

La preferencia se guarda mediante AsyncStorage en `@goodeats/appearance/v1`, por dispositivo y origen web. No se sincroniza con Supabase ni depende de la cuenta. El valor inicial es claro; al iniciar se recupera la preferencia antes de montar las pantallas. Un error de escritura se informa sin confirmar el cambio de tema.

## Implementación

- `constants/theme.ts`: paletas claras y oscuras con los mismos tokens semánticos. Fondos casi negros, superficies oscuras y tonos derivados de la identidad para mantener legibilidad.
- `contexts/ThemeContext.tsx`: proveedor de apariencia y estilos memoizados por paleta. El cambio no remonta las pantallas ni el proveedor de autenticación.
- `services/themePreference.ts`: lectura y persistencia aisladas de los datos de listas, recetas y perfiles.
- `components/AppearanceControl.tsx`: botón de activación con estado accesible y errores.
- Pantallas y componentes existentes consumen los tokens reactivos; incluyen formularios, estados vacíos, alertas, selectores web/nativos y navegación inferior. Los colores de texto sobre acciones se mantienen separados de los colores de superficie.
- El layout adapta el contenido de la barra de estado nativa. En web, también se configura `color-scheme` para los controles del navegador.

No se añadieron dependencias, migraciones, cambios de credenciales ni despliegues.

## Verificación

64 pruebas aprobadas, incluidas persistencia clara/oscura, fallo de almacenamiento y contraste mínimo de los pares semánticos de texto, formularios, acciones y alertas. Lint, TypeScript y exportación web aprobados.

Navegador local: cambio claro/oscuro, conservación de los campos del perfil mientras se edita, recuperación del tema tras recargar, activación mediante Enter y Espacio y navegación a compras. La validación de contraste de tokens no constituye una auditoría completa de WCAG. Pendiente probar en dispositivos físicos Android/iOS.
