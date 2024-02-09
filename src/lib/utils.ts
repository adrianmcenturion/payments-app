import type {PartnerProp, Payment} from "@/components/columns";

import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const filterPaymentsByPartner = (partner: PartnerProp | string, dates: Payment[]) => {
  return dates.filter((d) => d.socio === partner).map((d) => new Date(d.formateada));
};
