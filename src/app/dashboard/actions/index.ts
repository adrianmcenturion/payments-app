"use server";

import {revalidateTag} from "next/cache";

import {getPayments} from "@/lib/gsheets";
import {leerHojas} from "@/lib/gsheets";
import {getArca} from "@/lib/arca";

export default async function submit() {
  await getPayments();
  revalidateTag("payments");
}

const MAX_CUITS = 200; // CUITs distintos por consulta
const CONCURRENCIA = 5;

interface Datos {
  estado: "ok" | "no_existe" | "error";
  nombre?: string;
  direccion?: string;
  condicion?: string;
  aviso?: string;
  tipoSugerido?: "A" | "B";
}

export type Fila = Datos & {
  cuit: string;
  hoja: string;
  fila: number;
  tipo?: string; // el que figura en el sheet
  total?: number;
  honorarios?: number;
  iva?: number;
};

export type LoteState =
  | {status: "idle"}
  | {status: "error"; message: string}
  | {status: "ok"; filas: Fila[]};

// A: responsable inscripto y monotributo. B: el resto y los CUIT sin datos en ARCA.
function calcularTipo(estado: Datos["estado"], condicion?: string): "A" | "B" | undefined {
  if (estado === "no_existe") return "B";
  if (estado === "error" || !condicion) return undefined; // no hay base para sugerir

  return condicion === "responsable_inscripto" || condicion === "monotributo" ? "A" : "B";
}

async function consultarUno(cuit: string): Promise<Datos> {
  try {
    const c = await getArca().padron.getTaxpayerDetails(cuit);

    if (!c) return {estado: "no_existe", tipoSugerido: calcularTipo("no_existe")};

    const a = c.address;

    return {
      estado: "ok",
      nombre: c.name,
      direccion: a?.street?.replace(/\s+/g, " ").trim() || undefined,
      condicion: c.condition,
      aviso: c.errors.length ? c.errors.join(", ") : undefined,
      tipoSugerido: calcularTipo("ok", c.condition),
    };
  } catch (e) {
    console.error(cuit, e);

    return {estado: "error", aviso: "Falló la consulta a ARCA"};
  }
}

export async function consultarDesdeSheet(
  _prev: LoteState,
  formData: FormData,
): Promise<LoteState> {
  const elegidas = formData.getAll("hojas").map(String);

  if (elegidas.length === 0) {
    return {status: "error", message: "Elegí al menos una hoja."};
  }

  try {
    const hojas = await leerHojas(elegidas);

    // Una entrada por cada aparición del CUIT en el sheet
    const apariciones = hojas.flatMap((h) => h.apariciones.map((a) => ({...a, hoja: h.hoja})));

    if (apariciones.length === 0) {
      return {status: "error", message: "No encontré ningún CUIT en las hojas elegidas."};
    }

    // A ARCA se consulta una sola vez cada CUIT distinto
    const unicos = [...new Set(apariciones.map((a) => a.cuit))];

    if (unicos.length > MAX_CUITS) {
      return {
        status: "error",
        message: `Hay ${unicos.length} CUITs distintos y el máximo por vez es ${MAX_CUITS}.`,
      };
    }

    const datos = new Map<string, Datos>();

    // El primero va solo para que el SDK obtenga y guarde el ticket de ARCA
    datos.set(unicos[0], await consultarUno(unicos[0]));

    let siguiente = 1;

    async function worker() {
      while (true) {
        const i = siguiente++;

        if (i >= unicos.length) return;
        datos.set(unicos[i], await consultarUno(unicos[i]));
      }
    }
    await Promise.all(Array.from({length: CONCURRENCIA}, worker));

    // Una fila por aparición: datos de ARCA (repetidos por CUIT) + datos propios de esa fila
    const filas: Fila[] = apariciones.map((a) => ({
      cuit: a.cuit,
      hoja: a.hoja,
      fila: a.fila,
      tipo: a.tipo,
      total: a.total,
      honorarios: a.honorarios,
      iva: a.iva,
      ...datos.get(a.cuit)!,
    }));

    return {status: "ok", filas};
  } catch (e) {
    console.error(e);

    return {status: "error", message: "No pude leer el sheet de CUITs."};
  }
}
