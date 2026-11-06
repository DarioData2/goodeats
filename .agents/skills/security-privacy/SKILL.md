---
name: security-privacy
description: Audita seguridad, protección de datos y almacenamiento de GoodEats y prepara borradores de aviso legal, privacidad, cookies y términos basados en su funcionamiento real. Úsala para revisiones o documentos de seguridad y privacidad, sin certificar cumplimiento jurídico.
---

# Seguridad y privacidad

Reduce riesgos con controles técnicos y documentos verificables. Distingue hallazgos de seguridad, obligaciones jurídicas comprobadas y recomendaciones. No prometas evitar demandas ni certifiques cumplimiento por disponer de textos legales.

## Procedimiento

1. Delimita la solicitud: auditoría, corrección técnica, documentos o interfaz de consentimiento. Crear esta skill no autoriza ejecutar esos trabajos ni publicar contenido.
2. Inspecciona el código y la configuración pertinente sin revelar secretos. Identifica datos, finalidades, almacenamiento local/remoto, proveedores, destinatarios y flujos de terceros. Separa evidencia del repositorio de comprobación en producción.
3. Identifica responsable, países de operación y usuarios destinatarios. Usa Chile como contexto inicial de GoodEats, sin inferir jurisdicción solo del dominio. Pregunta únicamente por datos indispensables que el proyecto no permite verificar.
4. Antes de afirmar obligaciones, consulta fuentes oficiales vigentes y registra fecha, norma, versión y enlace. Distingue normas aplicables hoy de reformas futuras, proyectos de ley y recomendaciones. Si no hay verificación suficiente, entrega un borrador con la cuestión pendiente explícita.
5. Presenta un plan proporcional y criterios observables. Implementa únicamente el alcance autorizado, conserva los datos existentes y coordina documentos con comportamiento real.
6. Verifica los cambios: tipos, lint y pruebas pertinentes; para RLS, aislamiento entre cuentas y acceso anónimo en un entorno autorizado. Para consentimiento, prueba rechazo, revocación y ausencia de carga opcional previa. No conviertas resultados de mocks en evidencia de producción.
7. Entrega archivos, hallazgos con severidad y evidencia, correcciones, verificaciones ejecutadas, incertidumbres jurídicas y pendientes del responsable.

## Referencias por tarea

- Para auditorías o correcciones técnicas: [seguridad y datos](references/security-review.md).
- Para aviso legal, privacidad, cookies o términos: [documentación y consentimiento](references/legal-privacy.md).
- Para el inventario inicial de esta aplicación: [contexto GoodEats](references/goodeats.md); confírmalo antes de reutilizarlo.
- Para comprobar decisiones de la skill: [escenarios](references/scenarios.md).

## Límites operativos

- No inventes razón social, domicilio, RUT, contacto, país de alojamiento, contratos, plazos de conservación, mecanismos de eliminación o consentimientos existentes. En borradores usa marcas visibles de información pendiente; no publiques un texto como definitivo con esos vacíos.
- No presentes cláusulas de exención como renuncia a derechos irrenunciables. Señala revisión jurídica para definir bases de tratamiento, datos de salud, menores, transferencias, responsabilidades o condiciones comerciales cuando resulte material.
- No añadas un banner de cookies por costumbre ni asumas que todo almacenamiento local exige consentimiento. Decide según tecnologías, finalidad y normativa aplicable; si se requiere elección, respétala técnicamente.
- No guardes contraseñas en tablas propias ni expongas claves administrativas. Usa Auth y controles por propietario. Nunca inspecciones tokens del navegador ni copies datos personales reales a informes o fixtures.
- No escanees servicios ajenos, borres cuentas, cambies permisos ni infraestructura de producción fuera de una autorización específica. Usa datos sintéticos y entornos aislados; ante escrituras ambiguas verifica el efecto antes de reintentar.
- Los cambios de documentación no autorizan modificar esquema, instalar trackers, enviar datos a proveedores o desplegar. Un aviso de privacidad informa; no sustituye controles, procedimientos ni consentimiento cuando corresponda.

## Colaboración

Reutiliza `senior-software-developer` para implementar, `qa-testing` para regresiones y `ux-ui-design` para accesibilidad de avisos y opciones. Lee esas skills solo si aportan a la tarea. No dupliques auditorías ni crees subagentes por esta referencia.
