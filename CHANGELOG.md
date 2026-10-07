# Historial de cambios

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
