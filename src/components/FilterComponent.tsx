"use client";

import type {Socio} from "@/types";

import {useFilterStore} from "@/lib/store/filterStore";

import {Button} from "./ui/button";

const sociosOptions = ["apa", "don", "dgs", "sp"] as const;

function FilterComponent() {
  const {selectedSocios, toggleSocio, selectAllSocios} = useFilterStore();

  const getButtonClass = (socio: Socio) => {
    const isActive = selectedSocios.includes(socio);
    const base = "rounded-md px-2 py-1 uppercase transition-colors duration-200";

    if (!isActive) return `${base} bg-gray-200 text-gray-800 hover:bg-gray-300`;

    switch (socio) {
      case "apa":
        return `${base} bg-orange-500 text-white hover:bg-orange-700`;
      case "dgs":
        return `${base} bg-violet-600 text-white hover:bg-violet-700`;
      case "sp":
        return `${base} bg-pink-300 text-white hover:bg-pink-500`;
      case "don":
        return `${base} bg-blue-400 text-white hover:bg-blue-500`;
      default:
        return base;
    }
  };

  return (
    <div className="my-4 flex items-center justify-center gap-2 lg:gap-4">
      {sociosOptions.map((socio) => (
        <Button
          key={socio}
          className={getButtonClass(socio)}
          size="sm"
          onClick={() => toggleSocio(socio)}
        >
          {socio}
        </Button>
      ))}

      <Button
        className={`rounded-md px-2 py-1 text-xs uppercase transition-colors duration-200 md:text-sm ${
          selectedSocios.includes("all")
            ? "bg-primary hover:bg-primary/90 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
        size="sm"
        onClick={selectAllSocios}
      >
        Ver todos
      </Button>
    </div>
  );
}

export default FilterComponent;
