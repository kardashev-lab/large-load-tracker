export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { fetchLargeLoadHistory } from "@/lib/api";

export default async function ReportRedirect() {
  const history = await fetchLargeLoadHistory();
  const latest = [...history].sort((a, b) => a.snapshot_month.localeCompare(b.snapshot_month)).pop();
  const month = latest ? latest.snapshot_month.slice(0, 7) : new Date().toISOString().slice(0, 7);
  redirect(`/report/${month}`);
}
