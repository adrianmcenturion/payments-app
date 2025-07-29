import type {Payment} from "@/types";

import {useMemo} from "react";

import {useFilterStore} from "@/lib/store/filterStore";

export function useFilteredPayments(payments: Payment[]) {
  const selectedSocios = useFilterStore((s) => s.selectedSocios);

  return useMemo(() => {
    if (!payments) return [];

    if (selectedSocios.includes("all")) return payments;

    return payments.filter((payment) => selectedSocios.includes(payment.socio));
  }, [payments, selectedSocios]);
}
