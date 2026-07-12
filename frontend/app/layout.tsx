import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowEasy CRM",
  description: "AI-Powered CSV Importer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%", width: "100%" }}>
      <body style={{ height: "100%", width: "100%", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
