import {getPayments} from "@/lib/gsheets";
import CalendarWrapper from "@/components/CalendarComponent.client";
import {SwitchTheme} from "@/components/Switch";

export default async function Home() {
  const dates = await getPayments();

  return (
    <div className=" mx-auto max-w-2xl ">
      <div className="flex items-center justify-between gap-3">
        <header className="text-center text-xl font-bold leading-[4rem]">Control de pagos</header>
        <SwitchTheme />
      </div>
      <CalendarWrapper dates={dates} />
    </div>
  );
}
