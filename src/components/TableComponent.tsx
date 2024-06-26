import type {Payment} from "@/types";
import type {DateRange} from "react-day-picker";

import {useEffect, useState} from "react";
import {isAfter, isBefore, isEqual, isSameDay} from "date-fns";

import {columns} from "./columns";
import {DataTable} from "./data-table";
import {Toaster} from "./ui/toaster";

interface TableComponentProp {
  payments: Payment[];
  range: DateRange | undefined;
}

function TableComponent({payments, range}: TableComponentProp) {
  const [selectedDays, setSelectedDays] = useState<Payment[]>(
    payments.filter((d) => {
      if (!range) return;

      if (isSameDay(d.vencimientos, range.from!)) {
        return d;
      }
    }),
  );

  useEffect(() => {
    const handleSelectedDates = (payments: Payment[]) => {
      if (!range) return;

      if (!range.to) return;

      const filtered = payments.filter((d) => {
        return (
          (isAfter(new Date(d.vencimientos), new Date(range.from!)) ||
            isEqual(new Date(d.vencimientos), new Date(range.from!))) &&
          (isBefore(new Date(d.vencimientos), new Date(range.to!)) ||
            isEqual(new Date(d.vencimientos), new Date(range.to!)))
        );
      });

      setSelectedDays(filtered);
    };

    handleSelectedDates(payments);
  }, [range, payments]);

  return (
    <>
      <DataTable columns={columns} data={selectedDays} />

      <Toaster />
    </>
  );
}

export default TableComponent;
