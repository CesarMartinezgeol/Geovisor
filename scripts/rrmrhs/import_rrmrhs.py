import json
import re
import unicodedata
from datetime import datetime, date

import openpyxl
from pyproj import Transformer

SRC = "base_datos_rrmrhs.xlsx"
OUT_PUNTOS = "puntos.json"

to_wgs84 = Transformer.from_crs("EPSG:9377", "EPSG:4326", always_xy=True)


def strip_accents(s):
    return "".join(
        c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)
    )


def norm_header(h):
    if h is None:
        return ""
    h = strip_accents(str(h)).upper()
    h = re.sub(r"[().%]", " ", h)
    h = re.sub(r"[^A-Z0-9 ]", " ", h)
    h = re.sub(r"\s+", " ", h).strip()
    return h


# canonical param key -> list of normalized header variants seen across years
PARAM_MAP = {
    "alcalinidadTotal": ["ALCALINIDAD TOTAL", "ALCANILIDAD TOTAL"],
    "aluminioTotal": ["ALUMINIO TOTAL"],
    "amonio": ["AMONIO"],
    "arsenicoTotal": ["ARSENICO TOTAL"],
    "bicarbonatos": ["BICARBONATOS"],
    "cadmioTotal": ["CADMIO TOTAL"],
    "calcio": ["CALCIO"],
    "carbonatos": ["CARBONATOS"],
    "cloroResidualLibre": ["CLORO RESIDUAL LIBRE"],
    "cloruros": ["CLORUROS"],
    "cobreTotal": ["COBRE TOTAL"],
    "colorAparente": ["COLOR APARENTE", "COLOR VERDADERO REAL PH 6 08", "COLOR VERDADERO REAL"],
    "conductividad": ["CONDUCTIVIDAD"],
    "carbonoOrganicoTotal": ["CARBONO ORGANICO TOTAL", "CARBONO TOTAL ORGANICO"],
    "cromoTotal": ["CROMO TOTAL"],
    "durezaTotal": ["DUREZA TOTAL"],
    "fenolesTotales": ["FENOLES TOTALES"],
    "fluoruros": ["FLUORUROS"],
    "fosfatos": ["FOSFATOS", "FOSFORO REACTIVO SOLUBLE"],
    "grasasYAceites": ["GRASAS Y ACEITES"],
    "hidrocarburosTotales": ["HIDROCARBUROS TOTALES"],
    "hierroTotal": ["HIERRO TOTAL"],
    "magnesio": ["MAGNESIO TOTAL", "MAGNESIO"],
    "manganesoTotal": ["MANGANESO TOTAL"],
    "mercurioTotal": ["MERCURIO TOTAL"],
    "molibdenoTotal": ["MOLIBDENO TOTAL"],
    "nitratos": ["NITRATOS"],
    "nitritos": ["NITRITOS"],
    "nitrogenoAmoniacal": ["NITROGENO AMONIACAL"],
    "oxigenoDisuelto": ["OXIGENO DISUELTO"],
    "ph": ["PH"],
    "plomoTotal": ["PLOMO TOTAL"],
    "potasioDisuelto": ["POTASIO DISUELTO"],
    "sodioDisuelto": ["SODIO DISUELTO"],
    "solidosDisueltosTotales": ["SOLIDOS DISUELTOS TOTALES"],
    "sulfatos": ["SULFATOS"],
    "sulfuros": ["SULFUROS"],
    "temperatura": ["TEMPERATURA"],
    "turbidez": ["TURBIDEZ"],
    "zincTotal": ["ZINC TOTAL"],
    "coliformesTotales": ["COLIFORMES TOTAL", "COLIFORMES TOTALES"],
    "eColi": ["E COLI", "ESCHERICHIA COLI"],
    "errorBalanceIonico": ["ERROR BALANCE IONICO"],
    "tipologiaFacies": ["TIPOLOGIA DE FACIES HIDROGEOQUIMICAS", "TIPOLOGIA DE FACIES HIDROGEOQUIMICAS 1"],
}
PARAM_LOOKUP = {}
for key, variants in PARAM_MAP.items():
    for v in variants:
        PARAM_LOOKUP[v] = key

