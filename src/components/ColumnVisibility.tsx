"use client";

import type {Table} from "@tanstack/react-table";
import type {Payment} from "@/types";

import {ChevronDownIcon} from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {Button} from "./ui/button";

interface TableComponentProps {
  table: Table<Payment>;
}

export default function ColumnVisibilityToggle({table}: TableComponentProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="z-10 overflow-visible">
        <div>
          <Button className="ml-auto" variant="outline">
            Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-100">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              className="capitalize"
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
