import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Health Companion | AI Telemetry & Smart Vital Tracking",
  description: "Mobile-first pixel-perfect health tracking dashboard with live MQTT IoT telemetry, real-time vital alerts, and GPS tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} light antialiased`}>
      <body className="min-h-full font-sans">
        {children}
      </body>
    </html>
  );
}

