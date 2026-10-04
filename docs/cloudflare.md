# Publicar GoodEats en Cloudflare Pages

El proyecto es una aplicación estática de Expo Web. Pages aloja la interfaz y Supabase mantiene Auth y la base de datos. No requiere Workers, Pages Functions ni un backend adicional.

## Configuración del proyecto Pages

En Cloudflare, abre Workers & Pages, crea una aplicación Pages y elige importar un repositorio Git existente. Selecciona `DarioData2/goodeats` y concede acceso únicamente a este repositorio cuando GitHub solicite instalar o autorizar Cloudflare.

| Campo | Valor |
| --- | --- |
| Proyecto | `goodeats` (si está disponible) |
| Rama de producción | `main` |
| Framework preset | `None` |
| Directorio raíz | Raíz del repositorio |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist` |
| Node.js | `24.18.0`, indicado por `.node-version` |

Cloudflare instala las dependencias usando el lockfile. El comando de compilación comprueba que Supabase tenga configuración antes de generar la web. Si faltan variables, detiene la publicación en lugar de desplegar una app con el acceso a nube deshabilitado.

Añade a las variables de compilación de producción:

- `EXPO_PUBLIC_SUPABASE_URL`: el valor del `.env` local.
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: la clave publishable pública del `.env` local.

No subas `.env`, claves service_role ni contraseñas. Las dos variables EXPO_PUBLIC se incluyen en el JavaScript público; RLS protege las listas. Configúralas también en previews si decides usar entornos de preview. Debes recompilar después de modificar variables: las toma Expo durante el build.

Publica y comprueba la URL real `*.pages.dev` que asigne Cloudflare. No se presupone que `goodeats.pages.dev` esté disponible. Pages soporta el fallback de aplicaciones SPA sin añadir un `404.html` al directorio raíz.

## Dominio goodeats.cl

1. Añade `goodeats.cl` a Cloudflare como una zona en el plan Free. Revisa los registros DNS existentes que detecte y conserva los que correspondan a servicios activos.
2. Cloudflare asignará dos servidores de nombre concretos. No uses nameservers genéricos ni los de otra cuenta.
3. En NIC Chile, abre la configuración de `goodeats.cl` y reemplaza sus servidores de nombre por los dos asignados a esa zona. Si el dominio ya usa DNSSEC, coordina sus registros DS con el cambio de proveedor para mantener la resolución correcta.
4. Cuando la zona aparezca activa, entra al proyecto Pages, Custom domains, Set up a custom domain, y añade `goodeats.cl`.
5. Añade `www.goodeats.cl` si también quieres esa dirección. Cloudflare crea o propone los CNAME para Pages y emite el certificado HTTPS.

La asociación del dominio debe hacerse desde Pages; crear solamente un CNAME manual no basta. Para el dominio raíz, Cloudflare exige que la zona use sus servidores DNS. El registro del dominio y su renovación siguen en NIC Chile.

## Supabase Auth al publicar

En Supabase, Authentication, URL Configuration:

- Site URL: `https://goodeats.cl` cuando el dominio esté activo. Durante la primera publicación puede usarse la URL real de Pages.
- Redirect URLs: las URLs de producción que realmente utilices y los orígenes locales necesarios para desarrollo; evita autorizar indiscriminadamente todos los dominios de preview.

No cambies `EXPO_PUBLIC_SUPABASE_URL` por `goodeats.cl`: esa variable debe seguir apuntando a tu proyecto Supabase. La web puede usar el dominio propio manteniendo el endpoint actual del backend.

## Validación después de publicar

Comprueba HTTPS, carga de la página y assets, registro/confirmación de correo/login, creación de lista, alta/edición/marcado/eliminación/limpieza de productos, persistencia al recargar y aislamiento al cerrar sesión. La lista local del antiguo localhost no aparece automáticamente en el dominio publicado: el almacenamiento local pertenece a cada origen. Las listas de una cuenta de Supabase sí se consultan desde los distintos dispositivos al iniciar sesión.

Con la integración Git de Pages, los cambios de la rama `main` generan nuevos despliegues. La vinculación Supabase-GitHub es independiente del hosting y no es necesaria para servir esta web.

Referencias: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [build image](https://developers.cloudflare.com/pages/configuration/build-image/), [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
