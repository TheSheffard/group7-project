import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://vettme-six.vercel.app"), 
  title: {
    default: "VettMe — Pre-Employment Validation",
    template: "%s | VettMe",
  },
  description:
    "Component-based validation system for vetting job applicants. Verify candidate NIN, BVN, phone, email in real-time.",
  applicationName: "VettMe",
  authors: [{ name: "Group 7" }],
  keywords: [
    "validation",
    "vetting",
    "employment",
    "NIN",
    "BVN",
    "phone verification",
    "email verification",
  ],
  creator: "Group 7",
  publisher: "VettMe",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "VettMe — Pre-Employment Validation",
    description:
      "Verify candidates before the interview. NIN, BVN, phone, email validation in one place.",
    url: "https://vettme-six.vercel.app",
    siteName: "VettMe",
    locale: "en_US",
    type: "website",
    // 🌐 FIXED: Direct absolute URL pointing exactly to your raw image file
    images: [
      {
        url: "https://i.postimg.cc/QM7XHGwt/opengraph-image.jpg", 
        width: 1200,
        height: 630,
        alt: "VettMe - Pre-Employment Validation Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VettMe — Pre-Employment Validation",
    description:
      "Verify candidates before the interview. NIN, BVN, phone, email validation in one place.",
    // 🌐 FIXED: Twitter card direct asset match
    images: ["https://i.postimg.cc/QM7XHGwt/opengraph-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-bg-warm`}
      >
        {children}
      </body>
    </html>
  );
}
