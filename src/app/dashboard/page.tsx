import {redirect} from "next/navigation";

import readUserSession from "@/lib/actions";
import {publicPaths} from "@/lib/utils";
import {CalendarComponent} from "@/components/CalendarComponent";

export default async function PrivatePage() {
  const {data} = await readUserSession();

  if (!data.session) {
    return redirect(publicPaths.login);
  }

  return (
    <div className="max-w-5xlxl mx-auto">
      <CalendarComponent />
    </div>
  );
}
