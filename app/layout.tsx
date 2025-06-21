import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import "./globals.css";
import { ToastProvider } from "./components/ui/Toast";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://wabco.vercel.app' : 'http://localhost:3000'),
  title: "WABCO Mobility",
  description: "WABCO Mobility - Your trusted partner in automotive solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ClientSessionProvider>
          <ToastProvider>
            {children}
            <Toaster position="top-right" />
          </ToastProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
