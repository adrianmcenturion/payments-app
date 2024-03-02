import type {DataContextProps, DataContextType, PartnerProp} from "@/types";

import {createContext, useContext, useState} from "react";

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({children}: DataContextProps) {
  const [data, setData] = useState<PartnerProp | string>("");

  return <DataContext.Provider value={{data, setData}}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData debe ser utilizado dentro de un DataProvider");
  }

  return context;
};
