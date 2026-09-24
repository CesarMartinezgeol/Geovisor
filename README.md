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

## Cómo correrla en desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

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

## Próximos pasos (fase 2)

- Módulo de Conceptos Técnicos (CT) para trámites de concesión de aguas
  subterráneas ante Cormacarena.
- Enriquecer el historial hidráulico (Q, K, T, S) por punto desde las
  fichas técnicas y expedientes históricos.
- Edición en línea de los datos del punto (hoy se actualizan regenerando
  `puntos.json`).
