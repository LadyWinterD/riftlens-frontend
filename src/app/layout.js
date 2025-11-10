import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rift Rewind - AI-Powered League of Legends Analysis",
  description: "Transform your League of Legends gameplay into personalized insights with AI. Analyze match data from 500 EUW summoners using AWS AI services.",
  keywords: "League of Legends, LoL, AI Analysis, Match History, Performance Analytics, AWS, Riot Games",
  authors: [{ name: "LadyWinterD" }],
  openGraph: {
    title: "Rift Rewind",
    description: "AI-Powered League of Legends Match Analysis",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
