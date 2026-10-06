import {leerHojas} from "@/lib/gsheets";

import {SheetForm} from "./components/padron-form";

export const dynamic = "force-dynamic";

export const maxDuration = 60; // en Vercel depende de tu plan

export default async function PadronPage() {
  const hojas = await leerHojas();

  const resumen = hojas.map((h) => ({hoja: h.hoja, total: h.apariciones.length}));

  return (
    <main>
      <h1>Consulta de padrón</h1>
      <SheetForm hojas={resumen} />
    </main>
  );
}
