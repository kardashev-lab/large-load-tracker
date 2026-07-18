export type TimelineEntry = {
  date: string; // ISO date or "2027 Q2" style for approximate dates
  title: string;
  detail: string;
  status: "done" | "upcoming" | "unconfirmed";
  sourceUrl?: string;
  sourceLabel?: string;
};

export const TIMELINE: TimelineEntry[] = [
  {
    date: "2025 (signed, effective immediately)",
    title: "Senate Bill 6 signed into law",
    detail:
      "Tells the PUCT to set new interconnection rules and cost-sharing for large loads (75+ MW at one site), new rules for loads paired with existing power plants, and curtailment programs. This is the law Batch Zero is built on.",
    status: "done",
    sourceUrl: "https://www.weil.com/-/media/files/pdfs/2025/july/weil-energy-alert--senate-bill-6-reforms-interconnection-and-colocation-rules-for-data-centers-and-o.pdf",
    sourceLabel: "Weil Gotshal & Manges energy alert, July 29, 2025",
  },
  {
    date: "2026-03-04",
    title: "ERCOT files PGRR145 + NPRR1325",
    detail: "Two rule changes. One covers the study process, the other covers market rules. Together they set up Batch Zero.",
    status: "done",
    sourceUrl: "https://www.ercot.com/mktrules/issues/PGRR145",
    sourceLabel: "ERCOT PGRR145 issue page",
  },
  {
    date: "2026-06-02",
    title: "Committee and Board adopt the rules",
    detail: "ERCOT's Technical Advisory Committee voted yes, unanimously. The Board adopted the rules the same day.",
    status: "done",
  },
  {
    date: "2026-06-18",
    title: "PUCT approves. Rules become final",
    detail: "The Public Utility Commission of Texas signed off. Batch Zero is now official.",
    status: "done",
    sourceUrl: "https://www.ercot.com/files/docs/2026/06/18/ERCOT-Trending-Topic-New-Batch-Connection-Process-for-Large-Electricity-Users.pdf",
    sourceLabel: "ERCOT Trending Topics, June 18, 2026",
  },
  {
    date: "2026-07-10",
    title: "Batch Zero submission deadline",
    detail:
      "Last day to submit your paperwork if you want in on Batch Zero. That includes the Load Information Form, attestations, and load models. This date comes straight from ERCOT.",
    status: "done",
    sourceUrl: "https://www.ercot.com/files/docs/2026/06/18/ERCOT-Trending-Topic-New-Batch-Connection-Process-for-Large-Electricity-Users.pdf",
    sourceLabel: "ERCOT Trending Topics, June 18, 2026",
  },
  {
    date: "2026-07-24 (reported, not confirmed by us)",
    title: "TSP/DSP submission deadline (secondary source)",
    detail:
      "Some industry coverage reports a July 24 deadline for the utility to finish and submit your paperwork to ERCOT. We couldn't find this date in ERCOT's own materials, so treat it as reported, not confirmed.",
    status: "unconfirmed",
    sourceUrl: "https://www.zeroemissiongrid.com/iso-rto-meeting-summaries/batch-zero-readiness-06-11-26/",
    sourceLabel: "ZeroEmissionGrid meeting summary, June 11, 2026",
  },
  {
    date: "2026-08-07",
    title: "ERCOT notifies classification",
    detail: "ERCOT tells each applicant whether it's Base Load, Studied Load, or Excluded.",
    status: "upcoming",
    sourceUrl: "https://www.ercot.com/files/docs/2026/06/18/ERCOT-Trending-Topic-New-Batch-Connection-Process-for-Large-Electricity-Users.pdf",
    sourceLabel: "ERCOT Trending Topics, June 18, 2026",
  },
  {
    date: "2027 spring",
    title: "Allocations provided",
    detail: "ERCOT tells each Batch Zero project how much power it can reliably get.",
    status: "upcoming",
  },
  {
    date: "2027 Q2",
    title: "Developer commitment deadline",
    detail: "Developers in Batch Zero have to put up financial security and prove they control the site, likely by June 2027.",
    status: "upcoming",
  },
  {
    date: "2027 fall",
    title: "Final transmission plan published",
    detail: "ERCOT publishes the final plan: who gets what power, and what grid upgrades are needed.",
    status: "upcoming",
  },
  {
    date: "2027 summer",
    title: "Batch 1 applications open",
    detail: "The next round opens for projects that missed or didn't qualify for Batch Zero.",
    status: "upcoming",
  },
];

export const CLASSIFICATIONS = [
  {
    name: "Base Load",
    description:
      "Projects that already finished a prior interconnection study, or are already part of an approved regional study. Whatever capacity that earlier work earned them mostly carries over.",
  },
  {
    name: "Studied Load",
    description:
      "Projects with some study work done, but no locked-in allocation yet. The system-wide Batch Zero study decides what they get: full, partial, or a wait for a later batch.",
  },
  {
    name: "Excluded Load",
    description: "Projects that don't qualify as either have to wait for the next batch study, opening summer 2027.",
  },
];

export const PATHWAYS = [
  {
    name: "WLPUN, Withdrawal-Limited Private Use Network",
    description:
      "For loads bringing their own on-site power, like gas turbines or solar. That on-site generation reduces how much you need from the grid, so it's easier to connect at a higher level.",
  },
  {
    name: "PCLR, Provisional Controllable Load Resource",
    description:
      "For loads willing to let ERCOT dial down their power use when the local grid is under stress. In return, they can get access to the grid sooner, before a full transmission buildout finishes.",
  },
];
