"use client";

import type {SortingState, VisibilityState} from "@tanstack/react-table";
import type {DataTableProps} from "@/types";

import * as React from "react";
import {flexRender, getCoreRowModel, useReactTable, getSortedRowModel} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {Checkbox} from "./ui/checkbox";
import ScreenShotComponent from "./ScreenShotComponent";

export function DataTable<TData, TValue>({columns, data}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <div className="mx-auto flex  flex-col gap-3">
      <div className=" flex items-center justify-between gap-3 rounded-md border p-3">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <div key={column.id} className="flex flex-wrap items-center justify-between gap-1">
                <Checkbox
                  checked={column.getIsVisible()}
                  className="capitalize"
                  id="visibility"
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                />
                <label
                  className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="visibility"
                >
                  {column.id}
                </label>
              </div>
            );
          })}
      </div>
      <ScreenShotComponent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="capitalize">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="size-24 text-center" colSpan={columns.length}>
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              {table.getFooterGroups().map((footerEl) => (
                <TableRow key={footerEl.id}>
                  {footerEl.headers.map((headerEl) => {
                    return (
                      <TableCell key={headerEl.id} colSpan={headerEl.colSpan}>
                        {flexRender(headerEl.column.columnDef.footer, headerEl.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </div>
      </ScreenShotComponent>
    </div>
  );
}
