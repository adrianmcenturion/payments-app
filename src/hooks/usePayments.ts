import type {Payment} from "@/types";

import {useMutation, useQuery} from "@tanstack/react-query";

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

export interface NewPayment {
  socio: string;
  conceptos: string;
  valor?: number;
  "valor USD"?: number;
  vencimientos: Date | string;
}

export function useAddPayment() {
  return useMutation({
    mutationFn: async (newPayment: NewPayment) => {
      const res = await fetch("/api/add-payment", {
        method: "POST",
        body: JSON.stringify(newPayment),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();

        throw new Error(error.error || "Error al agregar el pago");
      }

      return res.json();
    },
  });
}
