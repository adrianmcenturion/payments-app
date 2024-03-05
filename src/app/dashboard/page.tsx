import {redirect} from "next/navigation";

import {getPayments} from "@/lib/gsheets";
import CalendarWrapper from "@/components/CalendarComponent.client";
import readUserSession from "@/lib/actions";
import {publicPaths} from "@/lib/utils";

export default async function PrivatePage() {
  const {data} = await readUserSession();

  console.log(data);

  if (!data.session) {
    return redirect(publicPaths.login);
  }

  const dates = await getPayments();

  return (
    <div className=" mx-auto max-w-2xl ">
      <CalendarWrapper dates={dates} />
    </div>
  );
}
