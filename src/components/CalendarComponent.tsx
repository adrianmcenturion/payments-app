"use client";

import type {SortingState, VisibilityState} from "@tanstack/react-table";

import {type DateRange} from "react-day-picker";
import {es} from "date-fns/locale";
import {useMemo, useRef, useState} from "react";
import {endOfDay, isWithinInterval, startOfDay} from "date-fns";
import {useReactTable, getCoreRowModel, getSortedRowModel} from "@tanstack/react-table";

import {Calendar} from "@/components/ui/calendar";
import {filterPaymentsByPartner} from "@/lib/utils";
import {usePayments} from "@/hooks/usePayments";
import {useFilteredPayments} from "@/hooks/useFilteredPayments";

import TableComponent from "./TableComponent";
import {Card, CardContent} from "./ui/card";
import ColumnVisibilityToggle from "./ColumnVisibility";
import {columns} from "./columns";
import FilterWrapper from "./FilterWrapper";
import Loader from "./loader";
import ScreenshotButton from "./ScreenshotButton";

export function CalendarComponent() {
  const defaultSelected: DateRange = {from: new Date(), to: new Date()};

  const {data: paymentsData, isLoading, isError} = usePayments();
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const screenshotRef = useRef<HTMLDivElement>(null);

  const filteredBySocio = useFilteredPayments(paymentsData ?? []);
  const apaPayments = filterPaymentsByPartner("apa", filteredBySocio);
  const donPayments = filterPaymentsByPartner("don", filteredBySocio);
  const spPayments = filterPaymentsByPartner("sp", filteredBySocio);
  const dgsPayments = filterPaymentsByPartner("dgs", filteredBySocio);

  const filteredByDate = useMemo(() => {
    if (!range?.from || !range.to) return filteredBySocio;

    const start = startOfDay(range.from);
    const end = endOfDay(range.to);

    return filteredBySocio.filter((d) => {
      const date = new Date(d.vencimientos);

      return isWithinInterval(date, {start, end});
    });
  }, [filteredBySocio, range]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: filteredByDate,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      ) : null}
      {isError ? <p>Error al cargar los pagos.</p> : null}
      {paymentsData ? (
        <Card>
          <FilterWrapper>
            <ScreenshotButton targetRef={screenshotRef} />
            <ColumnVisibilityToggle table={table} />
          </FilterWrapper>
          <CardContent>
            <div className="flex w-full flex-col justify-between gap-6 xl:flex-row">
              <Calendar
                className="max-h-fit w-full rounded-md border shadow-sm xl:max-w-96"
                locale={es}
                mode="range"
                modifiers={{
                  apaPayments,
                  donPayments,
                  spPayments,
                  dgsPayments,
                }}
                selected={range}
                onSelect={setRange}
              />

              <div ref={screenshotRef} className="w-full">
                <TableComponent table={table} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
