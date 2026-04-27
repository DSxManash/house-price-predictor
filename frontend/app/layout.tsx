import { Manrope } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "California Housing Predictor",
  description: "Random Forest house value predictor",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${manrope.className} ${manrope.variable} min-h-full overflow-x-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(10,127,139,0.2),transparent_42%),radial-gradient(circle_at_88%_20%,rgba(24,103,165,0.2),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(10,127,139,0.1),transparent_50%),linear-gradient(145deg,#f8f6f2,#ebe5db)] bg-fixed text-slate-900 dark:bg-[radial-gradient(circle_at_12%_10%,rgba(76,193,208,0.18),transparent_42%),radial-gradient(circle_at_88%_20%,rgba(122,182,255,0.18),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(76,193,208,0.1),transparent_50%),linear-gradient(145deg,#0e1623,#141f31)] dark:text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
