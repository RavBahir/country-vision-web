import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-providers";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Country Vision | Eye care and eyewear",
  description:
    "Professional eye exams, carefully selected frames and precision lenses, all in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased bg-[#FAF5EE] text-[#1F1A15]">
        <QueryProvider>
        {children}
        </QueryProvider>
      </body>
    </html>
  );
}
