import type {NewPayment, Payment} from "@/types";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

const getPayments = async (): Promise<Payment[]> => {
  const res = await fetch("/api/payments", {cache: "no-store"});

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

export function useAddPayment() {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["payments"]});
    },
  });
}
