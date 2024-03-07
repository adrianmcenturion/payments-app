"use client";

import type {DateRange} from "react-day-picker";
import type {CalendarProp, PartnerProp, Payment} from "@/types";

import {es} from "date-fns/locale";
import {isAfter, isBefore, isEqual, isSameDay} from "date-fns";
import {useEffect, useState} from "react";

import {Calendar} from "@/components/ui/calendar";
import {filterPaymentsByPartner} from "@/lib/utils";
import {useData} from "@/lib/DataContext";

import {columns} from "./columns";
import {DataTable} from "./data-table";
import FilterComponent from "./FilterComponent";
import {Toaster} from "./ui/toaster";
import ScreenShotComponent from "./ScreenShotComponent";

export function CalendarComponent({dates}: CalendarProp) {
  const defaultSelected: DateRange = {
    from: new Date(),
    // to: new Date(),
  };

  const {data} = useData();

  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const [selectedDays, setSelectedDays] = useState<Payment[]>(dates);
  const [filterDates, setFilterDates] = useState<Payment[]>(selectedDays);

  useEffect(() => {
    const handleSelectedDates = (filterDates: Payment[]) => {
      if (!range) return;
      // if (!range.to) return;

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

    handleSelectedDates(filterDates);
  }, [range, filterDates]);

  useEffect(() => {
    const filterPartners = (partner: PartnerProp | string) => {
      const filtered = dates.filter((d) => {
        if (partner === "all" || partner === "") return dates;
        else return d.socio === partner;
      });

      setFilterDates(filtered);
    };

    filterPartners(data);
  }, [data, dates]);

  const apaPayments = filterPaymentsByPartner("apa", filterDates);
  const donPayments = filterPaymentsByPartner("don", filterDates);
  const spPayments = filterPaymentsByPartner("sp", filterDates);
  const dgsPayments = filterPaymentsByPartner("dgs", filterDates);

  console.log("dates ", dates);
  console.log("selectedDays ", selectedDays);

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

      <ScreenShotComponent>
        <DataTable columns={columns} data={selectedDays} />
      </ScreenShotComponent>
      <Toaster />
    </>
  );
}
