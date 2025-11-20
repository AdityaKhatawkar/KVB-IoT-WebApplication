import type { Metadata } from "next";
import { Inter } from "next/font/google"; // use Google Inter font
import { Analytics } from "@vercel/analytics/react"; // fixed import
import Navbar from "@/components/navbar";
import { ToastProvider } from "@/contexts/toast-context";
import GoogleTranslateClient from "@/components/GoogleTranslateClient";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KVB App",
  description: "Created with Next.js + Tailwind",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <GoogleTranslateClient />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
