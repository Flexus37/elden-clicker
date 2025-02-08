import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ER Clicker",
  description: "Elden Ring death clicker",
};

export default function RootLayout({ children,}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased relative flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
    <header className="absolute top-0 left-0 w-full bg-white shadow-md flex flex-col items-center justify-center gap-y-4 p-4 z-10">
      <h1 className="text-3xl">Elden Ring Кликер</h1>
      <nav className="flex flex-row gap-4">
        <Link href="/">Главная</Link>
        <Link href="/stats">Статистика</Link>
      </nav>
    </header>
    
    {/* Контейнер для контента с отступом от header */}
    <main className="flex flex-col items-center flex-grow w-full pt-32 lg:px-8">
      {children}
    </main>
    </body>
    </html>
  );
}
