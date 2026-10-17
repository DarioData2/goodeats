# Seguridad, autenticación y datos

Aplica al cambio afectado; no declares una auditoría OWASP completa por revisar esta lista. Consulta documentación oficial vigente del servicio cuando la implementación dependa de ella.

## Límites de confianza

- [ ] Validar tipo, longitud, rango y formato en servidor; validación de UI mejora experiencia pero no autoriza operaciones.
- [ ] Parametrizar SQL. Escapar al representar contenido según su contexto; no aplicar sanitización destructiva genérica a todo texto.
- [ ] Comprobar autorización por recurso y operación para evitar acceso por identificadores ajenos (IDOR/BOLA).
- [ ] Revisar exposición de datos, inyección, XSS y, si se usan cookies, CSRF y sus atributos. CORS no sustituye autorización.
- [ ] No registrar contraseñas, tokens o datos personales innecesarios. Aplicar minimización y separar diagnóstico de información privada.

## Auth y Supabase

- [ ] Usar Supabase Auth para credenciales cuando ya sea el proveedor; no crear una tabla pública de contraseñas ni implementar un hash propio.
- [ ] Verificar usuario y permisos mediante mecanismos confiables del servidor o políticas, no un userId enviado por la interfaz.
- [ ] Mantener RLS habilitada y revisar grants junto con políticas. Una clave pública del cliente no concede acceso por sí sola.
- [ ] Revisar SELECT, INSERT (`WITH CHECK`), UPDATE (`USING` y `WITH CHECK`) y DELETE según operaciones permitidas; impedir cambio de propietario.
- [ ] Probar anónimo, propietario y otra cuenta; sesión expirada, cierre de sesión y error remoto. No desactivar RLS para solucionar una consulta.
- [ ] Nunca usar service-role o secreto administrativo en frontend. Proteger funciones privilegiadas: permisos, `search_path` y superficie de ejecución.
- [ ] Separar cachés y datos locales por cuenta; evitar mezclar invitados y usuarios o sobrescribir datos tras una lectura fallida.

## PostgreSQL y migraciones

- [ ] Constraints expresan invariantes (FK, UNIQUE, NOT NULL, CHECK); definir comportamiento ante borrado y duplicados.
- [ ] Revisar fechas, zona horaria, precisión numérica y cantidades pequeñas; no perder magnitud por formato o redondeo.
- [ ] Migración describe esquema anterior/posterior, compatibilidad, backfill, bloqueos y verificación; probar en entorno permitido.
- [ ] Plan de recuperación realista: revertir código no recupera datos borrados. Respaldar y autorizar operaciones destructivas antes de ejecutarlas.
- [ ] Escrituras concurrentes o reintentadas no duplican ni pierden cambios; usar transacciones o control de versiones cuando el caso lo requiera.
- [ ] Pruebas RLS usan roles y contexto de autenticación representativos; ejecutar como administrador puede ocultar fallos de aislamiento.

## Evidencia y límites

Informar qué tablas, políticas y flujos se inspeccionaron, qué pruebas se ejecutaron y en qué entorno. Si solo hay mocks o SQL sin ejecutar, indicar que la protección desplegada sigue pendiente de verificación. No consultar datos personales reales para crear evidencia si fixtures controladas bastan.
