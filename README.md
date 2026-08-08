# Large Load Tracker

ERCOT large-load interconnection queue tracker: queue history, zone scorecards, Batch Zero, and estimate / report views.

**Live:** [large-load-tracker.kardashevlabs.org](https://large-load-tracker.kardashevlabs.org)

---

## What it shows

Public ERCOT large-load interconnection data as time series and zone breakdowns, plus tools to estimate and report load impact. Data comes from the [kardashev-data](https://data.kardashevlabs.org) API.

Routes under `web/app/`: home, zones, batch-zero, estimate, report, methodology.

---

## Stack

| Layer | Tech |
|---|---|
| UI | Next.js 15, React 19, Tailwind CSS |
| Charts | [kardashev-charts](https://github.com/kardashev-lab/kardashev-charts) |
| Data | [kardashev-data](https://data.kardashevlabs.org) REST API |

---

## Running locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

The app talks to the production `data.kardashevlabs.org` API by default.

---

## License

MIT
