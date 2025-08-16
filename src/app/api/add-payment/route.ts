import type {NewPayment} from "@/hooks/usePayments";

import {NextResponse} from "next/server";

import {addPayments} from "@/lib/gsheets";

export const POST = async (req: Request) => {
  try {
    const body: NewPayment = (await req.json()) as NewPayment;

    const vencimientos =
      typeof body.vencimientos === "string"
        ? body.vencimientos
        : body.vencimientos instanceof Date
          ? body.vencimientos.toISOString()
          : "";

    const payment = await addPayments({
      ...body,
      vencimientos,
    });

    return NextResponse.json(payment, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Error agregando el pago"}, {status: 500});
  }
};
