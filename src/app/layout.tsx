import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Wyatt Case builds your business's AI automation onto a Mac you own outright — the machine and the code, yours to keep. Pay once, no subscription. Done-for-you agents, knowledge bases, web scraping, and full-stack Next.js/Supabase builds.";

export const metadata: Metadata = {
  metadataBase: new URL("https://wyattcase.com"),
  title: {
    default: "Wyatt Case — AI Automation You Own",
    template: "%s — Wyatt Case",
  },
  description,
  keywords: [
    "AI engineer",
    "RAG",
    "knowledge base",
    "agentic automation",
    "Next.js",
    "Supabase",
    "web scraping",
    "full-stack developer",
    "freelance AI developer",
  ],
  authors: [{ name: "Wyatt Case" }],
  openGraph: {
    title: "Wyatt Case — AI Automation You Own",
    description,
    url: "https://wyattcase.com",
    siteName: "Wyatt Case",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wyatt Case — AI Automation You Own",
    description,
    creator: "@wyattdcase",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden text-white antialiased`}
      >
        {/* Static, lightweight background — cool-to-warm depth echoing the brand, zero runtime cost. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55rem 55rem at 88% -8%, rgba(245,169,60,0.10), transparent 60%), radial-gradient(50rem 50rem at -6% 2%, rgba(70,120,150,0.10), transparent 55%), radial-gradient(42rem 42rem at 50% 112%, rgba(245,169,60,0.05), transparent 60%), #0a0a0c",
          }}
        />
        <Nav />
        {children}
        <Footer />
        <noscript>
          <div className="fixed inset-0 -z-10 bg-[#0a0a0c]" />
        </noscript>
      </body>
    </html>
  );
}
