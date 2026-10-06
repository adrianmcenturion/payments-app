"use client";

import {useState} from "react";
import {useFormState, useFormStatus} from "react-dom";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {consultarDesdeSheet, type Fila, type LoteState} from "@/app/dashboard/actions";

interface HojaResumen {
  hoja: string;
  total: number;
}

const initialState: LoteState = {status: "idle"};

const pesos = new Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS"});

function formatearMonto(n?: number) {
  return n === undefined ? "-" : pesos.format(n);
}

// "responsable_inscripto" -> "Responsable inscripto"
function formatearCondicion(condicion?: string) {
  if (!condicion) return "-";

  const texto = condicion.replace(/_/g, " ");

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// true si el tipo del sheet existe, hay sugerencia, y no coinciden
function tipoDistinto(f: Fila) {
  return Boolean(f.tipo && f.tipoSugerido && f.tipo !== f.tipoSugerido);
}

function EstadoBadge({fila}: {fila: Fila}) {
  if (fila.estado === "no_existe") {
    return <Badge variant="outline">No existe en ARCA</Badge>;
  }

  if (fila.estado === "error") {
    return <Badge variant="destructive">{fila.aviso ?? "Error"}</Badge>;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant="secondary">OK</Badge>
      {fila.aviso ? <span className="text-muted-foreground text-xs">{fila.aviso}</span> : null}
    </div>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Consultando... (puede tardar)" : "Consultar hojas elegidas"}
    </Button>
  );
}

export function SheetForm({hojas}: {hojas: HojaResumen[]}) {
  const [state, formAction] = useFormState(consultarDesdeSheet, initialState);
  const [filtro, setFiltro] = useState("todas");

  const todas = state.status === "ok" ? state.filas : [];
  const filas = filtro === "todas" ? todas : todas.filter((f) => f.hoja === filtro);

  // Hojas que realmente tienen resultados, con su cantidad de filas
  const hojasConResultados = hojas
    .map((h) => ({hoja: h.hoja, cantidad: todas.filter((f) => f.hoja === h.hoja).length}))
    .filter((h) => h.cantidad > 0);

  // Suma de las filas que se están viendo
  const suma = (campo: "total" | "honorarios" | "iva") =>
    filas.reduce((acc, f) => acc + (f[campo] ?? 0), 0);

  const diferencias = filas.filter(tipoDistinto).length;

  // Las últimas 4 columnas son Total, Honorarios, IVA y Estado
  const columnas = filtro === "todas" ? 12 : 11;
  const previas = columnas - 4;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Hojas a consultar</legend>
          {hojas.map((h) => (
            <div key={h.hoja} className="flex items-center gap-2">
              <Checkbox defaultChecked id={`hoja-${h.hoja}`} name="hojas" value={h.hoja} />
              <Label htmlFor={`hoja-${h.hoja}`}>
                {h.hoja} <span className="text-muted-foreground">({h.total} filas)</span>
              </Label>
            </div>
          ))}
        </fieldset>
        <SubmitButton />
      </form>

      {state.status === "error" && <p className="text-destructive text-sm">{state.message}</p>}

      {state.status === "ok" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por hoja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las hojas ({todas.length})</SelectItem>
                {hojasConResultados.map((h) => (
                  <SelectItem key={h.hoja} value={h.hoja}>
                    {h.hoja} ({h.cantidad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-muted-foreground text-sm">
              {filas.length} filas
              {diferencias > 0 && (
                <span className="text-destructive">
                  {" "}
                  · {diferencias} con tipo distinto al sugerido
                </span>
              )}
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {filtro === "todas" && <TableHead>Hoja</TableHead>}
                  <TableHead>Fila</TableHead>
                  <TableHead>CUIT</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Cond. IVA</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Sugerido</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Honorarios</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filas.length === 0 ? (
                  <TableRow>
                    <TableCell className="h-24 text-center" colSpan={columnas}>
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filas.map((f, i) => (
                    <TableRow key={`${f.hoja}-${f.fila}-${f.cuit}-${i}`}>
                      {filtro === "todas" && <TableCell>{f.hoja}</TableCell>}
                      <TableCell>{f.fila}</TableCell>
                      <TableCell className="font-mono">{f.cuit}</TableCell>
                      <TableCell>{f.nombre ?? "-"}</TableCell>
                      <TableCell>{f.direccion ?? "-"}</TableCell>
                      <TableCell>{formatearCondicion(f.condicion)}</TableCell>
                      <TableCell className="text-center">
                        {f.tipo ? (
                          <Badge variant={tipoDistinto(f) ? "destructive" : "secondary"}>
                            {f.tipo}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {f.tipoSugerido ? <Badge variant="outline">{f.tipoSugerido}</Badge> : "-"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatearMonto(f.total)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatearMonto(f.honorarios)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatearMonto(f.iva)}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge fila={f} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