META_MAP = {
    "expediente": ["EXPEDIENTE"],
    "usuario": ["USUARIO"],
    "contacto": ["CONTACTO", "NUMERO DE CONTACTO", "RESPONSABLE"],
    "correoElectronico": ["CORREO ELECTRONICO"],
    "resolucion": ["RESOLUCION"],
    "caudalOtorgado": ["CAUDAL OTORGADO L S", "CAUDAL L S"],
    "vigencia": ["VIGENCIA"],
    "municipio": ["MUNICIPIO"],
    "veredaBarrio": ["VEREDA BARRIO"],
    "provinciaHidrogeologica": ["PROVINCIA HIDROGEOLOGICA"],
    "sistemaAcuifero": ["SISTEMA ACUIFERO"],
    "zonaHidrogeologica": ["ZONA HIDROGEOLOGICA"],
    "tipoCaptacion": ["TIPO DE CAPTACION"],
    "codigoSap": ["CODIGO SAP", "CODIGO T A"],
    "profundidad_m": ["PROFUNDIDAD M", "PROFUNDIDAD"],
    "nivelEstatico_m": ["NIVEL ESTATICO 2025", "NIVEL ESTATICO 2023", "NIVEL ESTATICO"],
    "fechaMedicionNivel": ["FECHA DE MEDICION DE NIVEL ESTATICO"],
    "fechaTomaMuestra": ["FECHA TOMA DE MUESTRA", "FECHA TOMA MUESTRA"],
    "coordNorte": ["COORDENADA ORIGEN NACIONAL NORTE", "COORDENADA N", "Y"],
    "coordEste": ["COORDENADA ORIGEN NACIONAL ESTE", "COORDENADA E", "X"],
    "cota_msnm": ["COTA M S N M"],
    "nivelacionGeoreferenciacion": ["NIVELACION Y GEOREFERENCIAZION"],
    "disenoPozo": ["DISENO DE POZO"],
    "llavePaso": ["LLAVE DE PASO"],
    "medidorCaudal": ["MEDIDOR DE CAUDAL"],
    "casetaProteccion": ["CASETA DE PROTECCION"],
    "sistemaMedicionNiveles": ["SISTEMA DE MEDICION DE NIVELES PIEZOMETRICOS"],
    "cubiertaSanitaria": ["CUBIERTA SANITARIA"],
    "ruta": ["RUTA"],
    "profesionalResponsableRuta": ["PROFESIONAL RESPONSABLE DE LA RUTA"],
    "revisionInformesDisenos": ["REVISION DE INFORMES Y DISENOS"],
    "comentariosPrevios": ["COMENTARIOS PREVIOS"],
}
META_LOOKUP = {}
for key, variants in META_MAP.items():
    for v in variants:
        META_LOOKUP[v] = key

ID_HEADER_VARIANTS = {"ID DE PUNTO", "ID DEL PUNTO", "ID"}


def find_header_row(ws, max_scan=10):
    for r in range(1, max_scan + 1):
        for c in range(1, min(ws.max_column, 10) + 1):
            v = norm_header(ws.cell(row=r, column=c).value)
            if v in ID_HEADER_VARIANTS:
                return r
    return None


def cell_str(v):
    if v is None:
        return None
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, float) and v.is_integer():
        return int(v)
    if isinstance(v, str):
        v = v.strip()
        return v if v else None
    return v


def parse_num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if not s:
        return None
    # strip common non-numeric prefixes like "<" and units left over
    s2 = re.sub(r"^[<>~≈]", "", s).strip()
    s2 = s2.replace(",", ".")
    m = re.search(r"-?\d+(\.\d+)?", s2)
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


