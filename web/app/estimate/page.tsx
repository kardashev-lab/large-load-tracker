import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Estimate | ERCOT Large Load Tracker" };

export default function EstimatePage() {
  return (
    <ComingSoon
      title="Ahead of you in line"
      description="Enter a zone, MW, and load type to see current queue depth, historical throughput, and measured timelines for projects of that profile. Descriptive arithmetic from published data, not a forecast."
    />
  );
}
