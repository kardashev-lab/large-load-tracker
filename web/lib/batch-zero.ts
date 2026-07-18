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
      "Directs the PUCT to set new ERCOT interconnection standards and cost-sharing rules for large loads (75+ MW single-site demand), new co-location rules for loads paired with existing generation, and mandatory/voluntary curtailment programs. This is the statutory basis Batch Zero implements.",
    status: "done",
    sourceUrl: "https://www.weil.com/-/media/files/pdfs/2025/july/weil-energy-alert--senate-bill-6-reforms-interconnection-and-colocation-rules-for-data-centers-and-o.pdf",
    sourceLabel: "Weil Gotshal & Manges energy alert, July 29, 2025",
  },
  {
    date: "2026-03-04",
    title: "ERCOT files PGRR145 + NPRR1325",
    detail:
      "Planning Guide Revision Request 145 (study process) and the companion Nodal Protocol Revision Request 1325 (market rules) formally propose the Batch Zero framework.",
    status: "done",
    sourceUrl: "https://www.ercot.com/mktrules/issues/PGRR145",
    sourceLabel: "ERCOT PGRR145 issue page",
  },
  {
    date: "2026-06-02",
    title: "Technical Advisory Committee + Board adopt the rules",
    detail: "TAC unanimously recommended PGRR145/NPRR1325; ERCOT's Board of Directors adopted them the same day.",
    status: "done",
  },
  {
    date: "2026-06-18",
    title: "PUCT approves — rules become final",
    detail: "The Public Utility Commission of Texas approved the revision requests, finalizing the Batch Zero framework.",
    status: "done",
    sourceUrl: "https://www.ercot.com/files/docs/2026/06/18/ERCOT-Trending-Topic-New-Batch-Connection-Process-for-Large-Electricity-Users.pdf",
    sourceLabel: "ERCOT Trending Topics, June 18, 2026",
  },
  {
    date: "2026-07-10",
    title: "Batch Zero submission deadline",
    detail:
      "Deadline for projects wanting to be part of Batch Zero to submit required technical studies and documentation (the Load Information Form, attestations, dynamic load models). This is ERCOT's own stated deadline in its June 18 Trending Topic.",
    status: "done",
    sourceUrl: "https://www.ercot.com/files/docs/2026/06/18/ERCOT-Trending-Topic-New-Batch-Connection-Process-for-Large-Electricity-Users.pdf",
    sourceLabel: "ERCOT Trending Topics, June 18, 2026",
  },
  {
    date: "2026-07-24 (reported, not independently confirmed)",
    title: "TSP/DSP submission deadline (secondary source)",
    detail:
      "Industry meeting-summary coverage reports a separate July 24 deadline for the interconnecting TSP/DSP to finalize and submit the completed eligibility package to ERCOT, after reviewing the large load's July 10 submission. This date did not appear in ERCOT's own June 18 Trending Topic and hasn't been independently verified against a primary ERCOT document here — treat as reported, not confirmed.",
    status: "unconfirmed",
    sourceUrl: "https://www.zeroemissiongrid.com/iso-rto-meeting-summaries/batch-zero-readiness-06-11-26/",
    sourceLabel: "ZeroEmissionGrid meeting summary, June 11, 2026",
  },
  {
    date: "2026-08-07",
    title: "ERCOT notifies classification",
    detail: "ERCOT notifies each applicant whether it's classified as Base Load, Studied Load, or Excluded from Batch Zero.",
    status: "upcoming",
    sourceUrl: "https://www.ercot.com/files/docs/2026/06/18/ERCOT-Trending-Topic-New-Batch-Connection-Process-for-Large-Electricity-Users.pdf",
    sourceLabel: "ERCOT Trending Topics, June 18, 2026",
  },
  {
    date: "2027 spring",
    title: "Allocations provided",
    detail: "ERCOT provides each Batch Zero large load with the amount of electricity that can reliably be allocated to it.",
    status: "upcoming",
  },
  {
    date: "2027 Q2",
    title: "Developer commitment deadline",
    detail: "Deadline for developers in Batch Zero to post financial security and prove site control, currently planned for June 2027.",
    status: "upcoming",
  },
  {
    date: "2027 fall",
    title: "Final transmission plan published",
    detail: "ERCOT publishes the final transmission plan allocating load and prescribing the grid upgrades needed to support it.",
    status: "upcoming",
  },
  {
    date: "2027 summer",
    title: "Batch 1 applications open",
    detail: "The next batch study begins accepting applications for large loads not included in (or excluded from) Batch Zero.",
    status: "upcoming",
  },
];

export const CLASSIFICATIONS = [
  {
    name: "Base Load",
    description:
      "Projects that already completed a prior Large Load Interconnection Study (LLIS) meeting defined criteria, or are already included in an approved Regional Planning Group (RPG) study. Capacity allocated from that prior work is effectively preserved.",
  },
  {
    name: "Studied Load",
    description:
      "Projects with some study work completed but no predetermined allocation. Electricity allocation is determined through the system-wide Batch Zero study based on what the grid can reliably support once all eligible projects are assessed together — full allocation, partial allocation, or deferral to a later batch are all possible outcomes.",
  },
  {
    name: "Excluded Load",
    description: "Projects that don't qualify as Base Load or Studied Load must wait for a future batch study (Batch 1, opening summer 2027).",
  },
];

export const PATHWAYS = [
  {
    name: "WLPUN — Withdrawal-Limited Private Use Network",
    description:
      "For large loads bringing their own on-site generation (gas turbines, solar, etc.). The on-site generation offsets how much transmission capacity the load needs from the grid, making it easier to connect at higher levels.",
  },
  {
    name: "PCLR — Provisional Controllable Load Resource",
    description:
      "For large loads willing to let ERCOT curtail their consumption during localized grid stress, embedded into ERCOT's dispatch system. In exchange, they can access a portion of the grid ahead of a full transmission buildout.",
  },
];
