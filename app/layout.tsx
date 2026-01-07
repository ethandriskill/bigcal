import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BigCal - Yearly Calendar View",
  description: "View your entire year of events across multiple calendar accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
