"use server";

import {getArca} from "../arca"; // ajustá la ruta a tu arca.ts
import createSupabaseServerClient from "../supabase/server";

export default async function readUserSession() {
  const supabase = await createSupabaseServerClient();

  return supabase.auth.getSession();
}

export async function refreshUserSession() {
  const supabase = await createSupabaseServerClient();
  const session = await supabase.auth.getSession();
  const refreshToken = session.data.session;

  if (!refreshToken) return;

  return supabase.auth.refreshSession(refreshToken);
}

export type PadronState =
  | {status: "idle"}
  | {status: "error"; message: string}
  | {status: "not_found"}
  | {
      status: "ok";
      data: {
        taxId: string;
        name?: string;
        personType?: string;
        condition?: string;
        address?: string;
        errors: string[];
      };
    };

export async function consultarCuit(_prev: PadronState, formData: FormData): Promise<PadronState> {
  const cuit = String(formData.get("cuit") ?? "").replace(/\D/g, "");

  if (cuit.length !== 11) {
    return {status: "error", message: "El CUIT debe tener 11 dígitos."};
  }

  try {
    const c = await getArca().padron.getTaxpayerDetails(cuit);

    if (!c) return {status: "not_found"};

    const a = c.address;

    // Devolvemos solo lo necesario, sin `raw` (trae toda la respuesta de ARCA)
    return {
      status: "ok",
      data: {
        taxId: c.taxId,
        name: c.name,
        personType: c.personType,
        condition: c.condition,
        address: a ? [a.street, a.city, a.province].filter(Boolean).join(", ") : undefined,
        errors: c.errors ?? [],
      },
    };
  } catch (e) {
    console.error(e); // el detalle queda en el log del servidor

    return {
      status: "error",
      message: "No se pudo consultar ARCA. Revisá la configuración e intentá de nuevo.",
    };
  }
}
