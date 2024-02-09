"use clinet";

import React from "react";

import {useData} from "@/lib/DataContext";

import {Button} from "./ui/button";

function FilterComponent() {
  const {setData} = useData();

  const handleClick = (value: string) => {
    setData(value);
  };

  const renderButton = (value: string, className: string, label: string) => (
    <Button
      className={`uppercase hover:opacity-80 focus:border-[1px] focus:border-primary ${className}`}
      value={value}
      onClick={() => handleClick(value)}
    >
      {label}
    </Button>
  );

  return (
    <div className="my-4 flex items-center justify-center gap-6">
      {renderButton("apa", "apa hover:bg-orange-500", "apa")}
      {renderButton("sp", "sp hover:bg-pink-300", "sp")}
      {renderButton("dgs", "dgs hover:bg-violet-500", "dgs")}
      {renderButton("don", "don hover:bg-blue-500", "don")}
      {renderButton("all", "bg-primary", "Ver todos")}
    </div>
  );
}

export default FilterComponent;
