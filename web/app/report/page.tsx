import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Report | ERCOT Large Load Tracker" };

export default function ReportPage() {
  return (
    <ComingSoon
      title="State of ERCOT Large Load"
      description="Auto-generated monthly summary: what changed this month, notable status movements, and the updated reality-gap number. Permalinked per month."
    />
  );
}
