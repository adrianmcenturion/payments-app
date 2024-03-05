import {redirect} from "next/navigation";

import readUserSession from "@/lib/actions";
import {privatePaths} from "@/lib/utils";

import SignInForm from "./components/SignInForm";

export default async function Login() {
  const {data} = await readUserSession();

  if (data.session) {
    return redirect(privatePaths.dashboard);
  }

  return <SignInForm />;
}
