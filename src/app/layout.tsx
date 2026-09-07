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
  title: "Detasawy — A community-built data portal for the Pashto language",
  description:
    "The Pashto of tomorrow, built by its speakers one word at a time. Community-owned open datasets that teach machines Pashto.",
  openGraph: {
    title: "Detasawy",
    description: "A community-built data portal for the Pashto language.",
    url: "https://detasawy.com",
    siteName: "Detasawy",
    type: "website",
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
