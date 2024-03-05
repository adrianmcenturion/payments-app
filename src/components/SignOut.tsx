import {redirect} from "next/navigation";

import createSupabaseServerClient from "@/lib/supabase/server";

import {Button} from "./ui/button";

export default function SignOut() {
  const Logout = async () => {
    "use server";
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();

    redirect("/");
  };

  return (
    <form action={Logout}>
      <Button size="sm">Cerrar sesión</Button>
    </form>
  );
}
