# Plantillas adaptables

Usa solo lo que ayude a revisar el trabajo; reemplaza las indicaciones con hechos y elimina apartados irrelevantes.

## Plan de implementación

```text
Problema y comportamiento actual:
Resultado solicitado y fuera de alcance:
Stack/versiones y contratos afectados:
Criterios de aceptación observables:
Archivos o módulos previstos:
Pasos de implementación:
Datos, permisos, compatibilidad y riesgos:
Verificación prevista y entorno disponible:
```

## Criterio de aceptación

```text
Dado [estado inicial y rol], cuando [acción concreta], entonces [resultado observable].
Caso negativo/límite: [entrada o fallo] produce [respuesta] y conserva [invariante].
Evidencia: [prueba/comando o pasos de comprobación y entorno].
```

Ejemplo GoodEats: dado un producto pendiente con cantidad 6, cuando se intenta guardar cantidad 0, se muestra el error en Cantidad y el registro guardado conserva 6. Cuando se cancela, se sale de edición sin alterar el producto.

## Decisión técnica relevante

```text
Contexto y restricción:
Opciones consideradas:
Decisión y motivo:
Consecuencias, compatibilidad y coste:
Condición para revisar esta decisión:
```

## Entrega o descripción de PR

```text
Problema y comportamiento resultante:
Archivos principales y propósito:
Validación ejecutada: comando, resultado, entorno y alcance.
Riesgos y verificaciones pendientes:
Operación/migración/reversión, si aplica:
```

## Traspaso a QA o UX/UI

```text
Flujo y requisitos afectados:
Criterios de aceptación y casos límite:
Cómo reproducir y entorno con datos controlados:
Cambio implementado y evidencia existente:
Aspectos que requieren revisión especializada:
```

No incluir secretos, credenciales o información personal en estas plantillas.
