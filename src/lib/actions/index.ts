"use server";

import createSupabaseServerClient from "../supabase/server";

export default async function readUserSession() {
  const supabase = await createSupabaseServerClient();

  return supabase.auth.getSession();
}

export async function refreshUserSession() {
  const supabase = await createSupabaseServerClient();
  const session = await supabase.auth.getSession();
  const refreshToken = session.data.session;

  if (!refreshToken) return;

  return supabase.auth.refreshSession(refreshToken);
}
