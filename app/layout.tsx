import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Warfare",
  description: "A hexagonal grid strategy card game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
