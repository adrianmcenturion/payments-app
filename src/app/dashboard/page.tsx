import {redirect} from "next/navigation";

import {getPayments} from "@/lib/gsheets";
import CalendarWrapper from "@/components/CalendarComponent.client";
import readUserSession from "@/lib/actions";

export default async function PrivatePage() {
  const {data} = await readUserSession();

  if (!data.session) {
    return redirect("/");
  }

  const dates = await getPayments();

  return (
    <div className=" mx-auto max-w-2xl ">
      <CalendarWrapper dates={dates} />
    </div>
  );
}
