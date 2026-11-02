import { NextResponse } from "next/server";
import { todayInBerlin } from "@/lib/date-poll";
import { runLifecycleJob } from "@/services/lifecycle-job-service";

export const dynamic = "force-dynamic";

// Vercel Cron (see vercel.json) calls this daily with
// `Authorization: Bearer ${CRON_SECRET}`. Without a configured secret the
// route stays closed.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runLifecycleJob(todayInBerlin());
  return NextResponse.json(result);
}
