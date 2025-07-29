"use client";

import type {ReactNode} from "react";

import {CardHeader} from "./ui/card";
import FilterComponent from "./FilterComponent";

interface FilterWrapperProps {
  children?: ReactNode;
}

function FilterWrapper({children}: FilterWrapperProps) {
  return (
    <CardHeader className="overflow-visible">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <FilterComponent />
        <div className="flex items-center justify-evenly gap-2">{children}</div>
      </div>
    </CardHeader>
  );
}

export default FilterWrapper;
