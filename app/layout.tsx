import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "Our Family",
  description: "A private, living home for your family, generations and memories",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><LanguageProvider>{children}</LanguageProvider></body></html>;
}
