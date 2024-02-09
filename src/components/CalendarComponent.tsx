"use client";

import type {DateRange} from "react-day-picker";
import type {PartnerProp} from "./columns";

import * as React from "react";
import {es} from "date-fns/locale";
import {isAfter, isBefore, isEqual} from "date-fns";

import {Calendar} from "@/components/ui/calendar";
import {filterPaymentsByPartner} from "@/lib/utils";
import {useData} from "@/lib/DataContext";

import {columns, type Payment} from "./columns";
import {DataTable} from "./data-table";
import FilterComponent from "./FilterComponent";

interface CalendarProp {
  dates: Payment[];
}

export function CalendarComponent({dates}: CalendarProp) {
  const defaultSelected: DateRange = {
    from: new Date(),
    to: new Date(),
  };

  const {data} = useData();

  const [range, setRange] = React.useState<DateRange | undefined>(defaultSelected);
  const [selectedDays, setSelectedDays] = React.useState<Payment[]>([]);

  const [filterDates, setFilterDates] = React.useState<Payment[]>(selectedDays);

  const handleSelectedDates = (filterDates: Payment[]) => {
    if (!range) return;

    const filtered = filterDates.filter((d) => {
      return (
        (isAfter(new Date(d.formateada), new Date(range.from!)) ||
          isEqual(new Date(d.formateada), new Date(range.from!))) &&
        (isBefore(new Date(d.formateada), new Date(range.to!)) ||
          isEqual(new Date(d.formateada), new Date(range.to!)))
      );
    });

    setSelectedDays(filtered);
  };

  const filterPartners = (partner: PartnerProp | string) => {
    const filtered = dates.filter((d) => {
      if (partner === "all" || partner === "") return dates;
      else return d.socio === partner;
    });

    setFilterDates(filtered);
  };

  React.useEffect(() => {
    const filteredPartner = () => {
      filterPartners(data);
    };

    filteredPartner();
  }, [data]);

  React.useEffect(() => {
    const filteredDates = () => {
      handleSelectedDates(filterDates);
    };

    filteredDates();
  }, [range, filterDates]);

  const apaPayments = filterPaymentsByPartner("apa", filterDates);
  const donPayments = filterPaymentsByPartner("don", filterDates);
  const spPayments = filterPaymentsByPartner("sp", filterDates);
  const dgsPayments = filterPaymentsByPartner("dgs", filterDates);

  console.log("selectedDays ", selectedDays);

  console.log("range ", range);

  return (
    <>
      <Calendar
        className="mx-auto mb-6 w-fit rounded-md border shadow"
        locale={es}
        mode="range"
        modifiers={{
          apaPayments: apaPayments,
          donPayments: donPayments,
          spPayments: spPayments,
          dgsPayments: dgsPayments,
        }}
        selected={range}
        onSelect={setRange}
      />
      <FilterComponent />
      <DataTable columns={columns} data={selectedDays} />
    </>
  );
}
