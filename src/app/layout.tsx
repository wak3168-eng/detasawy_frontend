import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic, Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-naskh-arabic",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://detasawy.com"),
  title: {
    default: "Detasawy — A community-built data portal for the Pashto language",
    template: "%s — Detasawy",
  },
  description:
    "The Pashto of tomorrow, built by its speakers one word at a time. " +
    "Community-owned open datasets that teach machines Pashto — words, " +
    "voices and dialects from every district of Pashtunkhwa and Afghanistan.",
  applicationName: "Detasawy",
  keywords: [
    "Pashto",
    "Pashto language",
    "پښتو",
    "Pashto dataset",
    "Pashto speech data",
    "Pashto NLP",
    "low-resource language",
    "Pashtunkhwa",
    "Afghanistan",
    "open data",
    "language preservation",
  ],
  authors: [{ name: "Detasawy" }],
  creator: "Detasawy",
  publisher: "Detasawy",
  category: "education",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Detasawy",
    description:
      "A community-built data portal for the Pashto language, made by the " +
      "people who speak it.",
    url: "https://detasawy.com",
    siteName: "Detasawy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detasawy",
    description:
      "A community-built data portal for the Pashto language, made by the " +
      "people who speak it.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7FBFC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${nunito.variable} ${naskh.variable}`}
    >
      <body className="bg-ice font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
