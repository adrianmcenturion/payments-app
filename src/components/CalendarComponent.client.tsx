"use client";

import type {Payment} from "./columns";

import {DataProvider} from "@/lib/DataContext";

import {CalendarComponent} from "./CalendarComponent";

interface CalendarProp {
  dates: Payment[];
}

function CalendarWrapper({dates}: CalendarProp) {
  return (
    <DataProvider>
      <CalendarComponent dates={dates} />
    </DataProvider>
  );
}

export default CalendarWrapper;
