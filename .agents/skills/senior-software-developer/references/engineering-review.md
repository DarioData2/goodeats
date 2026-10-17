# Ingeniería y revisión técnica

Selecciona los apartados afectados; registra hallazgos con archivo, reproducción o razonamiento, impacto y corrección propuesta. No conviertas esta lista en un trámite para cambios triviales.

## Arquitectura

- [ ] La solución conserva contratos, rutas y persistencia existentes, o explica una incompatibilidad autorizada.
- [ ] Componentes presentan información; servicios concentran acceso a datos; reglas de dominio pueden probarse sin UI cuando ya existe esa separación.
- [ ] Estado local, global y remoto tienen propietario claro. No se duplican fuentes de verdad ni se añade estado global innecesario.
- [ ] Abstracciones responden a usos concretos; no se crean repositorios, fábricas o capas solo para cumplir un patrón.
- [ ] La refactorización preserva comportamiento con evidencia, y su alcance no incluye cambios funcionales accidentales.
- [ ] Dependencias nuevas tienen beneficio, coste, compatibilidad y mantenimiento evaluados.

## Código, frontend y móvil

- [ ] Formularios validan en el límite correcto; errores se asocian al campo y conservan entradas recuperables.
- [ ] Carga, vacío, éxito, error y reintento representan estados reales; no se informa éxito antes de confirmar persistencia.
- [ ] Efectos asíncronos manejan desmontaje, cambio de cuenta y respuestas fuera de orden. Se examinan doble envío y concurrencia cuando afectan escrituras.
- [ ] Navegación y componentes reutilizan convenciones del proyecto. Se comprueban web y nativo cuando tienen implementaciones diferentes.
- [ ] Teclado, foco, etiquetas accesibles, tamaños táctiles y pantallas estrechas se revisan en el flujo afectado.
- [ ] Listas grandes, imágenes, renders y solicitudes se optimizan con medición o evidencia; evitar memoización indiscriminada.
- [ ] TypeScript expresa estados y contratos sin ocultar problemas con `any`, aserciones o supresiones no justificadas.

## Backend y contratos

- [ ] REST tiene métodos, estados y errores coherentes; cliente y servidor validan sus propias fronteras.
- [ ] Django/Node/Python reutilizan validadores, transacciones y configuración presentes; no se incorpora otro backend por preferencia.
- [ ] Paginación, límites, timeouts e idempotencia corresponden al volumen y efectos reales.
- [ ] Consultas evitan N+1; índices responden a filtros y planes observados. No crear índices sin analizar coste de escritura.

## Calidad y DevOps

- [ ] Pruebas cubren resultados y regresiones, no una copia de la implementación. Incluyen casos positivos, negativos y límites relevantes.
- [ ] Resultados indican comando, entorno y alcance. Mocks no prueban RLS desplegada ni compilación prueba un dispositivo físico.
- [ ] Git diff no incluye secretos, builds, archivos temporales ni cambios ajenos. Seguir estrategia de ramas y PR del repositorio.
- [ ] CI usa scripts existentes, permisos mínimos y secretos gestionados por el proveedor; las acciones se revisan antes de añadirlas.
- [ ] Build usa versiones compatibles y variables del entorno correcto; distinguir compilación de publicación efectiva.
- [ ] Despliegues autorizados incluyen identificación de versión, comprobación de salud y estrategia de reversión. Tras un fallo, diagnosticar antes de reintentar.
