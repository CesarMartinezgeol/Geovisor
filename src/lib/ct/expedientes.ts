import expedientesData from "../../../data/ct/expedientes.json";
import { ExpedienteCT } from "./types";

export function getExpedientesCT(): ExpedienteCT[] {
  return expedientesData as unknown as ExpedienteCT[];
}
