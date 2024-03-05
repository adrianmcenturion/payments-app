import {redirect} from "next/navigation";

import readUserSession from "@/lib/actions";
import {publicPaths} from "@/lib/utils";

export default async function Home() {
  const {data} = await readUserSession();

  if (!data.session) {
    return redirect(publicPaths.login);
  }

  return (
    <h2 className="text-center">Necesitas iniciar sesión para poder ver el calendario de pagos.</h2>
  );
}
