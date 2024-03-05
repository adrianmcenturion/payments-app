import {redirect} from "next/navigation";

import readUserSession from "@/lib/actions";

import SignInForm from "./login/components/SignInForm";

export default async function Home() {
  const {data} = await readUserSession();

  if (data.session) {
    return redirect("/dashboard");
  }

  return <SignInForm />;
}