def load_year_sheet(wb, year):
    ws = wb[str(year)]
    hdr_row = find_header_row(ws)
    if hdr_row is None:
        print(f"  [{year}] no header row found, skipping")
        return {}
    headers = {}
    for c in range(1, ws.max_column + 1):
        raw = ws.cell(row=hdr_row, column=c).value
        nh = norm_header(raw)
        if not nh:
            continue
        key = None
        if nh in ID_HEADER_VARIANTS:
            key = "__id__"
        elif re.match(r"^NIVEL ESTATICO( \d{4})?$", nh):
            key = ("meta", "nivelEstatico_m")
        elif nh.startswith("FECHA DE MEDICION DE NIVEL"):
            key = ("meta", "fechaMedicionNivel")
        elif nh in META_LOOKUP:
            key = ("meta", META_LOOKUP[nh])
        elif nh in PARAM_LOOKUP:
            key = ("param", PARAM_LOOKUP[nh])
        headers[c] = key

    rows = {}
    for r in range(hdr_row + 1, ws.max_row + 1):
        id_col = next((c for c, k in headers.items() if k == "__id__"), None)
        if id_col is None:
            break
        pid = cell_str(ws.cell(row=r, column=id_col).value)
        if not pid:
            continue
        pid = str(pid).strip().upper().replace(" ", "")
        if not re.match(r"^R[NC]\d+$", pid):
            continue
        meta = {}
        params = {}
        for c, key in headers.items():
            if key is None or key == "__id__":
                continue
            kind, name = key
            val = ws.cell(row=r, column=c).value
            if kind == "meta":
                if name == "nivelEstatico_m":
                    if isinstance(val, (datetime, date)):
                        meta[name] = None  # dato mal digitado en la fuente (fecha en vez de nivel)
                    else:
                        meta[name] = parse_num(val)
                else:
                    meta[name] = cell_str(val)
            else:
                params[name] = parse_num(val)
        rows[pid] = {"meta": meta, "params": params}
    return rows


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    # 2019-2022 sheets use inconsistent/legacy row structures without a reliable
    # RN/RC point id column, so they are excluded to avoid corrupting the merge.
    years = [2023, 2024, 2025, 2026]
    by_year = {}
    for y in years:
        if str(y) not in wb.sheetnames:
            continue
        data = load_year_sheet(wb, y)
        print(f"year {y}: {len(data)} puntos")
        by_year[y] = data

    puntos = {}
    for y in years:
        for pid, rec in by_year.get(y, {}).items():
            p = puntos.setdefault(pid, {
                "id": pid,
                "red": "Nacional" if pid.startswith("RN") else "Regional",
                "mediciones": {},
            })
            # merge meta: later years overwrite (most current wins), but keep first non-null
            for k, v in rec["meta"].items():
                if v is None:
                    continue
                if k in ("nivelEstatico_m", "fechaMedicionNivel", "fechaTomaMuestra",
                         "revisionInformesDisenos", "comentariosPrevios"):
                    continue  # these are year-specific, go into mediciones below
                p[k] = v
            medicion = {"anio": y}
            for special in ("nivelEstatico_m", "fechaMedicionNivel", "fechaTomaMuestra",
                             "revisionInformesDisenos", "comentariosPrevios"):
                if rec["meta"].get(special) is not None:
                    medicion[special] = rec["meta"][special]
            for k, v in rec["params"].items():
                if v is not None:
                    medicion[k] = v
            if len(medicion) > 1:
                p["mediciones"][y] = medicion

    # coords + finishing touches
    out = []
    for pid, p in sorted(puntos.items(), key=lambda kv: (kv[1]["red"], int(re.sub(r"\D", "", kv[0])))):
        p["mediciones"] = [p["mediciones"][y] for y in sorted(p["mediciones"].keys())]
        norte = p.pop("coordNorte", None)
        este = p.pop("coordEste", None)
        lat = lon = None
        try:
            if norte and este:
                este_f = float(str(norte))  # placeholder, real calc below
        except Exception:
            pass
        if norte is not None and este is not None:
            try:
                n = float(str(norte).replace(",", "."))
                e = float(str(este).replace(",", "."))
                if n > 100000 and e > 100000:
                    lon_, lat_ = to_wgs84.transform(e, n)
                    lat, lon = lat_, lon_
            except Exception as ex:
                print("coord error", pid, norte, este, ex)
        p["coordenadas"] = {"norteOrigenNacional": norte, "esteOrigenNacional": este, "lat": lat, "lon": lon}

        for numkey in ("profundidad_m", "cota_msnm", "ruta", "vigencia"):
            v = p.get(numkey)
            if isinstance(v, str):
                n = parse_num(v)
                if n is not None:
                    p[numkey] = int(n) if n.is_integer() else n

        for boolkey in ("nivelacionGeoreferenciacion", "disenoPozo", "llavePaso", "medidorCaudal",
                        "casetaProteccion", "sistemaMedicionNiveles", "cubiertaSanitaria"):
            v = p.get(boolkey)
            if v is None:
                p[boolkey] = None
            elif isinstance(v, str):
                vv = v.strip().upper()
                p[boolkey] = True if vv in ("SI", "S", "X", "SÍ") else (False if vv in ("NO", "N") else v)
        out.append(p)

    with open(OUT_PUNTOS, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {len(out)} puntos to {OUT_PUNTOS}")
    missing_coords = [p["id"] for p in out if p["coordenadas"]["lat"] is None]
    print(f"puntos without coords: {len(missing_coords)} -> {missing_coords}")


if __name__ == "__main__":
    main()
