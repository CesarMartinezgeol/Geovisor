# Tablero de Conceptos Técnicos (CT)

`expedientes.json` es la lista de expedientes de CT en curso que muestra
`/ct` en la app. Por ahora **no hay edición en vivo desde el navegador**:
para agregar o actualizar un caso (nuevo expediente, cambio de estado,
vencimiento de plazo, etc.), pídeselo a Claude Code en el repo y se edita
este archivo y se hace commit/push — igual que con los datos de la RRMRHS.

Cuando el volumen de casos lo justifique, el siguiente paso natural es
mover esto a una base de datos real con edición desde la propia app (hoy
no la tiene para no depender de servicios externos que haya que
configurar).

Este tablero es solo de seguimiento (expediente, tipo de trámite, estado,
plazos). La evaluación técnica de fondo de cada CT se hace con la skill de
Claude Code `ct-cormacarena`, no aquí.

## Origen de los datos actuales

Los 656 expedientes cargados vienen del "Plan de saneamiento, Grupo suelo y
subsuelo 2023" (Drive del Grupo). Ver `scripts/ct/README.md` para cómo se
generó `expedientes.json` y qué limitaciones tiene (historial de cada
trámite guardado como texto libre en `observaciones`, no campo por campo).
