# Registro con confirmación por código

## Estado

Supabase tiene SMTP personalizado de Resend habilitado y `goodeats.cl` está verificado como dominio de envío. La plantilla de confirmación en español presenta el código y un enlace alternativo.

La entrega real del correo quedó comprobada. El formulario abre el campo de código al registrar una cuenta pendiente y muestra una confirmación al verificarlo. Para el enlace, la página de inicio consulta a Supabase si el correo está confirmado, elimina los datos de sesión de la URL y muestra el resultado con acceso al inicio de sesión.

## Configuración previa al despliegue

1. Verificar el dominio de envío con el proveedor SMTP elegido. Añadir únicamente sus registros DNS indicados, conservando los existentes.
2. Configurar remitente y SMTP en Supabase Auth > Emails > SMTP Settings. Introducir secretos directamente en el panel; nunca en el frontend ni en Git.
3. Mantener habilitados Allow new users to sign up y Confirm email.
4. En Confirm sign up, usar el asunto «Confirma tu correo en GoodEats» y el contenido de `supabase/templates/confirm-signup.html`. Supabase reemplaza `{{ .Token }}` por el código y `{{ .ConfirmationURL }}` por el enlace de confirmación.
5. Revisar caducidad, longitud del código (la UI admite 6–10 dígitos) y límites de Auth. El temporizador de reenvío de 60 segundos en la UI no sustituye los límites del servidor.
6. Probar con un correo autorizado para la prueba: registro, recepción, código incorrecto, correcto, reutilizado, reenvío y posterior acceso con contraseña. Confirmar que una cuenta pendiente no acceda a datos protegidos.
7. Publicar el frontend en Cloudflare solo cuando la entrega de correo y la plantilla estén listas. Verificar también el flujo en producción.

## Funcionamiento

El usuario introduce nombre, apellido, correo y contraseña. `signUp` crea una cuenta pendiente, `verifyOtp` confirma el correo y obtiene una sesión; `resend` solicita un nuevo correo de registro. No hay aprobación manual. No se almacenan códigos ni contraseñas en el cliente. Las políticas RLS existentes se conservan.

Las pruebas automatizadas simulan Auth: validan parámetros, rechazo de códigos mal formados, ausencia de sesión y errores del servidor. No demuestran entrega real de correos.

Referencias: https://supabase.com/docs/guides/auth/auth-smtp y https://supabase.com/docs/guides/auth/auth-email-templates.
