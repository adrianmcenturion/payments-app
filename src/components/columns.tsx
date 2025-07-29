"use client";

import type {ColumnDef} from "@tanstack/react-table";
import type {Payment} from "@/types";

import {format} from "date-fns";
import {ArrowUpDown} from "lucide-react";

import {Badge} from "@/components/ui/badge";

import {Button} from "./ui/button";

export const columns: ColumnDef<Payment>[] = [
  {
    id: "socio",
    accessorKey: "socio",
    header: "Socio",
    enableHiding: true,
    cell: ({row}) => {
      const partner: string = row.getValue("socio");

      return (
        <Badge
          className={`${
            partner === "sp"
              ? "sp"
              : partner === "apa"
                ? "apa"
                : partner === "dgs"
                  ? "dgs"
                  : partner === "don"
                    ? "don"
                    : ""
          } pointer-events-none font-bold uppercase`}
        >
          {partner}
        </Badge>
      );
    },
  },
  {
    id: "vencimientos",
    accessorKey: "vencimientos",
    enableHiding: true,
    header: ({column}) => {
      return (
        <div className="m-0 flex items-center justify-start p-0">
          <Button
            className="m-0 p-0"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Vto.
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({row}) => {
      const vencimiento = format(new Date(row.getValue("vencimientos")), "dd-MM");

      return <div className="ml-6 text-left font-medium">{String(vencimiento)}</div>;
    },
  },
  {
    id: "conceptos",
    accessorKey: "conceptos",
    enableHiding: true,
    header: () => {
      return <div className="text-left">Concepto</div>;
    },
    cell: ({row}) => {
      return <div className="text-left font-medium">{row.original.conceptos}</div>;
    },
  },
  {
    id: "total",
    footer: () => {
      return <div className="text-center">Total:</div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "valorARS",
    accessorKey: "valorARS",
    enableHiding: true,
    header: () => {
      return <div className="text-end">Valor ARS</div>;
    },
    cell: ({row}) => {
      const value: string = row.getValue("valorARS");

      const payment: string | number = isNaN(parseFloat(value))
        ? String(row.getValue("valorARS"))
        : parseFloat(value.replace(/\./g, "").replace(",", ".")).toLocaleString("es-AR", {
            currency: "ARS",
            style: "currency",
            maximumFractionDigits: 2,
          });

      return <div className="text-end font-medium">{payment ? payment : "-"}</div>;
    },
    footer: ({table}) => {
      const sum = table.getFilteredRowModel().rows.reduce((acc, row, index) => {
        const value: string = row.getValue("valorARS");
        const payment: string | number = parseFloat(value.replace(/\./g, "").replace(",", "."));

        return isNaN(payment) || (index === 0 && isNaN(payment)) ? acc : acc + payment;
      }, 0);

      return (
        <div className="text-end">
          {sum.toLocaleString("es-AR", {
            currency: "ARS",
            style: "currency",
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    id: "valorUSD",
    accessorKey: "valorUSD",
    enableHiding: true,
    header: () => {
      return <div className="text-end">Valor USD</div>;
    },
    cell: ({row}) => {
      const value: string = row.getValue("valorUSD");

      const payment: string | number = isNaN(parseFloat(value))
        ? String(row.getValue("valorUSD"))
        : parseFloat(value.replace(/\./g, "").replace(",", ".")).toLocaleString("es-AR", {
            currency: "USD",
            style: "currency",
            maximumFractionDigits: 2,
          });

      return <div className="text-end font-medium">{payment ? payment : "-"}</div>;
    },
    footer: ({table}) => {
      const sum = table.getFilteredRowModel().rows.reduce((acc, row, index) => {
        const value: string = row.getValue("valorUSD");
        const payment: string | number = parseFloat(value.replace(/\./g, "").replace(",", "."));

        return isNaN(payment) || (index === 0 && isNaN(payment)) ? acc : acc + payment;
      }, 0);

      return (
        <div className="text-end">
          {sum.toLocaleString("es-AR", {
            currency: "USD",
            style: "currency",
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
];
