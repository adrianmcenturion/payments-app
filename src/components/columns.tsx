"use client";

import type {ColumnDef} from "@tanstack/react-table";
import type {Payment} from "@/types";

import {format} from "date-fns";
import {ArrowUpDown} from "lucide-react";

import {Badge} from "@/components/ui/badge";

import {Button} from "./ui/button";

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "socio",
    header: "Socio",
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
          } font-bold uppercase`}
        >
          {partner}
        </Badge>
      );
    },
    footer: () => <div className="ml-1 text-left">Total: </div>,
  },
  {
    accessorKey: "vencimientos",
    header: ({column}) => {
      return (
        <Button
          className=""
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vto.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
      const vencimiento = format(new Date(row.getValue("vencimientos")), "dd-MM");

      return <div className="pl-6 font-medium">{String(vencimiento)}</div>;
    },
  },
  {
    accessorKey: "conceptos",
    header: "Concepto",
  },
  {
    accessorKey: "valorARS",
    header: () => {
      return <div className="text-center">Valor ARS</div>;
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

      return <div className="text-center font-medium">{payment ? payment : "-"}</div>;
    },
    footer: ({table}) => {
      const sum = table.getFilteredRowModel().rows.reduce((acc, row, index) => {
        const value: string = row.getValue("valorARS");
        const payment: string | number = parseFloat(value.replace(/\./g, "").replace(",", "."));

        return isNaN(payment) || (index === 0 && isNaN(payment)) ? acc : acc + payment;
      }, 0);

      return (
        <div className="ml-3 text-center">
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
    accessorKey: "valorUSD",
    header: () => {
      return <div className="text-center">Valor USD</div>;
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

      return <div className="ml-3 text-center font-medium">{payment ? payment : "-"}</div>;
    },
    footer: ({table}) => {
      const sum = table.getFilteredRowModel().rows.reduce((acc, row, index) => {
        const value: string = row.getValue("valorUSD");
        const payment: string | number = parseFloat(value.replace(/\./g, "").replace(",", "."));

        return isNaN(payment) || (index === 0 && isNaN(payment)) ? acc : acc + payment;
      }, 0);

      return (
        <div className="ml-3 text-center">
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
