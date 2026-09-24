# Import RRMRHS

Convierte el Excel maestro de la Red Regional de Monitoreo del Recurso
Hídrico Subterráneo ("BASE DE DATOS RRMRHS - RED REGIONAL DE MONITOREO DEL
RECURSO HIDRICO SUBTERRANEO.xlsx") en `data/rrmrhs/puntos.json`, que es lo
que consume la app.

## Requisitos

```bash
pip install openpyxl pyproj
```

## Uso

1. Descarga el Excel maestro más reciente (Google Drive de Cesar, carpeta
   "RRMRHS") y colócalo junto a este script como `base_datos_rrmrhs.xlsx`.
2. Corre:

   ```bash
   python3 import_rrmrhs.py
   ```

3. Copia el `puntos.json` generado a `data/rrmrhs/puntos.json` en la raíz
   del repo y vuelve a construir la app (`npm run build`).

## Notas sobre los datos fuente

- Cada año (2019-2026) tiene su propia hoja en el Excel, con nombres de
  columnas ligeramente distintos entre años. El script normaliza los
  encabezados más comunes; si Cormacarena agrega un parámetro nuevo o
  cambia el nombre de una columna, hay que sumarlo a `PARAM_MAP` o
  `META_MAP` en `import_rrmrhs.py`.
- Las hojas 2019-2022 usan esquemas de identificación de punto
  inconsistentes (sin un ID RN/RC confiable en todas las filas), así que
  por ahora se excluyen del cruce automático para no meter datos corruptos.
  Si se necesita rescatar esos años, hay que revisarlos fila por fila.
- Las coordenadas "Origen Nacional" están en EPSG:9377 (MAGNA-SIRGAS-CTM12).
  El script las convierte a lat/lon (WGS84) con `pyproj`.
- El nivel estático histórico (Tabla 4 de los informes individuales, con Q,
  eficiencia, K, T, S) no vive en este Excel maestro — se arma manualmente
  en cada informe a partir del expediente. Es candidato para una fase 2:
  extraerlo de "FICHAS TECNICAS -PUNTOS RRMRHS.xlsx" o de los informes
  anteriores.
