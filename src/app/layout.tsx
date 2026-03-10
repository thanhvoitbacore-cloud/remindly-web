import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { CalendarIcon, BellRing, User, LogIn, LayoutDashboard, Settings } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Remindly App",
  description: "Your modern events and reminders manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="antialiased bg-gray-950 text-gray-100 flex h-screen overflow-hidden font-inter">

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
