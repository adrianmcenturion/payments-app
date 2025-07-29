import type {Socio} from "@/types";

import {create} from "zustand";

interface FilterState {
  selectedSocios: Socio[];
  toggleSocio: (socio: Socio) => void;
  selectAllSocios: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedSocios: ["all"],
  toggleSocio: (socio) =>
    set((state) => {
      const allSocios: Socio[] = ["apa", "don", "dgs", "sp"];

      if (socio === "all") {
        return {selectedSocios: ["all"]};
      }

      const current = state.selectedSocios.includes("all") ? [] : state.selectedSocios;

      const isSelected = current.includes(socio);
      const newSelected = isSelected ? current.filter((s) => s !== socio) : [...current, socio];

      if (newSelected.length === 0) {
        return {selectedSocios: ["all"]};
      }

      const allSelected =
        newSelected.length === allSocios.length && allSocios.every((s) => newSelected.includes(s));

      return {
        selectedSocios: allSelected ? ["all"] : newSelected,
      };
    }),
  selectAllSocios: () => set({selectedSocios: ["all"]}),
}));
