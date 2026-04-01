import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   display: "swap",
// });

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KADIV - Premium Event Management",
  description: "KADIV is a luxury event company that handles end-to-end event planning and execution. Weddings, Corporate Events, Private Parties and more.",
  keywords: ["KADIV", "event management", "luxury events", "wedding planning", "corporate events", "party planning"],
  authors: [{ name: "KADIV Events" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KADIV - Premium Event Management",
    description: "We Handle Every Detail of Your Event. Premium event planning and execution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${playfairDisplay.variable} ${cormorantGaramond.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111111',
              border: '1px solid rgba(200, 164, 86, 0.2)',
              color: '#FAF3E0',
            },
          }}
        />
      </body>
    </html>
  );
}