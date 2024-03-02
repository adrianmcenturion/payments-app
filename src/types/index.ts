import type {ColumnDef} from "@tanstack/react-table";
import type {ReactNode} from "react";
import type {DayPicker} from "react-day-picker";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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

export interface CalendarProp {
  dates: Payment[];
}

export interface PartnerProp {
  socio: "apa" | "sp" | "dgs" | "don" | "all";
}

export interface Payment {
  socio: PartnerProp;
  vencimientos?: Date;
  formateada: Date;
  conceptos: string;
  valor: number | string;
  status?: "pending" | "processing" | "success" | "failed";
}
