import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QAWidget } from "@/components/QAWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESG Reporter - Sustainability Tracking for SMBs",
  description: "Track carbon emissions, water usage, and waste metrics for supply chain compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
        <QAWidget
          appName="ESG Reporter"
          checklist={[
            { description: "Dashboard loads with stats", type: "ui" },
            { description: "Can navigate to Carbon Emissions tab", type: "flow" },
            { description: "Can add emission entry", type: "function" },
            { description: "Can navigate to Water Usage tab", type: "flow" },
            { description: "Can add water entry", type: "function" },
            { description: "Can navigate to Waste Metrics tab", type: "flow" },
            { description: "Can add waste entry", type: "function" },
            { description: "Can generate report", type: "function" },
            { description: "Data persists after refresh", type: "function" },
          ]}
        />
      </body>
    </html>
  );
}
