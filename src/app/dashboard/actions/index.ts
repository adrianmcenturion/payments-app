"use server";

import {revalidateTag} from "next/cache";

import {getPayments} from "@/lib/gsheets";

export default async function submit() {
  await getPayments();
  revalidateTag("payments");
}
