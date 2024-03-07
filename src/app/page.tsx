import {redirect} from "next/navigation";

import readUserSession from "@/lib/actions";
import {privatePaths, publicPaths} from "@/lib/utils";

export default async function Home() {
  const {data} = await readUserSession();

  !data.session ? redirect(publicPaths.login) : redirect(privatePaths.dashboard);

  return (
    <h2 className="text-center">Necesitas iniciar sesión para poder ver el calendario de pagos.</h2>
  );
}
