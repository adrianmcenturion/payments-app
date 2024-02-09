import type {ReactNode} from "react";
import type {PartnerProp} from "@/components/columns";

import {createContext, useContext, useState} from "react";

// Definición de tipos
interface DataContextProps {
  children: ReactNode;
}

interface DataContextType {
  data: PartnerProp | string;
  setData: (data: PartnerProp | string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({children}: DataContextProps) {
  const [data, setData] = useState<PartnerProp | string>("");

  return <DataContext.Provider value={{data, setData}}>{children}</DataContext.Provider>;
}

// Hook personalizado para acceder al contexto
export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData debe ser utilizado dentro de un DataProvider");
  }

  return context;
};
