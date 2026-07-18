import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Batch Zero | ERCOT Large Load Tracker" };

export default function BatchZeroPage() {
  return (
    <ComingSoon
      title="Batch Zero explainer + tracker"
      description="What PGRR145 changed, the process stages, the LIF deadlines, and a dated changelog of ERCOT postings."
    />
  );
}
