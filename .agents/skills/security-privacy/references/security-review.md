# Revisión técnica de seguridad

## Inventario y alcance

Registra por flujo: dato, finalidad, origen, usuario/propietario, ubicación, acceso, proveedor, conservación conocida y eliminación real. Incluye logs, backups, correo de Auth y metadatos de solicitudes cuando estén verificados. Marca desconocidos; no vuelques valores personales ni secretos.

## Controles prioritarios

- **Auth y autorización:** comprueba sesiones, expiración y logout; valida propietario en backend/RLS, no solo filtrado UI. Prueba cuenta A, cuenta B y anónimo. No confíes en un UUID recibido del cliente como autorización.
- **Supabase:** revisa políticas SELECT/INSERT/UPDATE/DELETE, grants de tabla y columna, funciones y triggers; determina quién puede cambiar propietario o revisión. Una tabla con RLS activo puede seguir teniendo políticas incorrectas. Usa pruebas transaccionales con rollback cuando sean adecuadas y autorizadas.
- **Archivos:** verifica bucket privado, rutas por propietario, límites de tamaño, tipos y contenido, URLs firmadas y tratamiento de imágenes. No hagas público un bucket para resolver una vista previa.
- **Cliente y secretos:** separa claves publishable de service_role; revisa bundles, historial o logs dentro del alcance autorizado. Al informar una exposición redacta el valor y plantea contención/rotación; no publiques el secreto como evidencia.
- **Entradas:** valida en cada límite de confianza, parametriza SQL y evita HTML sin sanitizar. En URLs/importación comprueba protocolos, dominios y redirecciones; si existe descarga backend, evalúa SSRF y límites. No incorpores scraping o servicios de IA por una revisión.
- **Persistencia:** respeta aislamiento local/cuenta, evita sobrescribir datos ante fallos remotos, conserva precisión y maneja concurrencia/reintentos. Investiga metadatos sensibles almacenados en el dispositivo; no declares AsyncStorage/localStorage cifrado por defecto.
- **Privacidad:** minimiza datos y telemetría; comprueba acceso, rectificación, exportación y eliminación existentes. Documenta qué pasa en base, Storage, Auth, backups y dispositivo; borrar una fila no prueba eliminación integral.
- **Operación:** revisa HTTPS, cabeceras y dependencias según las herramientas disponibles. Separa hallazgos demostrados de endurecimiento recomendado; no cambies CSP, permisos o retención sin evaluar compatibilidad y autorización.

## Reporte por hallazgo

Usa: identificador, severidad, flujo afectado, evidencia redactada, pasos reproducibles, impacto, corrección propuesta, criterio de aceptación y verificación ejecutada. Explica límites: lectura de código, mocks, navegador, SQL real o entorno no disponible.

Prioriza exposición entre cuentas, credenciales y datos personales. No atribuyas una vulnerabilidad solo por el nombre de una dependencia ni afirmes ausencia de vulnerabilidades por pasar lint.
