import type {Payment, Socio} from "@/types";

import {google} from "googleapis";
import {GoogleSpreadsheet} from "google-spreadsheet";

const googleAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  },
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

export async function getPayments(): Promise<Payment[]> {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, googleAuth);

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
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, googleAuth);

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({...newPayment});

    return newPayment;
  } catch (error) {
    console.error("Error adding payment:", error);
    throw new Error("Error adding payment");
  }
}
