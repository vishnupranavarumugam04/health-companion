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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00f0ff" />
      </head>
      <body className="min-h-full font-sans">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener("load", function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
});`,
          }}
        />
      </body>
    </html>
  );
}

