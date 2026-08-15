"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/estimate", label: "Line Ahead", hint: "Arithmetic from Filing Observations" },
  { href: "/zones", label: "Zones", hint: "Where's easiest to build" },
  { href: "/batch-zero", label: "Batch Zero", hint: "New ERCOT rule, explained" },
  { href: "/report", label: "Report", hint: "What changed this month" },
  { href: "/methodology", label: "Methodology", hint: "Where the numbers come from" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <div className="site-header-inner">
      <Link href="/" className={`site-brand${onHome ? " active" : ""}`} aria-current={onHome ? "page" : undefined}>
        <Image src="/images/ercot.png" alt="" width={22} height={22} className="shrink-0" />
        <span className="site-brand-mark">Large Load Tracker</span>
        <span className="site-brand-sub">ERCOT</span>
      </Link>
      <nav className="site-nav">
        {NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
    </div>
  );
}
