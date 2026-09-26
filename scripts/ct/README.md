# Import Plan de Saneamiento (Grupo Suelo y Subsuelo)

Convierte "Plan de saneamiento, Grupo suelo y subsuelo 2023..xlsx" (hoja
"Saneamiento 2023") en `data/ct/expedientes.json`.

## Uso

```bash
pip install openpyxl
python3 import_saneamiento.py   # coloca el xlsx junto a este script
```

Copia el `expedientes.json` resultante a `data/ct/expedientes.json`.

## Notas

- El registro incluye TODOS los tipos de permiso que maneja el grupo
  (concesión de aguas subterráneas, ocupación de cauce, prospección,
  vertimientos, aprovechamiento forestal), no solo agua subterránea. En el
  tablero se filtra por tipo de permiso.
- Las columnas posteriores a MUNICIPIO/TIPO DE PERMISO (radicados, autos,
  fechas de cada etapa del trámite) tienen desalineaciones reales en el
  Excel fuente (celdas combinadas / captura manual inconsistente), así que
  no se reetiquetan campo por campo: se guardan tal cual, concatenadas, en
  `observaciones`, para no inventar una precisión que no se puede verificar
  por posición de columna.
- Cuando el mismo expediente aparece varias veces (prórrogas de distintos
  años), se conserva el registro del año más reciente y se anota que hay
  historial previo.
- El estado se mapea así: TRAMITE→en_tramite, OTORGADO→otorgado,
  ARCHIVADO/ARCHIVADO 2023/DESISTIMIENTO→archivado, NIEGA PERMISO→negado.
