import type {ColumnDef, Table} from "@tanstack/react-table";
import type {ReactNode} from "react";
import type {DayPicker} from "react-day-picker";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  table: Table<TData>;
}

export interface DataContextProps {
  children: ReactNode;
}

export interface DataContextType {
  data: PartnerProp | string;
  setData: (data: PartnerProp | string) => void;
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export interface CalendarProp {
  dates: Payment[];
}

export interface PartnerProp {
  socio: "apa" | "sp" | "dgs" | "don" | "all";
}

export type Socio = "apa" | "don" | "dgs" | "sp" | "all";

export interface Payment {
  socio: Socio;
  vencimientosSinFormato?: Date;
  vencimientos: Date;
  conceptos: string;
  valorARS: number | string;
  valorUSD?: number | string;
  status?: "pending" | "processing" | "success" | "failed";
}
