import {getPayments} from "@/lib/gsheets";
import CalendarWrapper from "@/components/CalendarComponent.client";

export default async function Home() {
  const dates = await getPayments();

  return (
    <div className="container mx-auto max-w-5xl py-10">
      <CalendarWrapper dates={dates} />
    </div>
  );
}
