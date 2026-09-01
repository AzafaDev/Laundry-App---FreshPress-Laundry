import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Geist } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/ui/ReactQueryProvider";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { LocaleHtmlSync } from "@/components/ui/LocaleHtmlSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreshPress Laundry",
  description: "Layanan laundry premium langsung dari pintu rumah Anda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleHtmlSync />
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster
          position="top-center"
          toastOptions={{ duration: 3000 }}
          containerStyle={{ left: 16, right: 16, top: 16 }}
        />
        <WhatsAppCTA />
      </body>
    </html>
  );
}
