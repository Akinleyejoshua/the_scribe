import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
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
    <html lang="en" className={bricolage.variable}>
      <body>{children}</body>
    </html>
  );
}
