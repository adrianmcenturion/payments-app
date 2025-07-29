import type {Payment} from "@/types";

import {useQuery} from "@tanstack/react-query";

const getPayments = async (): Promise<Payment[]> => {
  const res = await fetch("/api/payments");

  if (!res.ok) {
    throw new Error("Error al cargar los pagos");
  }

  const data = (await res.json()) as Payment[];

  return data;
};

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      return getPayments();
    },
  });
}
