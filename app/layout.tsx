import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

// Font decision per Design System Section 2: Inter (UI) + Fraunces
// (display/editorial only, never data/UI chrome). Both self-hosted via
// next/font — no runtime request to Google Fonts, no CLS from a late
// font swap, and it keeps the product on the £0 licensing cost NFR-10
// assumes.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvestorHub",
  description:
    "Compare ETFs, understand the numbers, and see what a fee difference really costs — built for active beginner investors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
