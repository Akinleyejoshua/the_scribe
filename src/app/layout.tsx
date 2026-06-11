import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Scribe — AI Writing Assistant for Christian Authors",
  description:
    "A Spirit-led AI writing assistant purpose-built for apostolic, prophetic, and Spirit-filled ministry voices. Capture your theological voice and generate manuscripts in your exact style.",
  keywords: [
    "Christian writing",
    "AI ghostwriter",
    "ministry books",
    "apostolic",
    "prophetic",
    "manuscript generator",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
