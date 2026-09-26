import json
import re
from datetime import datetime, date

import openpyxl

SRC = "plan_saneamiento.xlsx"
OUT = "expedientes.json"

TIPO_PERMISO_MAP = {
    "OCUPACION DE CAUCE": "Ocupación de cauce",
    "CONCESION DE AGUAS SUBTERRANEAS": "Concesión de aguas subterráneas",
    "PROSPECCION AGUAS SUBTERRANEAS": "Prospección de aguas subterráneas",
    "CONCESION DE AGUAS SUBTERRANEAS Y VERTIMIENTOS": "Concesión de aguas subterráneas y vertimientos",
    "VERTIMIENTOS": "Vertimientos",
    "OCUPACION DE CAUCE Y APROVECHAMIENTO FORESTAL": "Ocupación de cauce y aprovechamiento forestal",
    "APROVECHAMIENTO FORESTAL": "Aprovechamiento forestal",
}
NATURALEZA_MAP = {"NUEVO": "Nuevo", "PRORROGA": "Prórroga", "MODIFICACION": "Modificación"}

ESTADO_MAP = {
    "TRAMITE": "en_tramite",
    "OTORGADO": "otorgado",
    "ARCHIVADO": "archivado",
    "ARCHIVADO 2023": "archivado",
    "DESISTIMIENTO": "archivado",
    "NIEGA PERMISO": "negado",
}


def val_str(v):
    if v is None:
        return None
    if isinstance(v, (datetime, date)):
        return v.strftime("%d/%m/%Y")
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    s = str(v).strip()
    return s if s else None


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    ws = wb["Saneamiento 2023"]

    registros = []
    vistos = {}
    for r in range(2, ws.max_row + 1):
        expediente = val_str(ws.cell(row=r, column=10).value)
        if not expediente:
            continue
        usuario = val_str(ws.cell(row=r, column=11).value) or "(sin nombre registrado)"
        municipio = val_str(ws.cell(row=r, column=12).value)
        tipo_permiso_raw = (val_str(ws.cell(row=r, column=13).value) or "").upper()
        tipo_permiso = TIPO_PERMISO_MAP.get(tipo_permiso_raw, tipo_permiso_raw.title() or "Sin clasificar")
        naturaleza_raw = (val_str(ws.cell(row=r, column=8).value) or "").upper()
        naturaleza = NATURALEZA_MAP.get(naturaleza_raw)
        tipo_tramite = f"{tipo_permiso} — {naturaleza}" if naturaleza else tipo_permiso

        estado_raw = val_str(ws.cell(row=r, column=6).value)
        estado = ESTADO_MAP.get((estado_raw or "").upper(), "en_tramite")

        anio_raw = ws.cell(row=r, column=7).value
        anio = int(anio_raw) if isinstance(anio_raw, (int, float)) else None

        # Resto de columnas (historial del trámite: radicados, autos, fechas de
        # cada etapa): se conserva como texto libre en observaciones, sin
        # pretender re-etiquetar cada campo porque el orden de columnas de
        # esta hoja tiene inconsistencias reales (celdas combinadas / captura
        # manual) que no se pueden resolver con certeza por posición.
        extra_bits = []
        for c in list(range(1, 6)) + list(range(14, ws.max_column + 1)):
            v = val_str(ws.cell(row=r, column=c).value)
            if v and v.upper() not in ("N/A", "N.A", "NA"):
                extra_bits.append(v)
        # quita duplicados consecutivos (frecuentes por celdas repetidas)
        dedup = []
        for b in extra_bits:
            if not dedup or dedup[-1] != b:
                dedup.append(b)
        observaciones = " · ".join(dedup)
        if len(observaciones) > 600:
            observaciones = observaciones[:600] + "…"

        estado_raw_note = f"Estado original en el registro: {estado_raw}." if estado_raw and estado_raw.upper() not in ESTADO_MAP else ""
        if estado_raw_note:
            observaciones = (estado_raw_note + " " + observaciones).strip()

        registro = {
            "expediente": expediente,
            "usuario": usuario,
            "municipio": municipio,
            "tipoTramite": tipo_tramite,
            "tipoPermiso": tipo_permiso,
            "estado": estado,
            "anio": anio,
            "observaciones": observaciones or None,
        }

        if expediente in vistos:
            # Ya existe (prórrogas repetidas del mismo expediente en años
            # distintos): nos quedamos con el registro de año más reciente y
            # anotamos que hay historial previo.
            anterior = vistos[expediente]
            anio_ant = anterior.get("anio") or 0
            if (anio or 0) >= anio_ant:
                registro["observaciones"] = (
                    (registro["observaciones"] or "") + f" [Hay {vistos.get(expediente + '__count', 1)} registro(s) previos de este expediente en el histórico.]"
                ).strip()
                vistos[expediente] = registro
                vistos[expediente + "__count"] = vistos.get(expediente + "__count", 1) + 1
            continue

        vistos[expediente] = registro
        registros.append(registro)

    # limpia las claves auxiliares "__count" y usa el registro más reciente ya actualizado
    final = []
    for reg in registros:
        exp = reg["expediente"]
        final.append(vistos[exp])

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)
    print(f"Escribi {len(final)} expedientes (de {len(vistos)//1 if False else ''} vistos) en {OUT}")


if __name__ == "__main__":
    main()
