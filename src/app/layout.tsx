import type { Metadata } from "next";
import { Caveat, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ChapterRail } from "@/components/ChapterRail";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { brand } from "@/data/site";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | Study Abroad Counselling`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Discover the right country, course and university with personalised guidance from application to arrival.",
};

/**
 * The chrome — header, chapter rail and footer — lives here rather than on each
 * page, so it survives client-side navigation without remounting.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-royal focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
          <Navbar />
          <ChapterRail />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
