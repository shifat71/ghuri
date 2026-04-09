import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Public_Sans } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Ghuri | Trusted Travel Guides",
  description: "Find and book Nogori Verified local travel guides in Bangladesh.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${plusJakartaSans.variable} ${publicSans.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0 relative flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </main>
            <BottomNav />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
