"use client";

import type {CalendarProp} from "@/types";

import {DataProvider} from "@/lib/DataContext";

import {CalendarComponent} from "./CalendarComponent";

function CalendarWrapper({dates}: CalendarProp) {
  return (
    <DataProvider>
      <CalendarComponent dates={dates} />
    </DataProvider>
  );
}

export default CalendarWrapper;
