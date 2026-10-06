import type {Payment, Socio} from "@/types";
import type {GoogleSpreadsheetWorksheet} from "google-spreadsheet";

import {google} from "googleapis";
import {GoogleSpreadsheet} from "google-spreadsheet";

let auth: InstanceType<typeof google.auth.GoogleAuth> | undefined;

export function getGoogleAuth() {
  if (auth) return auth;

  auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return auth;
}

const COLUMNA = "DEMANDADO";

export interface Aparicion {
  fila: number; // número de fila en el sheet
  cuit: string;
  tipo?: string; // A o B, tal como figura en el sheet
  total?: number;
  honorarios?: number;
  iva?: number;
}

export interface HojaInfo {
  hoja: string;
  apariciones: Aparicion[];
}

interface Montos {
  tipo?: string;
  total?: number;
  honorarios?: number;
  iva?: number;
}
type FilaCruda = Montos & {demandado: string};

// Convierte "223342,46", "$ 223.342,46" o un número real en number
function parseMonto(valor: unknown): number | undefined {
  if (typeof valor === "number") return valor;

  let texto = String(valor ?? "").replace(/[^\d.,-]/g, "");

  if (!texto) return undefined;

  if (texto.includes(",")) {
    texto = texto.replace(/\./g, "").replace(",", "."); // 223.342,46 -> 223342.46
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(texto)) {
    texto = texto.replace(/\./g, ""); // 223.342 -> 223342
  }

  const n = Number(texto);

  return Number.isFinite(n) ? n : undefined;
}

// Lee la hoja desde el encabezado hacia abajo. null = no tiene la columna DEMANDADO.
async function leerHoja(
  sheet: GoogleSpreadsheetWorksheet,
): Promise<{inicio: number; filas: FilaCruda[]} | null> {
  const cabecera = await sheet.getCellsInRange("A1:AZ30");

  if (!cabecera) return null;

  for (let f = 0; f < cabecera.length; f++) {
    const encabezados: string[] = cabecera[f].map((c: unknown) =>
      String(c ?? "")
        .trim()
        .toUpperCase(),
    );

    const colDemandado = encabezados.indexOf(COLUMNA);

    if (colDemandado === -1) continue;

    const colTotal = encabezados.indexOf("TOTAL");
    const colHonor = encabezados.findIndex((e) => e.startsWith("HONOR"));
    const colIva = encabezados.indexOf("IVA");
    let colTipo = encabezados.indexOf("TIPO");

    if (colTipo === -1) colTipo = encabezados.findIndex((e) => e.startsWith("TIPO"));

    const inicio = f + 2; // primera fila de datos (en base 1)
    const datos = (await sheet.getCellsInRange(`A${inicio}:AZ`)) ?? [];

    const leer = (r: unknown[] | undefined, col: number) => (col === -1 ? undefined : r?.[col]);

    // filas[i] corresponde a la fila (inicio + i) del sheet
    const filas: FilaCruda[] = datos.map((r: unknown[]) => ({
      demandado: String(leer(r, colDemandado) ?? ""),
      tipo:
        String(leer(r, colTipo) ?? "")
          .trim()
          .toUpperCase() || undefined,
      total: parseMonto(leer(r, colTotal)),
      honorarios: parseMonto(leer(r, colHonor)),
      iva: parseMonto(leer(r, colIva)),
    }));

    return {inicio, filas};
  }

  return null;
}

// Lee las hojas indicadas (o todas) y devuelve cada aparición de un CUIT con sus datos
export async function leerHojas(nombres?: string[]): Promise<HojaInfo[]> {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_CUITS_ID!, getGoogleAuth());

  await doc.loadInfo();

  const resultado: HojaInfo[] = [];

  for (const sheet of doc.sheetsByIndex) {
    if (nombres && !nombres.includes(sheet.title)) continue;

    const datos = await leerHoja(sheet);

    if (datos === null) continue; // hoja sin columna DEMANDADO

    const apariciones: Aparicion[] = [];

    datos.filas.forEach((f, i) => {
      const cuits = f.demandado.match(/\b\d{2}-?\d{8}-?\d\b/g) ?? [];

      if (cuits.length === 0) return;

      // Si la fila del CUIT no tiene montos, se toman los de la fila de arriba
      const tieneMontos =
        f.total !== undefined || f.honorarios !== undefined || f.iva !== undefined;
      const fuente: Montos = tieneMontos ? f : (datos.filas[i - 1] ?? {});

      for (const c of cuits) {
        apariciones.push({
          fila: datos.inicio + i,
          cuit: c.replace(/\D/g, ""),
          tipo: f.tipo ?? fuente.tipo,
          total: fuente.total,
          honorarios: fuente.honorarios,
          iva: fuente.iva,
        });
      }
    });

    resultado.push({hoja: sheet.title, apariciones});
  }

  return resultado;
}

export async function getPayments(): Promise<Payment[]> {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, getGoogleAuth());

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();

    const allVencimientos: Payment[] = rows.map((row) => {
      row.toObject();

      const Payment: Payment = {
        socio: row.get("socio") as Socio,
        conceptos: row.get("conceptos") as string,
        vencimientos: row.get("formateada") as Date,
        valorARS: row.get("valor") as string | number,
        valorUSD: row.get("valor USD") as string | number,
        vencimientosSinFormato: row.get("vencimientos") as Date,
      };

      return Payment;
    });

    return allVencimientos;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Se produjo un error desconocido");
    }
  }
}

interface AddPayment {
  socio: string;
  conceptos: string;
  valor?: number;
  "valor USD"?: number;
  vencimientos: string;
}

export async function addPayments(newPayment: AddPayment): Promise<AddPayment> {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, getGoogleAuth());

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({...newPayment});

    return newPayment;
  } catch (error) {
    console.error("Error adding payment:", error);
    throw new Error("Error adding payment");
  }
}
