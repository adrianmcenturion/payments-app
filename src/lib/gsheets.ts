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
const REGEX_CUIT = /\b\d{2}-?\d{8}-?\d\b/g;

export interface Aparicion {
  fila: number; // número de fila en el sheet
  cuit: string; // vacío si la fila no tiene CUIT
  sinCuit?: boolean;
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
type FilaCruda = Montos & {cuits: string[]; omitir: boolean};

const tieneMontos = (m: Montos) =>
  m.total !== undefined || m.honorarios !== undefined || m.iva !== undefined;

// Filas de "TOTAL", "SUBTOTAL" o "SUMA": no son registros
function esFilaDeTotales(r: unknown[]) {
  return r.some((c) => /^(sub)?totales?\b|^suma\b/i.test(String(c ?? "").trim()));
}

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

// Lee una hoja desde el encabezado hacia abajo. null = no tiene la columna DEMANDADO.
async function leerHoja(sheet: GoogleSpreadsheetWorksheet): Promise<Aparicion[] | null> {
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

    const leer = (r: unknown[], col: number) => (col === -1 ? undefined : r[col]);

    // filas[i] corresponde a la fila (inicio + i) del sheet
    const filas: FilaCruda[] = datos.map((r: unknown[]) => ({
      cuits: (String(leer(r, colDemandado) ?? "").match(REGEX_CUIT) ?? []).map((c) =>
        c.replace(/\D/g, ""),
      ),
      omitir: esFilaDeTotales(r ?? []),
      tipo:
        String(leer(r, colTipo) ?? "")
          .trim()
          .toUpperCase() || undefined,
      total: parseMonto(leer(r, colTotal)),
      honorarios: parseMonto(leer(r, colHonor)),
      iva: parseMonto(leer(r, colIva)),
    }));

    const consumidas = new Set<number>(); // filas de montos ya asignadas a un CUIT
    const apariciones: Aparicion[] = [];

    // 1) Filas con CUIT: montos propios, o los de la fila de arriba si esa es una fila de montos sin CUIT
    filas.forEach((fila, i) => {
      if (fila.cuits.length === 0) return;

      let fuente: Montos = fila;

      if (!tieneMontos(fila)) {
        const arriba = filas[i - 1];

        if (arriba && arriba.cuits.length === 0 && !arriba.omitir && tieneMontos(arriba)) {
          fuente = arriba;
          consumidas.add(i - 1);
        }
      }

      for (const cuit of fila.cuits) {
        apariciones.push({
          fila: inicio + i,
          cuit,
          tipo: fila.tipo ?? fuente.tipo,
          total: fuente.total,
          honorarios: fuente.honorarios,
          iva: fuente.iva,
        });
      }
    });

    // 2) Filas con montos que ningún CUIT reclamó: se agregan sin CUIT
    filas.forEach((fila, i) => {
      if (fila.cuits.length > 0 || fila.omitir || consumidas.has(i) || !tieneMontos(fila)) return;

      apariciones.push({
        fila: inicio + i,
        cuit: "",
        sinCuit: true,
        tipo: fila.tipo,
        total: fila.total,
        honorarios: fila.honorarios,
        iva: fila.iva,
      });
    });

    return apariciones.sort((a, b) => a.fila - b.fila); // en el orden del sheet
  }

  return null;
}

// Lee las hojas indicadas (o todas) y devuelve cada aparición, con o sin CUIT
export async function leerHojas(nombres?: string[]): Promise<HojaInfo[]> {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_CUITS_ID!, getGoogleAuth());

  await doc.loadInfo();

  const resultado: HojaInfo[] = [];

  for (const sheet of doc.sheetsByIndex) {
    if (nombres && !nombres.includes(sheet.title)) continue;

    const apariciones = await leerHoja(sheet);

    if (apariciones === null) continue; // hoja sin columna DEMANDADO

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
