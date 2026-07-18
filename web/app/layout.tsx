import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://large-load.kardashevlabs.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ERCOT Large Load Tracker | Kardashev Labs",
  description:
    "Can this site get power in ERCOT, and roughly when? Large-load (data center / crypto / industrial) interconnection queue history, zone timelines, and the reality gap between approved and operational load.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "ERCOT Large Load Tracker | Kardashev Labs",
    description:
      "Large-load interconnection queue history, zone timelines, and the reality gap between approved and operational load in ERCOT.",
    url: siteUrl,
    siteName: "Kardashev Labs",
  },
  twitter: {
    card: "summary_large_image",
    title: "ERCOT Large Load Tracker | Kardashev Labs",
    description:
      "Large-load interconnection queue history, zone timelines, and the reality gap between approved and operational load in ERCOT.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "ERCOT Large Load Tracker",
      url: siteUrl,
      description:
        "Large-load interconnection queue history, zone timelines, and the reality gap between approved and operational load in ERCOT.",
      publisher: { "@id": "https://kardashevlabs.org#organization" },
    },
    {
      "@type": "Dataset",
      name: "ERCOT Large Load Tracker Data",
      description:
        "Monthly ERCOT large-load (data center / crypto / industrial) interconnection queue snapshots extracted from LLWG/LFLTF committee decks, generator interconnection milestone history (GIS_Report), and LMP-derived zone stress indicators.",
      url: siteUrl,
      creator: {
        "@id": "https://kardashevlabs.org#organization",
        "@type": "Organization",
        name: "Kardashev Labs",
        url: "https://kardashevlabs.org",
      },
    },
  ],
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/zones", label: "Zones" },
  { href: "/estimate", label: "Estimate" },
  { href: "/batch-zero", label: "Batch Zero" },
  { href: "/report", label: "Report" },
  { href: "/methodology", label: "Methodology" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="page">
          <header className="site-header">
            <Link href="/" className="site-brand">
              <span className="site-brand-mark">Large Load Tracker</span>
              <span className="site-brand-sub">ERCOT</span>
            </Link>
            <nav className="site-nav">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
          <footer className="footer">
            <span>
              A <a href="https://kardashevlabs.org">Kardashev Labs</a> tool. Data from ERCOT public
              committee filings.
            </span>
            <span>
              <a href="/methodology">How this is built</a>
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
