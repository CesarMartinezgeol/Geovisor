# Geovisor RRMRHS

Aplicación web para el Grupo Suelo y Subsuelo de Cormacarena: visor de la Red
Regional de Monitoreo del Recurso Hídrico Subterráneo (RRMRHS) del
departamento del Meta, con generación asistida de informes individuales de
monitoreo.

## Qué hace hoy (v1)

- **Mapa** de los 60 puntos de monitoreo (Red Nacional RN + Red Regional RC),
  coloreados según si tienen infraestructura completa y monitoreo reciente.
- **Ficha por punto** (`/puntos/[id]`): datos del expediente, infraestructura,
  historial de niveles y de calidad de agua (2023-2026), con los valores
  fuera de los límites de referencia resaltados en rojo.
- **Generador de informes** (`/informes/[id]`): produce un borrador en Word
  (.docx) con la estructura real del "Informe individual de monitoreo"
  (antecedentes, ficha técnica, historial, tabla de resultados con
  resaltado automático) ya lleno con los datos del punto. Los campos
  narrativos (descripción de la visita, estado de permisos, conclusiones)
  se completan en un formulario simple antes de descargar el documento.
- **Tablero de Conceptos Técnicos** (`/ct`): seguimiento de expedientes de
  CT (tipo de trámite, estado, plazos). Incluye un generador
  (`/ct/nuevo`) que arma el encabezado oficial DATOS GENERALES (plantilla
  F.GA-39) y los títulos de sección según el tipo de trámite, listo para
  que la evaluación de fondo (con la skill `ct-cormacarena`) se redacte
  encima. La app no evalúa ni decide nada por sí sola — eso es juicio
  técnico caso por caso, no algo automatizable.
- **OCR de documentos** (`/ocr`): sube un PDF (incluye expedientes
  multipágina, sin límite práctico de tamaño de escaneo) o una imagen
  (FUN, Auto de inicio, ficha técnica) y obtén la transcripción completa
  en texto, con tablas y estructura conservadas, para copiar, buscar o
  pegar donde haga falta. Usa el modelo de Claude con visión, pensado
  para escaneos ruidosos, sellos y letra manuscrita típicos de un
  expediente físico. El generador de CT (`/ct/nuevo`) tiene además un
  cargador que usa el mismo OCR para autocompletar el encabezado
  (Concepto Técnico, Auto, expediente, interesado, localización, fecha de
  visita) a partir del FUN o el Auto de inicio escaneado — siempre
  revisando lo que llenó antes de generar el documento.

## Cómo correrla en desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Configurar el OCR (obligatorio para `/ocr` y el autocompletado de `/ct/nuevo`)

El OCR usa la API de Claude (Anthropic), así que necesita una API key propia
(distinta de cualquier suscripción de Claude Code o claude.ai):

1. Crea una key en [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. En local, crea un archivo `.env.local` en la raíz del proyecto (no se
   sube a git) con:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. En Vercel: Project Settings → Environment Variables → agrega
   `ANTHROPIC_API_KEY` con el mismo valor.

Sin esta variable configurada, `/ocr` y el autocompletado de `/ct/nuevo`
responden con un error explicando que falta la key; el resto de la app
funciona igual sin ella. El modelo usado es `claude-opus-5` (configurable
con la variable opcional `OCR_MODEL`), priorizando calidad de lectura sobre
costo por tratarse de documentos oficiales.

## Cómo actualizar los datos de la red de monitoreo

Los datos viven en `data/rrmrhs/puntos.json`, generados a partir del Excel
maestro ("BASE DE DATOS RRMRHS...xlsx") con el script
`scripts/rrmrhs/import_rrmrhs.py`. Ver `scripts/rrmrhs/README.md` para
instrucciones de cómo volver a correrlo cuando haya datos nuevos (nuevo año,
correcciones, etc.). Este script lo debe correr quien mantenga el
repositorio (Claude Code); no requiere que edites nada a mano en el código.

Los límites de calidad de referencia (Resolución 2115 de 2007) están en
`data/rrmrhs/limites-res-2115-2007.json` — son un punto de partida y deben
verificarse contra el texto oficial antes de usarlos en un informe oficial.

## Desplegar en la nube

Este proyecto es un Next.js estándar, listo para desplegarse en
[Vercel](https://vercel.com) de forma gratuita:

1. Entra a vercel.com con tu cuenta de GitHub.
2. "Add New Project" → selecciona el repositorio `Geovisor`.
3. Vercel detecta Next.js automáticamente, dale "Deploy".
4. Cada vez que se actualice el código en GitHub, Vercel vuelve a publicar
   la app sola.

## Cómo actualizar el tablero de Conceptos Técnicos

`data/ct/expedientes.json` empieza vacío. Para agregar o actualizar un
expediente (nuevo caso, cambio de estado, plazo), pídeselo a Claude Code —
ver `data/ct/README.md`.

## Próximos pasos (fase 2)

- Enriquecer el historial hidráulico (Q, K, T, S) por punto desde las
  fichas técnicas y expedientes históricos.
- Edición en línea de los datos del punto y del tablero de CT (hoy se
  actualizan regenerando los JSON de `data/`).
