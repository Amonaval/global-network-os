import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XYZ Hierarchy Network",
  description: "Private multi-generation hierarchy and member directory",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}