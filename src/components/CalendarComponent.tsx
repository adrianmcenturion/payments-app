"use client";

import type {DateRange} from "react-day-picker";
import type {CalendarProp, PartnerProp, Payment} from "@/types";

import {es} from "date-fns/locale";
import {useEffect, useState} from "react";

import {Calendar} from "@/components/ui/calendar";
import {filterPaymentsByPartner} from "@/lib/utils";
import {useData} from "@/lib/DataContext";

import FilterComponent from "./FilterComponent";
import TableComponent from "./TableComponent";

export function CalendarComponent({dates}: CalendarProp) {
  const defaultSelected: DateRange = {
    from: new Date(),
  };

  const {data} = useData();
  const [payments, setPayments] = useState<Payment[]>(dates);
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);

  useEffect(() => {
    const filterPartners = (partner: PartnerProp | string) => {
      const filtered = dates.filter((d) => {
        if (partner === "all" || partner === "") return dates;
        else return d.socio === partner;
      });

      setPayments(filtered);
    };

    filterPartners(data);
  }, [data, dates]);

  const apaPayments = filterPaymentsByPartner("apa", dates);
  const donPayments = filterPaymentsByPartner("don", dates);
  const spPayments = filterPaymentsByPartner("sp", dates);
  const dgsPayments = filterPaymentsByPartner("dgs", dates);

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

      <TableComponent payments={payments} range={range} />
    </>
  );
}
