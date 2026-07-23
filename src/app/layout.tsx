import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Gabi Bijus — bijuterias artesanais feitas no Rio",
    template: "%s · Gabi Bijus",
  },
  description:
    "Bijuterias artesanais feitas à mão no Rio de Janeiro: colares, chokers, brincos, pulseiras e body chains com alma de verão eterno.",
  // A imagem de compartilhamento vem de app/opengraph-image.png
  openGraph: {
    siteName: "Gabi Bijus",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
