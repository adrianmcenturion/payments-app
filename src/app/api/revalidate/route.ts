import {revalidateTag} from "next/cache";

export async function GET() {
  revalidateTag("payments");

  return Response.json({revalidated: true});
}
