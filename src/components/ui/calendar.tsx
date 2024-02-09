"use client";

import type {DayProps} from "react-day-picker";

import * as React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button, DayPicker, useDayRender} from "react-day-picker";

import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function IconLeft({...props}) {
  return <ChevronLeft className="h-8 w-8" />;
}
function IconRight({...props}) {
  return <ChevronRight className="h-8 w-8" />;
}

function renderFlag(active: boolean, flag: string) {
  return <span className={`${active ? flag + " flag" : "hidden"}`} />;
}

function CustomDay(props: DayProps): JSX.Element {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);

  if (dayRender.isHidden) {
    return <div role="gridcell" />;
  }
  if (!dayRender.isButton) {
    return <div {...dayRender.divProps} />;
  }

  return (
    <Button ref={buttonRef} name="day" {...dayRender.buttonProps}>
      <div
        className={`relative m-0 flex h-full w-full items-center justify-center overflow-hidden ${
          dayRender.activeModifiers.apaPayments ||
          dayRender.activeModifiers.donPayments ||
          dayRender.activeModifiers.spPayments ||
          dayRender.activeModifiers.dgsPayments
            ? "rounded-lg border-2 border-solid p-0"
            : ""
        }`}
      >
        <div className="absolute top-0 flex items-start overflow-hidden">
          {renderFlag(dayRender.activeModifiers.apaPayments, "apa")}
          {renderFlag(dayRender.activeModifiers.donPayments, "don")}
          {renderFlag(dayRender.activeModifiers.spPayments, "sp")}
          {renderFlag(dayRender.activeModifiers.dgsPayments, "dgs")}
        </div>
        {dayRender.buttonProps.children}
      </div>
    </Button>
  );
}

function Calendar({className, classNames, showOutsideDays = true, ...props}: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-8 sm:space-x-8 sm:space-y-0 uppercase",
        month: "space-y-8",
        tfoot: "border-t-2",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({variant: "outline"}),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex border-b-2 py-2 border-solid",
        head_cell: "text-muted-foreground rounded-md w-9 lg:w-20  font-normal text-[0.8rem] ",
        row: "flex w-full mt-2 ",
        cell: "h-9  w-9 lg:w-20 lg:h-20  text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-9",
        day: cn(
          buttonVariants({variant: "ghost"}),
          "h-9  w-9 lg:w-20 lg:h-20 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        day_today: "bg-primary text-primary-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: IconLeft,
        IconRight: IconRight,
        Day: CustomDay,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export {Calendar};
