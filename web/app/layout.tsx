import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteNav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://large-load-tracker.kardashevlabs.org";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="page">
          <header className="site-header">
            <SiteHeader />
          </header>
          <div className="wrap">
            <main id="main-content">{children}</main>
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
        </div>
      </body>
    </html>
  );
}
