import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Explorer",
  description: "Search movies, view details, and save rated favorites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
