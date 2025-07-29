import type {Payment} from "@/types";
import type {Table} from "@tanstack/react-table";

import {DataTable} from "./data-table";
import {Toaster} from "./ui/toaster";

interface TableComponentProps {
  table: Table<Payment>;
}

function TableComponent({table}: TableComponentProps) {
  return (
    <div className="w-full">
      <DataTable columns={table.options.columns} data={table.options.data} table={table} />
      <Toaster />
    </div>
  );
}

export default TableComponent;
