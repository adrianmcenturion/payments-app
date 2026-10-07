"use client";

import type {Fila} from "@/app/dashboard/actions";

import {useState} from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FECHA = "30-sep";
const ORDEN_HOJAS = ["APA", "AA", "MM"]; // las demás hojas van después, por nombre

const formato = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function ordenHoja(hoja: string) {
  const i = ORDEN_HOJAS.indexOf(hoja.toUpperCase());

  return i === -1 ? ORDEN_HOJAS.length : i;
}

// Primero A, después B, y al final lo que no tenga tipo
function ordenTipo(tipo?: string) {
  return tipo === "A" ? 0 : tipo === "B" ? 1 : 2;
}

// El tipo del Excel; si no tiene, el sugerido según ARCA
function tipoDe(f: Fila) {
  return f.tipo ?? f.tipoSugerido;
}

// Monto con coma decimal y sin separador de miles, para pegar en Excel
function paraExcel(n?: number) {
  return n === undefined ? "" : n.toFixed(2).replace(".", ",");
}

// Si ARCA no trajo nombre usamos el CUIT; si ni siquiera hay CUIT, dejamos una marca para completar
function sujetoDe(f: Fila) {
  return f.nombre ?? ``;
}

export function FichaTable({filas}: {filas: Fila[]}) {
  const [copiado, setCopiado] = useState(false);

  // Orden: hoja, después tipo (A y luego B), y dentro de eso el orden original del Excel
  const ordenadas = [...filas].sort(
    (a, b) =>
      ordenHoja(a.hoja) - ordenHoja(b.hoja) ||
      a.hoja.localeCompare(b.hoja) ||
      ordenTipo(tipoDe(a)) - ordenTipo(tipoDe(b)) ||
      a.fila - b.fila,
  );

  const registros = ordenadas.map((f) => ({
    clave: `${f.hoja}-${f.fila}-${f.cuit}`,
    fecha: FECHA,
    concepto: `Hono. Mandatarios ds. ${sujetoDe(f)}`,
    tipo: "H",
    abogado: f.hoja,
    numero: "", // se completa después
    neto: f.honorarios,
    iva: f.iva,
    percepcion: "",
    total: f.total,
    categoria: tipoDe(f),
  }));

  const suma = (campo: "neto" | "iva" | "total") =>
    registros.reduce((acc, r) => acc + (r[campo] ?? 0), 0);

  async function copiar() {
    const texto = registros
      .map((r) =>
        [
          r.fecha,
          r.concepto,
          r.tipo,
          r.abogado,
          r.numero,
          paraExcel(r.neto),
          paraExcel(r.iva),
          r.percepcion,
          paraExcel(r.total),
        ].join("\t"),
      )
      .join("\n");

    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (registros.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Ficha de cuenta corriente</h2>
        <Button type="button" variant="outline" onClick={copiar}>
          {copiado ? "¡Copiado!" : "Copiar filas"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead>Abogado</TableHead>
              <TableHead>N°</TableHead>
              <TableHead className="text-right">Neto</TableHead>
              <TableHead className="text-right">IVA</TableHead>
              <TableHead className="text-right">Percep. IVA</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">A/B</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((r) => (
              <TableRow key={r.clave}>
                <TableCell>{r.fecha}</TableCell>
                <TableCell>{r.concepto}</TableCell>
                <TableCell className="text-center">{r.tipo}</TableCell>
                <TableCell>{r.abogado}</TableCell>
                <TableCell>{r.numero}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.neto === undefined ? "" : formato.format(r.neto)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.iva === undefined ? "" : formato.format(r.iva)}
                </TableCell>
                <TableCell className="text-right">{r.percepcion}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.total === undefined ? "" : formato.format(r.total)}
                </TableCell>
                <TableCell className="text-center">
                  {r.categoria ? <Badge variant="outline">{r.categoria}</Badge> : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium" colSpan={5}>
                Totales ({registros.length} filas)
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formato.format(suma("neto"))}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formato.format(suma("iva"))}
              </TableCell>
              <TableCell />
              <TableCell className="text-right tabular-nums">
                {formato.format(suma("total"))}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
