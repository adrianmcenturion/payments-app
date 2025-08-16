import type {Payment} from "@/types";
import type {Table} from "@tanstack/react-table";

import {DataTable} from "./data-table";

interface TableComponentProps {
  table: Table<Payment>;
}

function TableComponent({table}: TableComponentProps) {
  return (
    <div className="w-full">
      <DataTable columns={table.options.columns} data={table.options.data} table={table} />
    </div>
  );
}

export default TableComponent;
