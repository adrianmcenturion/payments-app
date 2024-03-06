"use client";

import type {DateRange} from "react-day-picker";
import type {CalendarProp, PartnerProp, Payment} from "@/types";

import {es} from "date-fns/locale";
import {isAfter, isBefore, isEqual, isSameDay} from "date-fns";
import {toPng} from "html-to-image";
import {useCallback, useEffect, useRef, useState} from "react";
import {useTheme} from "next-themes";

import {Calendar} from "@/components/ui/calendar";
import {filterPaymentsByPartner} from "@/lib/utils";
import {useData} from "@/lib/DataContext";

import {columns} from "./columns";
import {DataTable} from "./data-table";
import FilterComponent from "./FilterComponent";
import {Button} from "./ui/button";
import {Toaster} from "./ui/toaster";
import {useToast} from "./ui/use-toast";

export function CalendarComponent({dates}: CalendarProp) {
  const defaultSelected: DateRange = {
    from: new Date(),
  };

  const {toast} = useToast();
  const {theme} = useTheme();
  const {data} = useData();
  const ref = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const [selectedDays, setSelectedDays] = useState<Payment[]>(() => {
    const currentDate = new Date();

    return dates.filter((d) => isSameDay(new Date(d.formateada), currentDate));
  });
  const [filterDates, setFilterDates] = useState<Payment[]>(selectedDays);

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

  useEffect(() => {
    const handleSelectedDates = (filterDates: Payment[]) => {
      if (!range) return;
      if (!range.to) return;

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
    const filteredPartner = () => {
      filterPartners(data);
    };

    filteredPartner();
  }, [data]);

  const apaPayments = filterPaymentsByPartner("apa", filterDates);
  const donPayments = filterPaymentsByPartner("don", filterDates);
  const spPayments = filterPaymentsByPartner("sp", filterDates);
  const dgsPayments = filterPaymentsByPartner("dgs", filterDates);

  const changeBgColor =
    theme === "dark" ? {backgroundColor: "transparent"} : {backgroundColor: "white"};

  const handleScreenshot = useCallback(() => {
    if (ref.current === null) {
      return;
    }

    toPng(ref.current, {
      cacheBust: true,
      style: changeBgColor,
    })
      .then(async (dataUrl) => {
        const resp = await fetch(dataUrl);
        const blob = await resp.blob();
        const img = [new ClipboardItem({"image/png": blob})];

        await navigator.clipboard.write(img);
        toast({
          title: "Pantalla capturada",
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [ref, theme]);

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

      <Button className="mb-3" variant="outline" onClick={handleScreenshot}>
        Capturar pantalla
      </Button>
      <div ref={ref} className="">
        <DataTable columns={columns} data={selectedDays} />
      </div>
      <Toaster />
    </>
  );
}
