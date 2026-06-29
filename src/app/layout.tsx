import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShaderBackground } from "@/components/ShaderBackground";
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
        <ShaderBackground />
        {/* Darkening scrim so layered content stays legible over the shader. */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/55 to-black/80" />
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
