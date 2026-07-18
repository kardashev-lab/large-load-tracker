"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview", hint: "The big picture" },
  { href: "/estimate", label: "Estimate", hint: "How long for MY project?" },
  { href: "/zones", label: "Zones", hint: "Where's easiest to build" },
  { href: "/batch-zero", label: "Batch Zero", hint: "New ERCOT rule, explained" },
  { href: "/report", label: "Report", hint: "What changed this month" },
  { href: "/methodology", label: "Methodology", hint: "Where the numbers come from" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      {NAV.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <div key={item.href} className="site-nav-item">
            <Link href={item.href} className={isActive ? "active" : undefined} aria-current={isActive ? "page" : undefined}>
              {item.label}
            </Link>
            <span className="site-nav-hint">{item.hint}</span>
          </div>
        );
      })}
    </nav>
  );
}
